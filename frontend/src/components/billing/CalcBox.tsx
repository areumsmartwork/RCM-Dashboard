// CalcRow is owned by this component — no dependency on domain libs
export interface CalcRow {
  label:      string
  value:      string
  color?:     string
  separator?: boolean
}

export interface CalcBoxProps {
  rows: CalcRow[]
}

export function CalcBox({ rows }: CalcBoxProps) {
  return (
    <div className="bg-slate-50 rounded-md px-3 py-2.5 mt-2 flex flex-col gap-0.5">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 py-0.5 text-[12px] ${r.separator ? 'border-t border-slate-200 mt-1.5 pt-2' : ''}`}
        >
          <span className="text-slate-500 shrink-0">{r.label}</span>
          <span className={`font-mono ${r.color ?? 'text-slate-800'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}
