# DocTec - Sistema de Gestión para Talleres

Sistema integral para la gestión de órdenes, clientes e inventario de talleres de reparación.

## Requisitos

- Python 3.7 o superior
- pip (gestor de paquetes de Python)

## Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd DocTec
   ```

2. **Crear entorno virtual**
   ```bash
   python3 -m venv venv
   ```

3. **Activar entorno virtual**
   ```bash
   # En macOS/Linux:
   source venv/bin/activate
   
   # En Windows:
   venv\Scripts\activate
   ```

4. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configurar variables de entorno**
   ```bash
   # Copiar archivo de ejemplo
   cp env_example.txt .env
   
   # Editar .env con tus configuraciones
   # IMPORTANTE: Cambiar SECRET_KEY y credenciales por defecto
   ```

## Ejecución

1. **Activar entorno virtual** (si no está activado)
   ```bash
   source venv/bin/activate
   ```

2. **Ejecutar el servidor**
   ```bash
   python app.py
   ```

3. **Abrir en el navegador**
   - Página principal: http://localhost:8000
   - Registro: http://localhost:8000/register
   - Login: http://localhost:8000

## Funcionalidades

### Página Principal (index.html)
- Información sobre servicios
- Planes de suscripción (Básico, Premium, Empresarial)
- Formulario de contacto especializado
- Navegación a registro

### Registro de Usuarios (/register)
- Formulario de 3 pasos
- Información personal
- Información de empresa
- Selección de plan (incluyendo Plan Empresarial)
- Subida de logo

### Planes Disponibles
- **Plan Básico ($29.99/mes)**: Gestión básica de órdenes, clientes e inventario
- **Plan Premium ($49.99/mes)**: Funcionalidades avanzadas y soporte prioritario
- **Plan Empresarial (Personalizado)**: Soluciones a medida para empresas con múltiples sucursales

### Sistema de Gestión
- Gestión de órdenes
- Gestión de clientes
- Control de inventario
- Reportes

## Estructura del Proyecto

```
DocTec/
├── app.py                 # Servidor Flask
├── database.py            # Configuración de base de datos
├── index.html             # Página principal
├── templates/
│   └── register.html      # Página de registro
├── css/
│   └── style.css          # Estilos principales
├── js/
│   ├── landing.js         # JavaScript de la página principal
│   └── register.js        # JavaScript del registro
├── static/
│   └── css/
│       └── style.css      # Estilos adicionales
└── venv/                  # Entorno virtual (se crea automáticamente)
```

## Base de Datos

El sistema utiliza SQLite como base de datos. El archivo `orders.db` se crea automáticamente al ejecutar la aplicación por primera vez.

### Tablas:
- **users**: Información de usuarios registrados
- **orders**: Órdenes de servicio
- **notes**: Notas asociadas a órdenes

## Notas Importantes

- El servidor se ejecuta en el puerto 8000 para evitar conflictos con AirPlay en macOS
- Asegúrate de tener el entorno virtual activado antes de ejecutar el servidor
- La base de datos se crea automáticamente en la primera ejecución 