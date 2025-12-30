// js/app.js - Arquivo principal da aplicação

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema carregado');
    
    // Criar modais e carregar dados iniciais
    createModals();
    
    // Configurar eventos
    setupEventListeners();
    
    // Garantir que modais estejam ocultos
    hideAllModals();
});

function hideAllModals() {
    ['clientModal', 'saleModal', 'paymentModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    });
    
    const container = document.getElementById('mainContainer');
    if (container) container.classList.remove('blurred');
}

function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') performSearch();
        });
        
        searchInput.addEventListener('focus', function() {
            this.placeholder = '';
        });
        
        searchInput.addEventListener('blur', function() {
            if (!this.value.trim()) this.placeholder = 'Buscar cliente';
        });
    }

    // Fechar modais ao clicar fora
    ['clientModal', 'saleModal', 'paymentModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    if (id === 'clientModal') closeClientModal();
                    else if (id === 'saleModal') closeSaleModal();
                    else if (id === 'paymentModal') closePaymentModal();
                }
            });
        }
    });

    // ESC para fechar
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const clientModal = document.getElementById('clientModal');
            const saleModal = document.getElementById('saleModal');
            const paymentModal = document.getElementById('paymentModal');
            
            if (clientModal?.classList.contains('show')) closeClientModal();
            if (saleModal?.classList.contains('show')) closeSaleModal();
            if (paymentModal?.classList.contains('show')) closePaymentModal();
        }
    });

    // Máscaras
    setTimeout(() => {
        const clientPhone = document.getElementById('clientPhone');
        const saleValue = document.getElementById('saleValue');
        const paymentValue = document.getElementById('paymentValue');
        
        if (clientPhone) {
            clientPhone.addEventListener('input', () => applyPhoneMask(clientPhone));
        }
        
        if (saleValue) {
            saleValue.addEventListener('input', () => applyMoneyMask(saleValue));
        }

        if (paymentValue) {
            paymentValue.addEventListener('input', () => applyMoneyMask(paymentValue));
        }
    }, 100);
}

// --- VALIDAÇÕES ---

function validateClientFields() {
    const name = document.getElementById('clientName')?.value.trim();
    const phone = document.getElementById('clientPhone')?.value.trim();
    const address = document.getElementById('clientAddress')?.value.trim();

    if (!name || !phone || !address) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return false;
    }
    return { name, phone, address };
}

function validateSaleFields() {
    const linkedClient = document.getElementById('linkedClient')?.value;
    const saleDate = document.getElementById('saleDate')?.value;
    const saleProducts = document.getElementById('saleProducts')?.value.trim();
    const saleValue = document.getElementById('saleValue')?.value.trim();
    const paymentDate = document.getElementById('paymentDate')?.value;

    if (!linkedClient || !saleDate || !saleProducts || !saleValue || !paymentDate) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return false;
    }
    
    return { linkedClient, saleDate, saleProducts, saleValue, paymentDate };
}

function validatePaymentFields() {
    const linkedClient = document.getElementById('paymentLinkedClient')?.value;
    const paymentValue = document.getElementById('paymentValue')?.value.trim();
    const paymentMethod = document.getElementById('paymentMethod')?.value;

    if (!linkedClient || !paymentValue || !paymentMethod) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return false;
    }
    
    return { linkedClient, paymentValue, paymentMethod };
}

// --- LÓGICA DOS BOTÕES ATUALIZADA ---

// BOTÃO VERDE: Cadastra cliente e abre venda
function registerAndSell() {
    // 1. Validar campos
    const clientData = validateClientFields();
    if (!clientData) return;

    // 2. Adicionar cliente à lista global
    const newClient = addNewClient(clientData.name, clientData.phone, clientData.address);

    showNotification(`Cliente ${clientData.name} cadastrado!`);
    
    // 3. Fechar modal de cliente
    closeClientModal();
    
    // 4. Abrir modal de venda e selecionar o cliente
    setTimeout(() => {
        openSaleModal();
        
        // Seleciona automaticamente o novo cliente
        const linkedClientSelect = document.getElementById('linkedClient');
        if (linkedClientSelect) {
            linkedClientSelect.value = newClient.id;
        }
        
        showNotification(`Iniciando venda para ${clientData.name}`);
    }, 300);
}

// BOTÃO BRANCO: Apenas cadastra e volta
function registerOnly() {
    // 1. Validar
    const clientData = validateClientFields();
    if (!clientData) return;

    // 2. Adicionar
    addNewClient(clientData.name, clientData.phone, clientData.address);

    // 3. Fechar e avisar
    showNotification(`Cliente ${clientData.name} cadastrado com sucesso!`);
    closeClientModal();
}

function confirmSale() {
    const saleData = validateSaleFields();
    if (!saleData) return;

    console.log('Registrando venda:', saleData);
    showNotification('Venda registrada com sucesso!');
    closeSaleModal();
}

function confirmPayment() {
    const paymentData = validatePaymentFields();
    if (!paymentData) return;

    console.log('Registrando pagamento:', paymentData);
    showNotification('Pagamento registrado com sucesso!');
    closePaymentModal();
}

function handleMenuClick(option) {
    if (option === 'Registrar Pagamento') {
        openPaymentModal();
    } else {
        showNotification(`Abrindo: ${option}`);
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput?.value.trim();
    
    if (searchTerm) {
        showNotification(`Buscando por: ${searchTerm}`);
    } else {
        showNotification('Digite algo para buscar', 'error');
    }
}