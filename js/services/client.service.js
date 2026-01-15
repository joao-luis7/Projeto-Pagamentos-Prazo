 /* Calcula dívida total de um cliente somando vendas pendentes */
function calculateClientDebt(clientId) {
    if (!window.salesList) return 0;
    
    return window.salesList
        .filter(sale => sale.clientId === clientId && sale.status !== 'Pago')
        .reduce((total, sale) => total + sale.remainingValue, 0);
}