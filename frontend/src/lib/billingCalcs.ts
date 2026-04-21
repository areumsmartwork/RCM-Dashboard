import type { BillingClinic } from '../pages/billing/data'

// CalcRow / TotalRow are internal to this module.
// Components (CalcBox, TotalCard) define their own structurally-compatible types.
// TypeScript's structural typing ensures compatibility without a shared import.
interface CalcRow  { label: string; value: string; color?: string; separator?: boolean }
interface TotalRow { label: string; value: string; color?: string; bold?: boolean }

export interface BillingCalcs {
  rpm:              number
  ccm:              number
  total:            number
  fee:              number
  feeLabel:         string
  rClinic:          number
  rHicare:          number
  cClinic:          number
  cHicare:          number
  rpmCalcRows:      CalcRow[]
  ccmCalcRows:      CalcRow[]
  invoiceTotalRows: TotalRow[]
  infoText:         string
}

export const fmtMoney = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US')

export function calcBilling(
  clinic:     BillingClinic,
  rpmInvoice: string,
  ccmInvoice: string,
): BillingCalcs {
  const rpm   = parseFloat(rpmInvoice) || 0
  const ccm   = parseFloat(ccmInvoice) || 0
  const total = rpm + ccm
  const fee   = clinic.billerFeeType === 'pct'
    ? total * (clinic.billerFeeVal / 100)
    : clinic.billerFeeVal
  const feeLabel = clinic.billerFeeType === 'pct'
    ? `${clinic.billerFeeVal}% of total`
    : `Fixed $${clinic.billerFeeVal}`

  const rClinic = rpm * (clinic.rpmSplit[0] / 100)
  const rHicare = rpm * (clinic.rpmSplit[1] / 100)
  const cClinic = ccm * (clinic.ccmSplit[0] / 100)
  const cHicare = ccm * (clinic.ccmSplit[1] / 100)

  const rpmCalcRows: CalcRow[] = clinic.services.includes('RPM') && rpm > 0 ? [
    { label: 'Clinic share', value: fmtMoney(rClinic) },
    { label: 'Hicare share', value: fmtMoney(rHicare) },
  ] : []

  const ccmCalcRows: CalcRow[] = clinic.services.includes('CCM') && ccm > 0 ? [
    { label: 'Clinic share', value: fmtMoney(cClinic) },
    { label: 'Hicare share', value: fmtMoney(cHicare) },
  ] : []

  const invoiceTotalRows: TotalRow[] = total > 0 ? [
    { label: 'Total invoice',            value: fmtMoney(total),                   color: 'text-[#0C447C]' },
    { label: 'Total clinic amount',      value: fmtMoney(rClinic + cClinic) },
    { label: `Biller fee (${feeLabel})`, value: `− ${fmtMoney(fee)}`,              color: 'text-[#791F1F]' },
    { label: 'Total Hicare amount',      value: fmtMoney(rHicare + cHicare - fee), bold: true },
  ] : []

  const infoText = [
    'Split ratios from clinic settings',
    `RPM ${clinic.rpmSplit[0]}/${clinic.rpmSplit[1]}`,
    `CCM ${clinic.ccmSplit[0]}/${clinic.ccmSplit[1]}`,
    clinic.billerFeeType === 'pct'
      ? `Biller fee ${clinic.billerFeeVal}%`
      : `Biller fee $${clinic.billerFeeVal} fixed`,
  ].join(' · ')

  return {
    rpm, ccm, total, fee, feeLabel,
    rClinic, rHicare, cClinic, cHicare,
    rpmCalcRows, ccmCalcRows, invoiceTotalRows, infoText,
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function offsetMonth(offset: number): { year: number; month: number; label: string } {
  const now   = new Date()
  const d     = new Date(now.getFullYear(), now.getMonth() + offset)
  const year  = d.getFullYear()
  const month = d.getMonth() + 1
  return { year, month, label: MONTHS[month - 1] + ' ' + year }
}
