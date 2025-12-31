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

    // Atualizar dashboard com dados iniciais
    updateDashboard();
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
    
    // Validar valor
    const valueNumber = parseMoneyToNumber(saleValue);
    if (valueNumber <= 0) {
        showNotification('Valor da venda deve ser maior que zero', 'error');
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
    
    // Validar valor
    const valueNumber = parseMoneyToNumber(paymentValue);
    if (valueNumber <= 0) {
        showNotification('Valor do pagamento deve ser maior que zero', 'error');
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

/* Confirma registro de venda */
function confirmSale() {
    const saleData = validateSaleFields();
    if (!saleData) return;

    // Busca nome do cliente
    const client = window.clientsList.find(c => c.id === parseInt(saleData.linkedClient));
    if (!client) {
        showNotification('Cliente não encontrado!', 'error');
        return;
    }

    // Registra a venda
    const newSale = addNewSale(
        saleData.linkedClient,
        client.name,
        saleData.saleDate,
        saleData.paymentDate,
        saleData.saleProducts,
        saleData.saleValue
    );

    if (newSale) {
        const valueFormatted = formatCurrency(newSale.totalValue);
        showNotification(`Venda de ${valueFormatted} registrada para ${client.name}!`);
        closeSaleModal();
    }
}


/* Confirma registro de pagamento (COM LÓGICA FIFO) */
function confirmPayment() {
    const paymentData = validatePaymentFields();
    if (!paymentData) return;

    // Busca nome do cliente
    const client = window.clientsList.find(c => c.id === parseInt(paymentData.linkedClient));
    if (!client) {
        showNotification('Cliente não encontrado!', 'error');
        return;
    }

    // Registra o pagamento (a função já mostra o feedback detalhado)
    const newPayment = addNewPayment(
        paymentData.linkedClient,
        client.name,
        paymentData.paymentValue,
        paymentData.paymentMethod
    );

    if (newPayment) {
        closePaymentModal();
    }
}


function handleMenuClick(option) {
    if (option === 'Registrar Pagamento') {
        openPaymentModal();
    } else {
        showNotification(`Abrindo: ${option}`);
    }
}

/*Busca de clientes */
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput?.value.trim().toLowerCase();
    
    if (!searchTerm) {
        showNotification('Digite algo para buscar', 'error');
        return;
    }
    
    // Busca clientes
    const foundClients = window.clientsList.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm)
    );
    
    if (foundClients.length === 0) {
        showNotification(`Nenhum cliente encontrado para "${searchTerm}"`, 'error');
        return;
    }
    
    // Busca vendas desses clientes
    const clientIds = foundClients.map(c => c.id);
    const clientSales = window.salesList.filter(sale => clientIds.includes(sale.clientId));
    
    // Monta mensagem
    let message = `Encontrado(s) ${foundClients.length} cliente(s):\n\n`;
    
    foundClients.forEach(client => {
        const debt = calculateClientDebt(client.id);
        const sales = clientSales.filter(s => s.clientId === client.id).length;
        message += `• ${client.name}\n`;
        message += `  ${client.phone}\n`;
        message += `  ${sales} venda(s) | Dívida: ${formatCurrency(debt)}\n\n`;
    });
    
    showNotification(message);
    console.log('🔍 Resultado da busca:', foundClients);
}