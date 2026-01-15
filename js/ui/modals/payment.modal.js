function createPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-container payment-container" id="paymentContainer">
            <div class="payment-header">
                <div class="modal-title">Registrar Pagamento</div>
                <div class="modal-subtitle" id="paymentSubtitle">Selecione um cliente devedor.</div>
            </div>

            <div class="custom-select-wrapper">
                <div class="custom-select-trigger" onclick="togglePaymentDropdown()">
                    <span id="paymentSelectedName">Cliente Vinculado</span>
                    <div class="dropdown-arrow"></div>
                </div>
                <div class="custom-options" id="paymentClientOptions"></div>
            </div>

            <div id="paymentDetailsArea" class="payment-details hidden">
                <div class="debts-list-container" id="debtsList"></div>

                <div class="payment-footer-inputs">
                    <div class="footer-input-group">
                        <label>Valor do Pagamento</label>
                        <div class="input-box">
                            <input type="text" id="payValueInput" placeholder="0,00" oninput="applyMoneyMask && applyMoneyMask(this)">
                        </div>
                        <div class="input-helper" id="maxDebtHelper">Máximo: R$ 0,00</div>
                    </div>

                    <div class="footer-input-group">
                        <label>Data</label>
                        <div class="input-box"><input type="date" id="payDateInput"></div>
                    </div>

                    <div class="footer-input-group">
                        <label>Método</label>
                        <div class="input-box">
                            <select id="payMethodInput">
                                <option value="">Selecione</option>
                                <option value="pix">PIX</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="cartao">Cartão</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="payment-actions">
                    <button class="btn-cancel" onclick="closePaymentModal()">Cancelar</button>
                    <button class="btn-confirm" onclick="confirmPaymentUI()">Registrar</button>
                </div>
            </div>
        </div>
    `;
}

function togglePaymentDropdown() {
    const options = document.getElementById('paymentClientOptions');
    const trigger = document.querySelector('.custom-select-trigger');

    if (!options) return;

    if (options.classList.contains('open')) {
        options.classList.remove('open');
        if(trigger) trigger.classList.remove('open');
    } else {
        renderCustomOptions(); 
        options.classList.add('open');
        if(trigger) trigger.classList.add('open');
    }
}

// [CORREÇÃO CRÍTICA]: Calcula dívida usando salesList, não uma prop inexistente
function renderCustomOptions() {
    const container = document.getElementById('paymentClientOptions');
    container.innerHTML = '';

    window.clientsList.forEach(client => {
        // Usa a nova função de cálculo
        const totalDebt = calculateClientDebt(client.id);
        
        // Se quiser esconder clientes sem dívida, descomente abaixo:
        // if (totalDebt <= 0) return;

        const div = document.createElement('div');
        div.className = 'custom-option';
        div.onclick = () => selectPaymentClient(client);
        
        div.innerHTML = `
            <span class="client-name">${client.name}</span>
            <div class="debt-tag">
                ${formatCurrency(totalDebt)}
            </div>
        `;
        container.appendChild(div);
    });
}

function selectPaymentClient(client) {
    window.currentPaymentClient = client;

    // Fecha dropdown
    const optionsEl = document.getElementById('paymentClientOptions');
    if (optionsEl) optionsEl.classList.remove('open');
    const triggerEl = document.querySelector('.custom-select-trigger');
    if (triggerEl) triggerEl.classList.remove('open');

    // Atualiza Trigger com valor calculado
    const totalDebt = calculateClientDebt(client.id);
    const wrapper = document.querySelector('.custom-select-trigger');
    
    wrapper.innerHTML = `
        <span class="trigger-label">Débitos de ${client.name}</span>
        <div class="debt-tag-large">${formatCurrency(totalDebt)}</div>
        <div class="dropdown-arrow" style="transform: translateY(-50%) rotate(-180deg);"></div>
    `;
    wrapper.onclick = togglePaymentDropdown;

    // Mostra detalhes
    const container = document.getElementById('paymentContainer');
    container.classList.add('expanded');
    document.getElementById('paymentDetailsArea').classList.remove('hidden');

    renderDebtsList(client);
    document.getElementById('maxDebtHelper').textContent = `Máximo: ${formatCurrency(totalDebt)}`;
}

// [CORREÇÃO CRÍTICA]: Busca vendas do cliente na salesList
function renderDebtsList(client) {
    const list = document.getElementById('debtsList');
    list.innerHTML = '';

    // Filtra vendas pendentes deste cliente
    const pendingSales = window.salesList
        .filter(s => s.clientId === client.id && s.status !== 'Pago')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if(pendingSales.length === 0) {
        list.innerHTML = '<div style="padding:10px; color:#666; text-align:center">Nenhuma dívida pendente.</div>';
        return;
    }

    pendingSales.forEach(sale => {
        const item = document.createElement('div');
        item.className = 'debt-item';
        
        let tagClass;
    let valueColor;

    if (sale.status === 'Pago') {
        tagClass = 'tag-paid';      // Verde
        valueColor = '#1C7B07';     // Texto Verde
    } else {
        // Tanto 'Pendente' quanto 'Parcial' caem aqui (Vermelho)
        tagClass = 'tag-pending';   // Usa a classe CSS do retângulo vermelho
        valueColor = '#C70404';     // Texto Vermelho
    }

        item.innerHTML = `
            <div class="debt-info">
                <div class="debt-title">${sale.products}</div>
                <div class="debt-dates">
                    <span>Venda: ${sale.date.split('-').reverse().join('/')}</span>
                    <span style="margin-left: 15px">Vence: ${sale.dueDate.split('-').reverse().join('/')}</span>
                </div>
            </div>
            <div class="debt-values">
                <div class="debt-value" style="color: ${valueColor}">
                    ${formatCurrency(sale.remainingValue)}
                </div>
                <div class="${tagClass}">${sale.status}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

// Confirmar Pagamento (Chamado pelo botão UI)
function confirmPaymentUI() {
    if (!window.currentPaymentClient) {
        showNotification('Selecione um cliente primeiro!', 'error');
        return;
    }

    const valueInput = document.getElementById('payValueInput');
    const methodInput = document.getElementById('payMethodInput');

    const paymentValue = valueInput.value;
    const paymentMethod = methodInput.value;

    if (!paymentValue || !paymentMethod) {
        showNotification('Preencha valor e método.', 'error');
        return;
    }

    // Chama a função lógica (back-end logic)
    const result = addNewPayment(window.currentPaymentClient.id, window.currentPaymentClient.name, paymentValue, paymentMethod);

    if (result) {
        closePaymentModal();
    }
}

function openPaymentModal() {
    openModal('paymentModal');
    
    // Reset estado
    window.currentPaymentClient = null;
    const container = document.getElementById('paymentContainer');
    if (container) container.classList.remove('expanded');
    
    const details = document.getElementById('paymentDetailsArea');
    if (details) details.classList.add('hidden');

    const trigger = document.querySelector('.custom-select-trigger');
    if (trigger) {
        trigger.innerHTML = `
            <span id="paymentSelectedName">Cliente Vinculado</span>
            <div class="dropdown-arrow"></div>
        `;
        trigger.onclick = togglePaymentDropdown;
    }
    
    const today = getTodayDate();
    const dateInput = document.getElementById('payDateInput');
    if (dateInput) dateInput.value = today;
    
    const valueInput = document.getElementById('payValueInput');
    if (valueInput) valueInput.value = '';
    
    const methodInput = document.getElementById('payMethodInput');
    if (methodInput) methodInput.selectedIndex = 0;
}

function closePaymentModal() {
    closeModal('paymentModal');
}