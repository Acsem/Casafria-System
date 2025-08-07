from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField
from wtforms.validators import DataRequired, Length, Email, ValidationError
import re

class LoginForm(FlaskForm):
    """Formulario de login con validación"""
    username = StringField('Usuario', validators=[
        DataRequired(message='El usuario es requerido'),
        Length(min=3, max=50, message='El usuario debe tener entre 3 y 50 caracteres')
    ])
    password = PasswordField('Contraseña', validators=[
        DataRequired(message='La contraseña es requerida'),
        Length(min=6, message='La contraseña debe tener al menos 6 caracteres')
    ])

class CredentialsForm(FlaskForm):
    """Formulario para cambiar credenciales"""
    username = StringField('Nuevo Usuario', validators=[
        DataRequired(message='El usuario es requerido'),
        Length(min=3, max=50, message='El usuario debe tener entre 3 y 50 caracteres')
    ])
    password = PasswordField('Nueva Contraseña', validators=[
        DataRequired(message='La contraseña es requerida'),
        Length(min=6, message='La contraseña debe tener al menos 6 caracteres')
    ])
    confirm_password = PasswordField('Confirmar Contraseña', validators=[
        DataRequired(message='Debe confirmar la contraseña')
    ])

    def validate_username(self, field):
        """Validar formato del usuario"""
        if not re.match(r'^[a-zA-Z0-9_]+$', field.data):
            raise ValidationError('El usuario solo puede contener letras, números y guiones bajos')

    def validate_password(self, field):
        """Validar fortaleza de la contraseña"""
        password = field.data
        if not re.search(r'[a-zA-Z]', password):
            raise ValidationError('La contraseña debe contener al menos una letra')
        if not re.search(r'\d', password):
            raise ValidationError('La contraseña debe contener al menos un número')

    def validate_confirm_password(self, field):
        """Validar que las contraseñas coincidan"""
        if self.password.data != field.data:
            raise ValidationError('Las contraseñas no coinciden')

class OrderForm(FlaskForm):
    """Formulario para órdenes de trabajo"""
    client_name = StringField('Nombre del Cliente', validators=[
        DataRequired(message='El nombre del cliente es requerido'),
        Length(min=2, max=100, message='El nombre debe tener entre 2 y 100 caracteres')
    ])
    product = StringField('Producto', validators=[
        DataRequired(message='El producto es requerido'),
        Length(min=2, max=100, message='El producto debe tener entre 2 y 100 caracteres')
    ])
    brand = StringField('Marca', validators=[
        DataRequired(message='La marca es requerida'),
        Length(min=2, max=50, message='La marca debe tener entre 2 y 50 caracteres')
    ])
    damage = TextAreaField('Daño/Problema', validators=[
        DataRequired(message='La descripción del daño es requerida'),
        Length(min=10, max=500, message='La descripción debe tener entre 10 y 500 caracteres')
    ])

class NoteForm(FlaskForm):
    """Formulario para notas"""
    note = TextAreaField('Nota', validators=[
        DataRequired(message='La nota es requerida'),
        Length(min=5, max=1000, message='La nota debe tener entre 5 y 1000 caracteres')
    ]) 