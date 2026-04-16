import { useState, useEffect, useRef } from 'react'
import { Button, Card, CardHeader, CardBody } from '../../components/ui'
import { type BillingClinic, type InvoiceEntryRecord, fmt } from './data'
import type { SaveCiPayload } from '../../hooks/useInvoiceEntries'

// ── helpers ─────────────────────────────────────────────────

function MoneyInput({
  label, id, value, onChange, hint,
}: { label: string; id: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">$</span>
        <input
          id={id}
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-5 pr-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5] transition-colors"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}

function SelectInput({ label, id, value, onChange, options }: { label: string; id: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5] transition-colors"
      >
        <option value="">Select</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function CalcBox({ rows }: { rows: { label: string; value: string; color?: string; separator?: boolean }[] }) {
  return (
    <div className="bg-slate-50 rounded-md px-3 py-2.5 mt-2 flex flex-col gap-0.5">
      {rows.map((r, i) => (
        <div key={i} className={`flex items-center gap-3 py-0.5 text-[12px] ${r.separator ? 'border-t border-slate-200 mt-1.5 pt-2' : ''}`}>
          <span className="text-slate-500 shrink-0">{r.label}</span>
          <span className={`font-mono ${r.color ?? 'text-slate-800'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function TotalCard({ rows }: { rows: { label: string; value: string; color?: string; bold?: boolean }[] }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 flex flex-col gap-0.5 mt-3">
      {rows.map((r, i) => (
        <div key={i} className={`flex justify-between items-center py-0.5 text-[13px] ${r.bold ? 'font-medium border-t border-slate-200 mt-1.5 pt-2.5' : ''}`}>
          <span className="text-slate-500">{r.label}</span>
          <span className={`font-mono ${r.color ?? 'text-slate-800'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── ServiceBlock ─────────────────────────────────────────────

interface ServiceBlockProps {
  type:       'RPM' | 'CCM'
  splitLabel: string
  disabled:   boolean
  invoice:    string
  pts:        string
  calcRows:   { label: string; value: string; color?: string }[]
  onInvoice:  (v: string) => void
  onPts:      (v: string) => void
}

function ServiceBlock({ type, splitLabel, disabled, invoice, pts, calcRows, onInvoice, onPts }: ServiceBlockProps) {
  const isRpm    = type === 'RPM'
  const accent   = isRpm ? '#185FA5' : '#1D9E75'
  const labelCls = isRpm ? 'text-[#0C447C]' : 'text-[#085041]'

  return (
    <div className={`border border-slate-100 rounded-md overflow-hidden mb-3 last:mb-0 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-medium ${labelCls}`}>{type}</span>
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

// ── CISection ────────────────────────────────────────────────

interface CISectionProps {
  clinic:        BillingClinic
  rpmInv:        number
  ccmInv:        number
  fee:           number
  existingCi:    InvoiceEntryRecord | null
  onSaveCi:      (payload: SaveCiPayload) => Promise<void>
}

function CISection({ clinic, rpmInv, ccmInv, fee, existingCi, onSaveCi }: CISectionProps) {
  const [open,        setOpen]        = useState(false)
  const [mode,        setMode]        = useState<'total' | 'split'>('total')
  const [totalAmt,    setTotalAmt]    = useState('')
  const [totalDate,   setTotalDate]   = useState('')
  const [totalMethod, setTotalMethod] = useState('')
  const [totalRef,    setTotalRef]    = useState('')
  const [totalRemark, setTotalRemark] = useState('')
  const [rpmAmt,      setRpmAmt]      = useState('')
  const [ccmAmt,      setCcmAmt]      = useState('')
  const [splitRemark, setSplitRemark] = useState('')
  const [ciSaved,     setCiSaved]     = useState(false)
  const [saving,      setSaving]      = useState(false)

  // 기존 DB 값으로 폼 초기화
  useEffect(() => {
    if (existingCi?.ciAmount != null) {
      setTotalAmt(String(existingCi.ciAmount))
    } else {
      setTotalAmt('')
    }
    setTotalDate(existingCi?.ciDate ?? '')
    setTotalMethod(existingCi?.ciMethod ?? '')
    setTotalRef(existingCi?.ciReference ?? '')
    setTotalRemark(existingCi?.ciRemark ?? '')
    setRpmAmt('')
    setCcmAmt('')
    setSplitRemark('')
  // 의도적으로 entry ID 변경 시에만 폼 초기화 (개별 필드 변경은 재초기화 대상 아님)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCi?.id])

  const rpmExpected   = rpmInv * (clinic.rpmSplit[1] / 100)
  const ccmExpected   = ccmInv * (clinic.ccmSplit[1] / 100)
  const totalExpected = rpmExpected + ccmExpected - fee

  const ciTotal        = parseFloat(totalAmt) || 0
  const uncollected    = totalExpected - ciTotal

  const rpmReceived      = parseFloat(rpmAmt) || 0
  const ccmReceived      = parseFloat(ccmAmt) || 0
  const totalReceived    = rpmReceived + ccmReceived
  const splitUncollected = totalExpected - totalReceived

  const savedCiAmount = existingCi?.ciAmount ?? null

  async function handleSaveCi() {
    setSaving(true)
    try {
      if (mode === 'total') {
        const amount = ciTotal > 0 ? ciTotal : null
        await onSaveCi({
          ciAmount:    amount,
          ciDate:      totalDate || null,
          ciMethod:    (totalMethod as 'ACH' | 'Zelle' | 'Check') || null,
          ciReference: totalRef || null,
          ciRemark:    totalRemark || null,
          status:      amount != null && amount > 0 ? 'paid' : 'unpaid',
        })
      } else {
        const amount = totalReceived > 0 ? totalReceived : null
        await onSaveCi({
          ciAmount:    amount,
          ciDate:      null,
          ciMethod:    null,
          ciReference: null,
          ciRemark:    splitRemark || null,
          status:      amount != null && amount > 0 ? 'paid' : 'unpaid',
        })
      }
      setCiSaved(true)
      setTimeout(() => setCiSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-slate-200 rounded-md">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer bg-transparent text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-slate-500">Enter deposit received by HicareNet</span>
          {savedCiAmount != null && !open && (
            <span className="text-[11px] text-[#27500A] bg-[#EAF3DE] px-2 py-0.5 rounded-full">
              Saved {fmt(savedCiAmount)}
            </span>
          )}
        </div>
        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-4 pt-1 border-t border-slate-100 flex flex-col gap-4">

          {/* Mode toggle */}
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Input method</p>
            <div className="flex border border-slate-200 rounded-md overflow-hidden w-fit">
              {(['total', 'split'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    'text-[12px] px-3.5 py-1.5 cursor-pointer border-none',
                    m !== 'total' ? 'border-l border-slate-200' : '',
                    mode === m ? 'bg-[#E6F1FB] text-[#0C447C] font-medium' : 'bg-slate-50 text-slate-500',
                  ].join(' ')}
                >
                  {m === 'total' ? 'Total amount' : 'RPM / CCM separately'}
                </button>
              ))}
            </div>
          </div>

          {/* Total mode */}
          {mode === 'total' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <MoneyInput
                  label="Deposit amount" id="ci-total-amt"
                  value={totalAmt} onChange={setTotalAmt}
                  hint={`Expected: ${fmt(totalExpected)}`}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Deposit date</label>
                  <input type="date" value={totalDate} onChange={e => setTotalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
                </div>
                <SelectInput label="Payment method" id="ci-method" value={totalMethod} onChange={setTotalMethod} options={['ACH','Zelle','Check']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Reference no.</label>
                  <input type="text" value={totalRef} onChange={e => setTotalRef(e.target.value)} placeholder="Check # / ACH ref"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Remark</label>
                  <input type="text" value={totalRemark} onChange={e => setTotalRemark(e.target.value)} placeholder="Optional note"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
                </div>
              </div>
              {ciTotal > 0 && (
                <TotalCard rows={[
                  { label:'Expected (HicareNet)', value: fmt(totalExpected), color:'text-[#0C447C]' },
                  { label:'Received',             value: fmt(ciTotal),       color:'text-[#27500A]' },
                  { label:'Uncollected',          value: fmt(uncollected),   color: uncollected > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', bold: true },
                ]} />
              )}
            </div>
          )}

          {/* Split mode */}
          {mode === 'split' && (
            <div className="flex flex-col gap-3">
              {clinic.services.includes('RPM') && (
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <div className="flex items-center px-3.5 py-2 bg-slate-50 border-b border-slate-100" style={{ borderLeft:'3px solid #185FA5' }}>
                    <span className="text-[12px] font-medium text-[#0C447C]">RPM — HicareNet deposit</span>
                  </div>
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <MoneyInput label="RPM deposit amount" id="rpm-ci-amt" value={rpmAmt} onChange={setRpmAmt} hint={`Expected: ${fmt(rpmExpected)}`} />
                    {rpmReceived > 0 && (
                      <CalcBox rows={[
                        { label:'Expected',      value: fmt(rpmExpected),                color:'text-[#0C447C]' },
                        { label:'Received',      value: fmt(rpmReceived),                color:'text-[#27500A]' },
                        { label:'Uncollected',   value: fmt(rpmExpected - rpmReceived),  color: rpmExpected - rpmReceived > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', separator: true },
                      ]} />
                    )}
                  </div>
                </div>
              )}
              {clinic.services.includes('CCM') && (
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <div className="flex items-center px-3.5 py-2 bg-slate-50 border-b border-slate-100" style={{ borderLeft:'3px solid #1D9E75' }}>
                    <span className="text-[12px] font-medium text-[#085041]">CCM — HicareNet deposit</span>
                  </div>
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <MoneyInput label="CCM deposit amount" id="ccm-ci-amt" value={ccmAmt} onChange={setCcmAmt} hint={`Expected: ${fmt(ccmExpected)}`} />
                    {ccmReceived > 0 && (
                      <CalcBox rows={[
                        { label:'Expected',    value: fmt(ccmExpected),                color:'text-[#0C447C]' },
                        { label:'Received',    value: fmt(ccmReceived),                color:'text-[#27500A]' },
                        { label:'Uncollected', value: fmt(ccmExpected - ccmReceived),  color: ccmExpected - ccmReceived > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', separator: true },
                      ]} />
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-500">Remark</label>
                <input type="text" value={splitRemark} onChange={e => setSplitRemark(e.target.value)} placeholder="Optional note"
                  className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
              </div>
              {totalReceived > 0 && (
                <TotalCard rows={[
                  { label:'Total expected (HicareNet)', value: fmt(totalExpected),    color:'text-[#0C447C]' },
                  { label:'Total received',             value: fmt(totalReceived),    color:'text-[#27500A]' },
                  { label:'Total uncollected',          value: fmt(splitUncollected), color: splitUncollected > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', bold: true },
                ]} />
              )}
            </div>
          )}

          {/* CI Save button */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            {ciSaved && (
              <span className="flex items-center gap-1 text-[12px] text-[#27500A]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Saved
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleSaveCi} disabled={saving}>
              {saving ? 'Saving…' : 'Save CI'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── InvoiceEntryTab ──────────────────────────────────────────

interface InvoiceEntryTabProps {
  clinic:         BillingClinic
  records:        InvoiceEntryRecord[]
  onSaveInvoice:  (year: number, month: number, data: { rpmInvoice: number; ccmInvoice: number; rpmPts: number; ccmPts: number }) => Promise<void>
  onSaveCi:       (year: number, month: number, ci: SaveCiPayload) => Promise<void>
}

const MONTHS       = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December']

/** 현재 날짜 기준으로 offset 만큼 이동한 {year, month(1-12)} 반환 */
function offsetMonth(offset: number): { year: number; month: number } {
  const now = new Date()
  const d   = new Date(now.getFullYear(), now.getMonth() + offset)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function InvoiceEntryTab({ clinic, records, onSaveInvoice, onSaveCi }: InvoiceEntryTabProps) {
  const [monthOffset,   setMonthOffset]  = useState(0)
  const [rpmInvoice,    setRpmInvoice]   = useState('')
  const [ccmInvoice,    setCcmInvoice]   = useState('')
  const [rpmPts,        setRpmPts]       = useState('')
  const [ccmPts,        setCcmPts]       = useState('')
  const [isDirty,       setIsDirty]      = useState(false)
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  // stale closure 방지용 ref
  const onSaveRef = useRef(onSaveInvoice)
  useEffect(() => { onSaveRef.current = onSaveInvoice })

  const yearRef  = useRef(0)
  const monthRef = useRef(0)

  const { year, month } = offsetMonth(monthOffset)
  const monthLabel = MONTHS[month - 1] + ' ' + year

  // year/month ref 동기화
  useEffect(() => {
    yearRef.current  = year
    monthRef.current = month
  }, [year, month])

  // 해당 월 DB 레코드
  const currentEntry = records.find(r => r.billingYear === year && r.billingMonth === month) ?? null
  const isPaid       = currentEntry?.status === 'paid'

  // 월이 바뀌면 DB 값으로 폼 초기화, dirty 리셋
  useEffect(() => {
    setRpmInvoice(currentEntry?.rpmInvoice != null ? String(currentEntry.rpmInvoice) : '')
    setCcmInvoice(currentEntry?.ccmInvoice != null ? String(currentEntry.ccmInvoice) : '')
    setRpmPts(currentEntry?.rpmPts != null ? String(currentEntry.rpmPts) : '')
    setCcmPts(currentEntry?.ccmPts != null ? String(currentEntry.ccmPts) : '')
    setIsDirty(false)
    setAutoSaveState('idle')
  // 의도적으로 year/month/entry ID 변경 시에만 폼 초기화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, currentEntry?.id])

  // 입력 변경 시 800ms debounce 자동 저장
  useEffect(() => {
    if (!isDirty) return
    const rpm = parseFloat(rpmInvoice) || 0
    const ccm = parseFloat(ccmInvoice) || 0
    if (!rpm && !ccm) return   // 두 값 모두 비어있으면 저장 안 함

    setAutoSaveState('saving')
    const timer = setTimeout(async () => {
      try {
        await onSaveRef.current(yearRef.current, monthRef.current, {
          rpmInvoice: rpm,
          ccmInvoice: ccm,
          rpmPts:     parseFloat(rpmPts) || 0,
          ccmPts:     parseFloat(ccmPts) || 0,
        })
        setIsDirty(false)
        setAutoSaveState('saved')
        setTimeout(() => setAutoSaveState('idle'), 2000)
      } catch {
        setAutoSaveState('idle')
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [rpmInvoice, ccmInvoice, rpmPts, ccmPts, isDirty])

  const rpm      = parseFloat(rpmInvoice) || 0
  const ccm      = parseFloat(ccmInvoice) || 0
  const total    = rpm + ccm
  const fee      = clinic.billerFeeType === 'pct' ? total * (clinic.billerFeeVal / 100) : clinic.billerFeeVal
  const feeLabel = clinic.billerFeeType === 'pct' ? `${clinic.billerFeeVal}% of total` : `Fixed $${clinic.billerFeeVal}`

  const rClinic = rpm * (clinic.rpmSplit[0] / 100)
  const rHicare = rpm * (clinic.rpmSplit[1] / 100)
  const cClinic = ccm * (clinic.ccmSplit[0] / 100)
  const cHicare = ccm * (clinic.ccmSplit[1] / 100)

  const rpmCalcRows = clinic.services.includes('RPM') && rpm > 0 ? [
    { label:'Clinic share', value: fmt(rClinic) },
    { label:'Hicare share', value: fmt(rHicare) },
  ] : []

  const ccmCalcRows = clinic.services.includes('CCM') && ccm > 0 ? [
    { label:'Clinic share', value: fmt(cClinic) },
    { label:'Hicare share', value: fmt(cHicare) },
  ] : []

  const infoText = `Split ratios from clinic settings · RPM ${clinic.rpmSplit[0]}/${clinic.rpmSplit[1]} · CCM ${clinic.ccmSplit[0]}/${clinic.ccmSplit[1]} · ${clinic.billerFeeType === 'pct' ? `Biller fee ${clinic.billerFeeVal}%` : `Biller fee $${clinic.billerFeeVal} fixed`}`

  // 입력 핸들러: 값 세팅 + dirty 표시
  const handleRpmInvoice = (v: string) => { setRpmInvoice(v); setIsDirty(true) }
  const handleCcmInvoice = (v: string) => { setCcmInvoice(v); setIsDirty(true) }
  const handleRpmPts     = (v: string) => { setRpmPts(v);     setIsDirty(true) }
  const handleCcmPts     = (v: string) => { setCcmPts(v);     setIsDirty(true) }

  return (
    <div className="flex flex-col gap-3.5 px-6 py-5">

      {/* Billing period navigator */}
      <div className="flex items-center gap-2.5">
        <button onClick={() => setMonthOffset(v => v - 1)}
          className="w-7 h-7 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer bg-white">‹</button>
        <span className="text-[14px] font-semibold text-slate-700 min-w-[120px] text-center">{monthLabel}</span>
        <button onClick={() => setMonthOffset(v => v + 1)}
          className="w-7 h-7 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer bg-white">›</button>
        {monthOffset !== 0 && (
          <button
            onClick={() => setMonthOffset(0)}
            className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none px-1"
            title="Go to current month"
          >
            Today
          </button>
        )}
        <span className={`text-[11px] px-2.5 py-1 rounded-full ${isPaid ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FCEBEB] text-[#791F1F]'}`}>
          {isPaid ? 'Paid' : 'Unpaid'}
        </span>
        {/* 자동 저장 상태 표시 */}
        {autoSaveState === 'saving' && (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
            Saving…
          </span>
        )}
        {autoSaveState === 'saved' && (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[#27500A]">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Saved
          </span>
        )}
      </div>

      {/* Invoice */}
      <Card>
        <CardHeader icon="receipt_long" title="Invoice" />
        <CardBody padding="sm">
          <ServiceBlock
            type="RPM"
            splitLabel={`Clinic ${clinic.rpmSplit[0]}% · Hicare ${clinic.rpmSplit[1]}%`}
            disabled={!clinic.services.includes('RPM')}
            invoice={rpmInvoice} pts={rpmPts}
            calcRows={rpmCalcRows}
            onInvoice={handleRpmInvoice} onPts={handleRpmPts}
          />
          <ServiceBlock
            type="CCM"
            splitLabel={`Clinic ${clinic.ccmSplit[0]}% · Hicare ${clinic.ccmSplit[1]}%`}
            disabled={!clinic.services.includes('CCM')}
            invoice={ccmInvoice} pts={ccmPts}
            calcRows={ccmCalcRows}
            onInvoice={handleCcmInvoice} onPts={handleCcmPts}
          />

          {total > 0 && (
            <TotalCard rows={[
              { label:'Total invoice',            value: fmt(total),                   color:'text-[#0C447C]' },
              { label:'Total clinic amount',      value: fmt(rClinic + cClinic) },
              { label:`Biller fee (${feeLabel})`, value: `− ${fmt(fee)}`,              color:'text-[#791F1F]' },
              { label:'Total Hicare amount',      value: fmt(rHicare + cHicare - fee), bold: true },
            ]} />
          )}

          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-[#E6F1FB] rounded-md text-[11px] text-[#0C447C] leading-relaxed">
            <span className="material-symbols-outlined text-[14px] flex-shrink-0">info</span>
            <span>{infoText}</span>
          </div>
        </CardBody>
      </Card>

      {/* HicareNet Collection */}
      <Card>
        <CardHeader icon="account_balance" title="HicareNet Collection" />
        <CardBody padding="sm">
          {/* key를 월별로 줘서 월 이동 시 CISection 상태 초기화 */}
          <CISection
            key={`${year}-${month}`}
            clinic={clinic}
            rpmInv={rpm}
            ccmInv={ccm}
            fee={fee}
            existingCi={currentEntry}
            onSaveCi={ci => onSaveCi(year, month, ci)}
          />
        </CardBody>
      </Card>

      <div className="pb-6" />
    </div>
  )
}
