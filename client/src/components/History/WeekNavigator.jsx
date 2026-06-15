import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeekNavigator = ({ weeks, selectedWeek, onSelectWeek }) => {
  const currentIndex = weeks.findIndex(
    w => w.week_start === selectedWeek?.week_start
  );

  const handlePrevious = () => {
    if (currentIndex < weeks.length - 1) {
      onSelectWeek(weeks[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      onSelectWeek(weeks[currentIndex - 1]);
    }
  };

  if (!selectedWeek) return null;

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={handlePrevious}
        disabled={currentIndex === weeks.length - 1}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>

      <div className="text-center">
        <p className="font-medium text-gray-900 dark:text-white">
          {selectedWeek.week_start} – {selectedWeek.week_end}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Week {selectedWeek.week_number}
        </p>
      </div>

      <button
        onClick={handleNext}
        disabled={currentIndex === 0}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WeekNavigator;