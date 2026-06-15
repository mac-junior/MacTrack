import React, { useState, useEffect } from 'react';
import { historyApi } from '../../api/historyApi';
import { transactionApi } from '../../api/transactionApi';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { formatCurrency } from '../../utils/formatters';
import { Search } from 'lucide-react';

const SearchFilters = ({ onSearchResults }) => {
  const [filters, setFilters] = useState({
    query: '',
    startDate: '',
    endDate: '',
    type: '',
    categoryId: '',
    minAmount: '',
    maxAmount: '',
  });
  const [categories, setCategories] = useState({ income: [], expense: [], savings: [] });
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await transactionApi.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const response = await historyApi.search(filters);
      setResults(response.results);
      onSearchResults(response.results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'savings', label: 'Savings' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categories[filters.type] || []).map(cat => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Search"
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          placeholder="Search by description or source..."
        />

        <Input
          label="Start Date"
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />

        <Input
          label="End Date"
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />

        <Select
          label="Transaction Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, categoryId: '' })}
          options={typeOptions}
        />

        <Select
          label="Category"
          value={filters.categoryId}
          onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          options={categoryOptions}
          disabled={!filters.type}
        />

        <Input
          label="Min Amount"
          type="number"
          step="0.01"
          value={filters.minAmount}
          onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
          placeholder="0.00"
        />

        <Input
          label="Max Amount"
          type="number"
          step="0.01"
          value={filters.maxAmount}
          onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
          placeholder="0.00"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSearch} variant="primary" loading={searching}>
          <Search className="w-4 h-4 mr-2" />
          Search Transactions
        </Button>
      </div>

      {results && results.count > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Search Results</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {results.count} transactions totaling {formatCurrency(results.summary.total_amount)}
          </p>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {results.transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description || 'No description'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category_name}</p>
                </div>
                <p className={`text-sm font-semibold ${
                  transaction.type === 'income' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
            {results.count > 10 && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                + {results.count - 10} more transactions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;