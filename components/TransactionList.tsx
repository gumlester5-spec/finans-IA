
import React from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 py-8">No hay transacciones todavía. ¡Añade una para empezar!</p>;
  }

  return (
    <div className="space-y-3 pr-2 max-h-[60vh] overflow-y-auto">
      {transactions.map(transaction => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TransactionList;
