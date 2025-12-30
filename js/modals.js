// js/modals.js - Gerenciamento de modais e dados

// 1. LISTA GLOBAL DE CLIENTES (Simulando Banco de Dados)
// Colocamos aqui para ser acessível por todo o sistema
let clientsList = [
    { 
        id: 1, 
        name: 'João Silva', 
        debts: [
            { id: 101, description: 'Troca de Óleo', date: '10/02/2024', due: '10/03/2024', value: 150.00, status: 'pendente' },
            { id: 102, description: 'Alinhamento', date: '15/01/2024', due: '15/02/2024', value: 100.00, status: 'pago' }
        ]
    },
    { 
        id: 2, 
        name: 'Maria Santos', 
        debts: [
            { id: 201, description: 'Revisão Geral', date: '05/02/2024', due: '05/03/2024', value: 180.50, status: 'pendente' }
        ]
    },
    { 
        id: 3, 
        name: 'Pedro Oliveira', 
        debts: [
            { id: 301, description: 'Troca de Pneus', date: '20/02/2024', due: '20/03/2024', value: 320.75, status: 'pendente' }
        ]
    },
    { 
        id: 4, 
        name: 'Ana Costa', 
        debts: [] // Sem dívidas
    }
];

// --- FUNÇÃO PARA ADICIONAR NOVO CLIENTE ---
function addNewClient(name, phone, address) {
    const newId = clientsList.length + 1;
    const newClient = {
        id: newId,
        name: name,
        phone: phone,
        address: address,
        debt: '[]'
    };

    clientsList.push(newClient);
    return newClient;
}
// Helpers para cálculo de totais
function getClientTotalDebt(client) {
    return client.debts
        .filter(d => d.status === 'pendente')
        .reduce((acc, curr) => acc + curr.value, 0)
        .toFixed(2).replace('.', ',');
}

// Criar estrutura dos modais dinamicamente
function createModals() {
    createClientModal();
    createSaleModal();
    createPaymentModal();
}
// Variável global para armazenar o cliente selecionado no modal de pagamento
let currentPaymentClient = null;

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

    // Estrutura atualizada conforme Figma
    modal.innerHTML = `
        <div class="modal-container payment-container" id="paymentContainer">
            <div class="payment-header">
                <div class="modal-title">Registrar Pagamento</div>
                <div class="modal-subtitle" id="paymentSubtitle">Selecione um cliente devedor e registre o pagamento.</div>
            </div>

            <div class="custom-select-wrapper">
                <div class="custom-select-trigger" onclick="togglePaymentDropdown()">
                    <span id="paymentSelectedName">Cliente Vinculado</span>
                    <div class="dropdown-arrow"></div>
                </div>
                
                <div class="custom-options" id="paymentClientOptions">
                    </div>
            </div>

            <div id="paymentDetailsArea" class="payment-details hidden">
                
                <div class="debts-list-container" id="debtsList">
                    </div>

                <div class="payment-footer-inputs">
                    <div class="footer-input-group">
                        <label>Valor do Pagamento</label>
                        <div class="input-box">
                            <input type="text" id="payValueInput" placeholder="0,00" oninput="applyMoneyMask(this)">
                        </div>
                        <div class="input-helper" id="maxDebtHelper">Máximo: R$ 0,00</div>
                    </div>

                    <div class="footer-input-group">
                        <label>Data do Pagamento</label>
                        <div class="input-box">
                            <input type="date" id="payDateInput">
                        </div>
                    </div>

                    <div class="footer-input-group">
                        <label>Método do Pagamento</label>
                        <div class="input-box">
                            <select id="payMethodInput">
                                <option value="">Selecione o método</option>
                                <option value="pix">PIX</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="cartao">Cartão</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="payment-actions">
                    <button class="btn-cancel" onclick="closePaymentModal()">
                        <span>Cancelar</span>
                    </button>
                    <button class="btn-confirm" onclick="confirmPayment()">
                        <span>Registrar Pagamento</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- LÓGICA DO DROPDOWN CUSTOMIZADO ---
function togglePaymentDropdown() {
    const options = document.getElementById('paymentClientOptions');
    const trigger = document.querySelector('.custom-select-trigger');
    const arrow = document.querySelector('.custom-select-trigger .dropdown-arrow');

    if (!options) return;

    if (options.classList.contains('open')) {
        // fecha com animação
        options.classList.remove('open');
        trigger && trigger.classList.remove('open');
    } else {
        renderCustomOptions(); // Recarrega lista
        options.classList.add('open');
        trigger && trigger.classList.add('open');
    }
}

function renderCustomOptions() {
    const container = document.getElementById('paymentClientOptions');
    container.innerHTML = '';

    clientsList.forEach(client => {
        const totalDebt = getClientTotalDebt(client);
        
        // Se não tiver dívida, talvez nem mostre, ou mostre zerado.
        // Vou mostrar todos conforme o design
        
        const div = document.createElement('div');
        div.className = 'custom-option';
        div.onclick = () => selectPaymentClient(client);
        
        div.innerHTML = `
            <span class="client-name">${client.name}</span>
            <div class="debt-tag">
                R$ ${totalDebt}
            </div>
        `;
        container.appendChild(div);
    });
}

function selectPaymentClient(client) {
    // 1. SALVAR O CLIENTE NA VARIÁVEL GLOBAL
    currentPaymentClient = client;

    // 2. Fecha o dropdown
    const optionsEl = document.getElementById('paymentClientOptions');
    if (optionsEl) optionsEl.classList.remove('open');
    const triggerEl = document.querySelector('.custom-select-trigger');
    if (triggerEl) triggerEl.classList.remove('open');

    // 3. Atualiza o visual do Trigger (Campo de seleção)
    const totalDebt = getClientTotalDebt(client);
    const wrapper = document.querySelector('.custom-select-trigger');
    
    // Recria o HTML do trigger selecionado
    wrapper.innerHTML = `
        <span class="trigger-label">Débitos de ${client.name}</span>
        <div class="debt-tag-large">R$ ${totalDebt}</div>
        <div class="dropdown-arrow" style="transform: translateY(-50%) rotate(-180deg);"></div>
    `;
    wrapper.onclick = togglePaymentDropdown; // Reatribui o clique

    // 4. Expande o Modal e Mostra Detalhes
    const container = document.getElementById('paymentContainer');
    container.classList.add('expanded');

    const details = document.getElementById('paymentDetailsArea');
    details.classList.remove('hidden');

    // 5. Renderiza a lista e atualiza o helper
    renderDebtsList(client);
    document.getElementById('maxDebtHelper').textContent = `Máximo: R$ ${totalDebt}`;
}

function renderDebtsList(client) {
    const list = document.getElementById('debtsList');
    list.innerHTML = '';

    client.debts.forEach(debt => {
        const item = document.createElement('div');
        item.className = 'debt-item';
        
        // Define cor da tag baseada no status
        const tagClass = debt.status === 'pendente' ? 'tag-pending' : 'tag-paid';
        const tagText = debt.status === 'pendente' ? 'Pendente' : 'Pago';
        const valueColor = debt.status === 'pendente' ? '#C70404' : '#1C7B07'; // Vermelho ou Verde

        item.innerHTML = `
            <div class="debt-info">
                <div class="debt-title">${debt.description}</div>
                <div class="debt-dates">
                    <span>Venda: ${debt.date}</span>
                    <span style="margin-left: 15px">Vencimento em ${debt.due}</span>
                </div>
            </div>
            <div class="debt-values">
                <div class="debt-value" style="color: ${valueColor}">R$ ${debt.value.toFixed(2).replace('.', ',')}</div>
                <div class="${tagClass}">${tagText}</div>
            </div>
        `;
        list.appendChild(item);
    });
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

function openPaymentModal() {
    openModal('paymentModal');
    
    // Limpa seleção anterior
    currentPaymentClient = null; 
    
    // ... restante do código de reset (container.classList.remove('expanded'), etc)
    const container = document.getElementById('paymentContainer');
    if(container) container.classList.remove('expanded');
    
    const details = document.getElementById('paymentDetailsArea');
    if(details) details.classList.add('hidden');

    const trigger = document.querySelector('.custom-select-trigger');
    if(trigger) {
        trigger.innerHTML = `
            <span id="paymentSelectedName">Cliente Vinculado</span>
            <div class="dropdown-arrow"></div>
        `;
        trigger.onclick = togglePaymentDropdown;
    }
    
    // Data de hoje
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('payDateInput');
    if(dateInput) dateInput.value = today;
    
    // Limpa inputs
    document.getElementById('payValueInput').value = '';
    document.getElementById('payMethodInput').selectedIndex = 0;
}

function closePaymentModal() {
    closeModal('paymentModal');
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

function confirmPayment() {
    // 1. Verifica se tem cliente selecionado
    if (!currentPaymentClient) {
        showNotification('Selecione um cliente primeiro!', 'error');
        return;
    }

    // 2. Pega os valores dos NOVOS inputs
    const valueInput = document.getElementById('payValueInput');
    const dateInput = document.getElementById('payDateInput');
    const methodInput = document.getElementById('payMethodInput');

    const paymentValueStr = valueInput.value; // Ex: "100,00"
    const paymentDate = dateInput.value;
    const paymentMethod = methodInput.value;

    // 3. Validação Básica
    if (!paymentValueStr || !paymentDate || !paymentMethod) {
        showNotification('Preencha todos os campos do pagamento.', 'error');
        return;
    }

    // Converter valor para número (R$ 100,00 -> 100.00)
    const paymentValue = parseFloat(paymentValueStr.replace(/\./g, '').replace(',', '.'));

    if (isNaN(paymentValue) || paymentValue <= 0) {
        showNotification('Digite um valor válido.', 'error');
        return;
    }

    // 4. LÓGICA DE BAIXA (SIMPLIFICADA)
    // Aqui vamos "fingir" que pagou, atualizando o status das dívidas do cliente
    // Na vida real, você enviaria isso para um backend.
    
    let remainingPayment = paymentValue;
    let billsPaid = 0;

    // Percorre as dívidas pendentes e vai pagando
    currentPaymentClient.debts.forEach(debt => {
        if (debt.status === 'pendente' && remainingPayment > 0) {
            if (remainingPayment >= debt.value) {
                // Paga a conta inteira
                debt.status = 'pago';
                remainingPayment -= debt.value;
                billsPaid++;
            } else {
                // Pagamento parcial (opcional: criar lógica de saldo restante)
                // Por enquanto, vamos apenas avisar
                console.log(`Pagamento parcial na conta ${debt.description}`);
            }
        }
    });

    // 5. Feedback e Fechamento
    console.log('Pagamento Salvo:', {
        cliente: currentPaymentClient.name,
        valor: paymentValue,
        data: paymentDate,
        metodo: paymentMethod
    });

    showNotification(`Pagamento de R$ ${paymentValueStr} registrado com sucesso!`);
    
    // Fecha o modal
    closePaymentModal();
    
    // Opcional: Recarregar a lista se o modal for reaberto
    // (A variável currentPaymentClient será limpa no openPaymentModal)
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