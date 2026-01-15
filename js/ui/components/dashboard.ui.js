/* Atualiza os cards do dashboard e as listas inferiores */
function updateDashboard() {
    if (!window.salesList || !window.clientsList) return;
    
    // 1. CARDS
    // Total a receber (soma de todas as vendas pendentes)
    const totalReceivable = window.salesList
        .filter(sale => sale.status !== 'Pago')
        .reduce((sum, sale) => sum + sale.remainingValue, 0);
    
    // Vendas pendentes (não pagas completamente)
    const pendingSales = window.salesList.filter(sale => sale.status !== 'Pago').length;
    
    // Total de vendas
    const totalSales = window.salesList.length;
    
    // Clientes ativos
    const activeClients = window.clientsList.length;
    
    // Atualizar DOM Cards
    const cards = document.querySelectorAll('.dashboard-card');
    if (cards[0]) cards[0].querySelector('.card-valor').textContent = formatCurrency(totalReceivable);
    if (cards[1]) cards[1].querySelector('.card-valor').textContent = pendingSales;
    if (cards[2]) cards[2].querySelector('.card-valor').textContent = totalSales;
    if (cards[3]) cards[3].querySelector('.card-valor').textContent = activeClients;

    // 2. LISTAS (Novas funções chamadas aqui)
    updateMovementsList();
    updateDebtorsList();
}

/* Renderiza a lista de últimas movimentações (Vendas e Pagamentos misturados) */
function updateMovementsList() {
    const listContainer = document.querySelector('.movements-list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Limpa conteúdo estático (se houver)

    // Normaliza Vendas para formato de lista
    const sales = window.salesList.map(s => ({
        type: 'sale',
        date: s.date,
        name: s.clientName,
        value: s.totalValue,
        desc: 'Venda'
    }));

    // Normaliza Pagamentos para formato de lista
    const payments = (window.paymentsList || []).map(p => ({
        type: 'payment',
        date: p.date,
        name: p.clientName,
        value: p.value,
        desc: 'Pagamento'
    }));

    // Junta tudo, ordena por data (mais recente primeiro) e pega os 3 primeiros
    const allMovements = [...sales, ...payments]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    if (allMovements.length === 0) {
        listContainer.innerHTML = '<div style="padding:15px; text-align:center; color:#666;">Nenhuma movimentação recente.</div>';
        return;
    }

    allMovements.forEach(mov => {
        const isPayment = mov.type === 'payment';
        // Define cores e textos baseado no tipo (Pagamento = Verde, Venda = Azul/Padrao)
        const badgeClass = isPayment ? 'green' : 'green'; 
        const badgeTitle = isPayment ? 'Pagamento Recebido' : 'Venda Registrada';
        
        // Formata data simples (dd/mm)
        let dateStr = 'Data inválida';
        if(mov.date) {
            const parts = mov.date.split('-');
            if(parts.length === 3) dateStr = `${parts[2]}/${parts[1]}`;
        }

        const itemHTML = `
            <div class="movement-item">
                <div class="movement-info">
                    <div class="mov-name">${mov.name}</div>
                    <div class="mov-type">${mov.desc}</div>
                    <div class="mov-time">${dateStr}</div> 
                </div>
                <div class="mov-badge ${badgeClass}">
                    <span>${badgeTitle}</span>
                    <strong>${formatCurrency(mov.value)}</strong>
                </div>
            </div>
        `;
        listContainer.innerHTML += itemHTML;
    });
}

/* Renderiza a lista de maiores devedores */
function updateDebtorsList() {
    const listContainer = document.querySelector('.debtors-list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Limpa conteúdo estático

    // Calcula dívida de todos, ordena do maior para o menor e pega top 3
    const debtors = window.clientsList
        .map(client => ({
            ...client,
            debt: calculateClientDebt(client.id)
        }))
        .filter(c => c.debt > 0)
        .sort((a, b) => b.debt - a.debt)
        .slice(0, 3);

    if (debtors.length === 0) {
        listContainer.innerHTML = '<div style="padding:15px; text-align:center; color:#666;">Nenhum devedor no momento.</div>';
        return;
    }

    debtors.forEach((client, index) => {
        const itemHTML = `
            <div class="debtor-item">
                <div class="debtor-rank">${index + 1}º</div>
                <div class="debtor-info">
                    <div class="debtor-name">${client.name}</div>
                    <div class="debtor-status">Débito pendente</div>
                </div>
                <div class="debtor-badge red">
                    ${formatCurrency(client.debt)}
                </div>
            </div>
        `;
        listContainer.innerHTML += itemHTML;
    });
}