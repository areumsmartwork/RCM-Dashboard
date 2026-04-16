import { useState, useEffect } from 'react'
import type { BillingClinic } from '../pages/billing/data'

const API_BASE = '/api'

interface SplitRecord {
  serviceType: 'RPM' | 'CCM' | 'BHI' | 'PCM'
  clinicPct:   number
  hicarePct:   number
  effectiveFrom: string
}

interface FeeRecord {
  feeType:     'pct' | 'fixed'
  feeValue:    number
  effectiveFrom: string
}

export type BillingSettings = Pick<BillingClinic, 'rpmSplit' | 'ccmSplit' | 'billerFeeType' | 'billerFeeVal'>

/**
 * 선택된 클리닉의 현재 Revenue Split, Biller Fee를 DB에서 조회
 * dbId가 없으면 null 반환 (mock 데이터 fallback)
 */
export function useBillingSettings(clinicDbId: string | undefined): BillingSettings | null {
  const [settings, setSettings] = useState<BillingSettings | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.resolve(clinicDbId)
      .then(id => {
        // dbId 없으면 null로 리셋
        if (!id) { if (!cancelled) setSettings(null); return }

        return Promise.all([
          fetch(`${API_BASE}/clinics/${id}/revenue-split`).then(r => r.json()),
          fetch(`${API_BASE}/clinics/${id}/biller-fee`).then(r => r.json()),
        ]).then(([splits, fees]: [SplitRecord[], FeeRecord[]]) => {
          if (cancelled) return

          const rpm = splits.find(s => s.serviceType === 'RPM')
          const ccm = splits.find(s => s.serviceType === 'CCM')
          const fee = fees[0]

          if (!rpm && !ccm && !fee) return  // DB에 데이터 없으면 mock 유지

          setSettings({
            rpmSplit:      rpm ? [Number(rpm.clinicPct), Number(rpm.hicarePct)] : [50, 50],
            ccmSplit:      ccm ? [Number(ccm.clinicPct), Number(ccm.hicarePct)] : [50, 50],
            billerFeeType: fee?.feeType ?? 'pct',
            billerFeeVal:  fee ? Math.abs(Number(fee.feeValue)) : 0,
          })
        })
      })
      .catch(console.error)

    return () => { cancelled = true }
  }, [clinicDbId])

  return settings
}
