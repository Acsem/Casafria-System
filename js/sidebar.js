// Sidebar functionality - Common across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!localStorage.getItem('doctec_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar usuario actual
    const currentUser = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    const sidebarUserName = document.getElementById('sidebarUserName');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser;
    }
    if (sidebarUserName) {
        sidebarUserName.textContent = currentUser;
    }
    
    // Sidebar functionality
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    

    
    // Toggle sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
            if (sidebar.classList.contains('expanded')) {
                if (window.innerWidth <= 768) {
                    sidebarOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                document.body.classList.add('sidebar-expanded');
                sidebarToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
                document.body.classList.remove('sidebar-expanded');
                sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Cerrar sidebar
    function closeSidebar() {
        sidebar.classList.remove('expanded');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.body.classList.remove('sidebar-expanded');
        if (sidebarToggle) {
            sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Cerrar sidebar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('expanded')) {
            closeSidebar();
        }
    });
    
    // Marcar enlace activo en sidebar
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'home.html' && href === 'home.html')) {
            link.classList.add('active');
        }
    });
});

// Funciones para configuración (placeholder)
function showUserSettings() {
    alert('Configuración de usuario - Funcionalidad en desarrollo');
}

function showSystemSettings() {
    alert('Configuración del sistema - Funcionalidad en desarrollo');
}

// Función para obtener usuario actual
function getCurrentUser() {
    return localStorage.getItem('doctec_current_user') || 'Admin';
}

// Función para cerrar sesión
function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('doctec_logged_in');
        localStorage.removeItem('doctec_current_user');
        window.location.href = 'login.html';
    }
} 