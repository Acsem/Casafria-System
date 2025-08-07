// Verificar autenticación
window.onload = function() {
    if (!localStorage.getItem('doctec_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar usuario actual
    const currentUser = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    const sidebarUserNameElement = document.getElementById('sidebarUserName');
    if (userNameElement) {
        userNameElement.textContent = currentUser;
    }
    if (sidebarUserNameElement) {
        sidebarUserNameElement.textContent = currentUser;
    }
    
    loadReminders();
    setupSearchListener();
    setupDateFilter();
};

// Obtener usuario actual
function getCurrentUser() {
    return localStorage.getItem('doctec_current_user') || 'Admin';
}

// Cargar recordatorios
function loadReminders() {
    // Usar applyDateFilter para cargar con filtros aplicados
    applyDateFilter();
}

// Actualizar resumen de recordatorios
function updateRemindersSummary(reminders) {
    const total = reminders.length;
    const pending = reminders.filter(r => r.reminder.status === 'pendiente').length;
    const urgent = reminders.filter(r => r.reminder.priority === 'urgente').length;
    
    // Contar recordatorios de hoy
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayReminders = reminders.filter(r => r.reminder.date === todayString).length;
    
    document.getElementById('totalReminders').textContent = total;
    document.getElementById('pendingReminders').textContent = pending;
    document.getElementById('urgentReminders').textContent = urgent;
    document.getElementById('todayReminders').textContent = todayReminders;
}

// Renderizar recordatorios en la tabla
function renderReminders(reminders) {
    const tbody = document.getElementById('remindersTableBody');
    const noRemindersMessage = document.getElementById('noRemindersMessage');
    
    if (reminders.length === 0) {
        tbody.innerHTML = '';
        noRemindersMessage.style.display = 'block';
        return;
    }
    
    noRemindersMessage.style.display = 'none';
    
    // Ordenar recordatorios por fecha y hora
    reminders.sort((a, b) => {
        const dateA = new Date(`${a.reminder.date}T${a.reminder.time}`);
        const dateB = new Date(`${b.reminder.date}T${b.reminder.time}`);
        return dateA - dateB;
    });
    
    tbody.innerHTML = reminders.map(order => {
        const reminderDateTime = new Date(`${order.reminder.date}T${order.reminder.time}`);
        const isOverdue = reminderDateTime < new Date();
        const isToday = order.reminder.date === new Date().toISOString().split('T')[0];
        
        return `
            <tr class="${isOverdue ? 'overdue-reminder' : ''} ${isToday ? 'today-reminder' : ''}">
                <td>
                    <a href="order-detail.html?order=${order.orderNumber}" class="order-link">
                        ${order.orderNumber}
                    </a>
                </td>
                <td>${order.clientName || 'No especificado'}</td>
                <td>${order.product}</td>
                <td>
                    <div class="reminder-description">
                        ${order.reminder.description || 'Sin descripción'}
                    </div>
                </td>
                <td>
                    <div class="reminder-datetime">
                        <div class="reminder-date">${formatDate(order.reminder.date)}</div>
                        <div class="reminder-time">${formatTime(order.reminder.time)}</div>
                    </div>
                </td>
                <td>
                    <span class="reminder-status ${order.reminder.status || 'pendiente'}">
                        ${getStatusText(order.reminder.status)}
                    </span>
                </td>
                <td>
                    <span class="reminder-badge priority-${order.reminder.priority || 'media'}">
                        ${getPriorityText(order.reminder.priority)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewOrderDetail('${order.orderNumber}')" class="btn-small info" title="Ver Orden">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editReminder('${order.orderNumber}')" class="btn-small warning" title="Editar Recordatorio">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="markAsCompleted('${order.orderNumber}')" class="btn-small" title="Marcar como Completado">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Formatear hora
function formatTime(timeString) {
    if (!timeString) return 'No especificada';
    return timeString;
}

// Obtener texto del estado
function getStatusText(status) {
    const statusMap = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'completado': 'Completado',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || 'Pendiente';
}

// Obtener texto de prioridad
function getPriorityText(priority) {
    const priorityMap = {
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    return priorityMap[priority] || 'Media';
}

// Configurar búsqueda
function setupSearchListener() {
    const searchInput = document.getElementById('searchReminders');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterReminders(searchTerm);
    });
}

// Configurar filtro de fechas
function setupDateFilter() {
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        // Aplicar filtro inicial
        applyDateFilter();
    }
}

// Aplicar filtro de fechas
function applyDateFilter() {
    const dateFilter = document.getElementById('dateFilter');
    const filterValue = dateFilter ? dateFilter.value : 'all';
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    let activeReminders = orders.filter(order => 
        order.reminder && 
        order.reminder.date && 
        order.reminder.time && 
        order.reminder.status !== 'completado' && 
        order.reminder.status !== 'cancelado'
    );
    
    // Aplicar filtro de fecha
    if (filterValue !== 'all') {
        const today = new Date();
        const filterDate = new Date();
        
        switch (filterValue) {
            case '30':
                filterDate.setDate(today.getDate() - 30);
                break;
            case '15':
                filterDate.setDate(today.getDate() - 15);
                break;
            case '7':
                filterDate.setDate(today.getDate() - 7);
                break;
            case '3':
                filterDate.setDate(today.getDate() - 3);
                break;
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                break;
        }
        
        activeReminders = activeReminders.filter(order => {
            const reminderDate = new Date(order.reminder.date);
            
            if (filterValue === 'today') {
                return reminderDate.toDateString() === today.toDateString();
            } else {
                return reminderDate >= filterDate && reminderDate <= today;
            }
        });
    }
    
    // Aplicar filtro de búsqueda si existe
    const searchInput = document.getElementById('searchReminders');
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase();
        activeReminders = activeReminders.filter(order => 
            order.orderNumber.toLowerCase().includes(searchTerm) ||
            (order.clientName && order.clientName.toLowerCase().includes(searchTerm)) ||
            (order.product && order.product.toLowerCase().includes(searchTerm)) ||
            (order.reminder.description && order.reminder.description.toLowerCase().includes(searchTerm))
        );
    }
    
    updateRemindersSummary(activeReminders);
    renderReminders(activeReminders);
    
    // Actualizar contador de filtros
    updateFilterCounter(activeReminders.length);
}

// Actualizar contador de filtros
function updateFilterCounter(count) {
    const dateFilter = document.getElementById('dateFilter');
    const filterValue = dateFilter ? dateFilter.value : 'all';
    
    let filterText = '';
    switch (filterValue) {
        case '30':
            filterText = ' (Últimos 30 días)';
            break;
        case '15':
            filterText = ' (Últimos 15 días)';
            break;
        case '7':
            filterText = ' (Últimos 7 días)';
            break;
        case '3':
            filterText = ' (Últimos 3 días)';
            break;
        case 'today':
            filterText = ' (Hoy)';
            break;
        default:
            filterText = '';
    }
    
    // Actualizar el título de la página o mostrar en algún lugar
    const pageTitle = document.querySelector('.page-header h2');
    if (pageTitle) {
        pageTitle.innerHTML = `<i class="fas fa-bell"></i> Gestión de Recordatorios${filterText}`;
    }
}

// Filtrar recordatorios
function filterReminders(searchTerm) {
    // Usar la función applyDateFilter que ya maneja ambos filtros
    applyDateFilter();
}

// Ver detalle de orden
function viewOrderDetail(orderNumber) {
    window.location.href = `order-detail.html?order=${orderNumber}`;
}

// Editar recordatorio
function editReminder(orderNumber) {
    window.location.href = `order-detail.html?order=${orderNumber}`;
}

// Marcar como completado
function markAsCompleted(orderNumber) {
    if (confirm('¿Está seguro que desea marcar este recordatorio como completado?')) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
        
        if (orderIndex !== -1 && orders[orderIndex].reminder) {
            orders[orderIndex].reminder.status = 'completado';
            localStorage.setItem('orders', JSON.stringify(orders));
            
            showMessage('Recordatorio marcado como completado', 'success');
            loadReminders();
        }
    }
}

// Exportar a Excel
function exportRemindersToExcel() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        let activeReminders = orders.filter(order => 
            order.reminder && 
            order.reminder.date && 
            order.reminder.time && 
            order.reminder.status !== 'completado' && 
            order.reminder.status !== 'cancelado'
        );
        
        // Aplicar filtro de fecha si está activo
        const dateFilter = document.getElementById('dateFilter');
        const filterValue = dateFilter ? dateFilter.value : 'all';
        
        if (filterValue !== 'all') {
            const today = new Date();
            const filterDate = new Date();
            
            switch (filterValue) {
                case '30':
                    filterDate.setDate(today.getDate() - 30);
                    break;
                case '15':
                    filterDate.setDate(today.getDate() - 15);
                    break;
                case '7':
                    filterDate.setDate(today.getDate() - 7);
                    break;
                case '3':
                    filterDate.setDate(today.getDate() - 3);
                    break;
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
            }
            
            activeReminders = activeReminders.filter(order => {
                const reminderDate = new Date(order.reminder.date);
                
                if (filterValue === 'today') {
                    return reminderDate.toDateString() === today.toDateString();
                } else {
                    return reminderDate >= filterDate && reminderDate <= today;
                }
            });
        }
        
        if (activeReminders.length === 0) {
            showMessage('No hay recordatorios para exportar');
            return;
        }
        
        // Obtener texto del filtro aplicado
        let filterText = '';
        switch (filterValue) {
            case '30':
                filterText = ' - Últimos 30 días';
                break;
            case '15':
                filterText = ' - Últimos 15 días';
                break;
            case '7':
                filterText = ' - Últimos 7 días';
                break;
            case '3':
                filterText = ' - Últimos 3 días';
                break;
            case 'today':
                filterText = ' - Hoy';
                break;
            default:
                filterText = '';
        }
        
        // Preparar datos para Excel
        const excelData = activeReminders.map(order => ({
            'Número de Orden': order.orderNumber,
            'Cliente': order.clientName || 'No especificado',
            'Producto': order.product,
            'Marca': order.brand || 'No especificada',
            'Descripción del Recordatorio': order.reminder.description || 'Sin descripción',
            'Fecha': formatDate(order.reminder.date),
            'Hora': formatTime(order.reminder.time),
            'Estado': getStatusText(order.reminder.status),
            'Prioridad': getPriorityText(order.reminder.priority),
            'Fecha de Registro': formatDate(order.date)
        }));
        
        // Crear tabla HTML
        let tableHTML = `
            <html>
            <head>
                <style>
                    table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .summary { margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Reporte de Recordatorios - Ecuafrim</h2>
                    <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
                </div>
                
                <div class="summary">
                    <h3>Resumen</h3>
                    <p><strong>Total de recordatorios:</strong> ${activeReminders.length}</p>
                    <p><strong>Pendientes:</strong> ${activeReminders.filter(r => r.reminder.status === 'pendiente').length}</p>
                    <p><strong>Urgentes:</strong> ${activeReminders.filter(r => r.reminder.priority === 'urgente').length}</p>
                    <p><strong>De hoy:</strong> ${activeReminders.filter(r => r.reminder.date === new Date().toISOString().split('T')[0]).length}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Número de Orden</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Marca</th>
                            <th>Descripción del Recordatorio</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Estado</th>
                            <th>Prioridad</th>
                            <th>Fecha de Registro</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        excelData.forEach(row => {
            tableHTML += `
                <tr>
                    <td>${row['Número de Orden']}</td>
                    <td>${row['Cliente']}</td>
                    <td>${row['Producto']}</td>
                    <td>${row['Marca']}</td>
                    <td>${row['Descripción del Recordatorio']}</td>
                    <td>${row['Fecha']}</td>
                    <td>${row['Hora']}</td>
                    <td>${row['Estado']}</td>
                    <td>${row['Prioridad']}</td>
                    <td>${row['Fecha de Registro']}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        // Crear y descargar archivo
        const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recordatorios${filterText.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showMessage(`Reporte exportado exitosamente${filterText}. Total: ${activeReminders.length} recordatorios`);
        
    } catch (error) {
        console.error('Error al exportar recordatorios a Excel:', error);
        showMessage('Error al exportar el reporte. Por favor, intente nuevamente.', 'error');
    }
}

// Mostrar mensaje
function showMessage(message, type = 'info') {
    // Crear notificación toast
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para cerrar sesión
function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('doctec_logged_in');
        localStorage.removeItem('doctec_current_user');
        window.location.href = 'login.html';
    }
} 