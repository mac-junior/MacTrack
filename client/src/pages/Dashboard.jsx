import React, { useState, useEffect, useContext } from 'react';
import { transactionApi } from '../api/transactionApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, getGreeting } from '../utils/formatters';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  AlertCircle,
  Wallet,
  Target,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await transactionApi.getToday();
      setDashboardData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load dashboard data
        </p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Today's Income",
      amount: dashboardData.summary.total_income,
      icon: ArrowUpCircle,
      bgColor: 'bg-slate-100 dark:bg-slate-800/50',
      iconColor: 'text-slate-700 dark:text-slate-300',
      textColor: 'text-slate-700 dark:text-slate-300',
      prefix: '+',
    },
    {
      title: "Today's Expenses",
      amount: dashboardData.summary.total_expenses,
      icon: ArrowDownCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-600 dark:text-red-400',
      prefix: '-',
    },
    {
      title: "Today's Savings",
      amount: dashboardData.summary.total_savings,
      icon: PiggyBank,
      bgColor: 'bg-slate-100 dark:bg-slate-800/50',
      iconColor: 'text-slate-700 dark:text-slate-300',
      textColor: 'text-slate-700 dark:text-slate-300',
      prefix: '+',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          {getGreeting(user?.username)}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's your financial story for today
        </p>
      </div>

      {/* Unaccounted Money Alert */}
      {dashboardData.hasUnaccountedMoney && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                Unaccounted Money Detected
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                {dashboardData.unaccountedMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </h3>

              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <p className={`text-3xl font-bold ${card.textColor}`}>
              {card.prefix}
              {formatCurrency(card.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expected Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-slate-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Expected Balance
            </h3>

            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
              <Wallet className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </div>

          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(dashboardData.summary.expected_balance)}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Opening balance + today's income
          </p>
        </div>

        {/* Actual Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-slate-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Actual Balance
            </h3>

            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
              <Target className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </div>

          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(dashboardData.summary.actual_balance)}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            After all expenses and savings
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h3>

        {dashboardData.transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No transactions recorded today
          </p>
        ) : (
          <div className="space-y-3">
            {dashboardData.transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description || 'No description'}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category_name}
                  </p>
                </div>

                <p
                  className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;