import clsx from 'clsx';

const variants = {
  primary: 'bg-sidebar text-white hover:bg-emerald-700',
  secondary: 'bg-white text-sidebar border border-sidebar hover:bg-milk'
};

const sizes = {
  md: 'px-4 py-2 text-sm font-semibold rounded-lg',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl'
};

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => (
  <button
    className={clsx('transition-all focus:outline-none focus:ring-2 focus:ring-sky', variants[variant], sizes[size], className)}
    {...props}
  >
    {children}
  </button>
);

export default Button;
