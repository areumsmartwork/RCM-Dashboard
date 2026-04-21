import { MoneyInput }        from './MoneyInput'
import { CalcBox }           from './CalcBox'
import type { CalcRow }      from './CalcBox'    // prop type from co-located component

export interface ServiceBlockProps {
  type:       'RPM' | 'CCM'
  splitLabel: string
  disabled:   boolean
  invoice:    string
  pts:        string
  calcRows:   CalcRow[]
  onInvoice:  (v: string) => void
  onPts:      (v: string) => void
}

const ACCENT: Record<'RPM' | 'CCM', string>    = { RPM: '#185FA5', CCM: '#1D9E75' }
const LABEL_CLS: Record<'RPM' | 'CCM', string> = { RPM: 'text-[#0C447C]', CCM: 'text-[#085041]' }

export function ServiceBlock({ type, splitLabel, disabled, invoice, pts, calcRows, onInvoice, onPts }: ServiceBlockProps) {
  return (
    <div className={`border border-slate-100 rounded-md overflow-hidden mb-3 last:mb-0 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100"
        style={{ borderLeft: `3px solid ${ACCENT[type]}` }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-medium ${LABEL_CLS[type]}`}>{type}</span>
          <span className="text-slate-300 text-[11px]">·</span>
          <input
            type="number"
            value={pts}
            onChange={e => onPts(e.target.value)}
            placeholder="0"
            className="w-14 text-center px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white focus:outline-none focus:border-[#185FA5]"
          />
          <span className="text-[10px] text-slate-400">pts</span>
        </div>
        <span className="text-[11px] text-slate-400">{splitLabel}</span>
      </div>
      <div className="px-3.5 py-3 grid grid-cols-2 gap-4 items-center">
        <MoneyInput label={`${type} invoice total`} id={`${type}-invoice`} value={invoice} onChange={onInvoice} />
        {calcRows.length > 0 && <CalcBox rows={calcRows} />}
      </div>
    </div>
  )
}
