// ===== MOBILE OPTIMIZATION JAVASCRIPT =====

// Detectar el tipo de dispositivo
function getDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = width / height;
    
    if (width <= 480) return 'mobile';
    if (width <= 768) return 'tablet';
    if (width <= 1024) return 'desktop';
    return 'large-desktop';
}

// Detectar orientación
function getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

// Optimizar sidebar para móvil
function optimizeSidebar() {
    const deviceType = getDeviceType();
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');
    const navbar = document.querySelector('.navbar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar || !container || !navbar) return;
    
    if (deviceType === 'mobile') {
        // En móvil, sidebar ocupa toda la pantalla
        sidebar.style.width = '100%';
        sidebar.style.left = '-100%';
        container.style.marginLeft = '0';
        navbar.style.left = '0';
        navbar.style.right = '0';
        
        // Mostrar botón de toggle
        if (sidebarToggle) {
            sidebarToggle.style.display = 'flex';
        }
        
        // Agregar overlay para cerrar sidebar
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1999;
                display: none;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(overlay);
        }
        
        // Remover event listeners existentes para evitar duplicados
        const newSidebarToggle = sidebarToggle.cloneNode(true);
        sidebarToggle.parentNode.replaceChild(newSidebarToggle, sidebarToggle);
        
        // Event listeners para sidebar móvil
        if (newSidebarToggle) {
            newSidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.toggle('expanded');
                overlay.style.display = sidebar.classList.contains('expanded') ? 'block' : 'none';
            });
        }
        
        // Remover event listeners existentes del overlay
        const newOverlay = overlay.cloneNode(true);
        overlay.parentNode.replaceChild(newOverlay, overlay);
        
        newOverlay.addEventListener('click', () => {
            sidebar.classList.remove('expanded');
            newOverlay.style.display = 'none';
        });
        
    } else {
        // En desktop, sidebar normal
        sidebar.style.width = '100px';
        sidebar.style.left = '0';
        container.style.marginLeft = '100px';
        navbar.style.left = '100px';
        navbar.style.right = '0';
        
        if (sidebarToggle) {
            sidebarToggle.style.display = 'none';
        }
    }
}

// Optimizar tablas para móvil
function optimizeTables() {
    const deviceType = getDeviceType();
    const tables = document.querySelectorAll('.table-responsive');
    
    tables.forEach(table => {
        if (deviceType === 'mobile') {
            // Solo agregar scroll suave sin indicadores
            table.style.scrollBehavior = 'smooth';
            table.style.webkitOverflowScrolling = 'touch';
            
            // Remover cualquier indicador existente
            const existingIndicators = table.parentNode.querySelectorAll('.scroll-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
        } else {
            // Remover indicador en pantallas grandes
            const indicator = table.parentNode.querySelector('.scroll-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    });
}

// Optimizar botones para touch
function optimizeButtons() {
    const deviceType = getDeviceType();
    const buttons = document.querySelectorAll('.btn, .btn-small, .btn-primary, .btn-secondary');
    
    buttons.forEach(button => {
        if (deviceType === 'mobile') {
            // Asegurar tamaño mínimo para touch
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
            
            // Mejorar feedback táctil
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.98)';
                button.style.transition = 'transform 0.1s ease';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });
        }
    });
}

// Optimizar formularios para móvil
function optimizeForms() {
    const deviceType = getDeviceType();
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (deviceType === 'mobile') {
            // Prevenir zoom en iOS
            if (input.type === 'text' || input.type === 'email' || input.type === 'password') {
                input.style.fontSize = '16px';
            }
            
            // Mejorar touch targets
            input.style.minHeight = '44px';
            input.style.padding = '0.8rem 1rem';
        }
    });
}

// Optimizar modales para móvil
function optimizeModals() {
    const deviceType = getDeviceType();
    const modals = document.querySelectorAll('.modal-content');
    
    modals.forEach(modal => {
        if (deviceType === 'mobile') {
            modal.style.margin = '1rem';
            modal.style.maxHeight = '90vh';
            modal.style.overflowY = 'auto';
            modal.style.borderRadius = '12px';
        }
    });
}

// Optimizar cards y elementos de información
function optimizeCards() {
    const deviceType = getDeviceType();
    const cards = document.querySelectorAll('.menu-card, .summary-card, .order-detail-card');
    
    cards.forEach(card => {
        if (deviceType === 'mobile') {
            // Mejorar espaciado
            card.style.padding = '1.2rem';
            card.style.marginBottom = '1rem';
            card.style.borderRadius = '12px';
            
            // Agregar sombra sutil
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
    });
}

// Optimizar navegación
function optimizeNavigation() {
    const deviceType = getDeviceType();
    const navbar = document.querySelector('.navbar');
    const navBrand = document.querySelector('.nav-brand');
    
    if (deviceType === 'mobile' && navbar && navBrand) {
        // Ajustar navbar para móvil
        navbar.style.padding = '0.5rem';
        navbar.style.height = '60px';
        
        // Ocultar texto del brand en móvil
        const brandSpan = navBrand.querySelector('span');
        if (brandSpan) {
            brandSpan.style.display = 'none';
        }
        
        // Ajustar logo
        const logo = navBrand.querySelector('.nav-logo');
        if (logo) {
            logo.style.width = '28px';
            logo.style.height = '28px';
        }
    }
}

// Optimizar gráficos para móvil
function optimizeCharts() {
    const deviceType = getDeviceType();
    const charts = document.querySelectorAll('.chart-container');
    
    charts.forEach(chart => {
        if (deviceType === 'mobile') {
            chart.style.height = '250px';
            chart.style.borderRadius = '12px';
            chart.style.overflow = 'hidden';
        }
    });
}

// Mejorar accesibilidad
function improveAccessibility() {
    // Agregar atributos ARIA
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            const text = button.textContent.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        }
    });
    
    // Mejorar focus visible
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid var(--accent-color)';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
}

// Detectar cambios de orientación
function handleOrientationChange() {
    const orientation = getOrientation();
    const isLandscape = orientation === 'landscape';
    
    // Ajustar altura de elementos en landscape
    if (isLandscape && window.innerHeight < 600) {
        const modals = document.querySelectorAll('.modal-content');
        const charts = document.querySelectorAll('.chart-container');
        
        modals.forEach(modal => {
            modal.style.maxHeight = '80vh';
        });
        
        charts.forEach(chart => {
            chart.style.height = '200px';
        });
    }
}

// Función principal para inicializar optimizaciones móviles
function initMobileOptimizations() {
    // Aplicar optimizaciones al cargar
    optimizeSidebar();
    optimizeTables();
    optimizeButtons();
    optimizeForms();
    optimizeModals();
    optimizeCards();
    optimizeNavigation();
    optimizeCharts();
    improveAccessibility();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', () => {
        optimizeSidebar();
        optimizeTables();
        optimizeButtons();
        optimizeForms();
        optimizeModals();
        optimizeCards();
        optimizeNavigation();
        optimizeCharts();
    });
    
    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            handleOrientationChange();
            optimizeSidebar();
            optimizeTables();
        }, 100);
    });
    
    // Detectar preferencias de usuario
    if (window.matchMedia) {
        // Preferencia de movimiento reducido
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            document.body.style.setProperty('--transition', 'none');
        }
        
        // Preferencia de color oscuro
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDarkMode.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }
}

// Función para mostrar información de debug (solo en desarrollo)
function showDebugInfo() {
    // Comentado para no mostrar información de debug
    // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    //     const debugInfo = document.createElement('div');
    //     debugInfo.id = 'debug-info';
    //     debugInfo.style.cssText = `
    //         position: fixed;
    //         top: 10px;
    //         right: 10px;
    //         background: rgba(0,0,0,0.8);
    //         color: white;
    //         padding: 0.5rem;
    //         border-radius: 4px;
    //         font-size: 0.7rem;
    //         z-index: 9999;
    //         font-family: monospace;
    //     `;
    //     debugInfo.innerHTML = `
    //         Device: ${getDeviceType()}<br>
    //         Orientation: ${getOrientation()}<br>
    //         Screen: ${window.innerWidth}x${window.innerHeight}
    //     `;
    //     document.body.appendChild(debugInfo);
    //     
    //     window.addEventListener('resize', () => {
    //         debugInfo.innerHTML = `
    //             Device: ${getDeviceType()}<br>
    //             Orientation: ${getOrientation()}<br>
    //             Screen: ${window.innerWidth}x${window.innerHeight}
    //         `;
    //     });
    // }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initMobileOptimizations();
    // showDebugInfo(); // Comentado para no mostrar información de debug
});

// Exportar funciones para uso global
window.mobileUtils = {
    getDeviceType,
    getOrientation,
    optimizeSidebar,
    optimizeTables,
    optimizeButtons,
    optimizeForms,
    optimizeModals,
    optimizeCards,
    optimizeNavigation,
    optimizeCharts,
    improveAccessibility,
    handleOrientationChange
}; 