export interface MoneyInputProps {
  // Required
  label:    string
  id:       string
  value:    string
  onChange: (value: string) => void

  // Optional display
  hint?:        string
  className?:   string   // wrapper div override

  // Common native input attributes
  placeholder?: string
  disabled?:    boolean
  readOnly?:    boolean
  min?:         number | string
  max?:         number | string
  step?:        number | string
  name?:        string
}

export function MoneyInput({
  label, id, value, onChange, hint,
  className = '',
  placeholder,
  disabled,
  readOnly,
  min, max, step, name,
}: MoneyInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">$</span>
        <input
          id={id}
          type="number"
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(e.target.value)}
          className={[
            'w-full pl-5 pr-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white',
            'focus:outline-none focus:border-[#185FA5] transition-colors',
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : '',
            readOnly ? 'cursor-default bg-slate-50' : '',
          ].filter(Boolean).join(' ')}
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}
