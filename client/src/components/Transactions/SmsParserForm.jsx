import React, { useState } from 'react';
import { transactionApi } from '../../api/transactionApi';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SmsParserForm = ({ onSuccess }) => {
  const [smsMessage, setSmsMessage] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [confirmedData, setConfirmedData] = useState({
    type: '',
    amount: '',
    description: '',
    suggestedCategory: '',
  });

  const handleParse = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please paste an SMS message');
      return;
    }

    setLoading(true);
    try {
      const response = await transactionApi.parseSms(smsMessage);
      
      if (response.needsConfirmation) {
        setParsedData(response.parsedData);
        setConfirmedData({
          type: response.parsedData.type || '',
          amount: response.parsedData.amount || '',
          description: response.parsedData.description || '',
          suggestedCategory: response.parsedData.suggestedCategory || '',
        });
        setNeedsConfirmation(true);
        
        // Fetch categories for selection
        const categoriesResponse = await transactionApi.getCategories();
        setCategories(categoriesResponse.categories);
      } else {
        toast.success('Transaction parsed and saved successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error parsing SMS:', error);
      toast.error('Failed to parse SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await transactionApi.parseSms(smsMessage, confirmedData);
      toast.success('Transaction saved successfully');
      onSuccess();
      setNeedsConfirmation(false);
      setSmsMessage('');
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'savings', label: 'Savings' },
  ];

  const categoryOptions = (categories[confirmedData.type] || []).map(cat => ({
    value: cat.name,
    label: cat.name,
  }));

  if (needsConfirmation && parsedData) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div>
              <p className="text-amber-800 font-medium">Please confirm extracted information</p>
              <p className="text-amber-700 text-sm mt-1">
                The system detected a transaction but needs your confirmation
              </p>
            </div>
          </div>
        </div>

        <Select
          label="Transaction Type"
          value={confirmedData.type}
          onChange={(e) => setConfirmedData({ ...confirmedData, type: e.target.value })}
          options={typeOptions}
          required
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={confirmedData.amount}
          onChange={(e) => setConfirmedData({ ...confirmedData, amount: e.target.value })}
          required
        />

        <Select
          label="Category"
          value={confirmedData.suggestedCategory}
          onChange={(e) => setConfirmedData({ ...confirmedData, suggestedCategory: e.target.value })}
          options={categoryOptions}
          required
        />

        <Input
          label="Description"
          type="text"
          value={confirmedData.description}
          onChange={(e) => setConfirmedData({ ...confirmedData, description: e.target.value })}
          required
        />

        <div className="flex space-x-3">
          <Button onClick={handleConfirm} variant="primary" loading={loading}>
            Confirm & Save
          </Button>
          <Button onClick={() => setNeedsConfirmation(false)} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <p className="text-blue-800 font-medium">Paste your mobile money SMS</p>
            <p className="text-blue-700 text-sm mt-1">
              Copy and paste the entire SMS message from your mobile money provider
            </p>
          </div>
        </div>
      </div>

      <textarea
        className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        placeholder="Paste your SMS message here...
Example: You have received XAF 50,000 from Mac Track on 15/01/2024. Your new balance is XAF 150,000"
        value={smsMessage}
        onChange={(e) => setSmsMessage(e.target.value)}
      />

      <Button onClick={handleParse} variant="primary" loading={loading} className="w-full">
        Parse Transaction
      </Button>
    </div>
  );
};

export default SmsParserForm;