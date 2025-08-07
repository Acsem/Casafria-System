import os
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración base para la aplicación"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DATABASE = os.environ.get('DATABASE_URL') or 'orders.db'
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Configuración de seguridad
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = os.environ.get('SESSION_COOKIE_HTTPONLY', 'True').lower() == 'true'
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
    
    # Configuración de archivos
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    
    # Configuración de logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/doctec.log')
    
    # Credenciales por defecto
    DEFAULT_USERNAME = os.environ.get('DEFAULT_USERNAME', 'admin')
    DEFAULT_PASSWORD = os.environ.get('DEFAULT_PASSWORD', 'admin123')

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    
    # En producción, usar variables de entorno
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DATABASE = os.environ.get('DATABASE_URL')

class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    DATABASE = 'test_orders.db'

# Diccionario de configuraciones
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 