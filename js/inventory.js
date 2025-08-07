// Estructura para almacenar inventario
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// Cargar datos al iniciar
window.onload = function() {
    // Agregar productos de ejemplo si no existen
    if (inventory.length === 0) {
        inventory = [
            {
                id: 1,
                code: 'INV0001',
                name: 'Repuesto Motor',
                category: 'Repuestos',
                brand: 'Toyota',
                stock: 15,
                minStock: 5,
                purchasePrice: 150.00,
                salePrice: 200.00,
                location: 'Estante A1',
                status: 'Activo',
                description: 'Repuesto para motor Toyota Corolla',
                lastUpdate: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                code: 'INV0002',
                name: 'Aceite Motor',
                category: 'Consumibles',
                brand: 'Mobil',
                stock: 3,
                minStock: 10,
                purchasePrice: 25.00,
                salePrice: 35.00,
                location: 'Estante B2',
                status: 'Activo',
                description: 'Aceite sintético 5W-30',
                lastUpdate: '2024-01-20T14:45:00Z'
            },
            {
                id: 3,
                code: 'INV0003',
                name: 'Filtro de Aire',
                category: 'Repuestos',
                brand: 'Bosch',
                stock: 8,
                minStock: 5,
                purchasePrice: 12.00,
                salePrice: 18.00,
                location: 'Estante C3',
                status: 'Activo',
                description: 'Filtro de aire para motores pequeños',
                lastUpdate: '2024-02-01T09:15:00Z'
            },
            {
                id: 4,
                code: 'INV0004',
                name: 'Llave Inglesa',
                category: 'Herramientas',
                brand: 'Stanley',
                stock: 2,
                minStock: 5,
                purchasePrice: 45.00,
                salePrice: 60.00,
                location: 'Caja Herramientas',
                status: 'Activo',
                description: 'Llave inglesa ajustable 12"',
                lastUpdate: '2024-02-05T16:20:00Z'
            },
            {
                id: 5,
                code: 'INV0005',
                name: 'Batería 12V',
                category: 'Repuestos',
                brand: 'Exide',
                stock: 12,
                minStock: 8,
                purchasePrice: 80.00,
                salePrice: 120.00,
                location: 'Estante D4',
                status: 'Activo',
                description: 'Batería automotriz 12V 60Ah',
                lastUpdate: '2024-02-10T11:30:00Z'
            }
        ];
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }
    
    renderInventory();
    updateSummary();
    setupSearchListener();
};

// Función para mostrar el modal de nuevo producto
function showNewItemForm() {
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemModal').style.display = 'block';
}

// Cerrar modal
function closeItemModal() {
    document.getElementById('itemModal').style.display = 'none';
}

// Generar código de producto
function generateItemCode() {
    const lastItem = inventory[inventory.length - 1];
    if (lastItem) {
        const lastCode = lastItem.code;
        const number = parseInt(lastCode.replace('INV', '')) + 1;
        return `INV${number.toString().padStart(4, '0')}`;
    }
    return 'INV0001';
}

// Manejar el formulario de producto
document.getElementById('itemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemId = document.getElementById('itemId').value;
    const itemData = {
        id: itemId || Date.now(),
        code: document.getElementById('itemCode').value || generateItemCode(),
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        brand: document.getElementById('itemBrand').value,
        stock: parseInt(document.getElementById('itemStock').value),
        minStock: parseInt(document.getElementById('itemMinStock').value),
        purchasePrice: parseFloat(document.getElementById('itemPurchasePrice').value),
        salePrice: parseFloat(document.getElementById('itemSalePrice').value),
        location: document.getElementById('itemLocation').value,
        status: document.getElementById('itemStatus').value,
        description: document.getElementById('itemDescription').value,
        lastUpdate: new Date().toISOString()
    };

    if (itemId) {
        // Actualizar producto existente
        const index = inventory.findIndex(item => item.id === parseInt(itemId));
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...itemData };
        }
    } else {
        // Verificar si el código ya existe
        if (inventory.some(item => item.code === itemData.code)) {
            showMessage('El código ya existe. Por favor, use un código diferente.');
            return;
        }
        // Agregar nuevo producto
        inventory.push(itemData);
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory();
    updateSummary();
    closeItemModal();
    showMessage(itemId ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente');
});

// Renderizar la tabla de inventario
function renderInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    inventory.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.brand}</td>
            <td class="${item.stock <= item.minStock ? 'low-stock' : ''}">${item.stock}</td>
            <td>$${item.purchasePrice.toFixed(2)}</td>
            <td>$${item.salePrice.toFixed(2)}</td>
            <td>${item.location}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editItem(${item.id})" class="btn-small btn-icon-only" title="Editar">
                        <i class="fas fa-edit"></i>
                </button>
                    <button onclick="showItemDetails(${item.id})" class="btn-small btn-icon-only" title="Ver">
                        <i class="fas fa-eye"></i>
                </button>
                    <button onclick="deleteItem(${item.id})" class="btn-small btn-icon-only btn-danger" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Actualizar resumen del inventario
function updateSummary() {
    const totalProducts = inventory.length;
    const lowStock = inventory.filter(item => item.stock <= item.minStock).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.purchasePrice), 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
}

// Función para editar producto
function editItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemCode').value = item.code;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemBrand').value = item.brand;
        document.getElementById('itemStock').value = item.stock;
        document.getElementById('itemMinStock').value = item.minStock;
        document.getElementById('itemPurchasePrice').value = item.purchasePrice;
        document.getElementById('itemSalePrice').value = item.salePrice;
        document.getElementById('itemLocation').value = item.location;
        document.getElementById('itemStatus').value = item.status;
        document.getElementById('itemDescription').value = item.description;
        
        document.getElementById('itemModal').style.display = 'block';
    }
}

// Función para eliminar producto
function deleteItem(itemId) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
        inventory = inventory.filter(item => item.id !== itemId);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory();
        updateSummary();
        showMessage('Producto eliminado exitosamente');
    }
}

// Función para mostrar detalles del producto
function showItemDetails(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        alert(`
            Detalles del Producto:
            Código: ${item.code}
            Nombre: ${item.name}
            Categoría: ${item.category}
            Marca: ${item.brand}
            Stock: ${item.stock}
            Stock Mínimo: ${item.minStock}
            Precio de Compra: $${item.purchasePrice}
            Precio de Venta: $${item.salePrice}
            Ubicación: ${item.location}
            Estado: ${item.status}
            Descripción: ${item.description || 'N/A'}
            Última Actualización: ${new Date(item.lastUpdate).toLocaleString()}
        `);
    }
}

// Configurar buscador
function setupSearchListener() {
    document.getElementById('searchInventory').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItems = inventory.filter(item => 
            item.code.toLowerCase().includes(searchTerm) ||
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.brand.toLowerCase().includes(searchTerm)
        );
        renderFilteredInventory(filteredItems);
    });
}

// Renderizar inventario filtrado
function renderFilteredInventory(filteredItems) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    filteredItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.brand}</td>
            <td class="${item.stock <= item.minStock ? 'low-stock' : ''}">${item.stock}</td>
            <td>$${item.purchasePrice.toFixed(2)}</td>
            <td>$${item.salePrice.toFixed(2)}</td>
            <td>${item.location}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editItem(${item.id})" class="btn-small btn-icon-only" title="Editar">
                        <i class="fas fa-edit"></i>
                </button>
                    <button onclick="showItemDetails(${item.id})" class="btn-small btn-icon-only" title="Ver">
                        <i class="fas fa-eye"></i>
                </button>
                    <button onclick="deleteItem(${item.id})" class="btn-small btn-icon-only btn-danger" title="Eliminar">
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
    alert(message); // Puedes reemplazar esto con una implementación más elegante
}

// Exportar a Excel
function exportInventoryToExcel() {
    try {
        if (inventory.length === 0) {
            showMessage('No hay productos en el inventario para exportar');
            return;
        }

        // Preparar datos para Excel
        const excelData = inventory.map(item => ({
            'Código': item.code,
            'Nombre': item.name,
            'Categoría': item.category,
            'Marca': item.brand,
            'Stock Actual': item.stock,
            'Stock Mínimo': item.minStock,
            'Estado de Stock': item.stock <= item.minStock ? 'Stock Bajo' : 'Stock Normal',
            'Precio de Compra': `$${item.purchasePrice.toFixed(2)}`,
            'Precio de Venta': `$${item.salePrice.toFixed(2)}`,
            'Margen de Ganancia': `$${(item.salePrice - item.purchasePrice).toFixed(2)}`,
            'Porcentaje de Ganancia': `${((item.salePrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)}%`,
            'Ubicación': item.location,
            'Estado': item.status,
            'Descripción': item.description || '-',
            'Última Actualización': new Date(item.lastUpdate).toLocaleString()
        }));

        // Calcular estadísticas
        const totalItems = inventory.length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.purchasePrice), 0);
        const totalSaleValue = inventory.reduce((sum, item) => sum + (item.stock * item.salePrice), 0);
        const lowStockItems = inventory.filter(item => item.stock <= item.minStock).length;
        const activeItems = inventory.filter(item => item.status === 'Activo').length;
        const categories = [...new Set(inventory.map(item => item.category))];
        const brands = [...new Set(inventory.map(item => item.brand))];

        // Crear tabla HTML para exportar
        let tableHTML = `
            <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #1e3a8a; color: white; font-weight: bold;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Código</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Nombre</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Categoría</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Marca</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Stock Actual</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Stock Mínimo</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Estado de Stock</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Precio de Compra</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Precio de Venta</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Margen de Ganancia</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">% Ganancia</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Ubicación</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Estado</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Descripción</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Última Actualización</th>
                    </tr>
                </thead>
                <tbody>
        `;

        excelData.forEach(row => {
            const stockStatus = row['Estado de Stock'] === 'Stock Bajo' ? 'background-color: #ffebee;' : '';
            tableHTML += `
                <tr style="${stockStatus}">
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Código']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Nombre']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Categoría']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Marca']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Stock Actual']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Stock Mínimo']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Estado de Stock']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Precio de Compra']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Precio de Venta']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Margen de Ganancia']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['% Ganancia']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Ubicación']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Estado']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Descripción']}</td>
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
                <title>Reporte de Inventario - DocTec</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #1e3a8a; margin-bottom: 5px; }
                    .header p { color: #666; margin: 0; }
                    .summary { margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
                    .summary h3 { color: #1e3a8a; margin-top: 0; }
                    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
                    .summary-item { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #1e3a8a; }
                    .summary-item h4 { margin: 0 0 5px 0; color: #1e3a8a; font-size: 14px; }
                    .summary-item p { margin: 0; font-size: 18px; font-weight: bold; }
                    .warning { color: #d32f2f; }
                    .success { color: #388e3c; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #1e3a8a; color: white; padding: 10px; border: 1px solid #ddd; }
                    td { padding: 8px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .low-stock-row { background-color: #ffebee !important; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Reporte de Inventario</h1>
                    <p>DocTec - Sistema de Gestión de Órdenes</p>
                    <p>Generado el: ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="summary">
                    <h3>Resumen del Inventario</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <h4>Total de Productos</h4>
                            <p>${totalItems}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Productos Activos</h4>
                            <p class="success">${activeItems}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Stock Bajo</h4>
                            <p class="warning">${lowStockItems}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Valor Total (Compra)</h4>
                            <p>$${totalValue.toFixed(2)}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Valor Total (Venta)</h4>
                            <p>$${totalSaleValue.toFixed(2)}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Ganancia Potencial</h4>
                            <p class="success">$${(totalSaleValue - totalValue).toFixed(2)}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Categorías</h4>
                            <p>${categories.length}</p>
                        </div>
                        <div class="summary-item">
                            <h4>Marcas</h4>
                            <p>${brands.length}</p>
                        </div>
                    </div>
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
        a.download = `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showMessage(`Reporte de inventario exportado exitosamente. Total: ${totalItems} productos`);

    } catch (error) {
        console.error('Error al exportar inventario a Excel:', error);
        showMessage('Error al exportar el reporte. Por favor, intente nuevamente.');
    }
} 