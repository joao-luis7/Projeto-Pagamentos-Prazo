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
