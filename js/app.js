// js/app.js - Arquivo principal da aplicação

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema carregado');
    
    // Criar modais e carregar dados iniciais
    createModals();
    
    // Configurar eventos gerais
    setupEventListeners();
    
    // Configurar navegação do menu lateral (NOVO)
    setupSidebarNavigation();
    
    // Garantir que modais estejam ocultos
    hideAllModals();

    // Atualizar dashboard com dados iniciais
    updateDashboard();
});

// --- FUNÇÃO NOVA: NAVEGAÇÃO DO MENU ---
function setupSidebarNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove a classe 'active' de todos os itens
            navLinks.forEach(nav => nav.classList.remove('active'));

            // Adiciona a classe 'active' apenas ao item clicado
            this.classList.add('active');

            // Fecha o menu mobile se estivermos no celular
            const sidebar = document.getElementById('appSidebar');
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('show')) {
                toggleSidebar();
            }
        });
    });
}

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
    // A validação principal já ocorre dentro de confirmPaymentUI no modals.js
    return false; 
}


// --- LÓGICA DOS BOTÕES ---

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

function handleMenuClick(option) {
    if (option === 'Registrar Pagamento') {
        openPaymentModal();
    } else {
        // Apenas visual, já que não temos páginas reais ainda
        // O efeito de mudança de menu já é tratado pela setupSidebarNavigation
    }
}

/* Busca de clientes */
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput?.value.trim().toLowerCase();
    
    if (!searchTerm) {
        showNotification('Digite algo para buscar', 'error');
        return;
    }
    
    const foundClients = window.clientsList.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm)
    );
    
    if (foundClients.length === 0) {
        showNotification(`Nenhum cliente encontrado para "${searchTerm}"`, 'error');
        return;
    }
    
    const clientIds = foundClients.map(c => c.id);
    const clientSales = window.salesList.filter(sale => clientIds.includes(sale.clientId));
    
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

/* --- CONTROLE DO MENU MOBILE --- */
function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    }
}