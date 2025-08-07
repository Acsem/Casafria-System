// Variables globales para los gráficos
let ordersChart, statusChart;

// Verificar autenticación y cargar datos al iniciar
window.onload = function() {
    if (!localStorage.getItem('doctec_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    loadReports();
    initializeCharts();
};

// Cargar todos los reportes
function loadReports() {
    updateSummaryCards();
    updateDetailedStats();
    updateCollectionStats();
}

// Actualizar tarjetas de resumen
function updateSummaryCards() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Total de órdenes
    document.getElementById('totalOrders').textContent = orders.length;

    // Clientes activos (que tienen órdenes)
    const activeClients = new Set(orders.map(order => order.clientName)).size;
    document.getElementById('activeClients').textContent = activeClients;

    // Ingresos totales basados en información de cobro real
    const totalRevenue = calculateTotalRevenue(orders);
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;

    // Productos en inventario
    document.getElementById('inventoryItems').textContent = inventory.length;
}

// Función para calcular ingresos totales basándose en información de cobro real
function calculateTotalRevenue(orders) {
    return orders.reduce((total, order) => {
        // Si la orden tiene información de cobro
        if (order.paymentInfo && order.paymentInfo.serviceValue) {
            // Solo contar como ingreso si está cobrada o pendiente de cobro
            if (order.paymentInfo.paymentStatus === 'cobrada' || order.paymentInfo.paymentStatus === 'pendiente_cobro') {
                return total + (order.paymentInfo.serviceValue || 0);
            }
        }
        return total;
    }, 0);
}

// Función para calcular ingresos filtrados por período
function calculateFilteredRevenue(orders, dateRange) {
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);
    return calculateTotalRevenue(filteredOrders);
}

// Función para obtener el monto real de una orden
function getOrderAmount(order) {
    // Si la orden tiene información de cobro
    if (order.paymentInfo && order.paymentInfo.serviceValue) {
        // Solo mostrar monto si está cobrada o pendiente de cobro
        if (order.paymentInfo.paymentStatus === 'cobrada' || order.paymentInfo.paymentStatus === 'pendiente_cobro') {
            return order.paymentInfo.serviceValue || 0;
        }
    }
    return 0;
}

// Actualizar estadísticas detalladas
function updateDetailedStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const dateRange = parseInt(document.getElementById('dateRange').value);

    // Filtrar órdenes por período
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Órdenes completadas
    const completedOrders = filteredOrders.filter(order => order.status === 'completada').length;
    const completedPercentage = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('completedPercentage').textContent = `${completedPercentage}%`;

    // Órdenes pendientes
    const pendingOrders = filteredOrders.filter(order => order.status === 'pendiente').length;
    const pendingPercentage = orders.length > 0 ? ((pendingOrders / orders.length) * 100).toFixed(1) : 0;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('pendingPercentage').textContent = `${pendingPercentage}%`;

    // Promedio por orden basado en información de cobro real
    const totalRevenue = calculateFilteredRevenue(orders, dateRange);
    const averageOrder = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    document.getElementById('averageOrder').textContent = `$${averageOrder.toFixed(2)}`;

    // Órdenes este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    document.getElementById('monthlyOrders').textContent = monthlyOrders;
}

// Actualizar estadísticas de cobro
function updateCollectionStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const dateRange = parseInt(document.getElementById('dateRange').value);
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Contadores y montos
    let collectedOrders = 0;
    let collectedAmount = 0;
    let pendingCollectionOrders = 0;
    let pendingCollectionAmount = 0;
    let noCollectionOrders = 0;
    let noCollectionAmount = 0;
    let totalRegisteredAmount = 0;

    filteredOrders.forEach(order => {
        if (order.paymentInfo && order.paymentInfo.serviceValue) {
            const amount = order.paymentInfo.serviceValue;
            totalRegisteredAmount += amount;

            switch (order.paymentInfo.paymentStatus) {
                case 'cobrada':
                    collectedOrders++;
                    collectedAmount += amount;
                    break;
                case 'pendiente_cobro':
                    pendingCollectionOrders++;
                    pendingCollectionAmount += amount;
                    break;
                case 'sin_cobro':
                    noCollectionOrders++;
                    noCollectionAmount += amount;
                    break;
                default:
                    noCollectionOrders++;
                    noCollectionAmount += amount;
                    break;
            }
        }
    });

    // Actualizar elementos en el DOM
    document.getElementById('collectedOrders').textContent = collectedOrders;
    document.getElementById('collectedAmount').textContent = `$${collectedAmount.toLocaleString()}`;
    
    document.getElementById('pendingCollectionOrders').textContent = pendingCollectionOrders;
    document.getElementById('pendingCollectionAmount').textContent = `$${pendingCollectionAmount.toLocaleString()}`;
    
    document.getElementById('noCollectionOrders').textContent = noCollectionOrders;
    document.getElementById('noCollectionAmount').textContent = `$${noCollectionAmount.toLocaleString()}`;
    
    document.getElementById('totalRegisteredAmount').textContent = `$${totalRegisteredAmount.toLocaleString()}`;
}

// Filtrar órdenes por rango de fechas
function filterOrdersByDateRange(orders, days) {
    if (days === 'all') return orders;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= cutoffDate;
    });
}





// Inicializar gráficos
function initializeCharts() {
    createOrdersChart();
    createStatusChart();
}

// Crear gráfico de órdenes por mes
function createOrdersChart() {
    const ctx = document.getElementById('ordersChart').getContext('2d');
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const monthlyData = getMonthlyOrdersData(orders);

    ordersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Órdenes',
                data: monthlyData.data,
                borderColor: '#1e3a8a',
                backgroundColor: 'rgba(30, 58, 138, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Crear gráfico de estado de órdenes
function createStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const statusData = getStatusData(orders);

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: statusData.labels,
            datasets: [{
                data: statusData.data,
                backgroundColor: [
                    '#10b981', // Verde para completadas
                    '#f59e0b', // Amarillo para pendientes
                    '#ef4444', // Rojo para canceladas
                    '#6b7280'  // Gris para otros
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Obtener datos de órdenes por mes
function getMonthlyOrdersData(orders) {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    const monthlyCount = new Array(12).fill(0);

    orders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate.getFullYear() === currentYear) {
            monthlyCount[orderDate.getMonth()]++;
        }
    });

    return {
        labels: months,
        data: monthlyCount
    };
}

// Obtener datos de estado de órdenes
function getStatusData(orders) {
    const statusCount = {};
    
    orders.forEach(order => {
        const status = order.status || 'Pendiente';
        statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const labels = Object.keys(statusCount);
    const data = Object.values(statusCount);

    return { labels, data };
}

// Actualizar reportes cuando cambie el filtro
function updateReports() {
    updateDetailedStats();
    updateCharts();
    updateCollectionStats();
}

// Actualizar gráficos
function updateCharts() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const dateRange = parseInt(document.getElementById('dateRange').value);
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Actualizar gráfico de órdenes
    const monthlyData = getMonthlyOrdersData(filteredOrders);
    ordersChart.data.labels = monthlyData.labels;
    ordersChart.data.datasets[0].data = monthlyData.data;
    ordersChart.update();

    // Actualizar gráfico de estado
    const statusData = getStatusData(filteredOrders);
    statusChart.data.labels = statusData.labels;
    statusChart.data.datasets[0].data = statusData.data;
    statusChart.update();
}

// Exportar todos los reportes
function exportAllReports() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Crear datos para exportar
    const exportData = {
        summary: {
            totalOrders: orders.length,
            activeClients: new Set(orders.map(order => order.clientName)).size,
            totalRevenue: calculateTotalRevenue(orders),
            inventoryItems: inventory.length
        },
        orders: orders.map(order => ({
            orderNumber: order.orderNumber,
            clientName: order.clientName,
            product: order.product,
            date: formatDate(order.date),
            status: order.status || 'Pendiente',
            amount: getOrderAmount(order)
        })),
        clients: clients,
        inventory: inventory
    };

    // Crear archivo Excel
    const workbook = XLSX.utils.book_new();
    
    // Hoja de resumen
    const summaryData = [
        ['Métrica', 'Valor'],
        ['Total Órdenes', exportData.summary.totalOrders],
        ['Clientes Activos', exportData.summary.activeClients],
        ['Ingresos Totales', `$${exportData.summary.totalRevenue.toFixed(2)}`],
        ['Productos en Inventario', exportData.summary.inventoryItems]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Hoja de órdenes
    const ordersSheet = XLSX.utils.json_to_sheet(exportData.orders);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Órdenes');

    // Hoja de clientes
    const clientsSheet = XLSX.utils.json_to_sheet(exportData.clients);
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');

    // Hoja de inventario
    const inventorySheet = XLSX.utils.json_to_sheet(exportData.inventory);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventario');

    // Descargar archivo
    XLSX.writeFile(workbook, `reporte_completo_${new Date().toISOString().split('T')[0]}.xlsx`);
}



// Función auxiliar para formatear fechas
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
} 