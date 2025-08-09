from flask import Flask, render_template, request, redirect, session, jsonify, send_file, send_from_directory
from database import Database
import pandas as pd
from datetime import datetime
import io
import os
import json
from config import config
from error_handlers import init_error_handlers, log_security_event, validate_input
from forms import LoginForm, CredentialsForm, OrderForm, NoteForm
from auth_utils import login_required, get_current_user
from backup_manager import BackupManager

# Configurar aplicación para producción
app = Flask(__name__)

# Cargar configuración basada en entorno
env = os.environ.get('FLASK_ENV', 'production')
app.config.from_object(config[env])

# Configurar rutas de archivos estáticos
@app.route('/css/<path:filename>')
def css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def js(filename):
    return send_from_directory('js', filename)

@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory('images', filename)

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Inicializar manejadores de errores
init_error_handlers(app)

# Inicializar base de datos con configuración de Flask
db = Database(app.config.get('DATABASE'))

# Importar funciones de auth_utils
from auth_utils import load_credentials, save_credentials, verify_credentials

# Configuración de rutas
@app.route('/')
def index():
    return render_template('login.html')

@app.route('/test')
def test():
    return render_template('test_login.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/dashboard')
def dashboard():
    return render_template('home.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        form = LoginForm()
        if form.validate_on_submit():
            username = form.username.data
            password = form.password.data
        
            if verify_credentials(username, password):
                session['user_id'] = 1
                session['username'] = username
                session['user_name'] = username
                log_security_event('login_success', f'User {username} logged in')
                return jsonify({'success': True, 'redirect': '/dashboard'})
            else:
                log_security_event('login_failed', f'Failed login attempt for {username}')
                return jsonify({'success': False, 'message': 'Credenciales incorrectas'})
        else:
            return jsonify({'success': False, 'message': 'Datos de entrada inválidos'})
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/api/update_credentials', methods=['POST'])
def update_credentials():
    form = CredentialsForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        
        # Validar entrada adicional
        is_valid, message = validate_input(username, 50)
        if not is_valid:
            return jsonify({'success': False, 'message': message})
        
        is_valid, message = validate_input(password, 100)
        if not is_valid:
            return jsonify({'success': False, 'message': message})
        
        if save_credentials(username, password):
            log_security_event('credentials_updated', f'Credentials updated for user {username}')
            return jsonify({'success': True, 'message': 'Credenciales actualizadas'})
        else:
            log_security_event('credentials_update_failed', f'Failed to update credentials for {username}')
            return jsonify({'success': False, 'message': 'Error al actualizar credenciales'})
    else:
        return jsonify({'success': False, 'message': 'Datos de entrada inválidos'})

@app.route('/orders')
def view_orders():
    if 'username' not in session:
        session['username'] = 'Casafria'
    orders = db.get_orders()
    return render_template('view_orders.html', orders=orders)

@app.route('/new_order', methods=['GET', 'POST'])
@login_required
def new_order():
    if request.method == 'POST':
        form = OrderForm()
        if form.validate_on_submit():
            order = {
                'client_name': form.client_name.data,
                'product': form.product.data,
                'brand': form.brand.data,
                'damage': form.damage.data,
                'date': datetime.now()
            }
            db.add_order(order)
            log_security_event('order_created', f'Order created by {get_current_user()["username"]}')
            return redirect('/orders')
        else:
            return jsonify({'success': False, 'message': 'Datos de entrada inválidos'})
    return render_template('register_order.html')

@app.route('/add_note', methods=['POST'])
@login_required
def add_note():
    form = NoteForm()
    if form.validate_on_submit():
        order_id = request.form.get('order_id')
        note = form.note.data
        
        # Validar order_id
        try:
            order_id = int(order_id)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'ID de orden inválido'})
        
        db.add_note(order_id, note)
        log_security_event('note_added', f'Note added to order {order_id} by {get_current_user()["username"]}')
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Datos de entrada inválidos'})

@app.route('/export_excel')
def export_excel():
    orders = db.get_orders()
    df = pd.DataFrame(orders)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Órdenes')
    output.seek(0)
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'ordenes_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    )

# Rutas para respaldos
@app.route('/api/backup', methods=['POST'])
@login_required
def create_backup():
    """Crear respaldo de la base de datos"""
    try:
        backup_manager = BackupManager()
        success = backup_manager.create_backup_with_metadata()
        
        if success:
            log_security_event('backup_created', f'Backup created by {get_current_user()["username"]}')
            return jsonify({'success': True, 'message': 'Respaldo creado exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al crear respaldo'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/api/backups', methods=['GET'])
@login_required
def get_backups():
    """Obtener lista de respaldos disponibles"""
    try:
        backup_manager = BackupManager()
        backups = backup_manager.get_backup_info()
        return jsonify({'success': True, 'backups': backups})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/api/backup/restore', methods=['POST'])
@login_required
def restore_backup():
    """Restaurar desde un respaldo"""
    try:
        backup_path = request.json.get('backup_path')
        if not backup_path:
            return jsonify({'success': False, 'message': 'Ruta de respaldo no especificada'})
        
        backup_manager = BackupManager()
        success = backup_manager.restore_backup(backup_path)
        
        if success:
            log_security_event('backup_restored', f'Backup restored by {get_current_user()["username"]}')
            return jsonify({'success': True, 'message': 'Respaldo restaurado exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al restaurar respaldo'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True) 