import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

class Database:
    def __init__(self, database_path=None):
        # Usar la ruta de la base de datos desde configuración o por defecto
        if database_path is None:
            database_path = os.environ.get('DATABASE_URL', 'orders.db')
            # Si es una URL SQLite, extraer la ruta del archivo
            if database_path.startswith('sqlite:///'):
                database_path = database_path.replace('sqlite:///', '')
            elif database_path.startswith('sqlite://'):
                database_path = database_path.replace('sqlite://', '')
        
        # Asegurar que el directorio existe
        db_dir = os.path.dirname(database_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
        
        self.conn = sqlite3.connect(database_path, check_same_thread=False)
        
        # Optimizaciones de SQLite para mejor rendimiento
        self.conn.execute('PRAGMA journal_mode=WAL')  # Mejor concurrencia
        self.conn.execute('PRAGMA synchronous=NORMAL')  # Mejor rendimiento
        self.conn.execute('PRAGMA cache_size=10000')  # Más cache (10MB)
        self.conn.execute('PRAGMA temp_store=MEMORY')  # Temp en memoria
        self.conn.execute('PRAGMA mmap_size=268435456')  # 256MB para mmap
        self.conn.execute('PRAGMA page_size=4096')  # Tamaño de página optimizado
        
        self.create_tables()
        self.create_indexes()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            company_name TEXT,
            address TEXT,
            website TEXT,
            logo TEXT,
            plan TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            client_name TEXT,
            product TEXT,
            brand TEXT,
            damage TEXT,
            date DATETIME
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY,
            order_id INTEGER,
            note TEXT,
            date DATETIME,
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )
        ''')
        self.conn.commit()

    def create_indexes(self):
        """Crear índices para optimizar consultas"""
        cursor = self.conn.cursor()
        
        # Índices para la tabla orders
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_client_name ON orders(client_name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_brand ON orders(brand)')
        
        # Índices para la tabla users
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)')
        
        # Índices para la tabla notes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_notes_order_id ON notes(order_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date)')
        
        self.conn.commit()

    def register_user(self, full_name, email, phone, password, company_name, address, website='', logo='', plan='basic'):
        try:
            cursor = self.conn.cursor()
            
            # Verificar si el email ya existe
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                return False
            
            # Hashear la contraseña
            hashed_password = generate_password_hash(password)
            
            # Insertar el nuevo usuario
            cursor.execute('''
                INSERT INTO users (full_name, email, phone, password, company_name, address, website, logo, plan)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (full_name, email, phone, hashed_password, company_name, address, website, logo, plan))
            
            self.conn.commit()
            return True
            
        except Exception as e:
            print(f"Error al registrar usuario: {e}")
            return False

    def verify_user(self, username, password):
        cursor = self.conn.cursor()
        cursor.execute('SELECT password FROM users WHERE email = ?', (username,))
        result = cursor.fetchone()
        if result:
            return check_password_hash(result[0], password)
        return False

    def add_order(self, order):
        cursor = self.conn.cursor()
        cursor.execute('''
        INSERT INTO orders (client_name, product, brand, damage, date)
        VALUES (?, ?, ?, ?, ?)
        ''', (order['client_name'], order['product'], order['brand'], 
              order['damage'], order['date']))
        self.conn.commit()

    def get_orders(self):
        cursor = self.conn.cursor()
        cursor.execute('''
        SELECT o.*, GROUP_CONCAT(n.note) as notes
        FROM orders o
        LEFT JOIN notes n ON o.id = n.order_id
        GROUP BY o.id
        ORDER BY o.date DESC
        ''')
        return [dict(zip([col[0] for col in cursor.description], row))
                for row in cursor.fetchall()]

    def add_note(self, order_id, note):
        cursor = self.conn.cursor()
        cursor.execute('''
        INSERT INTO notes (order_id, note, date)
        VALUES (?, ?, DATETIME('now'))
        ''', (order_id, note))
        self.conn.commit() 