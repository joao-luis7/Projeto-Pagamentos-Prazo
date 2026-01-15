//dados brutos do sistema

window.clientsList = [
    { id: 1, name: 'João Silva', phone: '(11) 98765-4321', address: 'Rua A, 123' },
    { id: 2, name: 'Maria Santos', phone: '(11) 97654-3210', address: 'Rua B, 456' },
    { id: 3, name: 'Pedro Oliveira', phone: '(11) 96543-2109', address: 'Rua C, 789' },
    { id: 4, name: 'Ana Costa', phone: '(11) 95432-1098', address: 'Rua D, 321' }
];

window.salesList = [
    {
        id: 1,
        clientId: 3,
        clientName: 'Pedro Oliveira',
        date: '2024-02-20',
        dueDate: '2024-03-20',
        products: 'Troca de Pneus',
        totalValue: 320.75,
        paidValue: 0,
        remainingValue: 320.75,
        status: 'Pendente',
        payments: []
    },
    {
        id: 2,
        clientId: 2,
        clientName: 'Maria Santos',
        date: '2024-03-10',
        dueDate: '2024-04-10',
        products: 'Alinhamento e Balanceamento',
        totalValue: 180.50,
        paidValue: 0,
        remainingValue: 180.50,
        status: 'Pendente',
        payments: []
    },
    {
        id: 3,
        clientId: 1,
        clientName: 'João Silva',
        date: '2024-03-15',
        dueDate: '2024-04-15',
        products: 'Troca de Óleo',
        totalValue: 250.00,
        paidValue: 0,
        remainingValue: 250.00,
        status: 'Pendente',
        payments: []
    },
    {
        id: 4,
        clientId: 4,
        clientName: 'Ana Costa',
        date: '2024-04-01',
        dueDate: '2024-05-01',
        products: 'Revisão Completa',
        totalValue: 95.00,
        paidValue: 0,
        remainingValue: 95.00,
        status: 'Pendente',
        payments: []
    }
];

window.paymentsList = [];