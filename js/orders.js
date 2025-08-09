// Utilidades para localStorage
function getOrders() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Agregar órdenes de ejemplo si no existen
    if (orders.length === 0) {
        orders = [
            {
                orderNumber: 'ORD001',
                clientName: 'Juan Pérez',
                clientDocument: '1234567890',
                clientPhone: '0991234567',
                clientCity: 'Guayaquil',
                clientAddress: 'Av. Principal 123',
                clientReference: 'Frente al parque',
                product: 'Laptop HP',
                brand: 'HP',
                purchaseDate: '2023-01-15',
                warrantyStatus: 'Vigente',
                damage: 'No enciende, pantalla negra',
                date: '2024-01-20',
                notes: ['Diagnóstico: Problema de fuente de poder', 'Cliente autoriza reparación']
            },
            {
                orderNumber: 'ORD002',
                clientName: 'María García',
                clientDocument: '2345678901',
                clientPhone: '0992345678',
                clientCity: 'Quito',
                clientAddress: 'Calle 10 de Agosto 456',
                clientReference: 'Casa azul',
                product: 'Smartphone Samsung',
                brand: 'Samsung',
                purchaseDate: '2022-06-10',
                warrantyStatus: 'Vencida',
                damage: 'Pantalla rota, no responde al tacto',
                date: '2024-01-22',
                notes: ['Presupuesto enviado al cliente']
            },
            {
                orderNumber: 'ORD003',
                clientName: 'Carlos López',
                clientDocument: '3456789012',
                clientPhone: '0993456789',
                clientCity: 'Cuenca',
                clientAddress: 'Av. Solano 789',
                clientReference: 'Edificio comercial',
                product: 'Impresora Canon',
                brand: 'Canon',
                purchaseDate: '2023-03-20',
                warrantyStatus: 'Vigente',
                damage: 'Atascamiento de papel frecuente',
                date: '2024-01-25',
                notes: ['Limpieza realizada', 'Cliente satisfecho']
            },
            {
                orderNumber: 'ORD004',
                clientName: 'Ana Rodríguez',
                clientDocument: '4567890123',
                clientPhone: '0994567890',
                clientCity: 'Manta',
                clientAddress: 'Calle 15 321',
                clientReference: 'Cerca del malecón',
                product: 'Tablet iPad',
                brand: 'Apple',
                purchaseDate: '2022-12-05',
                warrantyStatus: 'Sin Garantía',
                damage: 'Batería no carga, se apaga rápido',
                date: '2024-01-28',
                notes: ['Batería reemplazada', 'Pruebas exitosas']
            },
            {
                orderNumber: 'ORD005',
                clientName: 'Luis Torres',
                clientDocument: '5678901234',
                clientPhone: '0995678901',
                clientCity: 'Portoviejo',
                clientAddress: 'Av. Manabí 654',
                clientReference: 'Frente a la plaza',
                product: 'Monitor LG',
                brand: 'LG',
                purchaseDate: '2023-08-12',
                warrantyStatus: 'Vigente',
                damage: 'Líneas verticales en pantalla',
                date: '2024-01-30',
                notes: ['Panel LCD defectuoso', 'En espera de repuesto']
            }
        ];
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    return orders;
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Función para calcular el total de costos
function calculateTotal(order) {
    const serviceValue = order.paymentInfo?.serviceValue || 0;
    const ivaValue = order.paymentInfo?.ivaValue || 0;
    const total = serviceValue + ivaValue;
    return total.toFixed(2);
}

// Renderizar la tabla de órdenes
function renderOrders() {
    const orders = getOrders();
    const tbody = document.getElementById('ordersBody');
    tbody.innerHTML = '';
    
    updateOrdersCounter(orders.length, orders.length);
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay órdenes registradas</td></tr>';
        return;
    }
    
    orders.forEach((order, idx) => {
        const notesCount = (order.notes || []).length;
        const currentStatus = order.status || 'ingresada';
        const statusText = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
        
        const tr = document.createElement('tr');
        tr.className = 'order-row';
        tr.setAttribute('data-order-number', order.orderNumber);
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.clientName}</td>
            <td>${order.product}</td>
            <td>${order.brand}</td>
            <td>${order.damage}</td>
            <td>${order.date}</td>
            <td>
                <span class="status-badge status-${currentStatus}">${statusText}</span>
            </td>
            <td>
                <div class="notes-counter">
                    <span class="notes-badge">${notesCount}</span>
                    <span class="notes-label">nota${notesCount !== 1 ? 's' : ''}</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small" onclick="event.stopPropagation(); showNoteModal('${order.orderNumber}')" title="Agregar Nota">
                        <i class="fas fa-comment-alt"></i>
                    </button>
                    <button class="btn-small btn-print" onclick="event.stopPropagation(); printOrderPDF('${order.orderNumber}')" title="Imprimir PDF">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-small btn-delete" onclick="event.stopPropagation(); deleteOrder('${order.orderNumber}')" title="Eliminar Orden">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Agregar evento click para abrir detalles
        tr.addEventListener('click', function() {
            openOrderDetail(order.orderNumber);
        });
        
        tbody.appendChild(tr);
    });
    
    // Actualizar resumen de filtros
    updateFilterSummary();
}

// Modal Nueva Orden
function showNewOrderForm() {
    document.getElementById('newOrderModal').style.display = 'block';
}
function closeNewOrderForm() {
    document.getElementById('newOrderModal').style.display = 'none';
    document.getElementById('newOrderForm').reset();
}

document.getElementById('newOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const orders = getOrders();
    const orderNumber = document.getElementById('orderNumber').value.trim();
    if (orders.some(o => o.orderNumber === orderNumber)) {
        alert('El número de orden ya existe. Usa uno diferente.');
        return;
    }
    const newOrder = {
        orderNumber,
        clientName: document.getElementById('clientName').value.trim(),
        clientDocument: document.getElementById('clientDocument').value.trim(),
        clientPhone: document.getElementById('clientPhone').value.trim(),
        clientCity: document.getElementById('clientCity').value.trim(),
        clientAddress: document.getElementById('clientAddress').value.trim(),
        clientReference: document.getElementById('clientReference').value.trim(),
        product: document.getElementById('product').value.trim(),
        brand: document.getElementById('brand').value.trim(),
        purchaseDate: document.getElementById('purchaseDate').value,
        warrantyStatus: document.getElementById('warrantyStatus').value,
        damage: document.getElementById('damage').value.trim(),
        date: document.getElementById('orderDate').value,
        notes: []
    };
    orders.push(newOrder);
    saveOrders(orders);
    closeNewOrderForm();
    renderOrders();
    updateOrdersCounter(orders.length, orders.length);
});

// Modal Notas
function showNoteModal(orderNumber) {
    document.getElementById('noteOrderId').value = orderNumber;
    document.getElementById('noteText').value = '';
    document.getElementById('noteModal').style.display = 'block';
}
function closeNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
    document.getElementById('noteForm').reset();
}

document.getElementById('noteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const orderNumber = document.getElementById('noteOrderId').value;
    const note = document.getElementById('noteText').value.trim();
    if (!note) return;
    const orders = getOrders();
    const idx = orders.findIndex(o => o.orderNumber === orderNumber);
    if (idx !== -1) {
        if (!orders[idx].notes) orders[idx].notes = [];
        orders[idx].notes.push(note);
        saveOrders(orders);
        renderOrders();
    }
    closeNoteModal();
});

// Exportar a Excel
function exportToExcel() {
    const orders = getOrders();
    if (orders.length === 0) {
        alert('No hay órdenes para exportar.');
        return;
    }
    const data = orders.map(order => ({
        'N° Orden': order.orderNumber,
        'Cliente': order.clientName,
        'Producto': order.product,
        'Marca': order.brand,
        'Daño': order.damage,
        'Fecha': order.date,
        'Notas': (order.notes || []).join(' | ')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Órdenes');
    XLSX.writeFile(wb, 'ordenes.xlsx');
}

// Abrir detalles de orden
function openOrderDetail(orderNumber) {
    window.location.href = `order-detail.html?order=${orderNumber}`;
}

// Eliminar orden
function deleteOrder(orderNumber) {
    if (confirm(`¿Está seguro que desea eliminar la orden #${orderNumber}? Esta acción no se puede deshacer.`)) {
        const orders = getOrders();
        const filteredOrders = orders.filter(order => order.orderNumber !== orderNumber);
        saveOrders(filteredOrders);
        renderOrders();
        updateOrdersCounter(filteredOrders.length, filteredOrders.length);
    }
}

// Generar PDF de la orden
async function printOrderPDF(orderNumber) {
    try {
    const orders = getOrders();
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
        alert('Orden no encontrada');
        return;
    }

        // Crear un elemento temporal para el PDF
        const element = document.createElement('div');
        element.innerHTML = `
            <div class="pdf-container" style="font-family: ${pdfConfig.font.family}; max-width: 800px; margin: 0 auto; padding: 15px; background: white;">
                <style>
                    .pdf-container { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        color: #2c3e50;
                        line-height: 1.4;
                    }
                    .pdf-header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: flex-start; 
                        margin-bottom: 20px; 
                        border-bottom: 1px solid #e0e0e0; 
                        padding-bottom: 15px; 
                    }
                    .company-info { 
                        display: flex; 
                        align-items: center; 
                        gap: 12px; 
                        flex: 2;
                    }
                    .company-logo { 
                        width: 50px; 
                        height: auto; 
                        border-radius: 8px;
                    }
                    .company-details h1 { 
                        color: #1e3a8a; 
                        font-size: 13px; 
                        margin: 0 0 2px 0; 
                        font-weight: 600; 
                    }
                    .company-details .slogan { 
                        color: #64748b; 
                        font-size: 9px; 
                        margin: 0 0 2px 0; 
                        font-weight: 500; 
                    }
                    .company-details .owner { 
                        font-size: 9px; 
                        margin: 0 0 2px 0; 
                        font-weight: 600; 
                        color: #374151;
                    }
                    .company-details p { 
                        margin: 1px 0; 
                        font-size: 7px; 
                        color: #6b7280; 
                    }
                    .document-title { 
                        text-align: center; 
                        flex: 1;
                    }
                    .document-title h2 { 
                        color: #1e3a8a; 
                        font-size: 15px; 
                        margin: 0 0 4px 0; 
                        font-weight: 600; 
                    }
                    .document-title .series { 
                        font-size: 9px; 
                        margin: 0; 
                        font-weight: 500; 
                        color: #64748b;
                    }

                    .section-header { 
                        background: #f8fafc; 
                        color: #1e3a8a; 
                        padding: 6px 10px; 
                        font-weight: 600; 
                        font-size: 9px; 
                        margin: 12px 0 6px 0; 
                        border-left: 3px solid #1e3a8a;
                        border-radius: 0 4px 4px 0;
                    }
                    
                    /* Diseño compacto para información del cliente */
                    .client-info-compact {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                        margin: 8px 0;
                        background: #f8fafc;
                        padding: 10px;
                        border-radius: 6px;
                        border: 1px solid #e5e7eb;
                    }
                    
                    .info-field-compact { 
                        display: flex; 
                        flex-direction: column; 
                        margin-bottom: 0; 
                    }
                    .info-field-compact label { 
                        font-weight: 600; 
                        font-size: 7px; 
                        margin-bottom: 3px; 
                        color: #374151;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .info-field-compact .input-line { 
                        border-bottom: 1px solid #d1d5db; 
                        height: 12px; 
                        padding: 2px 4px; 
                        font-size: 8px; 
                        background: white;
                        border-radius: 2px;
                    }
                    
                    .info-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 8px; 
                        margin: 6px 0; 
                    }
                    .info-field { 
                        display: flex; 
                        flex-direction: column; 
                        margin-bottom: 3px; 
                    }
                    .info-field label { 
                        font-weight: 600; 
                        font-size: 7px; 
                        margin-bottom: 1px; 
                        color: #374151;
                    }
                    .info-field .input-line { 
                        border-bottom: 1px solid #d1d5db; 
                        height: 12px; 
                        padding: 1px 3px; 
                        font-size: 8px; 
                        background: white;
                        border-radius: 2px;
                    }
                    .full-width { grid-column: 1 / -1; }
                    .text-area { 
                        border: 1px solid #d1d5db; 
                        min-height: 40px; 
                        padding: 6px; 
                        font-size: 9px; 
                        margin: 4px 0; 
                        border-radius: 4px;
                        background: white;
                    }
                    .date-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; 
                        gap: 2px; 
                        margin: 2px 0; 
                    }
                    .date-field { 
                        text-align: center; 
                        font-size: 6px; 
                        font-weight: 600; 
                        color: #374151;
                    }
                    .date-box { 
                        border: 1px solid #d1d5db; 
                        height: 12px; 
                        margin-top: 1px; 
                        border-radius: 2px;
                        background: white;
                    }
                    
                    /* Sección compacta de solicitud y terminación */
                    .service-sections-compact {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin: 6px 0;
                    }
                    .service-section-compact {
                        background: #f8fafc;
                        padding: 6px;
                        border-radius: 4px;
                        border: 1px solid #e5e7eb;
                    }
                    .service-section-compact .section-header {
                        margin: 0 0 4px 0;
                        padding: 3px 6px;
                        font-size: 8px;
                    }
                    .service-subtitle {
                        font-size: 6px;
                        font-weight: 600;
                        margin-bottom: 2px;
                        color: #374151;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .compact-date-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
                        gap: 2px;
                        margin: 2px 0;
                    }
                    .compact-date-field {
                        text-align: center;
                        font-size: 6px;
                        font-weight: 600;
                        color: #374151;
                    }
                    .compact-date-box {
                        border: 1px solid #d1d5db;
                        height: 12px;
                        margin-top: 1px;
                        border-radius: 2px;
                        background: white;
                        font-size: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .article-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 6px 0; 
                        border-radius: 6px;
                        overflow: hidden;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .article-table th, .article-table td { 
                        border: 1px solid #e5e7eb; 
                        padding: 4px; 
                        text-align: center; 
                        font-size: 8px; 
                    }
                    .article-table th { 
                        background: #1e3a8a; 
                        color: white; 
                        font-weight: 600; 
                    }
                    .article-table td {
                        background: white;
                    }
                    
                    /* Tablas compactas para artículos y repuestos */
                    .compact-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 4px 0;
                        border-radius: 4px;
                        overflow: hidden;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    }
                    .compact-table th, .compact-table td {
                        border: 1px solid #e5e7eb;
                        padding: 2px 3px;
                        text-align: center;
                        font-size: 7px;
                        height: 16px;
                    }
                    .compact-table th {
                        background: #1e3a8a;
                        color: white;
                        font-weight: 600;
                        font-size: 7px;
                    }
                    .compact-table td {
                        background: white;
                    }
                    .compact-checkbox-group {
                        display: flex;
                        gap: 8px;
                        justify-content: center;
                    }
                    .compact-checkbox-item {
                        display: flex;
                        align-items: center;
                        gap: 2px;
                    }
                    .compact-checkbox-item input {
                        width: 8px;
                        height: 8px;
                    }
                    .compact-checkbox-item span {
                        font-size: 6px;
                        font-weight: 600;
                    }
                    .warranty-section { 
                        display: flex; 
                        align-items: center; 
                        gap: 15px; 
                        margin: 6px 0; 
                    }
                    .checkbox-group { display: flex; gap: 15px; }
                    .checkbox-item { display: flex; align-items: center; gap: 3px; }
                    .checkbox-item input { width: 12px; height: 12px; }
                    .checkbox-item span { font-size: 8px; font-weight: 600; }
                    .cost-summary { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 8px; 
                        margin: 4px 0; 
                    }
                    .warehouse-data, .cost-data { 
                        border: 1px solid #e5e7eb; 
                        padding: 4px; 
                        border-radius: 4px;
                        background: white;
                    }
                    .warehouse-data h4, .cost-data h4 { 
                        background: #1e3a8a; 
                        color: white; 
                        padding: 2px 6px; 
                        margin: -4px -4px 4px -4px; 
                        font-size: 8px; 
                        font-weight: 600; 
                        border-radius: 4px 4px 0 0;
                    }
                    .cost-row { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                        margin: 2px 0; 
                        font-size: 7px; 
                    }
                    .cost-row .label { font-weight: 600; }
                    .cost-row .value { 
                        border-bottom: 1px solid #d1d5db; 
                        width: 50px; 
                        height: 10px; 
                        text-align: center; 
                        background: white;
                        border-radius: 2px;
                    }

                    .signatures { 
                        display: flex; 
                        justify-content: space-between; 
                        margin: 20px 0; 
                    }
                    .signature-box { text-align: center; }
                    .signature-line { 
                        border-bottom: 1px solid #d1d5db; 
                        width: 120px; 
                        height: 20px; 
                        margin-bottom: 4px; 
                        background: white;
                        border-radius: 2px;
                    }
                    .signature-label { 
                        font-size: 9px; 
                        font-weight: 600; 
                        margin: 0; 
                        color: #374151;
                    }
                    .disclaimer { 
                        font-size: 7px; 
                        margin: 15px 0; 
                        text-align: justify; 
                        line-height: 1.3; 
                        color: #6b7280;
                        background: #f9fafb;
                        padding: 8px;
                        border-left: 3px solid #e5e7eb;
                    }
                </style>

                <!-- Header -->
                <div class="pdf-header">
                    <div class="company-info">
                        <img src="${pdfConfig.company.logo}" class="company-logo" alt="Casafria Logo">
                        <div class="company-details">
                            <h1>${pdfConfig.company.name}</h1>
                            <p class="slogan">${pdfConfig.company.slogan}</p>
                            <p class="owner">${pdfConfig.company.owner}</p>
                            <p>${pdfConfig.company.address}</p>
                            <p>${pdfConfig.company.phone}</p>
                            <p>info</p>
                        </div>
                    </div>
                    <div class="document-title">
                        <h2>${pdfConfig.document.title}</h2>
                        <p class="series">${order.orderNumber}</p>
                    </div>
                </div>

                <!-- Información del Cliente - Diseño Compacto -->
                <div class="section-header">${pdfConfig.sections.clientInfo}</div>
                <div class="client-info-compact">
                    <div class="info-field-compact">
                        <label>${pdfConfig.fields.clientId}</label>
                        <div class="input-line">${order.clientDocument || '________________'}</div>
                    </div>
                    <div class="info-field-compact">
                        <label>${pdfConfig.fields.user}</label>
                        <div class="input-line">${order.clientName || '________________'}</div>
                    </div>
                    <div class="info-field-compact">
                        <label>${pdfConfig.fields.phone}</label>
                        <div class="input-line">${order.clientPhone || '________________'}</div>
                    </div>
                    <div class="info-field-compact">
                        <label>${pdfConfig.fields.address}</label>
                        <div class="input-line">${order.clientAddress || '________________'}</div>
                    </div>
                    <div class="info-field-compact">
                        <label>${pdfConfig.fields.city}</label>
                        <div class="input-line">${order.clientCity || '________________'}</div>
                    </div>
                    <div class="info-field-compact">
                        <label>DOMICILIO</label>
                        <div class="input-line">________________</div>
                    </div>
                </div>

                <!-- Solicitud y Terminación del Servicio - Compacto -->
                <div class="service-sections-compact">
                    <div class="service-section-compact">
                        <div class="section-header">${pdfConfig.sections.serviceRequest}</div>
                        <div style="margin: 2px 0;">
                            <div class="service-subtitle">REVISIÓN</div>
                            <div class="compact-date-grid">
                                <div class="compact-date-field">${pdfConfig.fields.domicile}</div>
                                <div class="compact-date-field">${pdfConfig.fields.warehouse}</div>
                                <div class="compact-date-field">${pdfConfig.fields.pickup}</div>
                                <div class="compact-date-field">${pdfConfig.fields.day}</div>
                                <div class="compact-date-field">${pdfConfig.fields.month}</div>
                                <div class="compact-date-field">${pdfConfig.fields.year}</div>
                            </div>
                            <div class="compact-date-grid">
                                <div class="compact-date-box"></div>
                                <div class="compact-date-box"></div>
                                <div class="compact-date-box"></div>
                                <div class="compact-date-box">${order.date ? new Date(order.date).getDate().toString().padStart(2, '0') : ''}</div>
                                <div class="compact-date-box">${order.date ? (new Date(order.date).getMonth() + 1).toString().padStart(2, '0') : ''}</div>
                                <div class="compact-date-box">${order.date ? new Date(order.date).getFullYear() : ''}</div>
                            </div>
                        </div>
                    </div>
                    <div class="service-section-compact">
                        <div class="section-header">${pdfConfig.sections.serviceCompletion}</div>
                        <div style="margin: 2px 0;">
                            <div class="compact-date-grid">
                                <div class="compact-date-field">${pdfConfig.fields.day}</div>
                                <div class="compact-date-field">${pdfConfig.fields.month}</div>
                                <div class="compact-date-field">${pdfConfig.fields.year}</div>
                            </div>
                            <div class="compact-date-grid">
                                <div class="compact-date-box">${new Date().getDate().toString().padStart(2, '0')}</div>
                                <div class="compact-date-box">${(new Date().getMonth() + 1).toString().padStart(2, '0')}</div>
                                <div class="compact-date-box">${new Date().getFullYear()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Datos de Artículos -->
                <div class="section-header">${pdfConfig.sections.articleData}</div>
                <table class="compact-table">
                    <thead>
                        <tr>
                            <th>${pdfConfig.fields.model}</th>
                            <th>${pdfConfig.fields.series}</th>
                            <th>${pdfConfig.fields.voltage}</th>
                            <th>${pdfConfig.fields.warranty}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${order.product || '________________'}</td>
                            <td>________________</td>
                            <td>${order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString('es-ES') : '________________'}</td>
                            <td>
                                <div class="compact-checkbox-group">
                                    <div class="compact-checkbox-item">
                                        <input type="checkbox" ${order.warrantyStatus === 'Vigente' ? 'checked' : ''}>
                                        <span>${pdfConfig.fields.yes}</span>
                                    </div>
                                    <div class="compact-checkbox-item">
                                        <input type="checkbox" ${order.warrantyStatus === 'Vencida' || order.warrantyStatus === 'Sin Garantía' ? 'checked' : ''}>
                                        <span>${pdfConfig.fields.no}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                            <td>
                                <div class="compact-checkbox-group">
                                    <div class="compact-checkbox-item">
                                        <input type="checkbox">
                                        <span>${pdfConfig.fields.yes}</span>
                                    </div>
                                    <div class="compact-checkbox-item">
                                        <input type="checkbox">
                                        <span>${pdfConfig.fields.no}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                            <td>
                                <div class="compact-checkbox-group">
                                    <div class="compact-checkbox-item">
                                        <input type="checkbox">
                                        <span>${pdfConfig.fields.yes}</span>
                                    </div>
                                    <div class="compact-checkbox-item">
                                        <input type="checkbox">
                                        <span>${pdfConfig.fields.no}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Daños y Solución -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 10px 0;">
                    <div>
                        <div class="section-header">${pdfConfig.sections.reportedDamage}</div>
                        <div class="text-area">${order.damage || '_________________________________________________________________<br>_________________________________________________________________<br>_________________________________________________________________'}</div>
                    </div>
                    <div>
                        <div class="section-header">${pdfConfig.sections.actualDamage}</div>
                        <div class="text-area">_________________________________________________________________<br>_________________________________________________________________<br>_________________________________________________________________</div>
                    </div>
                    <div>
                        <div class="section-header">${pdfConfig.sections.solution}</div>
                        <div class="text-area">_________________________________________________________________<br>_________________________________________________________________<br>_________________________________________________________________</div>
                    </div>
                </div>

                <!-- Datos de Repuestos -->
                <div class="section-header">${pdfConfig.sections.partsData}</div>
                <table class="compact-table">
                    <thead>
                        <tr>
                            <th>${pdfConfig.fields.partCode}</th>
                            <th>${pdfConfig.fields.spareCode}</th>
                            <th>${pdfConfig.fields.quantity}</th>
                            <th>${pdfConfig.fields.spare}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                        </tr>
                        <tr>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                        </tr>
                        <tr>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                            <td>________________</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Datos de Almacén y Costos -->
                <div class="cost-summary">
                    <div class="warehouse-data">
                        <h4>${pdfConfig.sections.warehouseData}</h4>
                        <div class="info-field">
                            <label>${pdfConfig.fields.warehouse}</label>
                            <div class="input-line">________________</div>
                        </div>
                        <div class="info-field">
                            <label>${pdfConfig.fields.purchaseDate}</label>
                            <div class="date-grid">
                                <div class="date-field">${pdfConfig.fields.day}</div>
                                <div class="date-field">${pdfConfig.fields.month}</div>
                                <div class="date-field">${pdfConfig.fields.year}</div>
                            </div>
                            <div class="date-grid">
                                <div class="date-box">${order.purchaseDate ? new Date(order.purchaseDate).getDate().toString().padStart(2, '0') : ''}</div>
                                <div class="date-box">${order.purchaseDate ? (new Date(order.purchaseDate).getMonth() + 1).toString().padStart(2, '0') : ''}</div>
                                <div class="date-box">${order.purchaseDate ? new Date(order.purchaseDate).getFullYear() : ''}</div>
                            </div>
                        </div>
                    </div>
                    <div class="cost-data">
                        <h4>RESUMEN DE COSTOS</h4>
                        <div class="cost-row">
                            <span class="label">${pdfConfig.fields.mileage}</span>
                            <span>Km.</span>
                            <div class="value">$${order.kilometer ? order.kilometer.toLocaleString() : '0'}</div>
                        </div>
                        <div class="cost-row">
                            <span class="label">${pdfConfig.fields.labor}</span>
                            <span></span>
                            <div class="value">$${order.paymentInfo?.serviceValue ? order.paymentInfo.serviceValue.toFixed(2) : '0.00'}</div>
                        </div>
                        <div class="cost-row">
                            <span class="label">${pdfConfig.fields.iva}</span>
                            <span>${order.paymentInfo?.ivaPercentage || 15}%</span>
                            <div class="value">$${order.paymentInfo?.ivaValue ? order.paymentInfo.ivaValue.toFixed(2) : '0.00'}</div>
                        </div>
                        <div class="cost-row">
                            <span class="label">${pdfConfig.fields.total}</span>
                            <span></span>
                            <div class="value">$${calculateTotal(order)}</div>
                        </div>
                    </div>
                </div>



                <!-- Observaciones -->
                <div class="section-header">${pdfConfig.sections.observations}</div>
                <div class="text-area">_________________________________________________________________<br>_________________________________________________________________<br>_________________________________________________________________</div>

                <!-- Disclaimer -->
                <div class="disclaimer">
                    ${pdfConfig.texts.disclaimer}
                </div>

                <!-- Firmas -->
                <div class="signatures">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <p class="signature-label">${pdfConfig.technicalReport.technicianSignature}</p>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <p class="signature-label">${pdfConfig.technicalReport.clientSignature}</p>
                    </div>
                </div>
            </div>
        `;

        // Opciones para el PDF
        const opt = {
            margin: [10, 10],
            filename: `orden_servicio_${order.orderNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };

        // Mostrar modal con opciones
        showPDFOptionsModal(order, element, opt);

    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
}

// Función para mostrar modal con opciones de PDF
function showPDFOptionsModal(order, element, opt) {
    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Segoe UI', Arial, sans-serif;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
        ">
            <h3 style="
                color: #1e3a8a;
                margin: 0 0 20px 0;
                font-size: 18px;
                font-weight: 600;
            ">📄 Generar PDF</h3>
            
            <p style="
                color: #374151;
                margin: 0 0 25px 0;
                font-size: 14px;
                line-height: 1.5;
            ">¿Cómo deseas generar el PDF de la orden <strong>${order.orderNumber}</strong>?</p>
            
            <div style="
                display: flex;
                justify-content: center;
                margin: 20px 0;
            ">
                <button onclick="downloadPDF('${order.orderNumber}', this)" style="
                    background: #1e3a8a;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                " onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#1e3a8a'">
                    💾 Descargar PDF
                </button>
            </div>
            
            <button onclick="closePDFModal()" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                margin-top: 20px;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
                ✕ Cancelar
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Guardar referencias para usar en las funciones
    window.currentPDFElement = element;
    window.currentPDFOptions = opt;
    window.currentPDFOrder = order;
}

// Función para descargar PDF
async function downloadPDF(orderNumber, button) {
    try {
        button.disabled = true;
        button.innerHTML = '⏳ Generando...';
        button.style.background = '#6b7280';

        const opt = {
            ...window.currentPDFOptions,
            filename: `orden_servicio_${orderNumber}.pdf`
        };

        await html2pdf().set(opt).from(window.currentPDFElement).save();
        closePDFModal();
    } catch (error) {
        console.error('Error al descargar PDF:', error);
        alert('Error al descargar el PDF. Por favor, intente nuevamente.');
        button.disabled = false;
        button.innerHTML = '💾 Descargar PDF';
        button.style.background = '#1e3a8a';
    }
}



// Función para cerrar modal
function closePDFModal() {
    const modal = document.querySelector('div[style*="z-index: 10000"]');
    if (modal) {
        modal.remove();
    }
    // Limpiar referencias
    window.currentPDFElement = null;
    window.currentPDFOptions = null;
    window.currentPDFOrder = null;
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
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 10px;">
            <style>
                .pdf-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 12px; 
                    border-bottom: 2px solid #000; 
                    padding-bottom: 6px; 
                }
                .company-info { display: flex; align-items: center; gap: 12px; }
                .company-logo { width: 50px; height: auto; }
                .company-details h1 { 
                    color: #1e3a8a; 
                    font-size: 16px; 
                    margin: 0 0 2px 0; 
                    font-weight: bold; 
                }
                .company-details p { 
                    margin: 1px 0; 
                    font-size: 9px; 
                    color: #333; 
                }
                .order-number { 
                    text-align: center; 
                    border: 2px solid #000; 
                    padding: 4px; 
                    min-width: 60px; 
                }
                .order-number h3 { margin: 0; font-size: 9px; }
                .order-number .number { font-size: 12px; font-weight: bold; }
                .section-header { 
                    background: #000; 
                    color: #fff; 
                    padding: 3px 8px; 
                    font-weight: bold; 
                    font-size: 10px; 
                    margin: 8px 0 4px 0; 
                }
                .info-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 6px; 
                    margin: 6px 0; 
                }
                .info-field { 
                    display: flex; 
                    flex-direction: column; 
                    margin-bottom: 4px; 
                }
                .info-field label { 
                    font-weight: bold; 
                    font-size: 9px; 
                    margin-bottom: 2px; 
                }
                .info-field .input-line { 
                    border-bottom: 1px solid #000; 
                    height: 12px; 
                    padding: 1px 2px; 
                    font-size: 9px; 
                }
                .full-width { grid-column: 1 / -1; }
                .text-area { 
                    border: 1px solid #000; 
                    min-height: 30px; 
                    padding: 3px; 
                    font-size: 9px; 
                    margin: 4px 0; 
                }
            </style>

            <!-- Header -->
            <div class="pdf-header">
                <div class="company-info">
                    <img src="images/casafria-logo.png" class="company-logo" alt="Casafria Logo">
                    <div class="company-details">
                        <h1>CASAFRIA</h1>
                        <p>Av. Principal #123, Quito - Ecuador</p>
                        <p>Tel: +593 99 123 4567</p>
                        <p>info</p>
                    </div>
                </div>
                <div class="order-number">
                    <h3>N°</h3>
                    <div class="number">${order.orderNumber}</div>
                </div>
            </div>

            <!-- Título Principal -->
            <h2 style="text-align: center; color: #1e3a8a; font-size: 14px; margin: 8px 0;">
                ORDEN DE SERVICIO TÉCNICO
            </h2>

            <!-- Datos del Cliente -->
            <div class="section-header">DATOS DEL CLIENTE</div>
            <div class="info-grid">
                <div class="info-field full-width">
                    <label>LUGAR DE ATENCIÓN:</label>
                    <div class="input-line">${order.clientAddress || '________________'}</div>
                </div>
                <div class="info-field">
                    <label>FECHA:</label>
                    <div class="input-line">${formatDate(order.date)}</div>
                </div>
                <div class="info-field">
                    <label>HORA:</label>
                    <div class="input-line">${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div class="info-field full-width">
                    <label>NOMBRE / RAZÓN SOCIAL:</label>
                    <div class="input-line">${order.clientName || '________________'}</div>
                </div>
                <div class="info-field">
                    <label>TIPO DOCUMENTO:</label>
                    <div class="input-line">Cédula</div>
                </div>
                <div class="info-field">
                    <label>N° DOCUMENTO:</label>
                    <div class="input-line">${order.clientDocument || '________________'}</div>
                </div>
                <div class="info-field">
                    <label>TELÉFONO:</label>
                    <div class="input-line">${order.clientPhone || '________________'}</div>
                </div>
            </div>

            <!-- Datos del Equipo -->
            <div class="section-header">DATOS DEL EQUIPO</div>
            <div class="info-grid">
                <div class="info-field">
                    <label>MARCA:</label>
                    <div class="input-line">${order.brand || '________________'}</div>
                </div>
                <div class="info-field">
                    <label>MODELO:</label>
                    <div class="input-line">${order.model || '________________'}</div>
                </div>
                <div class="info-field">
                    <label>SERIE:</label>
                    <div class="input-line">${order.serialNumber || '________________'}</div>
                </div>
            </div>



            <!-- Observaciones -->
            <div class="section-header">OBSERVACIONES</div>
            <div class="text-area">${order.notes ? order.notes.map(note => note).join('<br>') : '_________________________________________________________________<br>_________________________________________________________________<br>_________________________________________________________________'}</div>

            <!-- Diagnóstico Técnico -->
            <div class="section-header">DIAGNÓSTICO TÉCNICO</div>
            
            <div class="info-field">
                <label>DEFECTOS ENCONTRADOS:</label>
                <div class="text-area">_________________________________________________________________<br>_________________________________________________________________<br>_________________________________________________________________</div>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; margin: 15px 0;">
                <label style="font-weight: bold; font-size: 12px;">GARANTÍA:</label>
                <div style="display: flex; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <input type="checkbox" style="width: 15px; height: 15px;">
                        <span>SI</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <input type="checkbox" style="width: 15px; height: 15px;">
                        <span>NO</span>
                    </div>
                </div>
            </div>



            <!-- Firmas -->
            <div style="display: flex; justify-content: space-between; margin: 12px 0;">
                <div style="text-align: center;">
                    <div style="border-bottom: 1px solid #000; width: 120px; height: 15px; margin-bottom: 2px;"></div>
                    <p style="font-size: 9px; margin: 2px 0;">Firma del Técnico</p>
                </div>
                <div style="text-align: center;">
                    <div style="border-bottom: 1px solid #000; width: 120px; height: 15px; margin-bottom: 2px;"></div>
                    <p style="font-size: 9px; margin: 2px 0;">Firma del Cliente</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px solid #000; font-size: 9px; color: #333;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                        <label style="font-weight: bold; font-size: 9px;">FECHA DE ENTREGA:</label>
                        <div class="input-line" style="width: 80px; display: inline-block; margin-left: 5px;">________________</div>
                    </div>
                    <div>
                        <label style="font-weight: bold; font-size: 9px;">HORA DE:</label>
                        <div class="input-line" style="width: 80px; display: inline-block; margin-left: 5px;">________________</div>
                    </div>
                    <div>
                        <label style="font-weight: bold; font-size: 9px;">TOTAL $:</label>
                        <div class="input-line" style="width: 80px; display: inline-block; margin-left: 5px;">________________</div>
                    </div>
                </div>
                <p style="font-size: 9px; margin: 2px 0;">Gracias por confiar en Casafria</p>
                <small style="font-size: 8px;">Términos y condiciones aplicables</small>
            </div>
        </div>
    `;
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Configurar buscador
function setupSearchListener() {
    document.getElementById('searchOrders').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const orders = getOrders();
        
        if (searchTerm === '') {
            renderOrders();
            hideClearSearchButton();
            return;
        }
        
        const filteredOrders = orders.filter(order => 
            order.orderNumber.toLowerCase().includes(searchTerm) ||
            order.clientName.toLowerCase().includes(searchTerm) ||
            order.product.toLowerCase().includes(searchTerm) ||
            order.brand.toLowerCase().includes(searchTerm) ||
            order.damage.toLowerCase().includes(searchTerm) ||
            order.date.toLowerCase().includes(searchTerm)
        );
        
        renderFilteredOrders(filteredOrders);
        showClearSearchButton();
    });
}

// Actualizar contador de órdenes
function updateOrdersCounter(shownCount, totalCount) {
    const counterElement = document.getElementById('ordersCount');
    
    if (shownCount === totalCount) {
        counterElement.textContent = `Mostrando ${shownCount} de ${totalCount} órdenes`;
    } else {
        counterElement.textContent = `Mostrando ${shownCount} de ${totalCount} órdenes (filtradas)`;
    }
}

// Mostrar botón de limpiar búsqueda
function showClearSearchButton() {
    const clearBtn = document.getElementById('clearSearchBtn');
    clearBtn.style.display = 'flex';
}

// Ocultar botón de limpiar búsqueda
function hideClearSearchButton() {
    const clearBtn = document.getElementById('clearSearchBtn');
    clearBtn.style.display = 'none';
}

// Limpiar búsqueda
function clearSearch() {
    document.getElementById('searchOrders').value = '';
    renderOrders();
    hideClearSearchButton();
}

// Variables para filtro avanzado
let activeFilters = {
    dateFrom: '',
    dateTo: '',
    clientName: '',
    clientCity: '',
    product: '',
    brand: '',
    warrantyStatus: '',
    orderNumber: '',
    notes: ''
};

// Mostrar/ocultar panel de filtro avanzado
function toggleAdvancedFilter() {
    const panel = document.getElementById('advancedFilterPanel');
    const isVisible = panel.style.display === 'block';
    
    if (isVisible) {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        loadCurrentFilters();
    }
}

// Mostrar panel de filtro avanzado
function showAdvancedFilter() {
    const panel = document.getElementById('advancedFilterPanel');
    panel.style.display = 'block';
    loadCurrentFilters();
}

// Cerrar panel de filtro avanzado
function closeAdvancedFilter() {
    document.getElementById('advancedFilterPanel').style.display = 'none';
}

// Cargar filtros actuales en el modal
function loadCurrentFilters() {
    document.getElementById('filterDateFrom').value = activeFilters.dateFrom;
    document.getElementById('filterDateTo').value = activeFilters.dateTo;
    document.getElementById('filterClientName').value = activeFilters.clientName;
    document.getElementById('filterClientCity').value = activeFilters.clientCity;
    document.getElementById('filterProduct').value = activeFilters.product;
    document.getElementById('filterBrand').value = activeFilters.brand;
    document.getElementById('filterWarrantyStatus').value = activeFilters.warrantyStatus;
    document.getElementById('filterOrderNumber').value = activeFilters.orderNumber;
    document.getElementById('filterNotes').value = activeFilters.notes;
}

// Aplicar filtros avanzados
function applyAdvancedFilters() {
    const formData = new FormData(document.getElementById('advancedFilterForm'));
    
    // Actualizar filtros activos
    activeFilters = {
        dateFrom: formData.get('filterDateFrom') || '',
        dateTo: formData.get('filterDateTo') || '',
        clientName: formData.get('filterClientName') || '',
        clientCity: formData.get('filterClientCity') || '',
        product: formData.get('filterProduct') || '',
        brand: formData.get('filterBrand') || '',
        warrantyStatus: formData.get('filterWarrantyStatus') || '',
        orderNumber: formData.get('filterOrderNumber') || '',
        notes: formData.get('filterNotes') || ''
    };

    // Aplicar filtros
    applyFilters();
    showMessage('Filtros aplicados exitosamente');
}

// Aplicar filtros a los datos
function applyFilters() {
    const orders = getOrders();
    let filteredOrders = [...orders];

    // Filtro por fecha
    if (activeFilters.dateFrom) {
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.date) >= new Date(activeFilters.dateFrom)
        );
    }
    
    if (activeFilters.dateTo) {
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.date) <= new Date(activeFilters.dateTo)
        );
    }

    // Filtro por cliente
    if (activeFilters.clientName) {
        filteredOrders = filteredOrders.filter(order => 
            order.clientName.toLowerCase().includes(activeFilters.clientName.toLowerCase())
        );
    }

    if (activeFilters.clientCity) {
        filteredOrders = filteredOrders.filter(order => 
            order.clientCity && order.clientCity.toLowerCase().includes(activeFilters.clientCity.toLowerCase())
        );
    }

    // Filtro por producto
    if (activeFilters.product) {
        filteredOrders = filteredOrders.filter(order => 
            order.product.toLowerCase().includes(activeFilters.product.toLowerCase())
        );
    }

    if (activeFilters.brand) {
        filteredOrders = filteredOrders.filter(order => 
            order.brand.toLowerCase().includes(activeFilters.brand.toLowerCase())
        );
    }

    // Filtro por garantía
    if (activeFilters.warrantyStatus) {
        filteredOrders = filteredOrders.filter(order => 
            order.warrantyStatus === activeFilters.warrantyStatus
        );
    }

    // Filtro por número de orden
    if (activeFilters.orderNumber) {
        filteredOrders = filteredOrders.filter(order => 
            order.orderNumber.toLowerCase().includes(activeFilters.orderNumber.toLowerCase())
        );
    }

    // Filtro por notas
    if (activeFilters.notes) {
        filteredOrders = filteredOrders.filter(order => {
            if (!order.notes || order.notes.length === 0) return false;
            return order.notes.some(note => 
                note.toLowerCase().includes(activeFilters.notes.toLowerCase())
            );
        });
    }

    // Renderizar resultados filtrados
    renderFilteredOrders(filteredOrders);
    updateFilterSummary();
}

// Limpiar filtros avanzados
function clearAdvancedFilters() {
    activeFilters = {
        dateFrom: '',
        dateTo: '',
        clientName: '',
        clientCity: '',
        product: '',
        brand: '',
        warrantyStatus: '',
        orderNumber: '',
        notes: ''
    };

    // Limpiar formulario
    document.getElementById('advancedFilterForm').reset();
    
    // Renderizar todas las órdenes
    renderOrders();
    updateFilterSummary();
    showMessage('Filtros limpiados exitosamente');
    
    // Cerrar el panel después de limpiar
    closeAdvancedFilter();
}

// Actualizar resumen de filtros
function updateFilterSummary() {
    const filterSummary = document.getElementById('filterSummary');
    if (!filterSummary) return;

    const activeFilterCount = Object.values(activeFilters).filter(value => value !== '').length;
    
    if (activeFilterCount === 0) {
        filterSummary.style.display = 'none';
        return;
    }

    filterSummary.style.display = 'flex';
    filterSummary.innerHTML = `
        <div>
            <i class="fas fa-filter"></i>
            <span>Filtros activos: ${activeFilterCount}</span>
        </div>
        <button onclick="clearAdvancedFilters()" class="clear-all">
            <i class="fas fa-times"></i> Limpiar
        </button>
    `;
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

// Configurar evento del formulario de filtro avanzado
document.addEventListener('DOMContentLoaded', function() {
    const advancedFilterForm = document.getElementById('advancedFilterForm');
    if (advancedFilterForm) {
        advancedFilterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyAdvancedFilters();
        });
    }
});

// Renderizar órdenes filtradas
function renderFilteredOrders(filteredOrders) {
    const tbody = document.getElementById('ordersBody');
    tbody.innerHTML = '';
    
    const totalOrders = getOrders().length;
    updateOrdersCounter(filteredOrders.length, totalOrders);
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--text-light);"><i class="fas fa-search"></i> No se encontraron órdenes que coincidan con la búsqueda</td></tr>';
        return;
    }
    
    filteredOrders.forEach((order, idx) => {
        const notesCount = (order.notes || []).length;
        const tr = document.createElement('tr');
        tr.className = 'order-row';
        tr.setAttribute('data-order-number', order.orderNumber);
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.clientName}</td>
            <td>${order.product}</td>
            <td>${order.brand}</td>
            <td>${order.damage}</td>
            <td>${order.date}</td>
            <td>
                <div class="notes-counter">
                    <span class="notes-badge">${notesCount}</span>
                    <span class="notes-label">nota${notesCount !== 1 ? 's' : ''}</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small" onclick="event.stopPropagation(); showNoteModal('${order.orderNumber}')" title="Agregar Nota">
                        <i class="fas fa-comment-alt"></i>
                    </button>
                    <button class="btn-small btn-print" onclick="event.stopPropagation(); printOrderPDF('${order.orderNumber}')" title="Imprimir PDF">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-small btn-delete" onclick="event.stopPropagation(); deleteOrder('${order.orderNumber}')" title="Eliminar Orden">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Agregar evento click para abrir detalles
        tr.addEventListener('click', function() {
            openOrderDetail(order.orderNumber);
        });
        
        tbody.appendChild(tr);
    });
}

// Inicializar
renderOrders();
setupSearchListener(); 

 