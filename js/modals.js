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
// 4. INICIALIZAÇÃO DOS MODAIS (Coordenador)
// =============================================================================

// Função que coordena o carregamento de todos os modais
function createModals() {
    createClientModal();
    createSaleModal();
    createPaymentModal();
    createReminderModal();
}

// Variável global para rastrear cliente selecionado no modal de pagamento
let currentPaymentClient = null;

// =============================================================================
// 5. LÓGICA DO DROPDOWN CUSTOMIZADO
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
// 6. CONTROLE DE MODAIS (Gerenciado em app.utils.js)
// =============================================================================
// Todas as funções de abertura/fechamento de modais foram movidas para app.utils.js
// para manter a arquitetura modularizada

// Funções de confirmação específicas mantidas aqui:

// Confirmar Pagamento (Chamado pelo botão UI)
function confirmPaymentUI() {
    if (!window.currentPaymentClient) {
        showNotification('Selecione um cliente primeiro!', 'error');
        return;
    }

    const valueInput = document.getElementById('payValueInput');
    const methodInput = document.getElementById('payMethodInput');

    const paymentValue = valueInput.value;
    const paymentMethod = methodInput.value;

    if (!paymentValue || !paymentMethod) {
        showNotification('Preencha valor e método.', 'error');
        return;
    }

    // Chama a função lógica (back-end logic)
    const result = addNewPayment(window.currentPaymentClient.id, window.currentPaymentClient.name, paymentValue, paymentMethod);

    if (result) {
        closePaymentModal();
    }
}