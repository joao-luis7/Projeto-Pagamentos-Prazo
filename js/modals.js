// js/modals.js - Gerenciamento de modais e dados

// =============================================================================
// 1. DADOS E LISTAS GLOBAIS
// =============================================================================

window.clientsList = [
    { id: 1, name: 'João Silva', phone: '(11) 98765-4321', address: 'Rua A, 123' },
    { id: 2, name: 'Maria Santos', phone: '(11) 97654-3210', address: 'Rua B, 456' },
    { id: 3, name: 'Pedro Oliveira', phone: '(11) 96543-2109', address: 'Rua C, 789' },
    { id: 4, name: 'Ana Costa', phone: '(11) 95432-1098', address: 'Rua D, 321' }
];

window.salesList = [
    {
        id: 1,
        clientId: 3,
        clientName: 'Pedro Oliveira',
        date: '2024-02-20',
        dueDate: '2024-03-20',
        products: 'Troca de Pneus',
        totalValue: 320.75,
        paidValue: 0,
        remainingValue: 320.75,
        status: 'Pendente',
        payments: []
    },
    {
        id: 2,
        clientId: 2,
        clientName: 'Maria Santos',
        date: '2024-03-10',
        dueDate: '2024-04-10',
        products: 'Alinhamento e Balanceamento',
        totalValue: 180.50,
        paidValue: 0,
        remainingValue: 180.50,
        status: 'Pendente',
        payments: []
    },
    {
        id: 3,
        clientId: 1,
        clientName: 'João Silva',
        date: '2024-03-15',
        dueDate: '2024-04-15',
        products: 'Troca de Óleo',
        totalValue: 250.00,
        paidValue: 0,
        remainingValue: 250.00,
        status: 'Pendente',
        payments: []
    },
    {
        id: 4,
        clientId: 4,
        clientName: 'Ana Costa',
        date: '2024-04-01',
        dueDate: '2024-05-01',
        products: 'Revisão Completa',
        totalValue: 95.00,
        paidValue: 0,
        remainingValue: 95.00,
        status: 'Pendente',
        payments: []
    }
];

window.paymentsList = [];

// =============================================================================
// 2. FUNÇÕES HELPER (Auxiliares para evitar erros)
// =============================================================================

// Calcula a dívida total de um cliente baseado na salesList
function calculateClientDebt(clientId) {
    if (!window.salesList) return 0;
    return window.salesList
        .filter(sale => sale.clientId === parseInt(clientId) && sale.status !== 'Pago')
        .reduce((sum, sale) => sum + sale.remainingValue, 0);
}

// Garante formatação de moeda (caso não esteja no utils.js)
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Garante parser de número (caso não esteja no utils.js)
function parseMoneyToNumber(valueStr) {
    if (typeof valueStr === 'number') return valueStr;
    if (!valueStr) return 0;
    return parseFloat(valueStr.replace(/\./g, '').replace(',', '.').replace('R$', '').trim());
}

// Garante data de hoje (caso não esteja no utils.js)
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Simulação de notificação (caso não tenha biblioteca externa)
function showNotification(msg, type = 'success') {
    alert(msg); // Substitua por sua biblioteca de toast se tiver
}

// =============================================================================
// 3. FUNÇÕES DE CRUD (Adicionar Clientes, Vendas, Pagamentos)
// =============================================================================

function addNewClient(name, phone, address) {
    const newId = window.clientsList.length > 0 
    ? Math.max(...window.clientsList.map(c => c.id)) + 1 
    : 1;

    const newClient = { id: newId, name, phone, address };
    window.clientsList.push(newClient);
    return newClient;
}

function addNewSale(clientId, clientName, date, dueDate, products, totalValue) {
    const newId = window.salesList.length > 0 ? Math.max(...window.salesList.map(s => s.id)) + 1 : 1;
    const valueNumber = parseMoneyToNumber(totalValue);
    
    const newSale = {
        id: newId,
        clientId: parseInt(clientId),
        clientName, date, dueDate, products,
        totalValue: valueNumber,
        paidValue: 0,
        remainingValue: valueNumber,
        status: 'Pendente',
        payments: []
    };
    
    window.salesList.push(newSale);
    if(typeof updateDashboard === 'function') updateDashboard();
    return newSale;
}

/* Adiciona pagamento e aplica lógica FIFO */
function addNewPayment(clientId, clientName, paymentValue, paymentMethod) {
    const valueNumber = parseMoneyToNumber(paymentValue);
    
    // Validações
    if (valueNumber <= 0) {
        showNotification('Valor inválido!', 'error'); return null;
    }
    
    const pendingSales = window.salesList
        .filter(sale => sale.clientId === parseInt(clientId) && sale.status !== 'Pago')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (pendingSales.length === 0) {
        showNotification('Cliente sem débitos!', 'error'); return null;
    }
    
    const totalDebt = calculateClientDebt(clientId);
    if (valueNumber > totalDebt + 0.01) { // margem pequena para erro de arredondamento
        showNotification(`Valor excede a dívida de ${formatCurrency(totalDebt)}!`, 'error'); return null;
    }
    
    // Cria pagamento
    const newPaymentId = window.paymentsList.length > 0 ? Math.max(...window.paymentsList.map(p => p.id)) + 1 : 1;
    
    const newPayment = {
        id: newPaymentId,
        clientId: parseInt(clientId),
        clientName,
        date: getTodayDate(),
        value: valueNumber,
        method: paymentMethod,
        appliedTo: []
    };
    
    // Distribuição FIFO
    let remainingPayment = valueNumber;
    const affectedSales = [];
    
    for (const sale of pendingSales) {
        if (remainingPayment <= 0) break;
        
        const amountToApply = Math.min(remainingPayment, sale.remainingValue);
        
        sale.paidValue += amountToApply;
        sale.remainingValue -= amountToApply;
        
        if (sale.remainingValue < 0.01) { // Tratamento para ponto flutuante
             sale.remainingValue = 0; 
             sale.status = 'Pago';
        } else {
             sale.status = 'Parcial';
        }
        
        sale.payments.push({
            paymentId: newPaymentId,
            date: getTodayDate(),
            amount: amountToApply,
            method: paymentMethod
        });
        
        newPayment.appliedTo.push({
            saleId: sale.id,
            saleDescription: sale.products,
            amount: amountToApply
        });
        
        affectedSales.push({
            saleId: sale.id, description: sale.products, amount: amountToApply, status: sale.status
        });
        
        remainingPayment -= amountToApply;
    }
    
    window.paymentsList.push(newPayment);
    if(typeof updateDashboard === 'function') updateDashboard();
    
    showNotification(`Pagamento de ${formatCurrency(valueNumber)} registrado com sucesso!`);
    return newPayment;
}

// =============================================================================
// 4. ESTRUTURA E INTERFACE DOS MODAIS
// =============================================================================

function createModals() {
    createClientModal();
    createSaleModal();
    createPaymentModal();
    createReminderModal();
}

let currentPaymentClient = null;

function createClientModal() {
    const modal = document.getElementById('clientModal');
    if (!modal) return;
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-title">Cadastro de cliente</div>
            <div class="form-field nome">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="clientName" placeholder="Nome">
                <label class="form-field-label">Nome:</label>
            </div>
            <div class="form-field telefone">
                <div class="form-field-bg"></div>
                <input type="tel" class="form-field-input" id="clientPhone" placeholder="Telefone">
                <label class="form-field-label">Telefone:</label>
            </div>
            <div class="form-field endereco">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="clientAddress" placeholder="Endereço">
                <label class="form-field-label">Endereço:</label>
            </div>
            <button class="modal-btn primary" onclick="registerAndSell()">
                <span class="modal-btn-text primary">Cadastrar e vender</span>
            </button>
            <button class="modal-btn secondary" onclick="registerOnly()">
                <span class="modal-btn-text secondary">Apenas cadastrar</span>
            </button>
        </div>`;
}

function createSaleModal() {
    const modal = document.getElementById('saleModal');
    if (!modal) return;
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-title">Registro de Venda</div>
            <div class="form-field cliente-vinculado">
                <div class="form-field-bg"></div>
                <select class="form-field-select" id="linkedClient">
                    <option value="">Selecione um cliente</option>
                </select>
                <label class="form-field-label">Cliente Vinculado</label>
                <div class="dropdown-arrow"></div>
            </div>
            <div class="form-field data">
                <div class="form-field-bg"></div>
                <input type="date" class="form-field-input" id="saleDate">
                <label class="form-field-label">Data:</label>
            </div>
            <div class="form-field produtos">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="saleProducts" placeholder="Produtos">
                <label class="form-field-label">Produto / Serviço:</label>
            </div>
            <div class="form-field valor-total">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="saleValue" placeholder="0,00">
                <label class="form-field-label">Valor total:</label>
            </div>
            <div class="form-field pagamento">
                <div class="form-field-bg"></div>
                <input type="date" class="form-field-input" id="paymentDate">
                <label class="form-field-label">Vencimento:</label>
            </div>
            <button class="modal-btn primary sale-confirm" onclick="confirmSale()">
                <span class="modal-btn-text primary">CONFIRMAR</span>
            </button>
        </div>`;
}

function createPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-container payment-container" id="paymentContainer">
            <div class="payment-header">
                <div class="modal-title">Registrar Pagamento</div>
                <div class="modal-subtitle" id="paymentSubtitle">Selecione um cliente devedor.</div>
            </div>

            <div class="custom-select-wrapper">
                <div class="custom-select-trigger" onclick="togglePaymentDropdown()">
                    <span id="paymentSelectedName">Cliente Vinculado</span>
                    <div class="dropdown-arrow"></div>
                </div>
                <div class="custom-options" id="paymentClientOptions"></div>
            </div>

            <div id="paymentDetailsArea" class="payment-details hidden">
                <div class="debts-list-container" id="debtsList"></div>

                <div class="payment-footer-inputs">
                    <div class="footer-input-group">
                        <label>Valor do Pagamento</label>
                        <div class="input-box">
                            <input type="text" id="payValueInput" placeholder="0,00" oninput="applyMoneyMask && applyMoneyMask(this)">
                        </div>
                        <div class="input-helper" id="maxDebtHelper">Máximo: R$ 0,00</div>
                    </div>

                    <div class="footer-input-group">
                        <label>Data</label>
                        <div class="input-box"><input type="date" id="payDateInput"></div>
                    </div>

                    <div class="footer-input-group">
                        <label>Método</label>
                        <div class="input-box">
                            <select id="payMethodInput">
                                <option value="">Selecione</option>
                                <option value="pix">PIX</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="cartao">Cartão</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="payment-actions">
                    <button class="btn-cancel" onclick="closePaymentModal()">Cancelar</button>
                    <button class="btn-confirm" onclick="confirmPaymentUI()">Registrar</button>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// 5. LÓGICA DO DROPDOWN CUSTOMIZADO (CORRIGIDA)
// =============================================================================

function togglePaymentDropdown() {
    const options = document.getElementById('paymentClientOptions');
    const trigger = document.querySelector('.custom-select-trigger');

    if (!options) return;

    if (options.classList.contains('open')) {
        options.classList.remove('open');
        if(trigger) trigger.classList.remove('open');
    } else {
        renderCustomOptions(); 
        options.classList.add('open');
        if(trigger) trigger.classList.add('open');
    }
}

// [CORREÇÃO CRÍTICA]: Calcula dívida usando salesList, não uma prop inexistente
function renderCustomOptions() {
    const container = document.getElementById('paymentClientOptions');
    container.innerHTML = '';

    window.clientsList.forEach(client => {
        // Usa a nova função de cálculo
        const totalDebt = calculateClientDebt(client.id);
        
        // Se quiser esconder clientes sem dívida, descomente abaixo:
        // if (totalDebt <= 0) return;

        const div = document.createElement('div');
        div.className = 'custom-option';
        div.onclick = () => selectPaymentClient(client);
        
        div.innerHTML = `
            <span class="client-name">${client.name}</span>
            <div class="debt-tag">
                ${formatCurrency(totalDebt)}
            </div>
        `;
        container.appendChild(div);
    });
}

function selectPaymentClient(client) {
    currentPaymentClient = client;

    // Fecha dropdown
    const optionsEl = document.getElementById('paymentClientOptions');
    if (optionsEl) optionsEl.classList.remove('open');
    const triggerEl = document.querySelector('.custom-select-trigger');
    if (triggerEl) triggerEl.classList.remove('open');

    // Atualiza Trigger com valor calculado
    const totalDebt = calculateClientDebt(client.id);
    const wrapper = document.querySelector('.custom-select-trigger');
    
    wrapper.innerHTML = `
        <span class="trigger-label">Débitos de ${client.name}</span>
        <div class="debt-tag-large">${formatCurrency(totalDebt)}</div>
        <div class="dropdown-arrow" style="transform: translateY(-50%) rotate(-180deg);"></div>
    `;
    wrapper.onclick = togglePaymentDropdown;

    // Mostra detalhes
    const container = document.getElementById('paymentContainer');
    container.classList.add('expanded');
    document.getElementById('paymentDetailsArea').classList.remove('hidden');

    renderDebtsList(client);
    document.getElementById('maxDebtHelper').textContent = `Máximo: ${formatCurrency(totalDebt)}`;
}

// [CORREÇÃO CRÍTICA]: Busca vendas do cliente na salesList
function renderDebtsList(client) {
    const list = document.getElementById('debtsList');
    list.innerHTML = '';

    // Filtra vendas pendentes deste cliente
    const pendingSales = window.salesList
        .filter(s => s.clientId === client.id && s.status !== 'Pago')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if(pendingSales.length === 0) {
        list.innerHTML = '<div style="padding:10px; color:#666; text-align:center">Nenhuma dívida pendente.</div>';
        return;
    }

    pendingSales.forEach(sale => {
        const item = document.createElement('div');
        item.className = 'debt-item';
        
        let tagClass;
    let valueColor;

    if (sale.status === 'Pago') {
        tagClass = 'tag-paid';      // Verde
        valueColor = '#1C7B07';     // Texto Verde
    } else {
        // Tanto 'Pendente' quanto 'Parcial' caem aqui (Vermelho)
        tagClass = 'tag-pending';   // Usa a classe CSS do retângulo vermelho
        valueColor = '#C70404';     // Texto Vermelho
    }

        item.innerHTML = `
            <div class="debt-info">
                <div class="debt-title">${sale.products}</div>
                <div class="debt-dates">
                    <span>Venda: ${sale.date.split('-').reverse().join('/')}</span>
                    <span style="margin-left: 15px">Vence: ${sale.dueDate.split('-').reverse().join('/')}</span>
                </div>
            </div>
            <div class="debt-values">
                <div class="debt-value" style="color: ${valueColor}">
                    ${formatCurrency(sale.remainingValue)}
                </div>
                <div class="${tagClass}">${sale.status}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

// =============================================================================
// 6. CONTROLE GERAL DE ABERTURA/FECHAMENTO
// =============================================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const container = document.getElementById('mainContainer');
    if (modal && container) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        container.classList.add('blurred');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const container = document.getElementById('mainContainer');
    if (modal && container) {
        container.classList.remove('blurred');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 200);
    }
}

// Payment Modal Open/Close
function openPaymentModal() {
    openModal('paymentModal');
    
    // Reset estado
    currentPaymentClient = null; 
    const container = document.getElementById('paymentContainer');
    if(container) container.classList.remove('expanded');
    
    const details = document.getElementById('paymentDetailsArea');
    if(details) details.classList.add('hidden');

    const trigger = document.querySelector('.custom-select-trigger');
    if(trigger) {
        trigger.innerHTML = `
            <span id="paymentSelectedName">Cliente Vinculado</span>
            <div class="dropdown-arrow"></div>
        `;
        trigger.onclick = togglePaymentDropdown;
    }
    
    const today = getTodayDate();
    const dateInput = document.getElementById('payDateInput');
    if(dateInput) dateInput.value = today;
    
    document.getElementById('payValueInput').value = '';
    const methodInput = document.getElementById('payMethodInput');
    if(methodInput) methodInput.selectedIndex = 0;
}

function closePaymentModal() { closeModal('paymentModal'); }

// Confirmar Pagamento (Chamado pelo botão UI)
function confirmPaymentUI() {
    if (!currentPaymentClient) {
        showNotification('Selecione um cliente primeiro!', 'error'); return;
    }

    const valueInput = document.getElementById('payValueInput');
    const methodInput = document.getElementById('payMethodInput');

    const paymentValue = valueInput.value;
    const paymentMethod = methodInput.value;

    if (!paymentValue || !paymentMethod) {
        showNotification('Preencha valor e método.', 'error'); return;
    }

    // Chama a função lógica (back-end logic)
    const result = addNewPayment(currentPaymentClient.id, currentPaymentClient.name, paymentValue, paymentMethod);

    if (result) {
        closePaymentModal();
    }
}

// Client Modal
function openClientModal() {
    openModal('clientModal');
    clearClientFields();
}
function closeClientModal() { closeModal('clientModal'); }
function clearClientFields() {
    ['clientName', 'clientPhone', 'clientAddress'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

// Sale Modal
function openSaleModal() {
    openModal('saleModal');
    clearSaleFields();
    loadClients(); 
}
function closeSaleModal() { closeModal('saleModal'); }
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

// Carregar clientes no select SIMPLES (do modal de venda)
function loadClients() {
    const select = document.getElementById('linkedClient');
    if (!select) return;
    
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

// --- LÓGICA DO MODAL DE LEMBRETE (Central de Cobranças) ---

function createReminderModal() {
    const modal = document.getElementById('reminderModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-container reminder-container">
            <div class="reminder-header">
                <div class="modal-title">Enviar lembrete no Whatsapp</div>
                <div class="modal-subtitle">Envie lembretes automatizados para clientes com pagamentos pendentes</div>
            </div>
            
            <div class="reminder-main-box">
                <div id="reminderListTitle" class="reminder-list-title"></div>

                <div id="reminderListContainer" class="reminder-list-container">
                    </div>
            </div>

            <button class="modal-btn secondary" onclick="closeReminderModal()" style="margin-top: 20px; border: none; font-weight: 600;">
                Fechar
            </button>
        </div>
    `;
}

function openReminderModal() {
    const listContainer = document.getElementById('reminderListContainer');
    const titleContainer = document.getElementById('reminderListTitle');
    
    if (!listContainer || !titleContainer) return;

    listContainer.innerHTML = ''; 
    titleContainer.innerHTML = '';
    
    let overdueCount = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

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
            
            // Calc dias
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

    // 1. Atualiza o Título
    if (overdueCount > 0) {
        const plural = overdueCount > 1 ? 'Pagamentos Atrasados' : 'Pagamento Atrasado';
        titleContainer.innerHTML = `${overdueCount} ${plural}`;
        titleContainer.style.display = 'block';
    } else {
        titleContainer.style.display = 'none';
    }

    // 2. Gera os Cards
    if (overdueClients.length > 0) {
        overdueClients.forEach(item => {
            const dateParts = item.sale.dueDate.split('-');
            const dateFormatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            // [NOVO] Pega o valor formatado
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

function closeReminderModal() { closeModal('reminderModal'); }

function sendReminderToClient(id, name, phone) {
    // Lógica de envio (mantida)
    showNotification(`Abrindo WhatsApp de ${name}...`);
}