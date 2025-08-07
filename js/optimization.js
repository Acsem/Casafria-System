// Optimizaciones para localStorage y rendimiento del sistema

// Configuración de limpieza
const CLEANUP_CONFIG = {
    maxOrdersAge: 365, // días - mantener órdenes de 1 año
    maxBackups: 10,    // máximo número de respaldos
    cleanupInterval: 30 * 24 * 60 * 60 * 1000, // 30 días en ms
    maxStorageSize: 50 * 1024 * 1024 // 50MB máximo
};

// Función para limpiar datos antiguos
function cleanupOldData() {
    console.log('🧹 Iniciando limpieza de datos antiguos...');
    
    try {
        // Limpiar órdenes antiguas
        cleanupOldOrders();
        
        // Limpiar datos de clientes antiguos
        cleanupOldClients();
        
        // Limpiar inventario antiguo
        cleanupOldInventory();
        
        // Limpiar pagos antiguos
        cleanupOldPayments();
        
        // Verificar tamaño total
        checkStorageSize();
        
        console.log('✅ Limpieza completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    }
}

// Limpiar órdenes antiguas
function cleanupOldOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const originalCount = orders.length;
    const filteredOrders = orders.filter(order => {
        if (!order.date) return true; // Mantener órdenes sin fecha
        return new Date(order.date) > oneYearAgo;
    });
    
    const removedCount = originalCount - filteredOrders.length;
    if (removedCount > 0) {
        localStorage.setItem('orders', JSON.stringify(filteredOrders));
        console.log(`🗑️ Eliminadas ${removedCount} órdenes antiguas`);
    }
}

// Limpiar clientes antiguos
function cleanupOldClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Obtener clientes que están en órdenes recientes
    const activeClients = new Set();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    orders.forEach(order => {
        if (order.date && new Date(order.date) > oneYearAgo) {
            activeClients.add(order.clientName);
        }
    });
    
    const originalCount = clients.length;
    const filteredClients = clients.filter(client => 
        activeClients.has(client.name) || !client.createdAt
    );
    
    const removedCount = originalCount - filteredClients.length;
    if (removedCount > 0) {
        localStorage.setItem('clients', JSON.stringify(filteredClients));
        console.log(`🗑️ Eliminados ${removedCount} clientes inactivos`);
    }
}

// Limpiar inventario antiguo
function cleanupOldInventory() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const originalCount = inventory.length;
    
    // Mantener solo items con stock > 0 o precio > 0
    const filteredInventory = inventory.filter(item => 
        (item.stock && item.stock > 0) || 
        (item.price && item.price > 0) ||
        (item.cost && item.cost > 0)
    );
    
    const removedCount = originalCount - filteredInventory.length;
    if (removedCount > 0) {
        localStorage.setItem('inventory', JSON.stringify(filteredInventory));
        console.log(`🗑️ Eliminados ${removedCount} items de inventario vacíos`);
    }
}

// Limpiar pagos antiguos
function cleanupOldPayments() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const originalCount = payments.length;
    const filteredPayments = payments.filter(payment => {
        if (!payment.date) return true;
        return new Date(payment.date) > oneYearAgo;
    });
    
    const removedCount = originalCount - filteredPayments.length;
    if (removedCount > 0) {
        localStorage.setItem('payments', JSON.stringify(filteredPayments));
        console.log(`🗑️ Eliminados ${removedCount} pagos antiguos`);
    }
}

// Verificar tamaño del almacenamiento
function checkStorageSize() {
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        totalSize += new Blob([key, value]).size;
    });
    
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño total del almacenamiento: ${sizeMB} MB`);
    
    if (totalSize > CLEANUP_CONFIG.maxStorageSize) {
        console.warn('⚠️ Almacenamiento excede el límite recomendado');
        // Limpieza más agresiva
        aggressiveCleanup();
    }
}

// Limpieza agresiva cuando el almacenamiento es muy grande
function aggressiveCleanup() {
    console.log('🚨 Iniciando limpieza agresiva...');
    
    // Eliminar datos de más de 2 años
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const filteredOrders = orders.filter(order => {
        if (!order.date) return true;
        return new Date(order.date) > twoYearsAgo;
    });
    
    localStorage.setItem('orders', JSON.stringify(filteredOrders));
    console.log(`🗑️ Limpieza agresiva: eliminadas ${orders.length - filteredOrders.length} órdenes`);
}

// Función para comprimir datos
function compressData() {
    console.log('🗜️ Comprimiendo datos...');
    
    // Comprimir notas (eliminar espacios extra)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        if (order.notes && Array.isArray(order.notes)) {
            order.notes = order.notes.map(note => {
                if (typeof note === 'string') {
                    return note.trim();
                } else if (note && note.text) {
                    note.text = note.text.trim();
                    return note;
                }
                return note;
            }).filter(note => note && (typeof note === 'string' ? note.length > 0 : note.text && note.text.length > 0));
        }
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('✅ Datos comprimidos exitosamente');
}

// Función para optimizar consultas
function optimizeQueries() {
    console.log('⚡ Optimizando consultas...');
    
    // Crear índices en memoria para búsquedas rápidas
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Índice por número de orden
    const orderIndex = {};
    orders.forEach((order, index) => {
        if (order.orderNumber) {
            orderIndex[order.orderNumber] = index;
        }
    });
    
    // Índice por cliente
    const clientIndex = {};
    orders.forEach((order, index) => {
        if (order.clientName) {
            if (!clientIndex[order.clientName]) {
                clientIndex[order.clientName] = [];
            }
            clientIndex[order.clientName].push(index);
        }
    });
    
    // Guardar índices en sessionStorage para acceso rápido
    sessionStorage.setItem('orderIndex', JSON.stringify(orderIndex));
    sessionStorage.setItem('clientIndex', JSON.stringify(clientIndex));
    
    console.log('✅ Índices creados para consultas rápidas');
}

// Función para obtener estadísticas de almacenamiento
function getStorageStats() {
    const stats = {
        orders: 0,
        clients: 0,
        inventory: 0,
        payments: 0,
        totalSize: 0
    };
    
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const payments = JSON.parse(localStorage.getItem('payments')) || [];
        
        stats.orders = orders.length;
        stats.clients = clients.length;
        stats.inventory = inventory.length;
        stats.payments = payments.length;
        
        // Calcular tamaño total
        const allData = JSON.stringify({
            orders, clients, inventory, payments
        });
        stats.totalSize = new Blob([allData]).size;
        
    } catch (error) {
        console.error('Error al calcular estadísticas:', error);
    }
    
    return stats;
}

// Función para mostrar estadísticas
function showStorageStats() {
    const stats = getStorageStats();
    const sizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    
    console.log('📊 Estadísticas de Almacenamiento:');
    console.log(`   📋 Órdenes: ${stats.orders}`);
    console.log(`   👥 Clientes: ${stats.clients}`);
    console.log(`   📦 Inventario: ${stats.inventory}`);
    console.log(`   💰 Pagos: ${stats.payments}`);
    console.log(`   💾 Tamaño total: ${sizeMB} MB`);
}

// Inicializar optimizaciones
function initOptimizations() {
    console.log('🚀 Inicializando optimizaciones del sistema...');
    
    // Ejecutar limpieza automática cada 30 días
    const lastCleanup = localStorage.getItem('lastCleanup');
    const now = Date.now();
    
    if (!lastCleanup || (now - parseInt(lastCleanup)) > CLEANUP_CONFIG.cleanupInterval) {
        cleanupOldData();
        localStorage.setItem('lastCleanup', now.toString());
    }
    
    // Optimizar consultas
    optimizeQueries();
    
    // Mostrar estadísticas
    showStorageStats();
    
    console.log('✅ Optimizaciones inicializadas');
}

// Exportar funciones para uso global
window.DocTecOptimizations = {
    cleanupOldData,
    compressData,
    optimizeQueries,
    getStorageStats,
    showStorageStats,
    initOptimizations
};

// Ejecutar optimizaciones al cargar la página
if (typeof window !== 'undefined') {
    window.addEventListener('load', initOptimizations);
} 