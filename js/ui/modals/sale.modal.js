function createSaleModal() {
    const modal = document.getElementById('saleModal');
    if (!modal) return;
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-title">Registro de Venda</div>
            <div class="form-field cliente-vinculado">
                <div class="form-field-bg"></div>
                <select class="form-field-select" id="linkedClient">
                    <option value="">Selecione um cliente</option>
                </select>
                <label class="form-field-label">Cliente Vinculado</label>
                <div class="dropdown-arrow"></div>
            </div>
            <div class="form-field data">
                <div class="form-field-bg"></div>
                <input type="date" class="form-field-input" id="saleDate">
                <label class="form-field-label">Data:</label>
            </div>
            <div class="form-field produtos">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="saleProducts" placeholder="Produtos">
                <label class="form-field-label">Produto / Serviço:</label>
            </div>
            <div class="form-field valor-total">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="saleValue" placeholder="0,00">
                <label class="form-field-label">Valor total:</label>
            </div>
            <div class="form-field pagamento">
                <div class="form-field-bg"></div>
                <input type="date" class="form-field-input" id="paymentDate">
                <label class="form-field-label">Vencimento:</label>
            </div>
            <button class="modal-btn primary sale-confirm" onclick="confirmSale()">
                <span class="modal-btn-text primary">CONFIRMAR</span>
            </button>
        </div>`;
}

function openSaleModal() {
    openModal('saleModal');
    clearSaleFields();
    loadClients(); 
}
function closeSaleModal() { closeModal('saleModal'); }
function clearSaleFields() {
    const linkedClient = document.getElementById('linkedClient');
    const saleProducts = document.getElementById('saleProducts');
    const saleValue = document.getElementById('saleValue');
    if (linkedClient) linkedClient.selectedIndex = 0;
    if (saleProducts) saleProducts.value = '';
    if (saleValue) saleValue.value = '';
    
    const today = getTodayDate();
    const saleDate = document.getElementById('saleDate');
    const paymentDate = document.getElementById('paymentDate');
    if (saleDate) saleDate.value = today;
    if (paymentDate) paymentDate.value = today;
}

// Carregar clientes no select SIMPLES (do modal de venda)
function loadClients() {
    const select = document.getElementById('linkedClient');
    if (!select) return;
    
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    window.clientsList.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}