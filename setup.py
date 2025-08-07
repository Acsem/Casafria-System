#!/usr/bin/env python3
"""
Script de configuración inicial para DocTec
Este script ayuda a configurar el sistema de forma segura
"""

import os
import sys
import secrets
import string
from pathlib import Path

def generate_secret_key(length=32):
    """Generar una clave secreta segura"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_env_file():
    """Crear archivo .env con configuración segura"""
    env_path = Path('.env')
    
    if env_path.exists():
        print("⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (y/N): ", end='')
        response = input().lower()
        if response != 'y':
            print("❌ Configuración cancelada")
            return False
    
    # Generar clave secreta
    secret_key = generate_secret_key()
    
    # Solicitar credenciales por defecto
    print("\n🔐 Configuración de credenciales por defecto")
    print("⚠️  IMPORTANTE: Cambia estas credenciales después del primer login")
    
    default_username = input("Usuario por defecto (admin): ").strip() or "admin"
    default_password = input("Contraseña por defecto (admin123): ").strip() or "admin123"
    
    # Crear contenido del archivo .env
    env_content = f"""# Configuración de seguridad
SECRET_KEY={secret_key}
FLASK_ENV=production
FLASK_DEBUG=False

# Configuración de base de datos
DATABASE_URL=sqlite:///orders.db

# Configuración de sesión
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax

# Configuración de logging
LOG_LEVEL=INFO
LOG_FILE=logs/doctec.log

# Credenciales por defecto (cambiar inmediatamente)
DEFAULT_USERNAME={default_username}
DEFAULT_PASSWORD={default_password}
"""
    
    # Escribir archivo
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Archivo .env creado exitosamente")
    return True

def create_directories():
    """Crear directorios necesarios"""
    directories = ['logs', 'uploads', 'templates']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Directorio '{directory}' creado/verificado")

def check_dependencies():
    """Verificar dependencias"""
    try:
        import flask
        import pandas
        import werkzeug
        print("✅ Todas las dependencias están instaladas")
        return True
    except ImportError as e:
        print(f"❌ Dependencia faltante: {e}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False

def main():
    """Función principal del script"""
    print("🚀 Configuración inicial de DocTec")
    print("=" * 50)
    
    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
    
    # Crear directorios
    create_directories()
    
    # Crear archivo .env
    if create_env_file():
        print("\n🎉 Configuración completada exitosamente!")
        print("\n📋 Próximos pasos:")
        print("1. Ejecuta: python app.py")
        print("2. Accede a: http://localhost:8000")
        print("3. Cambia las credenciales por defecto")
        print("4. Configura HTTPS en producción")
    else:
        print("❌ Error en la configuración")
        sys.exit(1)

if __name__ == '__main__':
    main() 