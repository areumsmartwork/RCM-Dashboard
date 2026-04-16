import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api'

export interface InvoiceEntryRecord {
  id: string
  clinicId: string
  billingYear: number
  billingMonth: number
  rpmInvoice: number | null
  ccmInvoice: number | null
  rpmPts: number | null
  ccmPts: number | null
  ciAmount: number | null
  ciDate: string | null
  ciMethod: 'ACH' | 'Zelle' | 'Check' | null
  ciReference: string | null
  ciRemark: string | null
  status: 'paid' | 'unpaid'
}

export interface SaveCiPayload {
  ciAmount: number | null
  ciDate: string | null
  ciMethod: 'ACH' | 'Zelle' | 'Check' | null
  ciReference: string | null
  ciRemark: string | null
  status: 'paid' | 'unpaid'
}

/** MySQL decimal 컬럼은 문자열로 내려오므로 숫자로 변환 */
function normalize(r: InvoiceEntryRecord): InvoiceEntryRecord {
  return {
    ...r,
    rpmInvoice: r.rpmInvoice != null ? Number(r.rpmInvoice) : null,
    ccmInvoice: r.ccmInvoice != null ? Number(r.ccmInvoice) : null,
    ciAmount:   r.ciAmount   != null ? Number(r.ciAmount)   : null,
  }
}

export function useInvoiceEntries(clinicDbId: string | undefined) {
  const [records, setRecords] = useState<InvoiceEntryRecord[]>([])
  const [loading, setLoading] = useState(false)

  // 클리닉이 바뀌면 전체 내역 재조회
  useEffect(() => {
    if (!clinicDbId) return
    let cancelled = false

    // setLoading을 .then() 콜백 안에서 호출해 effect 내 직접 setState 경고 회피
    Promise.resolve()
      .then(() => { if (!cancelled) setLoading(true) })
      .then(() => fetch(`${API_BASE}/invoice-entries/clinic/${clinicDbId}`))
      .then(r => r.json())
      .then((data: InvoiceEntryRecord[]) => {
        if (!cancelled) setRecords(data.map(normalize))
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [clinicDbId])

  /** Invoice 저장 (upsert) → POST /invoice-entries */
  const saveInvoice = useCallback(async (dto: {
    clinicId: string
    billingYear: number
    billingMonth: number
    rpmInvoice: number
    ccmInvoice: number
    rpmPts: number
    ccmPts: number
  }): Promise<InvoiceEntryRecord> => {
    const res = await fetch(`${API_BASE}/invoice-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    const saved = normalize(await res.json())
    setRecords(prev => {
      const idx = prev.findIndex(r => r.id === saved.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = saved
        return updated
      }
      // 새 항목은 최신순 맨 앞
      return [saved, ...prev]
    })
    return saved
  }, [])

  /** CI(입금) 저장 → PATCH /invoice-entries/:id/ci */
  const saveCi = useCallback(async (
    entryId: string,
    dto: SaveCiPayload,
  ): Promise<InvoiceEntryRecord> => {
    const res = await fetch(`${API_BASE}/invoice-entries/${entryId}/ci`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    const saved = normalize(await res.json())
    setRecords(prev => {
      const idx = prev.findIndex(r => r.id === saved.id)
      if (idx < 0) return prev
      const updated = [...prev]
      updated[idx] = saved
      return updated
    })
    return saved
  }, [])

  return { records, loading, saveInvoice, saveCi }
}
