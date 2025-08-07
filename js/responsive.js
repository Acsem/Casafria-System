/**
 * Responsive Utilities for DocTec
 * Enhances mobile experience and responsive behavior
 */

class ResponsiveUtils {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.isDesktop = window.innerWidth > 1024;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMobileNavigation();
        this.setupTableResponsiveness();
        this.setupTouchGestures();
        this.setupViewportHandling();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle orientation change
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // Prevent zoom on double tap (iOS)
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.isDesktop = window.innerWidth > 1024;
        
        // Update table responsiveness
        this.updateTableResponsiveness();
        
        // Update navigation
        this.updateNavigation();
    }

    handleOrientationChange() {
        // Wait for orientation change to complete
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }

    setupMobileNavigation() {
        // Add mobile menu toggle if not exists
        const navbar = document.querySelector('.navbar, .navbar-landing');
        if (navbar && !document.querySelector('.mobile-menu-toggle')) {
            this.createMobileMenuToggle(navbar);
        }
    }

    createMobileMenuToggle(navbar) {
        const navLinks = navbar.querySelector('.nav-links');
        if (!navLinks) return;

        // Create mobile menu toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Add toggle functionality
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('nav-links-open');
            toggleBtn.classList.toggle('active');
            
            // Update icon
            const icon = toggleBtn.querySelector('i');
            if (navLinks.classList.contains('nav-links-open')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Insert toggle button
        navbar.insertBefore(toggleBtn, navLinks);

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('nav-links-open')) {
                navLinks.classList.remove('nav-links-open');
                toggleBtn.classList.remove('active');
                toggleBtn.querySelector('i').className = 'fas fa-bars';
            }
        });

        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('nav-links-open');
                toggleBtn.classList.remove('active');
                toggleBtn.querySelector('i').className = 'fas fa-bars';
            }
        });
    }

    setupTableResponsiveness() {
        this.updateTableResponsiveness();
    }

    updateTableResponsiveness() {
        const tables = document.querySelectorAll('.orders-table, .subscriptions-table, #clientsTable, #inventoryTable, #paymentsTable');
        
        tables.forEach(table => {
            const container = table.closest('.table-responsive, .table-container');
            if (!container) return;

            if (this.isMobile) {
                // On mobile, add horizontal scroll indicator
                if (!container.querySelector('.scroll-indicator')) {
                    this.addScrollIndicator(container);
                }
                
                // Add swipe gestures for table navigation
                this.addTableSwipeGestures(container);
            } else {
                // Remove mobile-specific elements on desktop
                const scrollIndicator = container.querySelector('.scroll-indicator');
                if (scrollIndicator) {
                    scrollIndicator.remove();
                }
            }
        });
    }

    addScrollIndicator(container) {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Desliza para ver más columnas';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 10;
            pointer-events: none;
            opacity: 0.8;
        `;
        
        container.style.position = 'relative';
        container.appendChild(indicator);
        
        // Hide indicator after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 500);
        }, 3000);
    }

    addTableSwipeGestures(container) {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('touchmove', (e) => {
            if (!startX) return;
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('touchend', () => {
            startX = 0;
        });
    }

    setupTouchGestures() {
        // Add pull-to-refresh functionality for mobile
        if (this.isMobile) {
            this.setupPullToRefresh();
        }
    }

    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pullDistance = 0;
        const threshold = 80;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].pageY;
            pullDistance = currentY - startY;
            
            if (pullDistance > 0 && pullDistance < threshold) {
                // Show pull indicator
                this.showPullIndicator(pullDistance);
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling && pullDistance > threshold) {
                // Trigger refresh
                this.triggerRefresh();
            }
            
            this.hidePullIndicator();
            isPulling = false;
            pullDistance = 0;
        });
    }

    showPullIndicator(distance) {
        let indicator = document.getElementById('pull-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pull-indicator';
            indicator.innerHTML = '<i class="fas fa-sync-alt"></i> Desliza para actualizar';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: var(--primary-color);
                color: white;
                text-align: center;
                padding: 10px;
                z-index: 9999;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        const progress = Math.min(distance / 80, 1);
        indicator.style.transform = `translateY(${(progress - 1) * 100}%)`;
    }

    hidePullIndicator() {
        const indicator = document.getElementById('pull-indicator');
        if (indicator) {
            indicator.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }
    }

    triggerRefresh() {
        // Show loading indicator
        this.showLoadingIndicator();
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showLoadingIndicator() {
        const loading = document.createElement('div');
        loading.id = 'loading-indicator';
        loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(loading);
    }

    setupViewportHandling() {
        // Fix viewport issues on mobile
        if (this.isMobile) {
            // Ensure proper viewport scaling
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        }
    }

    updateNavigation() {
        const navbar = document.querySelector('.navbar, .navbar-landing');
        if (navbar) {
            if (this.isMobile) {
                navbar.classList.add('mobile-nav');
            } else {
                navbar.classList.remove('mobile-nav');
                // Close mobile menu if open
                const navLinks = navbar.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('nav-links-open')) {
                    navLinks.classList.remove('nav-links-open');
                    const toggleBtn = navbar.querySelector('.mobile-menu-toggle');
                    if (toggleBtn) {
                        toggleBtn.classList.remove('active');
                        toggleBtn.querySelector('i').className = 'fas fa-bars';
                    }
                }
            }
        }
    }

    // Utility methods
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    static getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    }
}

// Initialize responsive utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveUtils = new ResponsiveUtils();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveUtils;
} 