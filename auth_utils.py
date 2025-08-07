import json
import os
from functools import wraps
from flask import session, redirect, url_for, request, jsonify
from config import Config
from error_handlers import log_security_event, validate_input

def load_credentials():
    """Cargar credenciales desde archivo de configuración"""
    credentials_file = 'credentials.json'
    default_credentials = {
        'username': Config.DEFAULT_USERNAME,
        'password': Config.DEFAULT_PASSWORD
    }
    
    if os.path.exists(credentials_file):
        try:
            with open(credentials_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            pass
    
    return default_credentials

def save_credentials(username, password):
    """Guardar credenciales en archivo de configuración"""
    credentials_file = 'credentials.json'
    credentials = {
        'username': username,
        'password': password
    }
    
    try:
        with open(credentials_file, 'w') as f:
            json.dump(credentials, f, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando credenciales: {e}")
        return False

def verify_credentials(username, password):
    """Verificar credenciales del usuario"""
    # Validar entrada
    is_valid, message = validate_input(username, 50)
    if not is_valid:
        log_security_event('invalid_input', f'Username validation failed: {message}')
        return False
    
    is_valid, message = validate_input(password, 100)
    if not is_valid:
        log_security_event('invalid_input', f'Password validation failed: {message}')
        return False
    
    credentials = load_credentials()
    is_valid = username == credentials.get('username') and password == credentials.get('password')
    
    # Registrar intento de login
    if is_valid:
        log_security_event('login_success', f'User {username} logged in successfully')
    else:
        log_security_event('login_failed', f'Failed login attempt for user {username}')
    
    return is_valid

def login_required(f):
    """Decorador para proteger rutas que requieren autenticación"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Si es una petición AJAX, devolver JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'error': 'No autenticado'}), 401
            # Si es una petición normal, redirigir a login
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """Obtener información del usuario actual"""
    if 'user_id' in session:
        return {
            'id': session.get('user_id'),
            'username': session.get('username'),
            'name': session.get('user_name', 'Usuario')
        }
    return None

def login_user(user_data):
    """Iniciar sesión del usuario"""
    session['user_id'] = user_data.get('id')
    session['username'] = user_data.get('username')
    session['user_name'] = user_data.get('name', user_data.get('username'))
    session.permanent = True

def logout_user():
    """Cerrar sesión del usuario"""
    session.clear()

def is_authenticated():
    """Verificar si el usuario está autenticado"""
    return 'user_id' in session 