import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ label, error, className, endAdornment, containerClassName, ...props }, ref) => (
  <label className={clsx('flex flex-col gap-1 text-sm text-gray-700', containerClassName)}>
    {label && <span>{label}</span>}
    <div className="relative">
    <input
        ref={ref}
      className={clsx(
          'w-full rounded-lg border border-softGrey bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-sidebar focus:outline-none focus:ring-1 focus:ring-sidebar',
          endAdornment && 'pr-12',
        className
      )}
      {...props}
    />
      {endAdornment && (
        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-sidebar">{endAdornment}</span>
      )}
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </label>
));

Input.displayName = 'Input';

export default Input;
