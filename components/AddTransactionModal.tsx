
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES, ICONS } from '../constants';
import { suggestCategory } from '../services/geminiService';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  existingTransaction: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, existingTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setAmount(String(existingTransaction.amount));
      setCategory(existingTransaction.category);
      setDescription(existingTransaction.description);
      setDate(new Date(existingTransaction.date).toISOString().split('T')[0]);
    } else {
      // Reset form
      setType('expense');
      setAmount('');
      setCategory(CATEGORIES.expense[0]);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [existingTransaction, isOpen]);

  useEffect(() => {
    setCategory(type === 'income' ? CATEGORIES.income[0] : CATEGORIES.expense[0]);
  }, [type]);

  const handleSuggestCategory = async () => {
    if (!description) {
      setError('Por favor, introduce una descripción primero.');
      return;
    }
    setError('');
    setIsSuggesting(true);
    try {
      const suggested = await suggestCategory(description);
      setCategory(suggested);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description || !date) {
        setError('Todos los campos son obligatorios.');
        return;
    }
    setError('');
    const newTransaction: Transaction = {
      id: existingTransaction ? existingTransaction.id : crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).toISOString(),
    };
    onSave(newTransaction);
  };

  if (!isOpen) return null;

  const categoryList = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{existingTransaction ? 'Editar' : 'Nueva'} Transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex rounded-md shadow-sm bg-gray-900">
              <button type="button" onClick={() => setType('income')} className={`px-4 py-2 w-1/2 rounded-l-md ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Ingreso</button>
              <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 w-1/2 rounded-r-md ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Gasto</button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Cantidad</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descripción</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Categoría</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500" required>
              {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
           {type === 'expense' && (
            <div className="mb-4">
              <button type="button" onClick={handleSuggestCategory} disabled={isSuggesting || !description} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                {isSuggesting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {ICONS.magic}
                    Sugerir Categoría con IA
                  </>
                )}
              </button>
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Fecha</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
