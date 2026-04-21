// TotalRow is owned by this component — no dependency on domain libs
export interface TotalRow {
  label:  string
  value:  string
  color?: string
  bold?:  boolean
}

export interface TotalCardProps {
  rows: TotalRow[]
}

export function TotalCard({ rows }: TotalCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 flex flex-col gap-0.5 mt-3">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`flex justify-between items-center py-0.5 text-[13px] ${r.bold ? 'font-medium border-t border-slate-200 mt-1.5 pt-2.5' : ''}`}
        >
          <span className="text-slate-500">{r.label}</span>
          <span className={`font-mono ${r.color ?? 'text-slate-800'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}
