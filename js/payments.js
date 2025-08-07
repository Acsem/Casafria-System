// Estructura para almacenar información de cobros
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];

// Cargar datos al iniciar
window.onload = function() {
    renderPayments();
    setupSearchListener();
};

// Renderizar la tabla de cobros
function renderPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    // Obtener cobros de órdenes existentes
    const ordersWithPayment = orders.filter(order => order.paymentInfo);
    
    // Combinar cobros de órdenes y cobros independientes
    const allPayments = [
        ...ordersWithPayment.map(order => ({
            ...order.paymentInfo,
            orderNumber: order.orderNumber,
            clientName: order.clientName,
            product: order.product,
            brand: order.brand,
            date: order.date,
            isFromOrder: true,
            orderId: order.id
        })),
        ...payments
    ];
    
    if (allPayments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <i class="fas fa-info-circle"></i> No hay cobros registrados.
                    <br><small>Los cobros aparecerán aquí una vez que se registren desde órdenes existentes o se creen nuevos cobros independientes.</small>
                </td>
            </tr>
        `;
        return;
    }

    allPayments.forEach(payment => {
        const statusText = getStatusText(payment.paymentStatus);
        const statusClass = getStatusClass(payment.paymentStatus);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${payment.orderNumber}</td>
            <td>${payment.clientName || 'No especificado'}</td>
            <td>${payment.product}</td>
            <td>${payment.brand || 'No especificada'}</td>
            <td>$${payment.serviceValue ? payment.serviceValue.toFixed(2) : '0.00'}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>${payment.paymentObservations || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editPayment('${payment.orderNumber}', ${payment.isFromOrder || false})" class="btn-small btn-icon-only" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePayment('${payment.orderNumber}', ${payment.isFromOrder || false})" class="btn-small btn-icon-only btn-danger" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para obtener texto del estado
function getStatusText(status) {
    switch(status) {
        case 'sin_cobro': return 'Sin Cobro';
        case 'pendiente_cobro': return 'Pendiente de Cobro';
        case 'cobrada': return 'Cobrada';
        default: return 'Sin Cobro';
    }
}

// Función para obtener clase CSS del estado
function getStatusClass(status) {
    switch(status) {
        case 'sin_cobro': return 'status-pending';
        case 'pendiente_cobro': return 'status-in-progress';
        case 'cobrada': return 'status-completed';
        default: return 'status-pending';
    }
}

// Función para editar cobro
function editPayment(orderNumber, isFromOrder = false) {
    if (isFromOrder) {
        // Editar cobro de una orden existente
        const order = orders.find(o => o.orderNumber === orderNumber);
        if (!order) return;

        const paymentInfo = order.paymentInfo || {
            serviceValue: 0,
            paymentStatus: 'sin_cobro',
            paymentObservations: ''
        };

        document.getElementById('orderId').value = orderNumber;
        document.getElementById('paymentStatus').value = paymentInfo.paymentStatus;
        document.getElementById('paymentAmount').value = paymentInfo.serviceValue;
        document.getElementById('paymentObservations').value = paymentInfo.paymentObservations;

        document.getElementById('paymentModal').style.display = 'block';
    } else {
        // Editar cobro independiente
        const payment = payments.find(p => p.orderNumber === orderNumber);
        if (!payment) return;

        document.getElementById('orderId').value = orderNumber;
        document.getElementById('paymentStatus').value = payment.paymentStatus;
        document.getElementById('paymentAmount').value = payment.serviceValue;
        document.getElementById('paymentObservations').value = payment.paymentObservations;

        document.getElementById('paymentModal').style.display = 'block';
    }
}

// Función para eliminar cobro
function deletePayment(orderNumber, isFromOrder = false) {
    if (confirm('¿Está seguro de que desea eliminar este cobro? Esta acción no se puede deshacer.')) {
        if (isFromOrder) {
            // Eliminar cobro de una orden existente
            const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
            
            if (orderIndex === -1) {
                showMessage('Orden no encontrada');
                return;
            }

            // Eliminar la información de pago de la orden
            delete orders[orderIndex].paymentInfo;
            
            // Guardar en localStorage
            localStorage.setItem('orders', JSON.stringify(orders));
        } else {
            // Eliminar cobro independiente
            const paymentIndex = payments.findIndex(p => p.orderNumber === orderNumber);
            
            if (paymentIndex === -1) {
                showMessage('Cobro no encontrado');
                return;
            }

            // Eliminar el cobro independiente
            payments.splice(paymentIndex, 1);
            
            // Guardar en localStorage
            localStorage.setItem('payments', JSON.stringify(payments));
        }
        
        // Actualizar la vista
        renderPayments();
        showMessage('Cobro eliminado exitosamente');
    }
}

// Cerrar modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Manejar el formulario de cobro
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderNumber = document.getElementById('orderId').value;
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    const paymentIndex = payments.findIndex(p => p.orderNumber === orderNumber);
    
    if (orderIndex !== -1) {
        // Actualizar información de cobro en la orden existente
        if (!orders[orderIndex].paymentInfo) {
            orders[orderIndex].paymentInfo = {};
        }

        orders[orderIndex].paymentInfo = {
            serviceValue: parseFloat(document.getElementById('paymentAmount').value) || 0,
            paymentStatus: document.getElementById('paymentStatus').value,
            paymentObservations: document.getElementById('paymentObservations').value,
            lastUpdate: new Date().toISOString()
        };

        localStorage.setItem('orders', JSON.stringify(orders));
    } else if (paymentIndex !== -1) {
        // Actualizar cobro independiente
        payments[paymentIndex] = {
            ...payments[paymentIndex],
            serviceValue: parseFloat(document.getElementById('paymentAmount').value) || 0,
            paymentStatus: document.getElementById('paymentStatus').value,
            paymentObservations: document.getElementById('paymentObservations').value,
            lastUpdate: new Date().toISOString()
        };

        localStorage.setItem('payments', JSON.stringify(payments));
    } else {
        showMessage('Cobro no encontrado');
        return;
    }

    renderPayments();
    closePaymentModal();
    showMessage('Información de cobro actualizada exitosamente');
});

// Configurar buscador
function setupSearchListener() {
    document.getElementById('searchPayment').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // Filtrar órdenes con información de pago
        const filteredOrders = orders.filter(order => 
            order.paymentInfo && (
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                (order.clientName && order.clientName.toLowerCase().includes(searchTerm)) ||
                order.product.toLowerCase().includes(searchTerm) ||
                (order.brand && order.brand.toLowerCase().includes(searchTerm))
            )
        );
        
        // Filtrar cobros independientes
        const filteredPayments = payments.filter(payment => 
            payment.orderNumber.toLowerCase().includes(searchTerm) ||
            (payment.clientName && payment.clientName.toLowerCase().includes(searchTerm)) ||
            payment.product.toLowerCase().includes(searchTerm) ||
            (payment.brand && payment.brand.toLowerCase().includes(searchTerm))
        );
        
        renderFilteredPayments(filteredOrders, filteredPayments);
    });
}

// Renderizar cobros filtrados
function renderFilteredPayments(filteredOrders, filteredPayments) {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    // Combinar cobros filtrados
    const allFilteredPayments = [
        ...filteredOrders.map(order => ({
            ...order.paymentInfo,
            orderNumber: order.orderNumber,
            clientName: order.clientName,
            product: order.product,
            brand: order.brand,
            date: order.date,
            isFromOrder: true,
            orderId: order.id
        })),
        ...filteredPayments
    ];

    if (allFilteredPayments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <i class="fas fa-search"></i> No se encontraron cobros que coincidan con la búsqueda.
                </td>
            </tr>
        `;
        return;
    }

    allFilteredPayments.forEach(payment => {
        const statusText = getStatusText(payment.paymentStatus);
        const statusClass = getStatusClass(payment.paymentStatus);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${payment.orderNumber}</td>
            <td>${payment.clientName || 'No especificado'}</td>
            <td>${payment.product}</td>
            <td>${payment.brand || 'No especificada'}</td>
            <td>$${payment.serviceValue ? payment.serviceValue.toFixed(2) : '0.00'}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>${payment.paymentObservations || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editPayment('${payment.orderNumber}', ${payment.isFromOrder || false})" class="btn-small btn-icon-only" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePayment('${payment.orderNumber}', ${payment.isFromOrder || false})" class="btn-small btn-icon-only btn-danger" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Mostrar mensaje
function showMessage(message) {
    // Crear un toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e3a8a;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Exportar a Excel
function exportToExcel() {
    try {
        // Obtener todos los cobros (órdenes con pago + cobros independientes)
        const ordersWithPayment = orders.filter(order => order.paymentInfo);
        const allPayments = [
            ...ordersWithPayment.map(order => ({
                ...order.paymentInfo,
                orderNumber: order.orderNumber,
                clientName: order.clientName,
                product: order.product,
                brand: order.brand,
                date: order.date,
                isFromOrder: true,
                orderId: order.id
            })),
            ...payments
        ];

        if (allPayments.length === 0) {
            showMessage('No hay cobros para exportar');
            return;
        }

        // Preparar datos para Excel
        const excelData = allPayments.map(payment => ({
            'Número de Orden': payment.orderNumber,
            'Cliente': payment.clientName || 'No especificado',
            'Producto': payment.product,
            'Marca': payment.brand || 'No especificada',
            'Valor del Servicio': `$${payment.serviceValue ? payment.serviceValue.toFixed(2) : '0.00'}`,
            'Estado del Pago': getStatusText(payment.paymentStatus),
            'Fecha': new Date(payment.date).toLocaleDateString(),
            'Observaciones': payment.paymentObservations || '-',
            'Tipo': payment.isFromOrder ? 'Cobro de Orden' : 'Cobro Independiente',
            'Última Actualización': new Date(payment.lastUpdate).toLocaleString()
        }));

        // Crear tabla HTML para exportar
        let tableHTML = `
            <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #1e3a8a; color: white; font-weight: bold;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Número de Orden</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Cliente</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Producto</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Marca</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Valor del Servicio</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Estado del Pago</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Fecha</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Observaciones</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Tipo</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Última Actualización</th>
                    </tr>
                </thead>
                <tbody>
        `;

        excelData.forEach(row => {
            tableHTML += `
                <tr>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Número de Orden']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Cliente']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Producto']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Marca']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Valor del Servicio']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Estado del Pago']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Fecha']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Observaciones']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Tipo']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Última Actualización']}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        // Crear contenido completo del documento
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Cobros - DocTec</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #1e3a8a; margin-bottom: 5px; }
                    .header p { color: #666; margin: 0; }
                    .summary { margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
                    .summary h3 { color: #1e3a8a; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #1e3a8a; color: white; padding: 10px; border: 1px solid #ddd; }
                    td { padding: 8px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Reporte de Cobros</h1>
                    <p>DocTec - Sistema de Gestión de Órdenes</p>
                    <p>Generado el: ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="summary">
                    <h3>Resumen del Reporte</h3>
                    <p><strong>Total de cobros:</strong> ${allPayments.length}</p>
                    <p><strong>Cobros de órdenes:</strong> ${ordersWithPayment.length}</p>
                    <p><strong>Cobros independientes:</strong> ${payments.length}</p>
                    <p><strong>Valor total:</strong> $${allPayments.reduce((sum, p) => sum + (p.serviceValue || 0), 0).toFixed(2)}</p>
                </div>
                
                ${tableHTML}
            </body>
            </html>
        `;

        // Crear blob y descargar
        const blob = new Blob([fullHTML], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Cobros_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showMessage(`Reporte exportado exitosamente. Total: ${allPayments.length} cobros`);

    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        showMessage('Error al exportar el reporte. Por favor, intente nuevamente.');
    }
}

// Función para cargar nuevas órdenes
function loadNewOrders() {
    // Recargar las órdenes y cobros desde localStorage
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    payments = JSON.parse(localStorage.getItem('payments')) || [];
    renderPayments();
    showMessage('Datos actualizados');
}

// Función para mostrar el modal de nuevo cobro
function showNewPaymentForm() {
    document.getElementById('newPaymentForm').reset();
    document.getElementById('newPaymentDate').valueAsDate = new Date();
    document.getElementById('newPaymentModal').style.display = 'block';
}

// Función para cerrar el modal de nuevo cobro
function closeNewPaymentModal() {
    document.getElementById('newPaymentModal').style.display = 'none';
}

// Manejar el formulario de nuevo cobro
document.getElementById('newPaymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderNumber = document.getElementById('newOrderNumber').value.trim();
    const clientName = document.getElementById('newClientName').value.trim();
    const product = document.getElementById('newService').value.trim();
    const paymentDate = document.getElementById('newPaymentDate').value;
    const paymentAmount = parseFloat(document.getElementById('newPaymentAmount').value);
    const paymentStatus = document.getElementById('newPaymentStatus').value;
    const paymentObservations = document.getElementById('newPaymentObservations').value.trim();

    // Validar campos requeridos
    if (!orderNumber || !clientName || !product || !paymentDate || !paymentAmount) {
        showMessage('Por favor, complete todos los campos requeridos.');
        return;
    }

    // Verificar si el número de orden ya existe en órdenes
    if (orders.some(o => o.orderNumber === orderNumber)) {
        showMessage('El número de orden ya existe en las órdenes registradas. Por favor, use un número diferente.');
        return;
    }

    // Verificar si el número de orden ya existe en cobros independientes
    if (payments.some(p => p.orderNumber === orderNumber)) {
        showMessage('El número de orden ya existe en los cobros. Por favor, use un número diferente.');
        return;
    }

    // Crear nuevo cobro independiente
    const newPayment = {
        id: Date.now(),
        orderNumber: orderNumber,
        clientName: clientName,
        product: product,
        brand: 'No especificada',
        date: paymentDate,
        serviceValue: paymentAmount,
        paymentStatus: paymentStatus,
        paymentObservations: paymentObservations,
        lastUpdate: new Date().toISOString()
    };

    // Agregar el nuevo cobro independiente
    payments.push(newPayment);

    // Guardar en localStorage
    localStorage.setItem('payments', JSON.stringify(payments));

    // Actualizar la vista
    renderPayments();
    closeNewPaymentModal();
    showMessage('Cobro independiente registrado exitosamente');
    
    // Limpiar el formulario
    this.reset();
}); 