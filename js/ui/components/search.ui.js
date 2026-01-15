function performSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value) {
        showNotification('Busca por: ' + searchInput.value);
    }
}
