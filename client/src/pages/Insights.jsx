import React, { useState, useEffect } from 'react';
import { historyApi } from '../api/historyApi';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SpendingChart from '../components/Charts/SpendingChart';
import CategoryBreakdown from '../components/Charts/CategoryBreakdown';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [period]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await historyApi.getInsights(period);
      setInsights(response.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load insights</p>
      </div>
    );
  }

  const periodOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last 365 Days' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Insights</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card accentColor="green">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(insights.totals.income)}
          </p>
        </Card>
        <Card accentColor="red">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(insights.totals.expenses)}
          </p>
        </Card>
        <Card accentColor="emerald">
          <p className="text-sm text-gray-500 mb-1">Total Savings</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(insights.totals.savings)}
          </p>
        </Card>
        <Card accentColor={insights.totals.net >= 0 ? 'green' : 'red'}>
          <p className="text-sm text-gray-500 mb-1">Net Change</p>
          <p className={`text-2xl font-bold ${insights.totals.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {insights.totals.net >= 0 ? '+' : ''}{formatCurrency(insights.totals.net)}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold px-3 mb-4 text-white">Spending Trends</h3>
          <SpendingChart data={insights.spending.top_categories} />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold px-3 mb-4 text-white">Category Breakdown</h3>
          <CategoryBreakdown categories={insights.spending.top_categories} />
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <h3 className="text-lg font-semibold px-3 mb-4 text-white flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
          Key Insights
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Daily average spending: <span className="font-semibold">{formatCurrency(insights.spending.daily_average)}</span>
            </p>
          </div>

          {insights.spending.biggest_expense && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                Largest expense: {formatCurrency(insights.spending.biggest_expense.amount)} on {insights.spending.biggest_expense.description}
              </p>
            </div>
          )}

          {insights.income.biggest_income && (
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                Largest income: {formatCurrency(insights.income.biggest_income.amount)} from {insights.income.biggest_income.description}
              </p>
            </div>
          )}

          {insights.patterns.frequent_transactions.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Frequent Transactions:</p>
              <ul className="space-y-1">
                {insights.patterns.frequent_transactions.map((pattern, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    • {pattern.description} ({pattern.count} times)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Recommendation */}
      {insights.spending.daily_average > insights.totals.income / 30 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div>
              <p className="text-amber-800 font-medium">Spending Alert</p>
              <p className="text-amber-700 text-sm mt-1">
                Your daily spending ({formatCurrency(insights.spending.daily_average)}) is higher than your daily income. Consider reviewing your expenses.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;