// js/modals.js - Gerenciamento de modais e dados

// 1. LISTA GLOBAL DE CLIENTES (Simulando Banco de Dados)
// Colocamos aqui para ser acessível por todo o sistema
let clientsList = [
    { id: 1, name: 'João Silva', debt: '250,00' },
    { id: 2, name: 'Maria Santos', debt: '180,50' },
    { id: 3, name: 'Pedro Oliveira', debt: '320,75' },
    { id: 4, name: 'Ana Costa', debt: '95,00' }
];

// --- FUNÇÃO PARA ADICIONAR NOVO CLIENTE ---
function addNewClient(name, phone, address) {
    const newId = clientsList.length + 1;
    const newClient = {
        id: newId,
        name: name,
        phone: phone,
        address: address,
        debt: '0,00'
    };
    
    clientsList.push(newClient);
    return newClient;
}

// Criar estrutura dos modais dinamicamente
function createModals() {
    createClientModal();
    createSaleModal();
    createPaymentModal();
}

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
                <div class="modal-btn-icon"></div>
                <span class="modal-btn-text primary">Cadastrar cliente e registrar uma nova venda</span>
            </button>
            
            <button class="modal-btn secondary" onclick="registerOnly()">
                <span class="modal-btn-text secondary">Apenas cadastrar cliente</span>
            </button>
        </div>
    `;
}

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
                <div class="form-field-note">(Apenas clientes no banco de dados)</div>
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
                <label class="form-field-label">Quando será o pagamento:</label>
            </div>
            <button class="modal-btn primary sale-confirm" onclick="confirmSale()">
                <span class="modal-btn-text primary">CONFIRMAR</span>
            </button>
        </div>
    `;
}

function createPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-title">Registrar Pagamento</div>
            
            <div class="form-field cliente-vinculado expanded">
                <div class="form-field-bg expanded"></div>
                <select class="form-field-select" id="paymentLinkedClient" onchange="updateDebtAmount(this)">
                    <option value="">Selecione um cliente</option>
                </select>
                <label class="form-field-label payment-client">Cliente Vinculado</label>
                <div class="debt-info" id="debtInfo">O valor da conta está em R$ 0,00</div>
                <div class="dropdown-arrow"></div>
            </div>
            
            <div class="form-field valor-pago">
                <div class="form-field-bg"></div>
                <input type="text" class="form-field-input" id="paymentValue" placeholder="0,00">
                <label class="form-field-label">Valor a ser pago:</label>
            </div>
            
            <div class="form-field forma-pagamento">
                <div class="form-field-bg"></div>
                <select class="form-field-select" id="paymentMethod">
                    <option value="">Selecione a forma de pagamento</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                </select>
                <label class="form-field-label">Forma de pagamento:</label>
                <div class="dropdown-arrow"></div>
            </div>
            
            <button class="modal-btn primary payment-confirm" onclick="confirmPayment()">
                <span class="modal-btn-text primary">CONFIRMAR</span>
            </button>
        </div>
    `;
}

// --- CONTROLE DOS MODAIS ---

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const container = document.getElementById('mainContainer');
    
    if (modal && container) {
        modal.style.display = 'flex'; // Importante para centralizar
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

// Modal de cliente
function openClientModal() {
    openModal('clientModal');
    clearClientFields();
}

function closeClientModal() {
    closeModal('clientModal');
}

function clearClientFields() {
    ['clientName', 'clientPhone', 'clientAddress'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

// Modal de venda
function openSaleModal() {
    openModal('saleModal');
    clearSaleFields();
    loadClients(); // Atualiza a lista antes de abrir
}

function closeSaleModal() {
    closeModal('saleModal');
}

function clearSaleFields() {
    const linkedClient = document.getElementById('linkedClient');
    const saleProducts = document.getElementById('saleProducts');
    const saleValue = document.getElementById('saleValue');
    
    if (linkedClient) linkedClient.selectedIndex = 0;
    if (saleProducts) saleProducts.value = '';
    if (saleValue) saleValue.value = '';
    
    // Data de hoje
    const today = new Date().toISOString().split('T')[0];
    const saleDate = document.getElementById('saleDate');
    const paymentDate = document.getElementById('paymentDate');
    
    if (saleDate) saleDate.value = today;
    if (paymentDate) paymentDate.value = today;
}

// Modal de pagamento
function openPaymentModal() {
    openModal('paymentModal');
    clearPaymentFields();
    loadClients(); // Atualiza a lista antes de abrir
}

function closePaymentModal() {
    closeModal('paymentModal');
}

function clearPaymentFields() {
    const linkedClient = document.getElementById('paymentLinkedClient');
    const paymentValue = document.getElementById('paymentValue');
    const paymentMethod = document.getElementById('paymentMethod');
    const debtInfo = document.getElementById('debtInfo');
    
    if (linkedClient) {
        linkedClient.value = '';
        linkedClient.selectedIndex = 0;
    }
    if (paymentValue) paymentValue.value = '';
    if (paymentMethod) paymentMethod.selectedIndex = 0;
    if (debtInfo) debtInfo.textContent = 'O valor da conta está em R$ 0,00';
}

function updateDebtAmount(select) {
    const selectedOption = select.options[select.selectedIndex];
    const debtInfo = document.getElementById('debtInfo');
    
    if (selectedOption && selectedOption.dataset.debt && debtInfo) {
        debtInfo.textContent = `O valor da conta está em R$ ${selectedOption.dataset.debt}`;
    } else if (debtInfo) {
        debtInfo.textContent = 'O valor da conta está em R$ 0,00';
    }
}

// Carregar clientes nos Selects
function loadClients() {
    const select = document.getElementById('linkedClient');
    const paymentSelect = document.getElementById('paymentLinkedClient');
    
    const populate = (element) => {
        if (!element) return;
        // Limpa tudo menos a primeira opção (placeholder)
        while (element.children.length > 1) {
            element.removeChild(element.lastChild);
        }
        
        // Adiciona os clientes da lista global
        clientsList.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            if (client.debt) option.dataset.debt = client.debt;
            element.appendChild(option);
        });
    };

    populate(select);
    populate(paymentSelect);
}