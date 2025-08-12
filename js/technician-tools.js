// Estructura para almacenar información de herramientas asignadas a técnicos
let technicianTools = JSON.parse(localStorage.getItem('technicianTools')) || [];
let technicians = JSON.parse(localStorage.getItem('technicians')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// Cargar datos al iniciar
window.onload = function() {
    loadTechnicians();
    loadInventory();
    renderTechnicianTools();
    updateSummary();
    setupSearchListener();
};

// Función para volver a la página anterior
function goBack() {
    window.history.back();
}

// Cargar técnicos desde localStorage
function loadTechnicians() {
    const savedTechnicians = localStorage.getItem('technicians');
    if (savedTechnicians) {
        try {
            technicians = JSON.parse(savedTechnicians);
        } catch (e) {
            console.error('Error al cargar técnicos:', e);
        }
    }
    
    // Si no hay técnicos guardados, usar los predeterminados
    if (technicians.length === 0) {
        technicians = [
            { id: 1, name: "Juan Pérez" },
            { id: 2, name: "Carlos Rodríguez" },
            { id: 3, name: "Miguel González" },
            { id: 4, name: "Luis Martínez" },
            { id: 5, name: "Roberto Silva" }
        ];
    }
}

// Cargar inventario desde localStorage
function loadInventory() {
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
        try {
            inventory = JSON.parse(savedInventory);
        } catch (e) {
            console.error('Error al cargar inventario:', e);
        }
    }
}

// Renderizar la lista de técnicos con herramientas
function renderTechnicianTools() {
    const container = document.getElementById('techniciansToolsList');
    if (!container) return;

    if (technicianTools.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <h3>No hay herramientas asignadas</h3>
                <p>Comienza asignando productos o herramientas a los técnicos para llevar un control del inventario.</p>
                <button onclick="showAssignToolModal()" class="btn-primary">
                    <i class="fas fa-plus"></i> Asignar Primer Producto
                </button>
            </div>
        `;
        return;
    }

    // Agrupar herramientas por técnico
    const toolsByTechnician = {};
    technicianTools.forEach(assignment => {
        if (!toolsByTechnician[assignment.technicianId]) {
            toolsByTechnician[assignment.technicianId] = [];
        }
        toolsByTechnician[assignment.technicianId].push(assignment);
    });

    let html = '';
    
    // Renderizar cada técnico con sus herramientas
    Object.keys(toolsByTechnician).forEach(technicianId => {
        const technician = technicians.find(t => t.id == technicianId);
        const tools = toolsByTechnician[technicianId];
        
        if (!technician) return;

        html += `
            <div class="technician-card">
                <div class="technician-header">
                    <div class="technician-info">
                        <i class="fas fa-user-cog"></i>
                        <h3>${technician.name}</h3>
                        <span class="tools-count">${tools.length} herramienta${tools.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="technician-actions">
                        <button onclick="showAssignToolModal('${technicianId}')" class="btn-small btn-primary">
                            <i class="fas fa-plus"></i> Asignar
                        </button>
                    </div>
                </div>
                <div class="tools-list">
        `;

        tools.forEach(tool => {
            const inventoryItem = inventory.find(item => item.id == tool.toolId);
            const toolName = inventoryItem ? inventoryItem.name : 'Herramienta no encontrada';
            const isOverdue = new Date(tool.expectedReturnDate) < new Date();
            const statusClass = tool.returned ? 'returned' : (isOverdue ? 'overdue' : 'active');
            const statusText = tool.returned ? 'Devuelta' : (isOverdue ? 'Vencida' : 'Activa');

            html += `
                <div class="tool-item ${statusClass}">
                    <div class="tool-info">
                        <div class="tool-name">
                            <i class="fas fa-tool"></i>
                            <span>${toolName}</span>
                        </div>
                        <div class="tool-details">
                            <span class="assign-date">
                                <i class="fas fa-calendar-plus"></i>
                                Asignada: ${new Date(tool.assignDate).toLocaleDateString()}
                            </span>
                            <span class="return-date ${isOverdue && !tool.returned ? 'overdue' : ''}">
                                <i class="fas fa-calendar-check"></i>
                                Devolución: ${new Date(tool.expectedReturnDate).toLocaleDateString()}
                            </span>
                        </div>
                        ${tool.observations ? `<div class="tool-observations">${tool.observations}</div>` : ''}
                    </div>
                    <div class="tool-actions">
                        ${!tool.returned ? `
                            <button onclick="returnTool('${tool.id}')" class="btn-small btn-success">
                                <i class="fas fa-check"></i> Devolver
                            </button>
                        ` : `
                            <span class="return-status">
                                <i class="fas fa-check-circle"></i>
                                Devuelta el ${new Date(tool.returnDate).toLocaleDateString()}
                                ${tool.returnCondition ? `(${getConditionText(tool.returnCondition)})` : ''}
                            </span>
                        `}
                        <button onclick="deleteToolAssignment('${tool.id}')" class="btn-small btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Obtener texto del estado de la herramienta
function getConditionText(condition) {
    const conditions = {
        'excelente': 'Excelente',
        'bueno': 'Bueno',
        'regular': 'Regular',
        'malo': 'Malo',
        'dañado': 'Dañado'
    };
    return conditions[condition] || condition;
}

// Actualizar resumen
function updateSummary() {
    const totalTechnicians = new Set(technicianTools.map(t => t.technicianId)).size;
    const totalTools = technicianTools.length;
    const pendingReturns = technicianTools.filter(t => !t.returned && new Date(t.expectedReturnDate) < new Date()).length;

    document.getElementById('totalTechnicians').textContent = totalTechnicians;
    document.getElementById('totalTools').textContent = totalTools;
    document.getElementById('pendingReturns').textContent = pendingReturns;
}

// Mostrar modal para asignar herramienta
function showAssignToolModal(technicianId = null) {
    const modal = document.getElementById('assignToolModal');
    const form = document.getElementById('assignToolForm');
    
    // Limpiar formulario
    form.reset();
    
    // Establecer fecha actual
    document.getElementById('assignDate').valueAsDate = new Date();
    
    // Establecer fecha de devolución esperada (7 días por defecto)
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 7);
    document.getElementById('expectedReturnDate').valueAsDate = expectedDate;
    
    // Cargar técnicos en el selector
    const technicianSelect = document.getElementById('assignTechnician');
    technicianSelect.innerHTML = '<option value="">Seleccionar técnico</option>';
    technicians.forEach(technician => {
        const option = document.createElement('option');
        option.value = technician.id;
        option.textContent = technician.name;
        if (technicianId && technician.id == technicianId) {
            option.selected = true;
        }
        technicianSelect.appendChild(option);
    });
    
    // Cargar herramientas en el selector (todos los productos del inventario)
    const toolSelect = document.getElementById('assignTool');
    toolSelect.innerHTML = '<option value="">Seleccionar herramienta</option>';
    inventory.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.category})`;
        toolSelect.appendChild(option);
    });
    
    modal.style.display = 'block';
}

// Cerrar modal de asignar herramienta
function closeAssignToolModal() {
    document.getElementById('assignToolModal').style.display = 'none';
}

// Mostrar modal para devolver herramienta
function returnTool(toolAssignmentId) {
    const assignment = technicianTools.find(t => t.id == toolAssignmentId);
    if (!assignment) return;

    document.getElementById('returnToolId').value = toolAssignmentId;
    document.getElementById('returnDate').valueAsDate = new Date();
    document.getElementById('returnDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('returnToolModal').style.display = 'block';
}

// Cerrar modal de devolver herramienta
function closeReturnToolModal() {
    document.getElementById('returnToolModal').style.display = 'none';
}

// Eliminar asignación de herramienta
function deleteToolAssignment(toolAssignmentId) {
    if (confirm('¿Está seguro de que desea eliminar esta asignación de herramienta?')) {
        const index = technicianTools.findIndex(t => t.id == toolAssignmentId);
        if (index !== -1) {
            technicianTools.splice(index, 1);
            localStorage.setItem('technicianTools', JSON.stringify(technicianTools));
            renderTechnicianTools();
            updateSummary();
            showMessage('Asignación eliminada exitosamente');
        }
    }
}

// Configurar buscador
function setupSearchListener() {
    document.getElementById('searchTechnicianTools').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm === '') {
            renderTechnicianTools();
            return;
        }
        
        // Filtrar asignaciones que coincidan con la búsqueda
        const filteredAssignments = technicianTools.filter(assignment => {
            const technician = technicians.find(t => t.id == assignment.technicianId);
            const inventoryItem = inventory.find(item => item.id == assignment.toolId);
            
            return (technician && technician.name.toLowerCase().includes(searchTerm)) ||
                   (inventoryItem && inventoryItem.name.toLowerCase().includes(searchTerm)) ||
                   (assignment.observations && assignment.observations.toLowerCase().includes(searchTerm));
        });
        
        renderFilteredTechnicianTools(filteredAssignments);
    });
}

// Renderizar técnicos con herramientas filtradas
function renderFilteredTechnicianTools(filteredAssignments) {
    const container = document.getElementById('techniciansToolsList');
    if (!container) return;

    if (filteredAssignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>No hay herramientas asignadas que coincidan con tu búsqueda.</p>
            </div>
        `;
        return;
    }

    // Agrupar herramientas filtradas por técnico
    const toolsByTechnician = {};
    filteredAssignments.forEach(assignment => {
        if (!toolsByTechnician[assignment.technicianId]) {
            toolsByTechnician[assignment.technicianId] = [];
        }
        toolsByTechnician[assignment.technicianId].push(assignment);
    });

    let html = '';
    
    Object.keys(toolsByTechnician).forEach(technicianId => {
        const technician = technicians.find(t => t.id == technicianId);
        const tools = toolsByTechnician[technicianId];
        
        if (!technician) return;

        html += `
            <div class="technician-card">
                <div class="technician-header">
                    <div class="technician-info">
                        <i class="fas fa-user-cog"></i>
                        <h3>${technician.name}</h3>
                        <span class="tools-count">${tools.length} herramienta${tools.length !== 1 ? 's' : ''} (filtradas)</span>
                    </div>
                </div>
                <div class="tools-list">
        `;

        tools.forEach(tool => {
            const inventoryItem = inventory.find(item => item.id == tool.toolId);
            const toolName = inventoryItem ? inventoryItem.name : 'Herramienta no encontrada';
            const isOverdue = new Date(tool.expectedReturnDate) < new Date();
            const statusClass = tool.returned ? 'returned' : (isOverdue ? 'overdue' : 'active');
            const statusText = tool.returned ? 'Devuelta' : (isOverdue ? 'Vencida' : 'Activa');

            html += `
                <div class="tool-item ${statusClass}">
                    <div class="tool-info">
                        <div class="tool-name">
                            <i class="fas fa-tool"></i>
                            <span>${toolName}</span>
                        </div>
                        <div class="tool-details">
                            <span class="assign-date">
                                <i class="fas fa-calendar-plus"></i>
                                Asignada: ${new Date(tool.assignDate).toLocaleDateString()}
                            </span>
                            <span class="return-date ${isOverdue && !tool.returned ? 'overdue' : ''}">
                                <i class="fas fa-calendar-check"></i>
                                Devolución: ${new Date(tool.expectedReturnDate).toLocaleDateString()}
                            </span>
                        </div>
                        ${tool.observations ? `<div class="tool-observations">${tool.observations}</div>` : ''}
                    </div>
                    <div class="tool-actions">
                        ${!tool.returned ? `
                            <button onclick="returnTool('${tool.id}')" class="btn-small btn-success">
                                <i class="fas fa-check"></i> Devolver
                            </button>
                        ` : `
                            <span class="return-status">
                                <i class="fas fa-check-circle"></i>
                                Devuelta el ${new Date(tool.returnDate).toLocaleDateString()}
                                ${tool.returnCondition ? `(${getConditionText(tool.returnCondition)})` : ''}
                            </span>
                        `}
                        <button onclick="deleteToolAssignment('${tool.id}')" class="btn-small btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Exportar a Excel
function exportTechnicianToolsToExcel() {
    try {
        if (technicianTools.length === 0) {
            showMessage('No hay herramientas asignadas para exportar');
            return;
        }

        // Preparar datos para Excel
        const excelData = technicianTools.map(assignment => {
            const technician = technicians.find(t => t.id == assignment.technicianId);
            const inventoryItem = inventory.find(item => item.id == assignment.toolId);
            
            return {
                'Técnico': technician ? technician.name : 'No encontrado',
                'Herramienta': inventoryItem ? inventoryItem.name : 'No encontrada',
                'Fecha de Asignación': new Date(assignment.assignDate).toLocaleDateString(),
                'Fecha de Devolución Esperada': new Date(assignment.expectedReturnDate).toLocaleDateString(),
                'Estado': assignment.returned ? 'Devuelta' : 'Activa',
                'Fecha de Devolución': assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : '-',
                'Estado de la Herramienta': assignment.returnCondition ? getConditionText(assignment.returnCondition) : '-',
                'Observaciones': assignment.observations || '-',
                'Observaciones de Devolución': assignment.returnObservations || '-'
            };
        });

        // Crear tabla HTML para exportar
        let tableHTML = `
            <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #1e3a8a; color: white; font-weight: bold;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Técnico</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Herramienta</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Fecha de Asignación</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Fecha de Devolución Esperada</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Estado</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Fecha de Devolución</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Estado de la Herramienta</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Observaciones</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Observaciones de Devolución</th>
                    </tr>
                </thead>
                <tbody>
        `;

        excelData.forEach(row => {
            tableHTML += `
                <tr>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Técnico']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Herramienta']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Fecha de Asignación']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Fecha de Devolución Esperada']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Estado']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Fecha de Devolución']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Estado de la Herramienta']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Observaciones']}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${row['Observaciones de Devolución']}</td>
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
                <title>Reporte de Herramientas por Técnico - Casafria</title>
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
                    <h1>Reporte de Herramientas por Técnico</h1>
                    <p>Casafria - Generado el ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="summary">
                    <h3>Resumen</h3>
                    <p><strong>Total de Técnicos:</strong> ${new Set(technicianTools.map(t => t.technicianId)).size}</p>
                    <p><strong>Total de Herramientas Asignadas:</strong> ${technicianTools.length}</p>
                    <p><strong>Herramientas Devueltas:</strong> ${technicianTools.filter(t => t.returned).length}</p>
                    <p><strong>Herramientas Activas:</strong> ${technicianTools.filter(t => !t.returned).length}</p>
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
        a.download = `Herramientas_por_Tecnico_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showMessage(`Reporte exportado exitosamente. Total: ${technicianTools.length} asignaciones`);
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        showMessage('Error al exportar el reporte. Por favor, intente nuevamente.');
    }
}

// Función para mostrar mensajes
function showMessage(message) {
    // Implementar sistema de notificaciones
    alert(message);
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Manejar el formulario de asignar herramienta
document.getElementById('assignToolForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const technicianId = document.getElementById('assignTechnician').value;
    const toolId = document.getElementById('assignTool').value;
    const assignDate = document.getElementById('assignDate').value;
    const expectedReturnDate = document.getElementById('expectedReturnDate').value;
    const observations = document.getElementById('assignObservations').value.trim();

    if (!technicianId || !toolId || !assignDate || !expectedReturnDate) {
        showMessage('Por favor, complete todos los campos requeridos.');
        return;
    }

    // Crear nueva asignación
    const newAssignment = {
        id: Date.now().toString(),
        technicianId: technicianId,
        toolId: toolId,
        assignDate: assignDate,
        expectedReturnDate: expectedReturnDate,
        observations: observations,
        returned: false,
        createdAt: new Date().toISOString()
    };

    // Agregar la nueva asignación
    technicianTools.push(newAssignment);

    // Guardar en localStorage
    localStorage.setItem('technicianTools', JSON.stringify(technicianTools));

    // Actualizar la vista
    renderTechnicianTools();
    updateSummary();
    closeAssignToolModal();
    showMessage('Herramienta asignada exitosamente');
});

// Manejar el formulario de devolver herramienta
document.getElementById('returnToolForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const toolAssignmentId = document.getElementById('returnToolId').value;
    const returnDate = document.getElementById('returnDate').value;
    const toolCondition = document.getElementById('toolCondition').value;
    const returnObservations = document.getElementById('returnObservations').value.trim();

    if (!toolAssignmentId || !returnDate || !toolCondition) {
        showMessage('Por favor, complete todos los campos requeridos.');
        return;
    }

    // Encontrar y actualizar la asignación
    const assignmentIndex = technicianTools.findIndex(t => t.id == toolAssignmentId);
    if (assignmentIndex !== -1) {
        technicianTools[assignmentIndex].returned = true;
        technicianTools[assignmentIndex].returnDate = returnDate;
        technicianTools[assignmentIndex].returnCondition = toolCondition;
        technicianTools[assignmentIndex].returnObservations = returnObservations;
        technicianTools[assignmentIndex].updatedAt = new Date().toISOString();

        // Guardar en localStorage
        localStorage.setItem('technicianTools', JSON.stringify(technicianTools));

        // Actualizar la vista
        renderTechnicianTools();
        updateSummary();
        closeReturnToolModal();
        showMessage('Herramienta devuelta exitosamente');
    } else {
        showMessage('Error: No se encontró la asignación de herramienta.');
    }
}); 