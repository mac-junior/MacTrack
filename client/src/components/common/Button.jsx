import React from 'react';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
}) => {
  const variants = {
    primary:
      'bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600',

    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300',

    danger:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',

    outline:
      'border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;