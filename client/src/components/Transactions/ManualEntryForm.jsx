import React, { useState, useEffect } from 'react';
import { transactionApi } from '../../api/transactionApi';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { validateAmount } from '../../utils/validators';
import toast from 'react-hot-toast';

const ManualEntryForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    categoryId: '',
    description: '',
    transactionDate: new Date().toISOString().slice(0, 16),
  });
  const [categories, setCategories] = useState({ income: [], expense: [], savings: [] });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await transactionApi.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.amount || !validateAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await transactionApi.createManual({
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        transactionDate: formData.transactionDate,
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
    { value: 'savings', label: 'Savings' },
  ];

  const categoryOptions = (categories[formData.type] || []).map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        error={errors.amount}
        placeholder="0.00"
        required
      />

      <Select
        label="Transaction Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value, categoryId: '' })}
        options={typeOptions}
        required
      />

      <Select
        label="Category"
        value={formData.categoryId}
        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
        options={categoryOptions}
        error={errors.categoryId}
        required
        disabled={categoryOptions.length === 0}
      />

      <Input
        label="Description (Optional)"
        type="text"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="What was this for?"
      />

      <Input
        label="Date & Time"
        type="datetime-local"
        value={formData.transactionDate}
        onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
        required
      />

      <div className="flex space-x-3 pt-4">
        <Button type="submit" variant="primary" loading={loading}>
          Save Transaction
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ManualEntryForm;