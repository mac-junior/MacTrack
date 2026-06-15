import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, accentColor, onClick }) => {
  const accentStyles = {
    green: 'border-l-4 border-emerald-500',
    red: 'border-l-4 border-red-500',
    amber: 'border-l-4 border-amber-500',
    blue: 'border-l-4 border-blue-500',
    emerald: 'border-l-4 border-emerald-500',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-card shadow-soft transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-medium',
        accentColor && accentStyles[accentColor],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;