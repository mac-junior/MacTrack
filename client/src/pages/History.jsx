import React, { useState, useEffect } from 'react';
import { historyApi } from '../api/historyApi';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WeekNavigator from '../components/History/WeekNavigator';
import WeekSummary from '../components/History/WeekSummary';
import TransactionDetailModal from '../components/History/TransactionDetailModal';
import SearchFilters from '../components/History/SearchFilters';
import { formatCurrency } from '../utils/formatters';
import { Calendar, Search } from 'lucide-react';

const History = () => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekDetails, setWeekDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchWeeks();
  }, [currentYear]);

  useEffect(() => {
    if (selectedWeek) {
      fetchWeekDetails(selectedWeek.week_start, selectedWeek.week_end);
    }
  }, [selectedWeek]);

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const response = await historyApi.getWeeks(currentYear);
      setWeeks(response.weeks);
      if (response.weeks.length > 0 && !selectedWeek) {
        setSelectedWeek(response.weeks[0]);
      }
    } catch (error) {
      console.error('Error fetching weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekDetails = async (weekStart, weekEnd) => {
    try {
      const response = await historyApi.getWeekDetails(weekStart, weekEnd, 1, 100);
      setWeekDetails(response);
    } catch (error) {
      console.error('Error fetching week details:', error);
    }
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
    setSelectedWeek(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Financial History</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>

      {showSearch && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <SearchFilters onSearchResults={(results) => setWeekDetails(results)} />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Summary</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleYearChange(currentYear - 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            >
              ←
            </button>
            <span className="font-medium text-gray-900 dark:text-white">{currentYear}</span>
            <button
              onClick={() => handleYearChange(currentYear + 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            >
              →
            </button>
          </div>
        </div>

        {weeks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No historical data available</p>
        ) : (
          <>
            <WeekNavigator
              weeks={weeks}
              selectedWeek={selectedWeek}
              onSelectWeek={setSelectedWeek}
            />

            {weekDetails && (
              <WeekSummary
                summary={weekDetails.summary}
                transactions={weekDetails.transactions}
                onSelectTransaction={setSelectedTransaction}
              />
            )}
          </>
        )}
      </div>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default History;