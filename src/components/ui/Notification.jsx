import clsx from 'clsx';

const variants = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200'
};

const Notification = ({ type = 'info', children, className }) => (
  <div className={clsx('rounded-lg border px-4 py-3 text-sm font-medium', variants[type], className)}>{children}</div>
);

export default Notification;

