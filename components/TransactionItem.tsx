import React from 'react';
import { Transaction } from '../types';
import { ICONS } from '../constants';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const { id, type, category, description, amount, date } = transaction;
  const isIncome = type === 'income';
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const formattedAmount = `${isIncome ? '+' : '-'} ${new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount)}`;
  const formattedDate = new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="flex items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
      <div className="p-2 mr-4 bg-gray-800 rounded-full">
        {isIncome ? ICONS.income : ICONS.expense}
      </div>
      <div className="flex-grow">
        <p className="font-bold text-white">{description}</p>
        <p className="text-sm text-gray-400">{category} &bull; {formattedDate}</p>
      </div>
      <div className="flex items-center space-x-3">
        <p className={`font-semibold text-lg ${amountColor}`}>{formattedAmount}</p>
        <div className="flex space-x-1">
            <button onClick={() => onEdit(transaction)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-600">
                {ICONS.edit}
            </button>
            <button onClick={() => onDelete(id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-gray-600">
                {ICONS.delete}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;