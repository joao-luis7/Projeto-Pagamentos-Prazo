function createReminderModal() {
    const modal = document.getElementById('reminderModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-container reminder-container">
            <div class="reminder-header">
                <div class="modal-title">Enviar lembrete no Whatsapp</div>
                <div class="modal-subtitle">Envie lembretes automatizados para clientes com pagamentos pendentes</div>
            </div>
            
            <div class="reminder-main-box">
                <div id="reminderListTitle" class="reminder-list-title"></div>

                <div id="reminderListContainer" class="reminder-list-container">
                    </div>
            </div>

            <button class="modal-btn secondary" onclick="closeReminderModal()" style="margin-top: 20px; border: none; font-weight: 600;">
                Fechar
            </button>
        </div>
    `;
}

function openReminderModal() {
    const listContainer = document.getElementById('reminderListContainer');
    const titleContainer = document.getElementById('reminderListTitle');
    
    if (!listContainer || !titleContainer) return;

    listContainer.innerHTML = ''; 
    titleContainer.innerHTML = '';
    
    let overdueCount = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    let overdueClients = [];

    window.clientsList.forEach(client => {
        const clientSales = window.salesList.filter(s => s.clientId === client.id && s.status !== 'Pago');
        
        // Filtra vencidos
        const overdueSales = clientSales.filter(sale => {
            const parts = sale.dueDate.split('-'); 
            const due = new Date(parts[0], parts[1] - 1, parts[2]);
            return due < today;
        });

        if (overdueSales.length > 0) {
            overdueCount += overdueSales.length;
            
            // Pega o mais antigo
            overdueSales.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            const oldest = overdueSales[0];
            
            // Calc dias
            const parts = oldest.dueDate.split('-');
            const dueObj = new Date(parts[0], parts[1] - 1, parts[2]);
            const diffDays = Math.ceil(Math.abs(today - dueObj) / (1000 * 60 * 60 * 24));
            
            overdueClients.push({
                client,
                sale: oldest,
                days: diffDays,
                count: overdueSales.length
            });
        }
    });

    overdueClients.sort((a, b) => b.days - a.days);

    // 1. Atualiza o Título
    if (overdueCount > 0) {
        const plural = overdueCount > 1 ? 'Pagamentos Atrasados' : 'Pagamento Atrasado';
        titleContainer.innerHTML = `${overdueCount} ${plural}`;
        titleContainer.style.display = 'block';
    } else {
        titleContainer.style.display = 'none';
    }

    // 2. Gera os Cards
    if (overdueClients.length > 0) {
        overdueClients.forEach(item => {
            const dateParts = item.sale.dueDate.split('-');
            const dateFormatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            // [NOVO] Pega o valor formatado
            const debtValue = formatCurrency(item.sale.remainingValue);

            const cardHTML = `
                <div class="reminder-item-wrapper">
                    <div class="reminder-floating-badge">
                        ${item.days} Dias de Atraso
                    </div>
                    
                    <div class="reminder-gray-card">
                        <div class="reminder-info-left">
                            <div class="client-name-bold">${item.client.name}</div>
                            
                            <div class="client-details-row" style="gap: 20px;">
                                <span style="font-weight: 500; color: #000;">${item.sale.products}</span>
                                
                                <span style="font-weight: 700; color: #AF1E1E;">${debtValue}</span>
                                
                                <span style="color: #444;">Vencimento: ${dateFormatted}</span>
                            </div>
                        </div>

                        <div class="reminder-action-right">
                             <button class="btn-whatsapp-pill" onclick="sendReminderToClient(${item.client.id}, '${item.client.name}', '${item.client.phone}')">
                                ENVIAR LEMBRETE
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listContainer.innerHTML += cardHTML;
        });
    } else {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #5F5F5F; width: 100%;">
                <p>Nenhum cliente com pagamento atrasado hoje.</p>
            </div>
        `;
    }

    openModal('reminderModal');
}

function closeReminderModal() { closeModal('reminderModal'); }

function sendReminderToClient(id, name, phone) {
    // Lógica de envio (mantida)
    showNotification(`Abrindo WhatsApp de ${name}...`);
}