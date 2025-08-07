import logging
import os
from flask import jsonify, render_template, request
from werkzeug.exceptions import HTTPException

# Crear directorio de logs si no existe
log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'doctec.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def init_error_handlers(app):
    """Inicializar manejadores de errores para la aplicación"""
    
    @app.errorhandler(400)
    def bad_request(error):
        """Manejar errores 400 - Bad Request"""
        logger.warning(f'Bad Request: {request.url} - {error}')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'error': 'Solicitud incorrecta', 'message': str(error)}), 400
        return render_template('error.html', error=error, code=400), 400

    @app.errorhandler(401)
    def unauthorized(error):
        """Manejar errores 401 - Unauthorized"""
        logger.warning(f'Unauthorized: {request.url} - {error}')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'error': 'No autorizado', 'message': 'Debe iniciar sesión'}), 401
        return render_template('error.html', error=error, code=401), 401

    @app.errorhandler(403)
    def forbidden(error):
        """Manejar errores 403 - Forbidden"""
        logger.warning(f'Forbidden: {request.url} - {error}')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'error': 'Acceso prohibido', 'message': str(error)}), 403
        return render_template('error.html', error=error, code=403), 403

    @app.errorhandler(404)
    def not_found(error):
        """Manejar errores 404 - Not Found"""
        logger.info(f'Not Found: {request.url} - {error}')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'error': 'Página no encontrada', 'message': str(error)}), 404
        return render_template('error.html', error=error, code=404), 404

    @app.errorhandler(500)
    def internal_error(error):
        """Manejar errores 500 - Internal Server Error"""
        logger.error(f'Internal Server Error: {request.url} - {error}')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'error': 'Error interno del servidor', 'message': 'Contacte al administrador'}), 500
        return render_template('error.html', error=error, code=500), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        """Manejar excepciones no capturadas"""
        logger.error(f'Unhandled Exception: {request.url} - {error}')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'error': 'Error inesperado', 'message': 'Contacte al administrador'}), 500
        return render_template('error.html', error=error, code=500), 500

def log_security_event(event_type, details, user_id=None, ip_address=None):
    """Registrar eventos de seguridad"""
    security_logger = logging.getLogger('security')
    security_logger.setLevel(logging.WARNING)
    
    log_data = {
        'event_type': event_type,
        'details': details,
        'user_id': user_id,
        'ip_address': ip_address or request.remote_addr,
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'timestamp': logging.Formatter().formatTime(logging.LogRecord('', 0, '', 0, '', (), None))
    }
    
    security_logger.warning(f'Security Event: {log_data}')

def validate_input(data, max_length=1000):
    """Validar entrada de datos básica"""
    if not data:
        return False, "Datos vacíos"
    
    if len(str(data)) > max_length:
        return False, f"Datos demasiado largos (máximo {max_length} caracteres)"
    
    # Verificar caracteres peligrosos
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '{', '}', '[', ']']
    if any(char in str(data) for char in dangerous_chars):
        return False, "Caracteres no permitidos detectados"
    
    return True, "OK" 