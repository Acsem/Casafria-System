let currentOrder = null;

const technicians = [
    { id: 1, name: "Técnico 1" },
    { id: 2, name: "Técnico 2" }
    // Agregar más técnicos según necesites
];

// Obtener el número de orden de la URL
function getOrderNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('order');
}

// Cargar los datos de la orden
function loadOrderDetails() {
    const orderNumber = getOrderNumberFromURL();
    if (!orderNumber) {
        alert('No se especificó una orden');
        window.location.href = 'orders.html';
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
        alert('Orden no encontrada');
        window.location.href = 'orders.html';
        return;
    }

    // Mostrar información de la orden
    document.getElementById('orderNumberDisplay').textContent = order.orderNumber;
    document.getElementById('clientNameDisplay').textContent = order.clientName || 'No especificado';
    document.getElementById('clientDocumentDisplay').textContent = order.clientDocument || 'No especificado';
    document.getElementById('clientPhoneDisplay').textContent = order.clientPhone || 'No especificado';
    document.getElementById('clientCityDisplay').textContent = order.clientCity || 'No especificado';
    document.getElementById('clientAddressDisplay').textContent = order.clientAddress || 'No especificado';
    document.getElementById('clientReferenceDisplay').textContent = order.clientReference || 'No especificado';
    document.getElementById('productDisplay').textContent = order.product;
    document.getElementById('brandDisplay').textContent = order.brand;
    document.getElementById('seriesDisplay').textContent = order.series || 'No especificado';
    document.getElementById('warehouseDisplay').textContent = order.warehouse || 'No especificado';
    document.getElementById('purchaseDateDisplay').textContent = order.purchaseDate ? formatDate(order.purchaseDate) : 'No especificada';
    document.getElementById('warrantyStatusDisplay').textContent = order.warrantyStatus || 'No especificado';
    document.getElementById('damageDisplay').textContent = order.damage;
    
    // Cargar información de kilometraje y valor
    const kilometerDisplay = document.getElementById('kilometerDisplay');
    const estimatedValueDisplay = document.getElementById('estimatedValueDisplay');
    
    if (order.kilometer) {
        kilometerDisplay.textContent = `${order.kilometer.toLocaleString()} km`;
    } else {
        kilometerDisplay.textContent = 'No registrado';
    }
    
    if (order.estimatedValue) {
        estimatedValueDisplay.textContent = `$${order.estimatedValue.toFixed(2)}`;
    } else {
        estimatedValueDisplay.textContent = 'No registrado';
    }
    
    // Cargar información de recordatorios
    const nextReminderDisplay = document.getElementById('nextReminderDisplay');
    const reminderStatusDisplay = document.getElementById('reminderStatusDisplay');
    
    if (order.reminder && order.reminder.date && order.reminder.time) {
        const reminderDateTime = new Date(`${order.reminder.date}T${order.reminder.time}`);
        nextReminderDisplay.textContent = reminderDateTime.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (order.reminder.status) {
            const statusText = order.reminder.status.charAt(0).toUpperCase() + order.reminder.status.slice(1);
            reminderStatusDisplay.innerHTML = `<span class="reminder-status ${order.reminder.status}">${statusText}</span>`;
        } else {
            reminderStatusDisplay.innerHTML = '<span class="reminder-status pending">Pendiente</span>';
        }
        
        // Agregar información de prioridad si existe
        if (order.reminder.priority) {
            const priorityText = order.reminder.priority.charAt(0).toUpperCase() + order.reminder.priority.slice(1);
            const priorityBadge = `<span class="reminder-badge priority-${order.reminder.priority}">${priorityText}</span>`;
            reminderStatusDisplay.innerHTML += ` ${priorityBadge}`;
        }
    } else {
        nextReminderDisplay.textContent = 'No hay recordatorios';
        reminderStatusDisplay.textContent = 'Sin recordatorios';
    }
    
    document.getElementById('dateDisplay').textContent = formatDate(order.date);

    // Cargar estado actual
    loadOrderStatus(order);
    
    // Cargar información de cobro
    loadPaymentInfo(order);
    
    // Cargar notas
    loadNotes(order);
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formatear fecha y hora para notas
function formatDateTime(date) {
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Cargar notas
function loadNotes(order) {
    const container = document.getElementById('notesContainer');
    const notes = order.notes || [];
    
    if (notes.length === 0) {
        container.innerHTML = '<p class="no-notes">No hay notas registradas para esta orden.</p>';
        return;
    }

    // Ordenar notas de la más reciente a la más antigua
    const sortedNotes = [...notes].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(order.date);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(order.date);
        return dateB - dateA;
    });

    container.innerHTML = sortedNotes.map((note, displayIndex) => {
        const noteDate = note.createdAt ? new Date(note.createdAt) : new Date(order.date);
        const formattedDate = formatDateTime(noteDate);
        
        // Encontrar el índice real en el array original
        const realIndex = order.notes.findIndex(n => 
            (n.text || n) === (note.text || note) && 
            (n.createdAt || order.date) === (note.createdAt || order.date)
        );
        
        // Verificar si la nota ha sido modificada
        const isModified = note.modifiedAt && note.modifiedAt !== note.createdAt;
        const modifiedIndicator = isModified ? '<span class="note-modified-badge" title="Nota modificada"><i class="fas fa-edit"></i></span>' : '';
        
        return `
            <div class="note-item" data-note-index="${realIndex}">
                <div class="note-header">
                    <div class="note-info">
                        <span class="note-number">Nota #${displayIndex + 1}</span>
                        <span class="note-date">${formattedDate} ${modifiedIndicator}</span>
                    </div>
                    <div class="note-actions">
                        <button onclick="editNote(${realIndex})" class="btn-small warning" title="Editar Nota">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteNote(${realIndex})" class="btn-small danger" title="Eliminar Nota">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content" id="note-content-${realIndex}">${note.text || note}</div>
                <div class="note-edit-form" id="note-edit-form-${realIndex}" style="display: none;">
                    <textarea id="note-edit-text-${realIndex}" class="note-edit-textarea">${note.text || note}</textarea>
                    <div class="note-edit-actions">
                        <button onclick="saveNoteEdit(${realIndex})" class="btn-small">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                        <button onclick="cancelNoteEdit(${realIndex})" class="btn-small secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Cargar estado de la orden
function loadOrderStatus(order) {
    const currentStatus = order.status || 'ingresada';
    const statusDisplay = document.getElementById('currentStatusDisplay');
    const statusSelect = document.getElementById('statusSelect');
    
    // Actualizar el badge de estado actual
    statusDisplay.textContent = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
    statusDisplay.className = `status-badge status-${currentStatus}`;
    
    // Actualizar el dropdown
    if (statusSelect) {
        statusSelect.value = currentStatus;
    }
}



// Cambiar estado de la orden (ahora solo desde el formulario de edición)
function changeOrderStatus(newStatus) {
    const orderNumber = getOrderNumberFromURL();
    if (!orderNumber) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (orderIndex === -1) return;
    
    const oldStatus = orders[orderIndex].status || 'ingresada';
    orders[orderIndex].status = newStatus;
    
    // Guardar cambios
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Recargar la página para mostrar los cambios
    loadOrderDetails();
    
    // Mostrar confirmación
    showNotification(`Estado cambiado a: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`, 'success');
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}



// Editar orden
function editOrder() {
    const orderNumber = getOrderNumberFromURL();
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) return;

    // Llenar el formulario de edición
    document.getElementById('editOrderNumber').value = order.orderNumber;
    document.getElementById('editClientName').value = order.clientName || '';
    document.getElementById('editClientDocument').value = order.clientDocument || '';
    document.getElementById('editClientPhone').value = order.clientPhone || '';
    document.getElementById('editClientCity').value = order.clientCity || '';
    document.getElementById('editClientAddress').value = order.clientAddress || '';
    document.getElementById('editClientReference').value = order.clientReference || '';
    document.getElementById('editProduct').value = order.product;
    document.getElementById('editBrand').value = order.brand;
    document.getElementById('editSeries').value = order.series || '';
    document.getElementById('editWarehouse').value = order.warehouse || '';
    document.getElementById('editPurchaseDate').value = order.purchaseDate || '';
    document.getElementById('editWarrantyStatus').value = order.warrantyStatus || '';
    document.getElementById('editDamage').value = order.damage;
    
    // Cargar información de kilometraje y valor
    document.getElementById('editKilometer').value = order.kilometer || '';
    document.getElementById('editEstimatedValue').value = order.estimatedValue || '';
    
    // Cargar información de recordatorios
    if (order.reminder) {
        document.getElementById('editReminderDate').value = order.reminder.date || '';
        document.getElementById('editReminderTime').value = order.reminder.time || '';
        document.getElementById('editReminderDescription').value = order.reminder.description || '';
        document.getElementById('editReminderStatus').value = order.reminder.status || '';
        document.getElementById('editReminderPriority').value = order.reminder.priority || '';
    } else {
        document.getElementById('editReminderDate').value = '';
        document.getElementById('editReminderTime').value = '';
        document.getElementById('editReminderDescription').value = '';
        document.getElementById('editReminderStatus').value = '';
        document.getElementById('editReminderPriority').value = '';
    }
    
    document.getElementById('editDate').value = order.date;
    
    // Cargar información de cobro en el formulario de edición
    const paymentInfo = order.paymentInfo || {};
    document.getElementById('editServiceValue').value = paymentInfo.serviceValue || '';
    document.getElementById('editIvaPercentage').value = paymentInfo.ivaPercentage || 15;
    document.getElementById('editIvaValue').value = paymentInfo.ivaValue || '';
    document.getElementById('editPaymentStatus').value = paymentInfo.paymentStatus || 'sin_cobro';
    document.getElementById('editPaymentObservations').value = paymentInfo.paymentObservations || '';

    // Mostrar formulario de edición y ocultar información de solo lectura
    document.getElementById('editFormContainer').style.display = 'block';
    document.querySelector('.order-detail-card').style.display = 'none';
    
    // Mostrar dropdown de estado
    document.getElementById('statusDropdown').style.display = 'flex';
    
    // Cambiar el botón de editar
    const editButton = document.querySelector('.header-actions .btn-primary');
    editButton.innerHTML = '<i class="fas fa-eye"></i> Ver Orden';
    editButton.onclick = viewOrder;
}

// Cancelar edición
function cancelEdit() {
    // Ocultar formulario de edición y mostrar información de solo lectura
    document.getElementById('editFormContainer').style.display = 'none';
    document.querySelector('.order-detail-card').style.display = 'block';
    
    // Ocultar dropdown de estado
    document.getElementById('statusDropdown').style.display = 'none';
    
    // Restaurar el botón de editar
    const editButton = document.querySelector('.header-actions .btn-primary');
    editButton.innerHTML = '<i class="fas fa-edit"></i> Editar Orden';
    editButton.onclick = editOrder;
}

// Ver orden (modo solo lectura)
function viewOrder() {
    // Ocultar formulario de edición y mostrar información de solo lectura
    document.getElementById('editFormContainer').style.display = 'none';
    document.querySelector('.order-detail-card').style.display = 'block';
    
    // Ocultar dropdown de estado
    document.getElementById('statusDropdown').style.display = 'none';
    
    // Restaurar el botón de editar
    const editButton = document.querySelector('.header-actions .btn-primary');
    editButton.innerHTML = '<i class="fas fa-edit"></i> Editar Orden';
    editButton.onclick = editOrder;
}

// Guardar cambios de la orden
document.getElementById('editOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderNumber = getOrderNumberFromURL();
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (orderIndex === -1) return;

    const originalOrder = orders[orderIndex];
    const updatedOrder = {
        ...originalOrder,
        clientName: document.getElementById('editClientName').value.trim(),
        clientDocument: document.getElementById('editClientDocument').value.trim(),
        clientPhone: document.getElementById('editClientPhone').value.trim(),
        clientCity: document.getElementById('editClientCity').value.trim(),
        clientAddress: document.getElementById('editClientAddress').value.trim(),
        clientReference: document.getElementById('editClientReference').value.trim(),
        product: document.getElementById('editProduct').value.trim(),
        brand: document.getElementById('editBrand').value.trim(),
        series: document.getElementById('editSeries').value.trim(),
        warehouse: document.getElementById('editWarehouse').value.trim(),
        purchaseDate: document.getElementById('editPurchaseDate').value,
        warrantyStatus: document.getElementById('editWarrantyStatus').value,
        damage: document.getElementById('editDamage').value.trim(),
        
        // Guardar información de kilometraje y valor
        kilometer: document.getElementById('editKilometer').value ? parseInt(document.getElementById('editKilometer').value) : null,
        estimatedValue: document.getElementById('editEstimatedValue').value ? parseFloat(document.getElementById('editEstimatedValue').value) : null,
        
        // Guardar información de recordatorios
        reminder: {
            date: document.getElementById('editReminderDate').value || null,
            time: document.getElementById('editReminderTime').value || null,
            description: document.getElementById('editReminderDescription').value.trim() || null,
            status: document.getElementById('editReminderStatus').value || null,
            priority: document.getElementById('editReminderPriority').value || null
        },
        
        date: document.getElementById('editDate').value,
        
        // Guardar información de cobro
        paymentInfo: {
            serviceValue: document.getElementById('editServiceValue').value ? parseFloat(document.getElementById('editServiceValue').value) : null,
            ivaPercentage: document.getElementById('editIvaPercentage').value ? parseInt(document.getElementById('editIvaPercentage').value) : 15,
            ivaValue: document.getElementById('editIvaValue').value ? parseFloat(document.getElementById('editIvaValue').value) : null,
            paymentStatus: document.getElementById('editPaymentStatus').value || 'sin_cobro',
            paymentObservations: document.getElementById('editPaymentObservations').value.trim() || null,
            lastUpdate: new Date().toISOString()
        }
    };



    orders[orderIndex] = updatedOrder;
    localStorage.setItem('orders', JSON.stringify(orders));

    // Mostrar notificación de éxito
    showNotification('Orden actualizada exitosamente', 'success');
    
    // Actualizar currentOrder para mantener la referencia
    currentOrder = updatedOrder;
    
    // Ocultar dropdown de estado
    document.getElementById('statusDropdown').style.display = 'none';
    
    // Volver al modo de visualización
    viewOrder();
    
    // Recargar los datos
    loadOrderDetails();
});

// Calcular automáticamente el IVA cuando cambie el valor del servicio o el porcentaje
document.addEventListener('DOMContentLoaded', function() {
    const serviceValueInput = document.getElementById('editServiceValue');
    const ivaPercentageSelect = document.getElementById('editIvaPercentage');
    const ivaValueInput = document.getElementById('editIvaValue');

    function calculateIva() {
        const serviceValue = parseFloat(serviceValueInput.value) || 0;
        const ivaPercentage = parseFloat(ivaPercentageSelect.value) || 0;
        const ivaValue = (serviceValue * ivaPercentage) / 100;
        ivaValueInput.value = ivaValue.toFixed(2);
    }

    if (serviceValueInput && ivaPercentageSelect && ivaValueInput) {
        serviceValueInput.addEventListener('input', calculateIva);
        ivaPercentageSelect.addEventListener('change', calculateIva);
    }
});

// Agregar nota
function addNote() {
    document.getElementById('newNoteText').value = '';
    document.getElementById('addNoteModal').style.display = 'block';
}

// Cerrar modal de agregar nota
function closeAddNoteModal() {
    document.getElementById('addNoteModal').style.display = 'none';
}

// Guardar nueva nota
document.getElementById('addNoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderNumber = getOrderNumberFromURL();
    const noteText = document.getElementById('newNoteText').value.trim();
    
    if (!noteText) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (orderIndex === -1) return;

    if (!orders[orderIndex].notes) orders[orderIndex].notes = [];
    
    // Crear objeto de nota con fecha y hora real
    const newNote = {
        text: noteText,
        createdAt: new Date().toISOString()
    };
    
    orders[orderIndex].notes.push(newNote);

    // Agregar entrada al historial
    if (!orders[orderIndex].history) orders[orderIndex].history = [];
    orders[orderIndex].history.push({
        action: 'Nota agregada',
        date: new Date().toISOString(),
        details: `Se agregó una nueva nota: "${noteText.substring(0, 50)}${noteText.length > 50 ? '...' : ''}"`
    });

    localStorage.setItem('orders', JSON.stringify(orders));

    closeAddNoteModal();
    loadOrderDetails();
});

// Editar nota
function editNote(noteIndex) {
    const noteContent = document.getElementById(`note-content-${noteIndex}`);
    const noteEditForm = document.getElementById(`note-edit-form-${noteIndex}`);
    const noteEditText = document.getElementById(`note-edit-text-${noteIndex}`);
    
    // Ocultar contenido y mostrar formulario de edición
    noteContent.style.display = 'none';
    noteEditForm.style.display = 'block';
    
    // Enfocar el textarea
    noteEditText.focus();
    noteEditText.select();
}

// Cancelar edición de nota
function cancelNoteEdit(noteIndex) {
    const noteContent = document.getElementById(`note-content-${noteIndex}`);
    const noteEditForm = document.getElementById(`note-edit-form-${noteIndex}`);
    const noteEditText = document.getElementById(`note-edit-text-${noteIndex}`);
    
    // Restaurar el contenido original
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderNumber = getOrderNumberFromURL();
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (order && order.notes && order.notes[noteIndex]) {
        const note = order.notes[noteIndex];
        noteEditText.value = note.text || note;
    }
    
    // Ocultar formulario y mostrar contenido
    noteEditForm.style.display = 'none';
    noteContent.style.display = 'block';
}

// Guardar edición de nota
function saveNoteEdit(noteIndex) {
    const orderNumber = getOrderNumberFromURL();
    const noteEditText = document.getElementById(`note-edit-text-${noteIndex}`);
    const newNoteText = noteEditText.value.trim();
    
    if (!newNoteText) {
        showNotification('La nota no puede estar vacía', 'error');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (orderIndex === -1) return;
    
    const oldNote = orders[orderIndex].notes[noteIndex];
    const oldNoteText = oldNote.text || oldNote;
    
    // Actualizar la nota manteniendo la fecha de creación original
    if (typeof oldNote === 'object' && oldNote.createdAt) {
        orders[orderIndex].notes[noteIndex] = {
            text: newNoteText,
            createdAt: oldNote.createdAt,
            modifiedAt: new Date().toISOString()
        };
    } else {
        // Si es una nota antigua (solo texto), convertirla al nuevo formato
        orders[orderIndex].notes[noteIndex] = {
            text: newNoteText,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };
    }
    
    // Agregar entrada al historial
    if (!orders[orderIndex].history) orders[orderIndex].history = [];
    orders[orderIndex].history.push({
        action: 'Nota editada',
        date: new Date().toISOString(),
        details: `Se editó la nota #${noteIndex + 1}: "${oldNoteText.substring(0, 50)}${oldNoteText.length > 50 ? '...' : ''}" → "${newNoteText.substring(0, 50)}${newNoteText.length > 50 ? '...' : ''}"`
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Recargar las notas para mostrar los cambios
    loadOrderDetails();
    showNotification('Nota editada exitosamente', 'success');
}

// Eliminar nota
function deleteNote(noteIndex) {
    const orderNumber = getOrderNumberFromURL();
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (orderIndex === -1) return;
    
    const note = orders[orderIndex].notes[noteIndex];
    const noteText = note.text || note;
    
    if (confirm(`¿Está seguro que desea eliminar la nota #${noteIndex + 1}?\n\n"${noteText.substring(0, 100)}${noteText.length > 100 ? '...' : ''}"`)) {
        // Agregar entrada al historial
        if (!orders[orderIndex].history) orders[orderIndex].history = [];
        orders[orderIndex].history.push({
            action: 'Nota eliminada',
            date: new Date().toISOString(),
            details: `Se eliminó la nota #${noteIndex + 1}: "${noteText.substring(0, 50)}${noteText.length > 50 ? '...' : ''}"`
        });
        
        // Eliminar la nota
        orders[orderIndex].notes.splice(noteIndex, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Recargar las notas
        loadOrderDetails();
        showNotification('Nota eliminada exitosamente', 'success');
    }
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Cargar información de cobro
function loadPaymentInfo(order) {
    const paymentInfo = order.paymentInfo || {
        serviceValue: 0,
        paymentStatus: 'sin_cobro',
        paymentObservations: ''
    };
    
    // Cargar en los elementos de visualización
    const serviceValueDisplay = document.getElementById('serviceValueDisplay');
    const paymentStatusDisplay = document.getElementById('paymentStatusDisplay');
    const paymentObservationsDisplay = document.getElementById('paymentObservationsDisplay');
    
    if (paymentInfo.serviceValue && paymentInfo.serviceValue > 0) {
        serviceValueDisplay.textContent = `$${paymentInfo.serviceValue.toFixed(2)}`;
    } else {
        serviceValueDisplay.textContent = 'No registrado';
    }
    
    // Mostrar estado de cobro con formato
    const statusText = getPaymentStatusText(paymentInfo.paymentStatus);
    paymentStatusDisplay.textContent = statusText;
    
    if (paymentInfo.paymentObservations && paymentInfo.paymentObservations.trim()) {
        paymentObservationsDisplay.textContent = paymentInfo.paymentObservations;
    } else {
        paymentObservationsDisplay.textContent = 'Sin observaciones';
    }
    
    // También cargar en los campos de edición si existen
    const editServiceValue = document.getElementById('editServiceValue');
    const editPaymentStatus = document.getElementById('editPaymentStatus');
    const editPaymentObservations = document.getElementById('editPaymentObservations');
    
    if (editServiceValue) {
        editServiceValue.value = paymentInfo.serviceValue || '';
    }
    if (editPaymentStatus) {
        editPaymentStatus.value = paymentInfo.paymentStatus || 'sin_cobro';
    }
    if (editPaymentObservations) {
        editPaymentObservations.value = paymentInfo.paymentObservations || '';
    }
}

// Obtener texto del estado de cobro
function getPaymentStatusText(status) {
    const statusMap = {
        'sin_cobro': 'Sin cobro',
        'pendiente_cobro': 'Pendiente de cobro',
        'cobrada': 'Cobrada'
    };
    return statusMap[status] || 'Sin cobro';
}



// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetails();
}); 