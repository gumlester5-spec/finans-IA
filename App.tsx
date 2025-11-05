
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType } from './types';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import CategoryChart from './components/CategoryChart';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const summary = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = summary.income - summary.expense;

  const handleOpenModal = (transaction: Transaction | null = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions([transaction, ...transactions]);
    }
    handleCloseModal();
  };

  const handleDeleteTransaction = (id: string) => {
    if(window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header onAddTransaction={() => handleOpenModal()} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Balance Total" amount={balance} color="text-indigo-400" />
          <SummaryCard title="Ingresos Totales" amount={summary.income} color="text-green-400" />
          <SummaryCard title="Gastos Totales" amount={summary.expense} color="text-red-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Transacciones Recientes</h2>
            <TransactionList 
              transactions={transactions} 
              onEdit={handleOpenModal} 
              onDelete={handleDeleteTransaction}
            />
          </div>
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center h-full">
             <h2 className="text-xl font-bold mb-4 text-gray-300 w-full">Gastos por Categoría</h2>
            <CategoryChart transactions={transactions} />
          </div>
        </div>
      </main>

      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTransaction}
          existingTransaction={editingTransaction}
        />
      )}
      
      <button 
        onClick={() => handleOpenModal()}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 lg:hidden"
        aria-label="Añadir transacción"
      >
        {ICONS.plus}
      </button>
    </div>
  );
};

export default App;
