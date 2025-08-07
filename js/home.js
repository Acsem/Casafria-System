// Verificar autenticación
window.onload = function() {
    if (!localStorage.getItem('doctec_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar usuario actual
    const currentUser = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser;
    }
    
    updateOrderCount();
    updateClientCount();
    updatePendingPayments();
    updateInventoryCount();
    updateRemindersCount();
};

// Función para actualizar el contador de clientes
function updateClientCount() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const clientCount = document.getElementById('clientCount');
    if (clientCount) {
        clientCount.textContent = `${clients.length} clientes registrados`;
    }
}

// Función para cerrar sesión
function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('doctec_logged_in');
        localStorage.removeItem('doctec_current_user');
        window.location.href = 'login.html';
    }
}

// Actualizar contador de órdenes
function updateOrderCount() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const activeOrders = orders.filter(order => 
        order.status !== 'Completado' && order.status !== 'Cancelado'
    );
    document.getElementById('orderCount').textContent = 
        `${activeOrders.length} órdenes activas`;
}

// Función para actualizar el contador de cobros pendientes
function updatePendingPayments() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const pendingCount = payments.filter(p => p.status === 'Pendiente').length;
    const pendingElement = document.getElementById('pendingPayments');
    if (pendingElement) {
        pendingElement.textContent = `${pendingCount} cobros pendientes`;
    }
}

// Función para actualizar el contador de inventario
function updateInventoryCount() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const inventoryElement = document.getElementById('inventoryCount');
    if (inventoryElement) {
        inventoryElement.textContent = `${inventory.length} productos`;
    }
}

// Función para actualizar el contador de recordatorios activos
function updateRemindersCount() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const activeReminders = orders.filter(order => 
        order.reminder && 
        order.reminder.date && 
        order.reminder.time && 
        order.reminder.status !== 'completado' && 
        order.reminder.status !== 'cancelado'
    );
    
    const remindersElement = document.getElementById('remindersCount');
    if (remindersElement) {
        if (activeReminders.length === 0) {
            remindersElement.textContent = '0 recordatorios activos';
        } else if (activeReminders.length === 1) {
            remindersElement.textContent = '1 recordatorio activo';
        } else {
            remindersElement.textContent = `${activeReminders.length} recordatorios activos`;
        }
    }
}

