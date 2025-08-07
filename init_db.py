#!/usr/bin/env python3
"""
Script de inicialización de base de datos para producción
"""
import os
import sys
from database import Database

def init_database():
    """Inicializar la base de datos en producción"""
    try:
        print("🔧 Inicializando base de datos...")
        
        # Crear instancia de base de datos
        db = Database()
        
        # Verificar que las tablas existen
        cursor = db.conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"✅ Base de datos inicializada correctamente")
        print(f"📋 Tablas disponibles: {[table[0] for table in tables]}")
        
        # Verificar que las tablas principales existen
        expected_tables = ['users', 'orders', 'notes']
        existing_tables = [table[0] for table in tables]
        
        missing_tables = []
        for table in expected_tables:
            if table not in existing_tables:
                missing_tables.append(table)
        
        if missing_tables:
            print(f"⚠️  Tablas faltantes: {missing_tables}")
            print("🔄 Recreando tablas...")
            db.create_tables()
            db.create_indexes()
            print("✅ Tablas recreadas correctamente")
        else:
            print("✅ Todas las tablas existen correctamente")
        
        print("🎉 Base de datos lista para producción!")
        return True
        
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1) 