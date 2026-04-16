/**
 * RCM Dashboard — API 진단 스크립트
 *
 * 실행: node scripts/diagnose.mjs
 * (Node 18+ 필요, 백엔드가 localhost:3001 에서 실행 중이어야 함)
 *
 * 검사 항목:
 *  [1] 백엔드 서버 연결
 *  [2] GET /api/clinics  → dbId 획득
 *  [3] GET /api/invoice-entries/clinic/:id  → seed 데이터 확인
 *  [4] GET /api/clinics/:id/revenue-split   → split 설정 확인
 *  [5] GET /api/clinics/:id/biller-fee      → fee 설정 확인
 *  [6] POST /api/invoice-entries            → 신규 저장
 *  [7] PATCH /api/invoice-entries/:id/ci   → CI 저장
 */

const BASE = 'http://localhost:3001/api'
const CLINIC_CODE = 'SDW'   // seed 데이터의 첫 번째 클리닉

// ── 색상 출력 ────────────────────────────────────────────────
const ok   = s => `\x1b[32m✔ ${s}\x1b[0m`
const fail = s => `\x1b[31m✘ ${s}\x1b[0m`
const info = s => `\x1b[36m  ${s}\x1b[0m`
const head = s => `\n\x1b[1m[${s}]\x1b[0m`

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status} — ${text}`)
  }
  return res.json()
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status} — ${text}`)
  }
  return res.json()
}

async function run() {
  console.log('\n=== RCM Dashboard API 진단 ===')

  // ── [1] 서버 연결 ───────────────────────────────────────────
  console.log(head('1/7 백엔드 서버 연결'))
  let clinics
  try {
    clinics = await get('/clinics')
    console.log(ok(`연결 성공 — 클리닉 ${clinics.length}개`))
  } catch (e) {
    console.log(fail(`백엔드 연결 실패: ${e.message}`))
    console.log(info('백엔드를 시작하세요: cd backend && npm run start:dev'))
    process.exit(1)
  }

  // ── [2] clinic.dbId (UUID) 획득 ────────────────────────────
  console.log(head(`2/7 클리닉 UUID 획득 (code: ${CLINIC_CODE})`))
  const clinic = clinics.find(c => c.code === CLINIC_CODE)
  if (!clinic) {
    console.log(fail(`code="${CLINIC_CODE}" 클리닉 없음`))
    console.log(info(`존재하는 code: ${clinics.map(c => c.code).join(', ')}`))
    process.exit(1)
  }
  console.log(ok(`UUID: ${clinic.id}`))
  console.log(info(`name: ${clinic.name}`))
  console.log(info(`serviceTypes: ${JSON.stringify(clinic.serviceTypes)}`))
  const dbId = clinic.id

  // ── [3] invoice-entries seed 확인 ──────────────────────────
  console.log(head('3/7 invoice-entries (seed 데이터)'))
  let entries
  try {
    entries = await get(`/invoice-entries/clinic/${dbId}`)
    if (entries.length === 0) {
      console.log(fail('invoice_entries 테이블에 데이터 없음 (seed가 실행되지 않았을 수 있음)'))
    } else {
      console.log(ok(`${entries.length}개 레코드 발견`))
      entries.forEach(e => {
        console.log(info(
          `${e.billingYear}-${String(e.billingMonth).padStart(2,'0')}` +
          `  rpm=${e.rpmInvoice}  ccm=${e.ccmInvoice}` +
          `  ci=${e.ciAmount ?? '-'}  status=${e.status}`
        ))
      })
    }
  } catch (e) {
    console.log(fail(`invoice-entries 조회 실패: ${e.message}`))
  }

  // ── [4] revenue-split 설정 ─────────────────────────────────
  console.log(head('4/7 revenue-split 설정'))
  try {
    const splits = await get(`/clinics/${dbId}/revenue-split`)
    if (splits.length === 0) {
      console.log(fail('revenue_split_history 테이블에 데이터 없음'))
    } else {
      splits.forEach(s =>
        console.log(ok(`${s.serviceType}: clinic=${s.clinicPct}% hicare=${s.hicarePct}% (from ${s.effectiveFrom})`))
      )
    }
  } catch (e) {
    console.log(fail(`revenue-split 조회 실패: ${e.message}`))
  }

  // ── [5] biller-fee 설정 ────────────────────────────────────
  console.log(head('5/7 biller-fee 설정'))
  try {
    const fees = await get(`/clinics/${dbId}/biller-fee`)
    if (fees.length === 0) {
      console.log(fail('biller_fee_history 테이블에 데이터 없음'))
    } else {
      const f = fees[0]
      console.log(ok(`현재 fee: type=${f.feeType}  value=${f.feeValue}  from=${f.effectiveFrom}`))
    }
  } catch (e) {
    console.log(fail(`biller-fee 조회 실패: ${e.message}`))
  }

  // ── [6] invoice 저장 테스트 ────────────────────────────────
  console.log(head('6/7 invoice 저장 (POST)'))
  const testYear  = new Date().getFullYear()
  const testMonth = new Date().getMonth() + 1
  let savedEntry
  try {
    savedEntry = await post('/invoice-entries', {
      clinicId:     dbId,
      billingYear:  testYear,
      billingMonth: testMonth,
      rpmInvoice:   9999,
      ccmInvoice:   8888,
      rpmPts:       10,
      ccmPts:       20,
    })
    console.log(ok(`저장 성공 — id: ${savedEntry.id}`))
    console.log(info(`rpmInvoice=${savedEntry.rpmInvoice}  ccmInvoice=${savedEntry.ccmInvoice}`))
  } catch (e) {
    console.log(fail(`invoice 저장 실패: ${e.message}`))
  }

  // ── [7] CI 저장 테스트 ─────────────────────────────────────
  console.log(head('7/7 CI 저장 (PATCH)'))
  if (!savedEntry) {
    console.log(fail('invoice 저장 실패로 CI 테스트 건너뜀'))
  } else {
    try {
      const patched = await patch(`/invoice-entries/${savedEntry.id}/ci`, {
        ciAmount:    12345,
        ciDate:      `${testYear}-${String(testMonth).padStart(2,'0')}-01`,
        ciMethod:    'ACH',
        ciReference: 'TEST-REF-001',
        ciRemark:    '진단 스크립트 테스트',
        status:      'paid',
      })
      console.log(ok(`CI 저장 성공`))
      console.log(info(`ciAmount=${patched.ciAmount}  status=${patched.status}`))
    } catch (e) {
      console.log(fail(`CI 저장 실패: ${e.message}`))
    }
  }

  // ── 요약 ───────────────────────────────────────────────────
  console.log('\n=== 진단 완료 ===\n')
  console.log('프론트엔드 확인 사항:')
  console.log(info('1. useBillingClinics → API 호출해서 clinic.dbId 설정되는지'))
  console.log(info('2. useInvoiceEntries → dbId 받아서 entries fetch 되는지'))
  console.log(info('3. InvoiceEntryTab → currentEntry 있으면 폼 자동 채워지는지'))
}

run().catch(e => {
  console.error(fail(`예상치 못한 오류: ${e.message}`))
  process.exit(1)
})
