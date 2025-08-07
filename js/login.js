// Configuración inicial de credenciales
let credentials = JSON.parse(localStorage.getItem('doctec_credentials')) || {
    username: 'admin',
    password: 'admin123'
};

// Función para validar entrada del lado del cliente
function validateInput(input, minLength, maxLength, pattern = null) {
    if (!input || input.trim().length === 0) {
        return { valid: false, message: 'Este campo es requerido' };
    }
    
    if (input.length < minLength) {
        return { valid: false, message: `Mínimo ${minLength} caracteres` };
    }
    
    if (input.length > maxLength) {
        return { valid: false, message: `Máximo ${maxLength} caracteres` };
    }
    
    if (pattern && !pattern.test(input)) {
        return { valid: false, message: 'Formato inválido' };
    }
    
    return { valid: true, message: '' };
}

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const configForm = document.getElementById('configForm');
const configSection = document.getElementById('configSection');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loginBtn = document.getElementById('loginBtn');

// Función para mostrar mensajes
function showMessage(message, type = 'error') {
    const messageElement = type === 'error' ? errorMessage : successMessage;
    const otherElement = type === 'error' ? successMessage : errorMessage;
    
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    otherElement.style.display = 'none';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Función para limpiar mensajes
function clearMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Función para validar credenciales
function validateCredentials(username, password) {
    return username === credentials.username && password === credentials.password;
}

// Función para guardar credenciales
function saveCredentials(username, password) {
    credentials = { username, password };
    localStorage.setItem('doctec_credentials', JSON.stringify(credentials));
}

// Función para mostrar/ocultar sección de configuración
function toggleConfig() {
    const isVisible = configSection.style.display === 'block';
    configSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        // Limpiar formulario de configuración
        configForm.reset();
        clearMessages();
    }
}

// Función para validar contraseña
function validatePassword(password) {
    // Mínimo 6 caracteres
    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
        return 'La contraseña debe contener al menos una letra y un número';
    }
    
    return null;
}

// Función para validar usuario
function validateUsername(username) {
    if (username.length < 3) {
        return 'El usuario debe tener al menos 3 caracteres';
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return 'El usuario solo puede contener letras, números y guiones bajos';
    }
    
    return null;
}

// Event listener para el formulario de login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validaciones del lado del cliente
    const usernameValidation = validateInput(username, 3, 50, /^[a-zA-Z0-9_]+$/);
    if (!usernameValidation.valid) {
        showMessage(usernameValidation.message);
        return;
    }
    
    const passwordValidation = validateInput(password, 6, 100);
    if (!passwordValidation.valid) {
        showMessage(passwordValidation.message);
        return;
    }
    
    // Validar que la contraseña contenga al menos una letra y un número
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        showMessage('La contraseña debe contener al menos una letra y un número');
        return;
    }
    
    // Deshabilitar botón durante la validación
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    // Primero intentar validación local
    if (validateCredentials(username, password)) {
        showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
        
        // Guardar estado de sesión
        localStorage.setItem('doctec_logged_in', 'true');
        localStorage.setItem('doctec_current_user', username);
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } else {
        // Si falla la validación local, intentar con el servidor
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        fetch('/login', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        })
        .then(data => {
            if (data.success) {
                showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                
                // Guardar estado de sesión
                localStorage.setItem('doctec_logged_in', 'true');
                localStorage.setItem('doctec_current_user', username);
                
                // Redirigir al dashboard
                setTimeout(() => {
                    window.location.href = data.redirect || 'home.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Usuario o contraseña incorrectos');
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error de conexión. Intente nuevamente.');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        });
    }
});

// Event listener para el formulario de configuración
configForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();
    
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones
    const usernameError = validateUsername(newUsername);
    if (usernameError) {
        showMessage(usernameError);
        return;
    }
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        showMessage(passwordError);
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('Las contraseñas no coinciden');
        return;
    }
    
    // Guardar credenciales localmente primero
    saveCredentials(newUsername, newPassword);
    
    // Intentar guardar en el servidor también
    const formData = new FormData();
    formData.append('username', newUsername);
    formData.append('password', newPassword);
    
    fetch('/api/update_credentials', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    })
    .then(data => {
        if (data.success) {
            showMessage('Credenciales actualizadas correctamente. Puede iniciar sesión con las nuevas credenciales.', 'success');
        } else {
            showMessage('Credenciales guardadas localmente. ' + (data.message || ''));
        }
        
        // Limpiar formulario y ocultar sección
        configForm.reset();
        setTimeout(() => {
            toggleConfig();
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Credenciales guardadas localmente. Error de conexión con el servidor.');
        
        // Limpiar formulario y ocultar sección
        configForm.reset();
        setTimeout(() => {
            toggleConfig();
        }, 2000);
    });
});

// Función para verificar si ya está logueado
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('doctec_logged_in') === 'true';
    if (isLoggedIn) {
        window.location.href = 'home.html';
    }
}

// Función para logout (para usar en otras páginas)
function logout() {
    localStorage.removeItem('doctec_logged_in');
    localStorage.removeItem('doctec_current_user');
    window.location.href = 'login.html';
}

// Función para obtener usuario actual
function getCurrentUser() {
    return localStorage.getItem('doctec_current_user') || 'Usuario';
}

// Verificar estado de login al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    // Agregar efectos visuales a los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Agregar animación de carga al botón de login
    loginBtn.addEventListener('click', function() {
        if (!this.disabled) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        }
    });
});

// Función para mostrar/ocultar contraseña
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Agregar funcionalidad de mostrar/ocultar contraseña
document.addEventListener('DOMContentLoaded', function() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const icon = input.nextElementSibling;
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', function() {
            togglePasswordVisibility(input.id);
        });
    });
});

// Función para limpiar credenciales (para desarrollo)
function resetCredentials() {
    localStorage.removeItem('doctec_credentials');
    localStorage.removeItem('doctec_logged_in');
    localStorage.removeItem('doctec_current_user');
    location.reload();
}

// Agregar función de reset al objeto window para debugging
window.resetCredentials = resetCredentials; 