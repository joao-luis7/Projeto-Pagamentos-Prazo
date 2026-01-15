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