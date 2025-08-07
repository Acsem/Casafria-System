// Estructura para almacenar clientes
let clients = JSON.parse(localStorage.getItem('clients')) || [];

// Cargar clientes al iniciar
window.onload = function() {
    // Agregar clientes de ejemplo si no existen
    if (clients.length === 0) {
        clients = [
            {
                id: 1,
                code: 'CL0001',
                firstName: 'Juan',
                lastName: 'Pérez',
                phone: '555-0101',
                city: 'Madrid',
                address: 'Calle Mayor 123',
                additionalInfo: 'Cliente frecuente, prefiere servicio express',
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                code: 'CL0002',
                firstName: 'María',
                lastName: 'García',
                phone: '555-0102',
                city: 'Barcelona',
                address: 'Avenida Diagonal 456',
                additionalInfo: 'Especialista en electrónica',
                createdAt: '2024-01-20T14:45:00Z'
            },
            {
                id: 3,
                code: 'CL0003',
                firstName: 'Carlos',
                lastName: 'López',
                phone: '555-0103',
                city: 'Valencia',
                address: 'Calle Colón 789',
                additionalInfo: 'Cliente corporativo',
                createdAt: '2024-02-01T09:15:00Z'
            }
        ];
        localStorage.setItem('clients', JSON.stringify(clients));
    }
    
    renderClients();
    setupSearchListener();
};

// Función para mostrar el modal de nuevo cliente
function showNewClientForm() {
    document.getElementById('modalTitle').textContent = 'Nuevo Cliente';
    document.getElementById('clientForm').reset();
    document.getElementById('clientModal').style.display = 'block';
}

// Función para cerrar el modal
function closeClientModal() {
    document.getElementById('clientModal').style.display = 'none';
}

// Manejar el formulario de cliente
document.getElementById('clientForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const client = {
        id: Date.now(),
        code: generateClientCode(),
        firstName: document.getElementById('clientFirstName').value,
        lastName: document.getElementById('clientLastName').value,
        phone: document.getElementById('clientPhone').value,
        city: document.getElementById('clientCity').value,
        address: document.getElementById('clientAddress').value,
        additionalInfo: document.getElementById('clientInfo').value,
        createdAt: new Date().toISOString()
    };

    clients.push(client);
    saveClients();
    renderClients();
    closeClientModal();
    showMessage('Cliente guardado exitosamente');
});

// Generar código único para el cliente
function generateClientCode() {
    const lastClient = clients[clients.length - 1];
    const lastNumber = lastClient ? parseInt(lastClient.code.slice(2)) : 0;
    return `CL${String(lastNumber + 1).padStart(4, '0')}`;
}

// Renderizar la tabla de clientes
function renderClients() {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';

    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.className = 'client-row';
        tr.style.cursor = 'pointer';
        tr.onclick = () => openClientDetail(client.id);
        tr.innerHTML = `
            <td>${client.code}</td>
            <td>${client.firstName} ${client.lastName}</td>
            <td>${client.phone}</td>
            <td>${client.city}</td>
            <td>${client.address}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="event.stopPropagation(); editClient(${client.id})" class="btn-small" title="Editar Cliente">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); openClientDetail(${client.id})" class="btn-small" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteClient(${client.id})" class="btn-small btn-danger" title="Eliminar Cliente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para editar cliente
function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        document.getElementById('modalTitle').textContent = 'Editar Cliente';
        document.getElementById('clientFirstName').value = client.firstName;
        document.getElementById('clientLastName').value = client.lastName;
        document.getElementById('clientPhone').value = client.phone;
        document.getElementById('clientCity').value = client.city;
        document.getElementById('clientAddress').value = client.address;
        document.getElementById('clientInfo').value = client.additionalInfo;
        
        document.getElementById('clientForm').dataset.editId = clientId;
        document.getElementById('clientModal').style.display = 'block';
    }
}

// Función para eliminar cliente
function deleteClient(clientId) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        clients = clients.filter(c => c.id !== clientId);
        saveClients();
        renderClients();
        showMessage('Cliente eliminado exitosamente');
    }
}

// Función para abrir la página de detalles del cliente
function openClientDetail(clientId) {
    window.location.href = `client-detail.html?id=${clientId}`;
}

// Función para mostrar detalles del cliente (mantenida por compatibilidad)
function showClientDetails(clientId) {
    openClientDetail(clientId);
}

// Configurar el buscador
function setupSearchListener() {
    document.getElementById('searchClient').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredClients = clients.filter(client => 
            client.code.toLowerCase().includes(searchTerm) ||
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm) ||
            client.phone.includes(searchTerm) ||
            client.city.toLowerCase().includes(searchTerm)
        );
        renderFilteredClients(filteredClients);
    });
}

// Renderizar clientes filtrados
function renderFilteredClients(filteredClients) {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';

    filteredClients.forEach(client => {
        const tr = document.createElement('tr');
        tr.className = 'client-row';
        tr.style.cursor = 'pointer';
        tr.onclick = () => openClientDetail(client.id);
        tr.innerHTML = `
            <td>${client.code}</td>
            <td>${client.firstName} ${client.lastName}</td>
            <td>${client.phone}</td>
            <td>${client.city}</td>
            <td>${client.address}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="event.stopPropagation(); editClient(${client.id})" class="btn-small" title="Editar Cliente">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); openClientDetail(${client.id})" class="btn-small" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteClient(${client.id})" class="btn-small btn-danger" title="Eliminar Cliente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Guardar clientes en localStorage
function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Mostrar mensaje temporal
function showMessage(message) {
    alert(message); // Puedes reemplazar esto con una implementación más elegante
} 