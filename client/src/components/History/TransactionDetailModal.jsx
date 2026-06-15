import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Calendar, Tag, FileText, Smartphone } from 'lucide-react';

const TransactionDetailModal = ({ transaction, onClose }) => {
  return (
    <Modal isOpen={!!transaction} onClose={onClose} title="Transaction Details" size="md">
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className={`text-2xl font-bold ${
              transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' :
            transaction.type === 'expense' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {transaction.type}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-gray-900">{transaction.category_name}</p>
            </div>
          </div>

          {transaction.description && (
            <div className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900">{transaction.description}</p>
              </div>
            </div>
          )}

          {transaction.source && (
            <div className="flex items-start space-x-3">
              <Smartphone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="text-gray-900">{transaction.source}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="text-gray-900">{formatDateTime(transaction.transaction_date)}</p>
            </div>
          </div>
        </div>

        {transaction.is_parsed && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">Auto-parsed from SMS</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;