// utils.js - Funções utilitárias

// Notificações
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.remove('show', 'error');
        
        if (type === 'error') {
            notification.classList.add('error');
        }
        
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }
}

// Máscara de telefone
function applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    input.value = value;
}

// Máscara de valor monetário
function applyMoneyMask(input) {
    let value = input.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2) + '';
    value = value.replace(".", ",");
    value = value.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    value = value.replace(/(\d)(\d{3}),/g, "$1.$2,");
    input.value = value;
}

// Data atual
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/*Converte string formatada "320,75" para número 320.75 */
function parseMoneyToNumber(moneyString) {
    if (!moneyString) return 0;
    
    // Remove "R$", espaços e pontos de milhar
    const cleaned = moneyString
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '');
    
    // Converte vírgula decimal para ponto
    const normalized = cleaned.replace(',', '.');
    
    return parseFloat(normalized) || 0;
}

/* Converte número 320.75 para string formatada "320,75" */
function formatNumberToMoney(number) {
    if (typeof number !== 'number') return '0,00';
    
    return number
        .toFixed(2)
        .replace('.', ',')
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

/* Formata valor com prefixo R$ */
function formatCurrency(number) {
    return `R$ ${formatNumberToMoney(number)}`;
}

 /* Calcula dívida total de um cliente somando vendas pendentes */
function calculateClientDebt(clientId) {
    if (!window.salesList) return 0;
    
    return window.salesList
        .filter(sale => sale.clientId === clientId && sale.status !== 'Pago')
        .reduce((total, sale) => total + sale.remainingValue, 0);
}

 /* Atualiza os cards do dashboard com dados reais */
function updateDashboard() {
    if (!window.salesList || !window.clientsList) return;
    
    // Total a receber (soma de todas as vendas pendentes)
    const totalReceivable = window.salesList
        .filter(sale => sale.status !== 'Pago')
        .reduce((sum, sale) => sum + sale.remainingValue, 0);
    
    // Vendas pendentes (não pagas completamente)
    const pendingSales = window.salesList.filter(sale => sale.status !== 'Pago').length;
    
    // Total de vendas
    const totalSales = window.salesList.length;
    
    // Clientes ativos
    const activeClients = window.clientsList.length;
    
    // Atualizar DOM
    const cards = document.querySelectorAll('.dashboard-card');
    if (cards[0]) cards[0].querySelector('.card-valor').textContent = formatCurrency(totalReceivable);
    if (cards[1]) cards[1].querySelector('.card-valor').textContent = pendingSales;
    if (cards[2]) cards[2].querySelector('.card-valor').textContent = totalSales;
    if (cards[3]) cards[3].querySelector('.card-valor').textContent = activeClients;
}