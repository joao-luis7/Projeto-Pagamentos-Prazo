function createModals() {
    if (typeof createClientModal === 'function') createClientModal();
    if (typeof createSaleModal === 'function') createSaleModal();
    if (typeof createPaymentModal === 'function') createPaymentModal();
    if (typeof createReminderModal === 'function') createReminderModal();
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa todos os modais (HTML)
    createModals(); // Esta função agora chama as sub-funções nos arquivos .modal.js
    
    setupEventListeners();
    setupSidebarNavigation();
    updateDashboard(); // Atualiza os números na tela
});

// Exemplo de função que coordena dois serviços:
function registerAndSell() {
    const clientData = validateClientFields(); // Chama o validador
    if (!clientData) return;

    const newClient = addNewClient(clientData.name, clientData.phone, clientData.address); // Chama o serviço
    showNotification(`Cliente ${clientData.name} cadastrado!`);
    
    closeClientModal();
    
    setTimeout(() => {
        openSaleModal();
        const select = document.getElementById('linkedClient');
        if (select) select.value = newClient.id;
    }, 300);
}