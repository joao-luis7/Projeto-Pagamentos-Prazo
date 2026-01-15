// js/app.utils.js - Funções utilitárias gerais da aplicação

// =============================================================================
// 1. CONTROLE DA SIDEBAR
// =============================================================================

function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
    if (overlay) {
        overlay.classList.toggle('show');
    }
}

// =============================================================================
// 2. CONTROLE DE MENU
// =============================================================================

function handleMenuClick(menuItem) {
    if (menuItem === 'Registrar Pagamento') {
        openPaymentModal();
    } else if (menuItem === 'Lembretes') {
        openReminderModal();
    }
    
    // Fecha sidebar em dispositivos móveis
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('show')) {
        toggleSidebar();
    }
}

// =============================================================================
// 3. BUSCA (Placeholder para futura implementação)
// =============================================================================

function performSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value) {
        showNotification('Busca por: ' + searchInput.value);
    }
}

// =============================================================================
// 4. CONFIGURAÇÃO DE EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Máscaras de entrada
    const phoneInputs = document.querySelectorAll('[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (typeof applyPhoneMask === 'function') {
                applyPhoneMask(this);
            }
        });
    });

    // Máscaras monetárias
    const moneyInputs = document.querySelectorAll('[data-mask="money"], .form-field-input[id*="Value"], .form-field-input[id*="value"]');
    moneyInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (typeof applyMoneyMask === 'function') {
                applyMoneyMask(this);
            }
        });
    });

    // Fechar modal ao clicar no overlay
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalId = this.id;
                closeModal(modalId);
            }
        });
    });
}

// =============================================================================
// 5. NAVEGAÇÃO DA SIDEBAR
// =============================================================================

function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona ao clicado
            this.classList.add('active');
        });
    });
}

// =============================================================================
// 6. FUNÇÕES DE CLIENTE (Ações nos modais)
// =============================================================================

function registerOnly() {
    const clientData = validateClientFields();
    if (!clientData) return;

    const newClient = addNewClient(clientData.name, clientData.phone, clientData.address);
    showNotification(`Cliente ${clientData.name} cadastrado com sucesso!`);
    
    closeClientModal();
    updateDashboard();
}

// =============================================================================
// 7. FUNÇÕES DE VENDA (Ações nos modais)
// =============================================================================

function confirmSale() {
    const linkedClientSelect = document.getElementById('linkedClient');
    const saleDate = document.getElementById('saleDate');
    const saleProducts = document.getElementById('saleProducts');
    const saleValue = document.getElementById('saleValue');
    const paymentDate = document.getElementById('paymentDate');

    // Validação
    if (!linkedClientSelect?.value) {
        showNotification('Selecione um cliente', 'error');
        return;
    }

    const clientId = parseInt(linkedClientSelect.value);
    const client = window.clientsList.find(c => c.id === clientId);
    
    if (!client) {
        showNotification('Cliente não encontrado', 'error');
        return;
    }

    if (!saleDate?.value || !saleProducts?.value || !saleValue?.value) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }

    // Converte valor
    const totalValue = parseMoneyToNumber(saleValue.value);
    
    if (totalValue <= 0) {
        showNotification('Informe um valor válido', 'error');
        return;
    }

    // Adiciona venda
    const newSale = addNewSale(
        clientId,
        client.name,
        saleDate.value,
        paymentDate.value || saleDate.value,
        saleProducts.value,
        totalValue
    );

    showNotification(`Venda registrada para ${client.name}!`);
    closeSaleModal();
    updateDashboard();
}

// =============================================================================
// 8. CONTROLE GENÉRICO DE MODAIS
// =============================================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const mainContainer = document.getElementById('mainContainer') || document.querySelector('main');
    
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        if (mainContainer) {
            mainContainer.classList.add('blurred');
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const mainContainer = document.getElementById('mainContainer') || document.querySelector('main');
    
    if (modal) {
        if (mainContainer) {
            mainContainer.classList.remove('blurred');
        }
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 200);
    }
}

// Wrappers específicos para cada modal
function openClientModal() {
    openModal('clientModal');
    clearClientFields();
}

function closeClientModal() {
    closeModal('clientModal');
}

function clearClientFields() {
    ['clientName', 'clientPhone', 'clientAddress'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

function openSaleModal() {
    openModal('saleModal');
    clearSaleFields();
    loadClients();
}

function closeSaleModal() {
    closeModal('saleModal');
}

function clearSaleFields() {
    const linkedClient = document.getElementById('linkedClient');
    const saleProducts = document.getElementById('saleProducts');
    const saleValue = document.getElementById('saleValue');
    
    if (linkedClient) linkedClient.selectedIndex = 0;
    if (saleProducts) saleProducts.value = '';
    if (saleValue) saleValue.value = '';
    
    const today = getTodayDate();
    const saleDate = document.getElementById('saleDate');
    const paymentDate = document.getElementById('paymentDate');
    
    if (saleDate) saleDate.value = today;
    if (paymentDate) paymentDate.value = today;
}

function loadClients() {
    const select = document.getElementById('linkedClient');
    if (!select) return;
    
    // Remove opções antigas (mantém a primeira)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    window.clientsList.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

function openPaymentModal() {
    openModal('paymentModal');
    
    // Reset estado
    window.currentPaymentClient = null;
    const container = document.getElementById('paymentContainer');
    if (container) container.classList.remove('expanded');
    
    const details = document.getElementById('paymentDetailsArea');
    if (details) details.classList.add('hidden');

    const trigger = document.querySelector('.custom-select-trigger');
    if (trigger) {
        trigger.innerHTML = `
            <span id="paymentSelectedName">Cliente Vinculado</span>
            <div class="dropdown-arrow"></div>
        `;
        trigger.onclick = togglePaymentDropdown;
    }
    
    const today = getTodayDate();
    const dateInput = document.getElementById('payDateInput');
    if (dateInput) dateInput.value = today;
    
    const valueInput = document.getElementById('payValueInput');
    if (valueInput) valueInput.value = '';
    
    const methodInput = document.getElementById('payMethodInput');
    if (methodInput) methodInput.selectedIndex = 0;
}

function closePaymentModal() {
    closeModal('paymentModal');
}

function openReminderModal() {
    // Carrega dados no modal
    const listContainer = document.getElementById('reminderListContainer');
    const titleContainer = document.getElementById('reminderListTitle');
    
    if (!listContainer || !titleContainer) return;

    listContainer.innerHTML = '';
    titleContainer.innerHTML = '';
    
    let overdueCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdueClients = [];

    window.clientsList.forEach(client => {
        const clientSales = window.salesList.filter(s => s.clientId === client.id && s.status !== 'Pago');
        
        // Filtra vencidos
        const overdueSales = clientSales.filter(sale => {
            const parts = sale.dueDate.split('-');
            const due = new Date(parts[0], parts[1] - 1, parts[2]);
            return due < today;
        });

        if (overdueSales.length > 0) {
            overdueCount += overdueSales.length;
            
            // Pega o mais antigo
            overdueSales.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            const oldest = overdueSales[0];
            
            // Calcula dias
            const parts = oldest.dueDate.split('-');
            const dueObj = new Date(parts[0], parts[1] - 1, parts[2]);
            const diffDays = Math.ceil(Math.abs(today - dueObj) / (1000 * 60 * 60 * 24));
            
            overdueClients.push({
                client,
                sale: oldest,
                days: diffDays,
                count: overdueSales.length
            });
        }
    });

    overdueClients.sort((a, b) => b.days - a.days);

    // Atualiza o Título
    if (overdueCount > 0) {
        const plural = overdueCount > 1 ? 'Pagamentos Atrasados' : 'Pagamento Atrasado';
        titleContainer.innerHTML = `${overdueCount} ${plural}`;
        titleContainer.style.display = 'block';
    } else {
        titleContainer.style.display = 'none';
    }

    // Gera os Cards
    if (overdueClients.length > 0) {
        overdueClients.forEach(item => {
            const dateParts = item.sale.dueDate.split('-');
            const dateFormatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            const debtValue = formatCurrency(item.sale.remainingValue);

            const cardHTML = `
                <div class="reminder-item-wrapper">
                    <div class="reminder-floating-badge">
                        ${item.days} Dias de Atraso
                    </div>
                    
                    <div class="reminder-gray-card">
                        <div class="reminder-info-left">
                            <div class="client-name-bold">${item.client.name}</div>
                            
                            <div class="client-details-row" style="gap: 20px;">
                                <span style="font-weight: 500; color: #000;">${item.sale.products}</span>
                                <span style="font-weight: 700; color: #AF1E1E;">${debtValue}</span>
                                <span style="color: #444;">Vencimento: ${dateFormatted}</span>
                            </div>
                        </div>

                        <div class="reminder-action-right">
                            <button class="btn-whatsapp-pill" onclick="sendReminderToClient(${item.client.id}, '${item.client.name}', '${item.client.phone}')">
                                ENVIAR LEMBRETE
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listContainer.innerHTML += cardHTML;
        });
    } else {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #5F5F5F; width: 100%;">
                <p>Nenhum cliente com pagamento atrasado hoje.</p>
            </div>
        `;
    }

    openModal('reminderModal');
}

function closeReminderModal() {
    closeModal('reminderModal');
}

function sendReminderToClient(id, name, phone) {
    // Placeholder para integração WhatsApp
    showNotification(`Abrindo WhatsApp de ${name}...`);
}
