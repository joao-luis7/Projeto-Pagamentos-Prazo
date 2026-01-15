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