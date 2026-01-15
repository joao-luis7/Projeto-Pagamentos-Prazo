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
