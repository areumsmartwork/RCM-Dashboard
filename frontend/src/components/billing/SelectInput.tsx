export interface SelectOption {
  value: string
  label: string
}

export interface SelectInputProps {
  // Required
  label:    string
  id:       string
  value:    string
  onChange: (value: string) => void

  // Options: plain string array or { value, label } objects
  options:  string[] | SelectOption[]

  // Optional
  placeholder?: string   // empty option label (default: "Select")
  className?:   string
  disabled?:    boolean
  name?:        string
}

export function SelectInput({
  label, id, value, onChange, options,
  placeholder = 'Select',
  className = '',
  disabled,
  name,
}: SelectInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className={[
          'w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white',
          'focus:outline-none focus:border-[#185FA5] transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : '',
        ].filter(Boolean).join(' ')}
      >
        <option value="">{placeholder}</option>
        {(options as (string | SelectOption)[]).map(o => {
          const v = typeof o === 'string' ? o : o.value
          const l = typeof o === 'string' ? o : o.label
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </div>
  )
}
