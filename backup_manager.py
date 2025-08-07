import shutil
import datetime
import os
import sqlite3
import json
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backup.log'),
        logging.StreamHandler()
    ]
)

class BackupManager:
    def __init__(self, db_path='orders.db', backup_dir='backups'):
        self.db_path = db_path
        self.backup_dir = backup_dir
        self.max_backups = 10  # Mantener solo los últimos 10 respaldos
        
        # Crear directorio de respaldos si no existe
        os.makedirs(self.backup_dir, exist_ok=True)
        os.makedirs('logs', exist_ok=True)
    
    def create_backup(self):
        """Crear respaldo de la base de datos"""
        try:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = os.path.join(self.backup_dir, f'orders_{timestamp}.db')
            
            # Verificar que la base de datos existe
            if not os.path.exists(self.db_path):
                logging.error(f"Base de datos no encontrada: {self.db_path}")
                return False
            
            # Crear respaldo
            shutil.copy2(self.db_path, backup_path)
            
            # Verificar integridad del respaldo
            if self.verify_backup(backup_path):
                logging.info(f"Respaldo creado exitosamente: {backup_path}")
                self.cleanup_old_backups()
                return True
            else:
                logging.error(f"Error en la verificación del respaldo: {backup_path}")
                os.remove(backup_path)
                return False
                
        except Exception as e:
            logging.error(f"Error al crear respaldo: {e}")
            return False
    
    def verify_backup(self, backup_path):
        """Verificar integridad del respaldo"""
        try:
            conn = sqlite3.connect(backup_path)
            cursor = conn.cursor()
            
            # Verificar que las tablas existen
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            required_tables = ['users', 'orders', 'notes']
            for table in required_tables:
                if table not in tables:
                    logging.error(f"Tabla {table} no encontrada en el respaldo")
                    return False
            
            # Verificar integridad de la base de datos
            cursor.execute("PRAGMA integrity_check")
            result = cursor.fetchone()
            
            conn.close()
            
            if result[0] == 'ok':
                return True
            else:
                logging.error(f"Error de integridad en el respaldo: {result[0]}")
                return False
                
        except Exception as e:
            logging.error(f"Error al verificar respaldo: {e}")
            return False
    
    def cleanup_old_backups(self):
        """Eliminar respaldos antiguos manteniendo solo los últimos max_backups"""
        try:
            # Obtener lista de respaldos ordenados por fecha
            backup_files = []
            for file in os.listdir(self.backup_dir):
                if file.startswith('orders_') and file.endswith('.db'):
                    file_path = os.path.join(self.backup_dir, file)
                    backup_files.append((file_path, os.path.getmtime(file_path)))
            
            # Ordenar por fecha de modificación (más reciente primero)
            backup_files.sort(key=lambda x: x[1], reverse=True)
            
            # Eliminar respaldos antiguos
            if len(backup_files) > self.max_backups:
                for file_path, _ in backup_files[self.max_backups:]:
                    os.remove(file_path)
                    logging.info(f"Respaldo antiguo eliminado: {file_path}")
                    
        except Exception as e:
            logging.error(f"Error al limpiar respaldos antiguos: {e}")
    
    def restore_backup(self, backup_path):
        """Restaurar desde un respaldo"""
        try:
            if not os.path.exists(backup_path):
                logging.error(f"Archivo de respaldo no encontrado: {backup_path}")
                return False
            
            # Verificar integridad del respaldo
            if not self.verify_backup(backup_path):
                logging.error("El respaldo no es válido")
                return False
            
            # Crear respaldo del estado actual antes de restaurar
            current_backup = f"pre_restore_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            if os.path.exists(self.db_path):
                shutil.copy2(self.db_path, os.path.join(self.backup_dir, current_backup))
            
            # Restaurar
            shutil.copy2(backup_path, self.db_path)
            logging.info(f"Respaldo restaurado exitosamente desde: {backup_path}")
            return True
            
        except Exception as e:
            logging.error(f"Error al restaurar respaldo: {e}")
            return False
    
    def get_backup_info(self):
        """Obtener información de los respaldos disponibles"""
        try:
            backups = []
            for file in os.listdir(self.backup_dir):
                if file.startswith('orders_') and file.endswith('.db'):
                    file_path = os.path.join(self.backup_dir, file)
                    file_size = os.path.getsize(file_path)
                    file_date = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
                    
                    backups.append({
                        'filename': file,
                        'path': file_path,
                        'size_mb': round(file_size / (1024 * 1024), 2),
                        'date': file_date.strftime('%Y-%m-%d %H:%M:%S'),
                        'timestamp': file_date.timestamp()
                    })
            
            # Ordenar por fecha (más reciente primero)
            backups.sort(key=lambda x: x['timestamp'], reverse=True)
            return backups
            
        except Exception as e:
            logging.error(f"Error al obtener información de respaldos: {e}")
            return []
    
    def create_backup_with_metadata(self):
        """Crear respaldo con metadatos adicionales"""
        try:
            # Crear respaldo de la base de datos
            if not self.create_backup():
                return False
            
            # Crear archivo de metadatos
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            metadata_path = os.path.join(self.backup_dir, f'backup_metadata_{timestamp}.json')
            
            metadata = {
                'backup_date': datetime.datetime.now().isoformat(),
                'db_size_mb': round(os.path.getsize(self.db_path) / (1024 * 1024), 2),
                'backup_type': 'full',
                'version': '1.0',
                'description': 'Respaldo automático del sistema DocTec'
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logging.info(f"Metadatos del respaldo guardados: {metadata_path}")
            return True
            
        except Exception as e:
            logging.error(f"Error al crear respaldo con metadatos: {e}")
            return False

# Función para crear respaldo programado
def scheduled_backup():
    """Función para ser llamada por un cron job o scheduler"""
    backup_manager = BackupManager()
    return backup_manager.create_backup_with_metadata()

if __name__ == "__main__":
    # Crear respaldo manual
    backup_manager = BackupManager()
    success = backup_manager.create_backup_with_metadata()
    
    if success:
        print("✅ Respaldo creado exitosamente")
        
        # Mostrar información de respaldos
        backups = backup_manager.get_backup_info()
        print(f"\n📊 Respaldo #{len(backups)} creado:")
        if backups:
            latest = backups[0]
            print(f"   📁 Archivo: {latest['filename']}")
            print(f"   📏 Tamaño: {latest['size_mb']} MB")
            print(f"   📅 Fecha: {latest['date']}")
    else:
        print("❌ Error al crear respaldo") 