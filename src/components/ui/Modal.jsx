import clsx from 'clsx';

const placementClasses = {
  center: 'items-center justify-center',
  'bottom-right': 'items-end justify-end'
};

const Modal = ({ open, title, children, onClose, placement = 'center' }) => {
  if (!open) return null;
  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex bg-black/40 p-4',
        placementClasses[placement] || placementClasses.center
      )}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">×</button>
        </header>
        {children}
      </div>
    </div>
  );
};

export default Modal;
