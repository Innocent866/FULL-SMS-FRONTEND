import { forwardRef } from 'react';
import clsx from 'clsx';

const Card = forwardRef(({ title, action, children, className }, ref) => (
  <section ref={ref} className={clsx('rounded-2xl bg-white p-6 shadow-sm', className)}>
    {(title || action) && (
      <header className="mb-4 flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {action}
      </header>
    )}
    {children}
  </section>
));

Card.displayName = 'Card';

export default Card;
