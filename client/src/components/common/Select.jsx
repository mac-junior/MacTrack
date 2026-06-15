import React from 'react';
import clsx from 'clsx';

const Select = React.forwardRef(({
  label,
  options,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'input-field',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;