const Select = ({ label, options = [], error, ...props }) => (
  <label className="flex flex-col gap-1 text-sm text-gray-700">
    {label && <span>{label}</span>}
    <select className="rounded-lg border border-softGrey bg-white px-4 py-2 focus:border-sidebar focus:outline-none" {...props}>
      {options.map((option, id) => (
        <option key={id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </label>
);

export default Select;
