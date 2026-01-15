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
