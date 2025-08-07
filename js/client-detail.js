// Variables globales
let currentClient = null;
let clientId = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el ID del cliente de la URL
    const urlParams = new URLSearchParams(window.location.search);
    clientId = urlParams.get('id');
    
    if (!clientId) {
        alert('ID de cliente no especificado');
        window.location.href = 'clients.html';
        return;
    }
    
    loadClientDetails();
    loadClientOrders();
});

// Cargar detalles del cliente
function loadClientDetails() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    currentClient = clients.find(client => client.id == clientId);
    
    if (!currentClient) {
        alert('Cliente no encontrado');
        window.location.href = 'clients.html';
        return;
    }
    
    // Mostrar información del cliente
    document.getElementById('clientCode').textContent = currentClient.code || 'N/A';
    document.getElementById('clientName').textContent = `${currentClient.firstName} ${currentClient.lastName}`;
    document.getElementById('clientPhone').textContent = currentClient.phone || 'N/A';
    document.getElementById('clientCity').textContent = currentClient.city || 'N/A';
    document.getElementById('clientAddress').textContent = currentClient.address || 'N/A';
    document.getElementById('clientInfo').textContent = currentClient.additionalInfo || 'Sin información adicional';
    
    // Actualizar título de la página
    document.title = `Cliente ${currentClient.firstName} ${currentClient.lastName} - DocTec`;
    
    // Calcular estadísticas
    calculateClientStats();
}

// Cargar órdenes del cliente
function loadClientOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const clientOrders = orders.filter(order => 
        order.clientName && order.clientName.toLowerCase().includes(currentClient.firstName.toLowerCase()) ||
        order.clientName && order.clientName.toLowerCase().includes(currentClient.lastName.toLowerCase())
    );
    
    const tbody = document.getElementById('clientOrdersBody');
    tbody.innerHTML = '';
    
    if (clientOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-light);">
                    <i class="fas fa-info-circle"></i> No hay órdenes registradas para este cliente
                </td>
            </tr>
        `;
        return;
    }
    
    clientOrders.forEach(order => {
        const row = document.createElement('tr');
        row.className = 'order-row';
        row.onclick = () => openOrderDetail(order.orderNumber);
        
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.product || 'N/A'}</td>
            <td>${order.brand || 'N/A'}</td>
            <td>${order.damage || 'N/A'}</td>
            <td>${formatDate(order.date)}</td>
            <td><span class="status-badge status-pending">Pendiente</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small" onclick="event.stopPropagation(); openOrderDetail('${order.orderNumber}')" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-small btn-print" onclick="event.stopPropagation(); printOrderPDF('${order.orderNumber}')" title="Imprimir PDF">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Calcular estadísticas del cliente
function calculateClientStats() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const clientOrders = orders.filter(order => 
        order.clientName && order.clientName.toLowerCase().includes(currentClient.firstName.toLowerCase()) ||
        order.clientName && order.clientName.toLowerCase().includes(currentClient.lastName.toLowerCase())
    );
    
    const totalOrders = clientOrders.length;
    const pendingOrders = clientOrders.filter(order => !order.status || order.status === 'pending').length;
    const completedOrders = clientOrders.filter(order => order.status === 'completed').length;
    const totalBilled = clientOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // Encontrar la última visita
    const lastVisit = clientOrders.length > 0 ? 
        clientOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null;
    
    // Actualizar estadísticas
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('totalBilled').textContent = `$${totalBilled.toLocaleString()}`;
    document.getElementById('lastVisit').textContent = lastVisit ? formatDate(lastVisit) : 'N/A';
}

// Abrir detalles de orden
function openOrderDetail(orderNumber) {
    window.location.href = `order-detail.html?order=${orderNumber}`;
}

// Imprimir PDF de orden
function printOrderPDF(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
        alert('Orden no encontrada');
        return;
    }

    // Crear contenido del PDF
    const pdfContent = generatePDFContent(order);
    
    // Abrir en nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Orden #${order.orderNumber}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    margin: 20px; 
                    color: #2c3e50;
                    line-height: 1.4;
                    background: white;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 1px solid #e0e0e0; 
                    padding-bottom: 15px; 
                    margin-bottom: 25px; 
                }
                .header h1 { 
                    color: #1e3a8a; 
                    font-size: 18px; 
                    margin: 0 0 5px 0; 
                    font-weight: 600; 
                }
                .header h2 { 
                    color: #64748b; 
                    font-size: 14px; 
                    margin: 0 0 8px 0; 
                    font-weight: 500; 
                }
                .header p { 
                    color: #6b7280; 
                    font-size: 12px; 
                    margin: 0; 
                }
                .section { 
                    margin-bottom: 25px; 
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }
                .section h3 { 
                    color: #1e3a8a; 
                    border-bottom: 1px solid #e5e7eb; 
                    padding-bottom: 8px; 
                    margin: 0 0 15px 0;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                .info-row { 
                    display: flex; 
                    flex-direction: column;
                    margin-bottom: 0; 
                }
                .label { 
                    font-weight: 600; 
                    font-size: 11px;
                    color: #374151;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .value { 
                    font-size: 13px;
                    color: #1f2937;
                    padding: 6px 8px;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid #d1d5db;
                    min-height: 16px;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .footer {
                    margin-top: 40px; 
                    text-align: center; 
                    font-size: 11px; 
                    color: #6b7280;
                    padding: 15px;
                    background: #f9fafb;
                    border-radius: 6px;
                    border-left: 3px solid #e5e7eb;
                }
                @media print { 
                    body { margin: 0; } 
                    .section { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${pdfContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// Generar contenido del PDF
function generatePDFContent(order) {
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return `
        <div class="header">
            <h1>DocTec - Orden de Trabajo</h1>
            <h2>Orden #${order.orderNumber}</h2>
            <p>Fecha de Registro: ${formatDate(order.date)}</p>
        </div>

        <div class="section">
            <h3>📋 Información del Cliente</h3>
            <div class="info-grid">
            <div class="info-row">
                    <span class="label">Nombre</span>
                <span class="value">${order.clientName || 'No especificado'}</span>
            </div>
            <div class="info-row">
                    <span class="label">Teléfono</span>
                <span class="value">${order.clientPhone || 'No especificado'}</span>
            </div>
            <div class="info-row">
                    <span class="label">Ciudad</span>
                <span class="value">${order.clientCity || 'No especificado'}</span>
            </div>
            <div class="info-row">
                    <span class="label">Dirección</span>
                <span class="value">${order.clientAddress || 'No especificado'}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>🛠️ Información del Producto</h3>
            <div class="info-grid">
            <div class="info-row">
                    <span class="label">Producto</span>
                <span class="value">${order.product}</span>
            </div>
            <div class="info-row">
                    <span class="label">Marca</span>
                <span class="value">${order.brand}</span>
            </div>
                <div class="info-row full-width">
                    <span class="label">Descripción del Daño</span>
                <span class="value">${order.damage}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString('es-ES')}</p>
            <p>DocTec - Sistema de Gestión de Talleres</p>
        </div>
    `;
}

// Editar cliente
function editClient() {
    // Llenar el formulario con los datos actuales
    document.getElementById('editFirstName').value = currentClient.firstName;
    document.getElementById('editLastName').value = currentClient.lastName;
    document.getElementById('editPhone').value = currentClient.phone;
    document.getElementById('editCity').value = currentClient.city;
    document.getElementById('editAddress').value = currentClient.address;
    document.getElementById('editInfo').value = currentClient.additionalInfo || '';
    
    // Mostrar el modal
    document.getElementById('editClientModal').style.display = 'block';
}

// Cerrar modal de edición
function closeEditModal() {
    document.getElementById('editClientModal').style.display = 'none';
}

// Eliminar cliente
function deleteClient() {
    if (confirm(`¿Está seguro que desea eliminar al cliente ${currentClient.firstName} ${currentClient.lastName}? Esta acción no se puede deshacer.`)) {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const updatedClients = clients.filter(client => client.id != clientId);
        localStorage.setItem('clients', JSON.stringify(updatedClients));
        
        alert('Cliente eliminado correctamente');
        window.location.href = 'clients.html';
    }
}

// Manejar envío del formulario de edición
document.getElementById('editClientForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const updatedClient = {
        ...currentClient,
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        phone: document.getElementById('editPhone').value,
        city: document.getElementById('editCity').value,
        address: document.getElementById('editAddress').value,
        additionalInfo: document.getElementById('editInfo').value
    };
    
    // Actualizar en localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const updatedClients = clients.map(client => 
        client.id == clientId ? updatedClient : client
    );
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    
    // Actualizar variable global
    currentClient = updatedClient;
    
    // Recargar detalles
    loadClientDetails();
    
    // Cerrar modal
    closeEditModal();
    
    alert('Cliente actualizado correctamente');
});

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('editClientModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
} 