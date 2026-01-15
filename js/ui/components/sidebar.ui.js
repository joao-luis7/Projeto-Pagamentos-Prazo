function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
    if (overlay) {
        overlay.classList.toggle('show');
    }
}

function handleMenuClick(menuItem) {
    if (menuItem === 'Registrar Pagamento') {
        openPaymentModal();
    } else if (menuItem === 'Lembretes') {
        openReminderModal();
    }
    
    // Fecha sidebar em dispositivos móveis
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('show')) {
        toggleSidebar();
    }
}

function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona ao clicado
            this.classList.add('active');
        });
    });
}