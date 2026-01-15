function createClientModal() {
    const modal = document.getElementById('clientModal');
    if (!modal) return;
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-title">Cadastro de cliente</div>
            <div class="form-field nome">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="clientName" placeholder="Nome">
                <label class="form-field-label">Nome:</label>
            </div>
            <div class="form-field telefone">
                <div class="form-field-bg"></div>
                <input type="tel" class="form-field-input" id="clientPhone" placeholder="Telefone">
                <label class="form-field-label">Telefone:</label>
            </div>
            <div class="form-field endereco">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="clientAddress" placeholder="Endereço">
                <label class="form-field-label">Endereço:</label>
            </div>
            <button class="modal-btn primary" onclick="registerAndSell()">
                <span class="modal-btn-text primary">Cadastrar e vender</span>
            </button>
            <button class="modal-btn secondary" onclick="registerOnly()">
                <span class="modal-btn-text secondary">Apenas cadastrar</span>
            </button>
        </div>`;
}