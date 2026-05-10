export const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  className = '',
  ...props
}) => (
  <div className="flex flex-col mb-4">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-slate-300'
      } ${className}`}
      {...props}
    />
    {error && (
      <span className="text-sm text-red-600 mt-1">{error}</span>
    )}
  </div>
);

export const FormSelect = ({
  label,
  value,
  onChange,
  options = [],
  error,
  placeholder = 'Select...',
  className = '',
  ...props
}) => (
  <div className="flex flex-col mb-4">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-slate-300'
      } ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <span className="text-sm text-red-600 mt-1">{error}</span>
    )}
  </div>
);

export const FormTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  className = '',
  rows = 4,
  ...props
}) => (
  <div className="flex flex-col mb-4">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
    )}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
        error ? 'border-red-500' : 'border-slate-300'
      } ${className}`}
      {...props}
    />
    {error && (
      <span className="text-sm text-red-600 mt-1">{error}</span>
    )}
  </div>
);
