# Sistema de Login - DocTec

## Instrucciones de Uso

### Primera Vez
1. Al acceder al sistema por primera vez, las credenciales por defecto son:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

2. Se recomienda cambiar estas credenciales inmediatamente después del primer acceso.

### Cambiar Credenciales
1. En la pantalla de login, haga clic en "Configurar Credenciales"
2. Complete los campos:
   - **Nuevo Usuario**: Mínimo 3 caracteres, solo letras, números y guiones bajos
   - **Nueva Contraseña**: Mínimo 6 caracteres, debe contener al menos una letra y un número
   - **Confirmar Contraseña**: Debe coincidir con la nueva contraseña

3. Haga clic en "Guardar Configuración"

### Características del Sistema
- **Almacenamiento Local**: Las credenciales se guardan en el navegador
- **Persistencia**: Las credenciales se mantienen entre sesiones
- **Validación**: El sistema valida la fortaleza de las contraseñas
- **Seguridad**: Las contraseñas se almacenan de forma segura

### Funciones Disponibles
- ✅ Login con usuario y contraseña personalizados
- ✅ Configuración de credenciales desde la interfaz
- ✅ Validación de fortaleza de contraseñas
- ✅ Persistencia de sesión
- ✅ Logout seguro
- ✅ Redirección automática al dashboard

### Notas Importantes
- Las credenciales se almacenan localmente en el navegador
- Para mayor seguridad, cambie las credenciales por defecto
- El sistema no requiere conexión a internet para funcionar
- Las sesiones se mantienen hasta que se haga logout manualmente

### Solución de Problemas
Si olvida sus credenciales:
1. Abra las herramientas de desarrollador del navegador (F12)
2. En la consola, ejecute: `resetCredentials()`
3. Recargue la página
4. Use las credenciales por defecto: `admin` / `admin123` 