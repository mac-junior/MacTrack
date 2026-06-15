import React, { useState } from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Edit2, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { transactionApi } from '../../api/transactionApi';
import toast from 'react-hot-toast';

const TransactionItem = ({ transaction, onDelete, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: transaction.amount,
    description: transaction.description || '',
    categoryId: transaction.category_id,
  });
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);

  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';

  const handleEdit = async () => {
    setLoading(true);
    try {
      await transactionApi.update(transaction.id, editForm);
      toast.success('Transaction updated');
      setShowEditModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {transaction.description || 'No description'}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${
              isIncome ? 'bg-emerald-100 text-emerald-700' :
              isExpense ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {transaction.type}
            </span>
            <span className="text-xs text-gray-500">
              {transaction.category_name}
            </span>
            <span className="text-xs text-gray-400">
              {formatDateTime(transaction.transaction_date)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <p className={`font-semibold ${
            isIncome ? 'text-emerald-600' :
            isExpense ? 'text-red-600' :
            'text-blue-600'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
          
          <div className="hidden group-hover:flex items-center space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1 text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Transaction"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={editForm.amount}
            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
          />
          <Input
            label="Description"
            type="text"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleEdit} variant="primary" loading={loading}>
              Save Changes
            </Button>
            <Button onClick={() => setShowEditModal(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransactionItem;