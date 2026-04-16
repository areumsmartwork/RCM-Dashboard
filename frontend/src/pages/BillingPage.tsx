import { useState } from 'react'
import { Badge }             from '../components/ui'
import { NavTabs }           from '../components/ui/NavTabs'
import { ClinicListPanel }   from '../components/shared/ClinicListPanel'
import { InvoiceEntryTab }   from './billing/InvoiceEntryTab'
import { EntryHistoryTab }   from './billing/EntryHistoryTab'
import { useBillingClinics } from '../hooks/useBillingClinics'
import { useInvoiceEntries } from '../hooks/useInvoiceEntries'
import { useBillingSettings } from '../hooks/useBillingSettings'
import type { SaveCiPayload } from '../hooks/useInvoiceEntries'

const TABS = [
  { key:'invoice', label:'Invoice entry' },
  { key:'history', label:'Entry history' },
]

export function BillingPage() {
  const { clinics } = useBillingClinics()
  const [activeId,  setActiveId]  = useState(clinics[0].id)
  const [activeTab, setActiveTab] = useState('invoice')

  const clinic = clinics.find(c => c.id === activeId) ?? clinics[0]

  // DB에서 현재 split 비율 / biller fee 조회 → mock 데이터 override
  const dbSettings = useBillingSettings(clinic.dbId)
  const effectiveClinic = dbSettings ? { ...clinic, ...dbSettings } : clinic

  // 선택된 클리닉의 DB UUID로 invoice 내역 관리
  const { records, loading, saveInvoice, saveCi } = useInvoiceEntries(clinic.dbId)

  /** Invoice 저장 */
  async function handleSaveInvoice(
    year: number, month: number,
    data: { rpmInvoice: number; ccmInvoice: number; rpmPts: number; ccmPts: number },
  ) {
    if (!clinic.dbId) return
    await saveInvoice({ clinicId: clinic.dbId, billingYear: year, billingMonth: month, ...data })
  }

  /** CI(입금) 저장 — invoice가 없으면 먼저 생성(upsert) 후 CI 저장 */
  async function handleSaveCi(year: number, month: number, ci: SaveCiPayload) {
    if (!clinic.dbId) return
    let entry = records.find(r => r.billingYear === year && r.billingMonth === month)
    if (!entry) {
      entry = await saveInvoice({
        clinicId: clinic.dbId, billingYear: year, billingMonth: month,
        rpmInvoice: 0, ccmInvoice: 0, rpmPts: 0, ccmPts: 0,
      })
    }
    await saveCi(entry.id, ci)
  }

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

      {/* Left — 클리닉 목록 */}
      <ClinicListPanel
        activeId={activeId}
        onSelect={id => { setActiveId(id); setActiveTab('invoice') }}
      />

      {/* Right — main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-page-bg">

        {/* Clinic header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-medium text-slate-800">{clinic.name}</h2>
            {clinic.services.map(s => (
              <Badge key={s} variant={s === 'RPM' ? 'rpm' : 'ccm'}>{s}</Badge>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <NavTabs
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          className="px-6 mt-4"
        />

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'invoice' && (
            <InvoiceEntryTab
              clinic={effectiveClinic}
              records={records}
              onSaveInvoice={handleSaveInvoice}
              onSaveCi={handleSaveCi}
            />
          )}
          {activeTab === 'history' && (
            <EntryHistoryTab
              clinic={effectiveClinic}
              records={records}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
