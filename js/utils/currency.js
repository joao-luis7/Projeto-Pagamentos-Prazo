/* Formata valor com prefixo R$ */
function formatCurrency(number) {
    return `R$ ${formatNumberToMoney(number)}`;
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

// Máscara de valor monetário
function applyMoneyMask(input) {
    let value = input.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2) + '';
    value = value.replace(".", ",");
    value = value.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    value = value.replace(/(\d)(\d{3}),/g, "$1.$2,");
    input.value = value;
}