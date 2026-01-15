

// =============================================================================
// 4. CONFIGURAÇÃO DE EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Máscaras de entrada
    const phoneInputs = document.querySelectorAll('[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (typeof applyPhoneMask === 'function') {
                applyPhoneMask(this);
            }
        });
    });

    // Máscaras monetárias
    const moneyInputs = document.querySelectorAll('[data-mask="money"], .form-field-input[id*="Value"], .form-field-input[id*="value"]');
    moneyInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (typeof applyMoneyMask === 'function') {
                applyMoneyMask(this);
            }
        });
    });

    // Fechar modal ao clicar no overlay
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalId = this.id;
                closeModal(modalId);
            }
        });
    });
}
