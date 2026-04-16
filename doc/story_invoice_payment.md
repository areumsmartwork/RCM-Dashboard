# Story-Invoice
**Invoice 발행 · 수금 · 정산 · Revenue Split 관리**

| 항목 | 내용 |
|---|---|
| 문서 버전 | v1.0 |
| 작성일 | 2026-04-07 |
| 상태 | Frontend 개발 준비 |
| 연관 Story | Story-Billing (ERA/Denial), Story-ClinicSettings (Split 설정) |

---

## 1. 개요

클리닉별 월별 Invoice를 생성하고, 수금(Payment) 입력 및 정산(Settlement) 상태를 관리하는 화면.

### 핵심 업무 흐름

```
Invoice 입력 (RPM / CCM 분리)
    → 자동 계산 (Clinic share / Hicare share / Biller fee)
        → CI 입력 (ERA/EOB 확인 후 수기)
            → 수금 완료 / 미수금 관리
```

---

## 2. 화면 구성

총 3개 탭으로 구성된 단일 페이지.

| 탭 | 설명 |
|---|---|
| **Invoices** | 클리닉별 Invoice 목록, 상세, 상태 관리 |
| **Payments** | 수금 기록 및 신규 입력 |
| **EOB Upload & Matching** | EOB 파일 업로드 및 Claim 매칭 (2차) |

> EOB Upload & Matching 탭은 2차 개발. 1차에서는 탭 구조만 유지하고 "Coming soon" 처리.

---

## 3. 페이지 공통 요소

### 3.1 월 네비게이터 (상단 고정)

- `‹ March 2025 ›` 형태로 월 이동
- 선택된 월 기준으로 전체 탭 데이터 연동

### 3.2 Summary Cards

**Invoices 탭**

| 카드 | 표시 내용 |
|---|---|
| Total invoiced | 해당 월 전체 청구 합계 |
| Collected | 수금 완료 합계 |
| Outstanding | 미수금 합계 (빨간색 강조) |
| 수금 현황 | Settled / Paid / Partial / Unpaid 비율 바 차트 |

**Payments 탭**

| 카드 | 표시 내용 |
|---|---|
| Total received | 해당 월 수금 합계 |
| Pending collection | 미수금 합계 |
| Fully settled | 정산 완료 Invoice 건수 |

---

## 4. Invoices 탭

### 4.1 Invoice 목록 테이블

**컬럼 구성**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| Invoice ID | string | 고유 식별자 (INV-XXXX) |
| Clinic | string | 클리닉명 |
| Patients | number | 청구 환자 수 |
| Claims | number | CPT claim 건수 |
| Total billed | currency | 총 청구액 (RPM + CCM) |
| Invoice amt. | currency | 최종 인보이스 금액 |
| Paid | currency | 수금액 |
| Balance | currency | 미수금 (빨간색) |
| Status | badge | Unpaid / Partial / Paid / Settled / Reissue / Void |
| Due date | date | 납기일 |

**행 확장 (Expandable rows)**

- Invoice 행 클릭 → 환자별 소계 행(pt-row) 펼침
- 환자 행 클릭 → CPT 코드별 명세 행(cpt-row) 펼침
- 3단계 계층: Invoice → Patient → CPT

**필터 / 검색**

- Status 필터: All / Unpaid / Partial / Paid / Settled / Reissue / Void
- 텍스트 검색: 클리닉명 또는 Invoice ID

**액션 버튼**

- `+ Generate invoices` : 해당 월 전체 Invoice 일괄 생성

### 4.2 Invoice 상세 패널 (Side panel)

목록에서 Invoice 클릭 시 우측에 슬라이드 인.

**표시 항목**

```
Invoice info
├── Clinic
├── Period (billing month)
├── Patients count · CPT lines count
├── Total billed
├── Revenue split (Clinic X% / Hicare X%)
├── Invoice amount
├── Paid
├── Balance
├── Status (badge)
└── Due date

Patient breakdown (테이블)
├── Patient name
├── Medicare ID
├── CPT count
├── Billed
└── Ins. paid

Payment history
└── 수금일 · 방법 · Ref no. · 금액 목록
    + 신규 입력 폼 (Amount / Method / Ref no.)

Actions
├── Download invoice (PDF)
├── + Record payment
├── ✓ Mark as settled
└── ✕ Void invoice
```

**상태별 Notice 배너**

| 상태 | 배너 |
|---|---|
| Reissue | 주황색 점선 — "EOB 재발행으로 금액이 변경됐습니다." |
| Settled / Paid | 초록색 — "정산 완료 — 수금이 확인됐습니다." |

**상태별 Actions 변화**

| 상태 | 표시 액션 |
|---|---|
| Unpaid / Partial | Download PDF / Record payment / Mark as settled / Void |
| Reissue | Download updated PDF / Record payment / Mark as settled |
| Paid / Settled | Download PDF only |
| Void | 액션 없음 |

### 4.3 Invoice 상태 정의

| 상태 | 색상 | 조건 |
|---|---|---|
| Unpaid | Blue | payments 없음 |
| Partial | Amber | 0 < paid < invoice_amount |
| Paid | Green | paid = invoice_amount |
| Settled | Teal | Mark as settled 처리 완료 |
| Reissue | Amber (점선) | EOB 재발행으로 금액 변경 필요 |
| Void | Red | Void 처리됨 |

---

## 5. Payments 탭

### 5.1 수금 기록 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| Date | date | 수금일 |
| Invoice ID | string | 연결된 Invoice |
| Clinic | string | 클리닉명 |
| Method | string | ACH / Check / Zelle / Wire |
| Ref no. | string | 참조번호 |
| Amount | currency | 수금액 |
| Status | badge | Settled / Partial |
| Action | button | Settle 버튼 (미정산 시) |

**필터**

- 클리닉 선택
- 텍스트 검색 (클리닉명 / Ref no.)

### 5.2 신규 수금 입력 폼 (하단 고정)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| Invoice ID | text | 필수 | INV-XXXX 형식 |
| Amount | number | 필수 | 수금액 |
| Method | select | 필수 | ACH / Check / Zelle / Wire |
| Ref no. | text | 선택 | 참조번호 |

저장 시 → 해당 Invoice의 `paid` 업데이트 → status 자동 재계산

---

## 6. EOB Upload & Matching 탭 (2차)

> 1차에서는 탭만 존재하며 "Coming soon" 표시. 아래는 2차 개발 명세.

### 6.1 EOB 업로드

- 드래그앤드롭 또는 클릭 업로드 (PDF)
- Medicare ID 기준 자동 Claim 매칭
- 재발행(Reissued) 감지 시 기존 Invoice 자동 Void + 신규 생성

### 6.2 업로드 이력 테이블

| 컬럼 | 설명 |
|---|---|
| File name | 업로드 파일명 |
| Uploaded | 업로드일 |
| Matched | 매칭 건수 (N / Total) |
| Type | Original / Reissued |
| Status | Processing / Complete |

### 6.3 미매칭 수동 처리

| 컬럼 | 설명 |
|---|---|
| Medicare ID | 환자 식별자 |
| Patient | 환자명 |
| CPT | 코드 |
| Amount | 금액 |
| Match to claim | 드롭다운으로 Claim 선택 |
| Action | Match 버튼 |

---

## 7. 데이터 모델 (DB 연결 기준)

### 7.1 사용 테이블

| 테이블 | 용도 |
|---|---|
| `clinics` | 클리닉명, is_active |
| `invoices` | Invoice 기본 정보, status, split 비율 |
| `invoice_claims` | Invoice ↔ Claim 연결 |
| `claims` | 환자별 청구 내역, billing_month |
| `claim_cpt_lines` | CPT 코드별 billed / paid |
| `payments` | 수금 기록 (amount, method, ref) |
| `invoice_history` | 상태 변경 이력 (append-only) |
| `eob_files` | EOB 업로드 이력 (2차) |
| `era_matches` | EOB-Claim 매칭 결과 (2차) |

### 7.2 Invoice 상태 전이

```
[생성] → Unpaid
Unpaid  → Partial   : 부분 payment 입력
Unpaid  → Paid      : 전액 payment 입력
Partial → Paid      : 잔액 payment 입력
Paid    → Settled   : Mark as settled 액션
Any     → Reissue   : EOB 재발행 감지 (2차)
Any     → Void      : Void 액션 (Settled 제외)
Void    → (종료)
```

### 7.3 자동 계산 (조회 시)

| 필드 | 계산식 |
|---|---|
| Balance | invoice_amount − SUM(payments.amount) |
| Clinic share | total_billed × split_clinic_pct / 100 |
| Hicare share | total_billed × split_hicare_pct / 100 − biller_fee |
| Biller fee | total_billed × % 또는 고정금액 (clinic settings 기준) |
| Status | payments 합계 기준 자동 판단 |

---

## 8. Acceptance Criteria

### Invoice 목록

- [ ] 월 선택 시 해당 월 Invoice만 표시
- [ ] Status 필터 및 텍스트 검색 동작
- [ ] Invoice → Patient → CPT 3단계 확장 동작
- [ ] Void Invoice는 행 흐리게 표시 (opacity 0.5)
- [ ] Summary Cards 수치가 목록 데이터와 일치

### Invoice 상세 패널

- [ ] Invoice 클릭 시 패널 슬라이드 인
- [ ] 패널 닫기 (✕) 동작
- [ ] 상태별 Notice 배너 표시
- [ ] 상태별 Actions 버튼 표시/숨김 정확히 동작
- [ ] Record payment 입력 시 Balance 즉시 업데이트
- [ ] Mark as settled → Status: Settled, Actions 변경
- [ ] Void → 행 흐리게, 패널 Actions 제거
- [ ] invoice_history에 변경 이력 저장 (append-only)

### Payments 탭

- [ ] 수금 기록 목록 표시
- [ ] 신규 수금 입력 시 해당 Invoice Balance 업데이트
- [ ] Settle 버튼 → Invoice status: Settled
- [ ] 클리닉 필터 / 검색 동작

### Revenue split 계산

- [ ] 클리닉 설정(Story-ClinicSettings)의 RPM/CCM split 비율 자동 적용
- [ ] Biller fee (비율 또는 고정금액) 자동 적용
- [ ] 비율 변경 이력(revenue_split_history) 기준으로 해당 월 비율 적용

---

## 9. 미확인 사항 (개발 착수 전 확인 필요)

| # | 항목 | 내용 |
|---|---|---|
| 1 | Invoice 자동 생성 트리거 | `+ Generate invoices` 버튼 클릭 시 해당 월 claims 기준 자동 생성인지, 수동 입력인지 |
| 2 | PDF 생성 방식 | 서버사이드 PDF 생성 라이브러리 결정 필요 (예: Puppeteer, WeasyPrint) |
| 3 | Reissue 감지 로직 | EOB 재발행 자동 감지 조건 정의 (2차 개발 시 확정) |
| 4 | Invoice per Pt 표시 | 목록 또는 상세 패널에 invoice per pt 지표 표시 여부 |
| 5 | Void 권한 | Void 액션을 admin 전용으로 제한할지 여부 |

---

## 10. 디자인 토큰 (기존 화면과 동일)

```css
--font-sans: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", "Fira Code", monospace;
--color-text-primary: #1a1918;
--color-text-secondary: #5f5e5a;
--color-text-tertiary: #9e9c97;
--color-background-primary: #ffffff;
--color-background-secondary: #fdfcf8;
--color-border-secondary: #ddd6c5;
--color-border-tertiary: #ede8db;
--border-radius-md: 6px;
--border-radius-lg: 10px;
```

**Status badge 색상**

| Status | Background | Text |
|---|---|---|
| Unpaid | #E6F1FB | #0C447C |
| Partial | #FAEEDA | #633806 |
| Paid | #EAF3DE | #27500A |
| Settled | #E1F5EE | #085041 |
| Reissue | #FAEEDA + dashed border | #633806 |
| Void | #FCEBEB | #791F1F |

---

*본 문서는 frontend 개발 착수 전 확인 사항을 포함한 명세서입니다. 미확인 사항은 개발 착수 전 확정이 필요합니다.*