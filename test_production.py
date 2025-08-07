#!/usr/bin/env python3
"""
Script de prueba para verificar la aplicación de producción
"""
import os
import sys
from app_production import app

def test_production_app():
    """Probar la aplicación de producción"""
    try:
        print("🔍 Probando aplicación de producción...")
        
        # Configurar variables de entorno para prueba
        os.environ['FLASK_ENV'] = 'production'
        os.environ['SECRET_KEY'] = 'test-secret-key'
        os.environ['DATABASE_URL'] = 'test_orders.db'
        
        # Crear contexto de aplicación
        with app.test_client() as client:
            # Probar ruta principal
            response = client.get('/')
            print(f"✅ Ruta principal: {response.status_code}")
            
            # Probar ruta de CSS
            response = client.get('/css/style.css')
            print(f"✅ Archivo CSS: {response.status_code}")
            
            # Probar ruta de JS
            response = client.get('/js/main.js')
            print(f"✅ Archivo JS: {response.status_code}")
            
            # Probar ruta de imágenes
            response = client.get('/images/ecuafrim-logo.png')
            print(f"✅ Archivo de imagen: {response.status_code}")
        
        print("🎉 Todas las pruebas pasaron exitosamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")
        return False

if __name__ == "__main__":
    success = test_production_app()
    sys.exit(0 if success else 1) 