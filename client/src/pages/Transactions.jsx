import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ManualEntryForm from '../components/Transactions/ManualEntryForm';
import SmsParserForm from '../components/Transactions/SmsParserForm';
import TransactionList from '../components/Transactions/TransactionList';
import { transactionApi } from '../api/transactionApi';
import { PlusCircle, Smartphone, List } from 'lucide-react';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('manual');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionApi.getAll(1, 50);
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSuccess = () => {
    setShowModal(false);
    fetchTransactions();
    toast.success('Transaction recorded successfully');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionApi.delete(id);
        toast.success('Transaction deleted');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <Button
          variant="primary"
          onClick={() => {
            setModalType('manual');
            setShowModal(true);
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <Card>
        <div className="border-b border-gray-100 mb-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              All Transactions
            </button>
            <button
              onClick={() => setActiveTab('parse')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'parse'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-2" />
              Parse SMS
            </button>
          </div>
        </div>

        {activeTab === 'manual' ? (
          <TransactionList
            transactions={transactions}
            loading={loading}
            onDelete={handleDelete}
          />
        ) : (
          <SmsParserForm onSuccess={handleTransactionSuccess} />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'manual' ? 'Add Manual Transaction' : 'Parse SMS Transaction'}
      >
        {modalType === 'manual' ? (
          <ManualEntryForm onSuccess={handleTransactionSuccess} onCancel={() => setShowModal(false)} />
        ) : (
          <SmsParserForm onSuccess={handleTransactionSuccess} />
        )}
      </Modal>
    </div>
  );
};

export default Transactions;