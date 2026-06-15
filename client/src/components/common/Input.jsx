import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={clsx(
              'w-full px-4 py-2.5 border rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent',
              'transition-all duration-200',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'border-gray-300 dark:border-gray-600',
              error && 'border-red-500 dark:border-red-500',
              isPassword && 'pr-10',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;