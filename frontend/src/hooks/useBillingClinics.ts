import { useState, useEffect } from 'react'
import { BILLING_CLINICS } from '../pages/billing/data'
import type { BillingClinic } from '../pages/billing/data'

const API_BASE = '/api'

interface ApiClinic { id: string; code: string }

// ── useBillingClinics ────────────────────────────────────────
// GET /api/clinics 로 DB UUID(dbId)를 가져와 목 데이터와 병합

export function useBillingClinics() {
  const [clinics, setClinics] = useState<BillingClinic[]>(BILLING_CLINICS)

  useEffect(() => {
    fetch(`${API_BASE}/clinics`)
      .then(r => r.json())
      .then((apiClinics: ApiClinic[]) => {
        setClinics(prev =>
          prev.map(c => {
            const match = apiClinics.find(a => a.code === c.code)
            return match ? { ...c, dbId: match.id } : c
          }),
        )
      })
      .catch(console.error)
  }, [])

  return { clinics, loading: false, error: null }
}

export function useBillingClinic(id: number) {
  const { clinics } = useBillingClinics()
  const clinic = clinics.find(c => c.id === id) ?? clinics[0]
  return { clinic, loading: false, error: null }
}

export type { BillingClinic }
