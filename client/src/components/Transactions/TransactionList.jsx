import React, { useState } from 'react';
import TransactionItem from './TransactionItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TransactionList = ({ transactions, loading, onDelete, onUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions found</p>
        <p className="text-sm text-gray-400 mt-1">Start by adding your first transaction</p>
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  return (
    <div>
      <div className="space-y-2">
        {currentTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;