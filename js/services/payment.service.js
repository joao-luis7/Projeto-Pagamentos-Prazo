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