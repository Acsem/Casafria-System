// Configuración inicial
const USERS = {
    'admin': 'admin123'
};

let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Función para calcular el total de costos
function calculateTotal(order) {
    const serviceValue = order.paymentInfo?.serviceValue || 0;
    const ivaValue = order.paymentInfo?.ivaValue || 0;
    const total = serviceValue + ivaValue;
    return total.toFixed(2);
}
// Funciones de autenticación
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (USERS[username] === password) {
        localStorage.setItem('loggedIn', 'true');
        showMainPage();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});

function logout() {
    localStorage.removeItem('loggedIn');
    showLoginPage();
}

// Navegación
function showMainPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    showOrders();
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('mainPage').style.display = 'none';
}

function showOrders() {
    document.getElementById('ordersPage').style.display = 'block';
    document.getElementById('newOrderPage').style.display = 'none';
    renderOrders();
}

function showNewOrder() {
    document.getElementById('ordersPage').style.display = 'none';
    document.getElementById('newOrderPage').style.display = 'block';
}

// Gestión de órdenes
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const order = {
        id: Date.now(),
        orderNumber: document.getElementById('orderNumber').value,
        clientId: document.getElementById('clientId').value,
        clientName: document.getElementById('clientName').value,
        product: document.getElementById('product').value,
        brand: document.getElementById('brand').value,
        damage: document.getElementById('damage').value,
        date: document.getElementById('orderDate').value,
        notes: [],
        status: 'Pendiente'
    };

    // Verificar si el número de orden ya existe
    if (orders.some(o => o.orderNumber === order.orderNumber)) {
        alert('El número de orden ya existe. Por favor, use un número diferente.');
        return;
    }

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    this.reset();
    showOrders();
});

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.clientName}</td>
            <td>${order.product}</td>
            <td>${order.brand}</td>
            <td>${order.damage.substring(0, 50)}${order.damage.length > 50 ? '...' : ''}</td>
            <td>${formatDate(order.date)}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">
                    ${order.status}
                </span>
            </td>
            <td>${order.notes.length} notas</td>
            <td>
                <button onclick="showOrderDetails(${order.id})" class="btn-small">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button onclick="showNoteModal(${order.id})" class="btn-small">
                    <i class="fas fa-plus"></i> Nota
                </button>
                <button onclick="printOrderPDF(${order.id})" class="btn-small btn-print">
                    <i class="fas fa-print"></i> PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Gestión de notas
function showNoteModal(orderId) {
    document.getElementById('noteModal').style.display = 'block';
    document.getElementById('noteOrderId').value = orderId;
}

function closeNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
}

document.getElementById('noteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const orderId = parseInt(document.getElementById('noteOrderId').value);
    const noteText = document.getElementById('noteText').value;

    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.notes.push(noteText);
        saveOrders();
        renderOrders();
    }

    closeNoteModal();
    this.reset();
});

// Exportar a Excel
function exportToExcel() {
    // Preparar los datos para exportar
    const dataToExport = orders.map(order => ({
        'N° Orden': order.orderNumber,
        'Cliente': order.clientName,
        'Producto': order.product,
        'Marca': order.brand,
        'Daño': order.damage,
        'Fecha': formatDate(order.date),
        'Estado': order.status,
        'Notas': order.notes.join(' | ')
    }));

    // Crear una hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Órdenes");

    // Generar el archivo Excel
    XLSX.writeFile(wb, `ordenes_${formatDateForFile(new Date())}.xlsx`);
}

function formatDateForFile(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Persistencia de datos
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Verificar sesión al cargar
window.onload = function() {
    if (localStorage.getItem('loggedIn') === 'true') {
        showMainPage();
    }
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('orderDate').value = now.toISOString().slice(0,16);
};

// Agregar funciones para manejar los detalles de la orden
function showOrderDetails(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('es-ES', options);
}

// Evento para el buscador
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredOrders = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.clientName.toLowerCase().includes(searchTerm) ||
        order.product.toLowerCase().includes(searchTerm) ||
        order.brand.toLowerCase().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm)
    );
    renderFilteredOrders(filteredOrders);
});

function renderFilteredOrders(filteredOrders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    filteredOrders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.clientName}</td>
            <td>${order.product}</td>
            <td>${order.brand}</td>
            <td>${order.damage.substring(0, 50)}${order.damage.length > 50 ? '...' : ''}</td>
            <td>${formatDate(order.date)}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">
                    ${order.status}
                </span>
            </td>
            <td>${order.notes.length} notas</td>
            <td>
                <button onclick="showOrderDetails(${order.id})" class="btn-small">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button onclick="showNoteModal(${order.id})" class="btn-small">
                    <i class="fas fa-plus"></i> Nota
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Agregar la función para generar el PDF - Formato Casafria Original
async function printOrderPDF(orderId) {
    try {
        const order = orders.find(o => o.id === orderId);
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
                        border-radius: 4px;
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
                            <p>${pdfConfig.company.email}</p>
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
                            <th>${pdfConfig.fields.brand}</th>
                            <th>${pdfConfig.fields.warranty}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${order.product || '________________'}</td>
                            <td>________________</td>
                            <td>${order.brand || '________________'}</td>
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