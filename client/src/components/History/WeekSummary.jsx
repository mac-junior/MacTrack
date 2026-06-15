import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, PiggyBank, AlertCircle } from 'lucide-react';

const WeekSummary = ({ summary, transactions, onSelectTransaction }) => {
  const summaryCards = [
    {
      title: 'Total Income',
      amount: summary.total_income,
      icon: TrendingUp,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Expenses',
      amount: summary.total_expenses,
      icon: TrendingDown,
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Total Savings',
      amount: summary.total_savings,
      icon: PiggyBank,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const netChange = summary.total_income - (summary.total_expenses + summary.total_savings);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h3>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${card.textColor}`}>
              {formatCurrency(card.amount)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Change</h3>
            <p className={`text-xl font-bold mt-1 ${netChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
            </p>
          </div>
          {summary.total_unaccounted > 0 && (
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{formatCurrency(summary.total_unaccounted)} unaccounted</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Transactions</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions this week</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => onSelectTransaction(transaction)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description || 'No description'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category_name}</p>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekSummary;