# Story-ClinicSettings
**클리닉 설정 및 데이터 동기화 관리**

| 항목 | 내용 |
|---|---|
| 문서 버전 | v1.2 |
| 작성일 | 2026-04-07 |
| 최종 수정 | 2026-04-13 |
| 상태 | Frontend 개발 준비 |
| 연관 Story | Story-Invoice (split 비율 참조), Story-Billing (클리닉 마스터 참조) |

> **v1.2 변경사항**
> - Basic Information: 외부 sync로만 데이터 수신, UI에서 read-only 표시. 사용자 입력/수정 불가.
> - Add clinic 버튼 제거 — 클리닉은 외부 sync로만 추가됨
> - 신규 클리닉 추가 플로우 제거
>
> **v1.1 변경사항**
> - Clinic code: 대문자 3자리 고정 확정
> - Biller Fee: 별도 테이블(`biller_fee_history`) 분리, 마이너스 값 허용 (회사 부담 케이스)
> - BHI / PCM: 현재 미사용, 확장 가능한 구조로만 유지
> - 클리닉 정렬: 외부 sync 순서값 + 사용자 드래그앤드롭 변경 가능
> - 데이터 동기화: 자동 스케줄 없음, Sync 버튼으로만 수동 실행

---

## 1. 개요

클리닉별 기본 정보, 서비스 타입, CMS-1500 청구 정보, Revenue Split 비율, Biller Fee, EMR 바로가기를 통합 관리하는 설정 화면.

Story-Invoice의 수금 계산과 Story-Billing의 청구 처리가 이 화면의 설정값을 기준으로 동작한다.

### 핵심 원칙

- **Basic Information은 read-only** — 외부 sync로만 데이터 수신, UI에서 수정 불가
- **클리닉 추가/삭제 없음** — 클리닉 목록은 외부 sync로만 관리
- Revenue Split 비율 변경 시 **이력 보존** — 과거 월 빌링에 소급 적용되지 않음
- Biller Fee 변경 시 **이력 보존** — 별도 테이블로 분리 관리
- 클리닉 비활성화(Deactivate) 시 **기존 데이터 삭제 불가** — is_active = false 처리
- 데이터 동기화는 **Sync 버튼으로만** 수동 실행 — 자동 스케줄 없음

---

## 2. 화면 구성

좌우 2열 레이아웃.

| 영역 | 설명 |
|---|---|
| **Left sidebar (240px)** | 클리닉 목록, 검색, Sync 버튼 |
| **Main panel** | 선택된 클리닉의 설정 섹션들 |

---

## 3. Left Sidebar

### 3.1 클리닉 목록

- 클리닉명 + 클리닉 코드 + State + Service type 표시
- 클릭 시 Main panel에 해당 클리닉 설정 로드
- 활성 클리닉: 파란색 배경 + 우측 border accent
- 비활성 클리닉: 흐리게 표시 (opacity 0.5) + `Inactive` 뱃지

**정렬 방식**

- 기본 정렬: 외부 sync 시 수신되는 `sort_order` 값 기준
- 사용자가 사이드바에서 드래그앤드롭으로 순서 변경 가능
- 변경 즉시 해당 클리닉의 `sort_order` 업데이트

### 3.2 검색

- 클리닉명 또는 클리닉 코드(3자리)로 실시간 필터링

### 3.3 Sync 버튼

- 사이드바 상단 또는 하단 배치
- 클릭 시 외부 API 호출 → 클리닉 목록 및 상세 정보 갱신
- 마지막 sync 시각 표시: `Last synced: 2025-03-10 14:32`
- Sync 진행 중 로딩 인디케이터 표시
- 자동 스케줄 없음 — 버튼 클릭으로만 실행

### 3.4 클리닉 목록 관리

- 클리닉 추가 / 삭제는 UI에서 불가
- 외부 sync를 통해서만 클리닉 목록 갱신
- 비활성화(Deactivate)만 허용

---

## 4. Main Panel — 설정 섹션

### 4.1 Basic Information

**read-only 표시 전용** — 외부 sync 시 수신된 데이터를 그대로 표시. UI에서 수정 불가.

| 필드 | 타입 | 설명 |
|---|---|---|
| Clinic name | text (read-only) | 클리닉 공식명 |
| Clinic code | text (read-only) | 대문자 3자리 고정 (SDW, JCM 등) |
| Contact name | text (read-only) | 담당자명 |
| Phone | text (read-only) | 연락처 |
| Timezone | text (read-only) | 타임존 |
| State | text (read-only) | 주 코드 |
| Address | text (read-only) | 클리닉 주소 |

> 모든 필드는 입력 불가 상태로 표시. 데이터 변경이 필요한 경우 Sync 버튼으로 외부 데이터를 갱신하도록 안내.

### 4.2 Service Type

RPM / CCM / BHI / PCM 중 복수 선택 가능 (pill 토글 방식).

| 서비스 | 상태 | 설명 |
|---|---|---|
| RPM | 사용 중 | Remote Patient Monitoring |
| CCM | 사용 중 | Chronic Care Management |
| BHI | 확장 예정 | Behavioral Health Integration — 현재 Revenue Split 미생성 |
| PCM | 확장 예정 | Principal Care Management — 현재 Revenue Split 미생성 |

- RPM / CCM 선택 시 Revenue Split 테이블에 행 생성
- BHI / PCM 선택 시 service_types에 저장되나 Revenue Split 행 미생성 (확장 구조 유지)
- 선택된 서비스만 Story-Invoice의 Invoice 입력 필드 활성화
- 서비스 비활성화 시 해당 서비스의 기존 데이터는 보존

### 4.3 CMS-1500 Billing Info

클리닉 공통 청구 정보. CMS-1500 양식에 자동으로 채워지는 값.

| 필드 | CMS-1500 Box | 타입 | 설명 |
|---|---|---|---|
| Federal Tax ID (EIN) | Box 25 | text (mono) | 사업자 세금 식별번호 (XX-XXXXXXX) |
| Billing Provider NPI | Box 33a | text (mono) | 10자리 National Provider Identifier |
| Taxonomy Code | Box 33b | text (mono) | 10자리 Provider specialty code |
| Place of Service (POS) | Box 24B | select | 11-Office / 12-Home / 02-Telehealth / 10-Telehealth(home) |
| Accept Assignment | Box 27 | toggle | Medicare 청구 시 Yes 권장 |

> RPM/CCM은 POS 11 또는 02가 일반적. hint 텍스트로 안내.

### 4.4 Revenue Split (Clinic : Hicare)

서비스 타입별 병원/Hicare 수익 분배 비율 설정. 현재 RPM / CCM만 운영.

**테이블 구성**

| 컬럼 | 설명 |
|---|---|
| Service | RPM / CCM (선택된 서비스 중 운영 중인 것만 표시) |
| Ratio | Clinic : Hicare 비율 입력 (숫자 입력, 합산 자동 계산) |
| Split | 비율 뱃지 자동 표시 (Clinic X% / Hicare X%) |
| Effective from | 이 비율이 적용되는 시작 월 (YYYY-MM) |
| Last saved | 마지막 저장일 |

**비율 입력 방식**

- Clinic : Hicare = 6 : 4 입력 → Clinic 60% / Hicare 40% 자동 계산
- 입력값 변경 시 Split 뱃지 실시간 업데이트

**이력 관리 규칙**

- 비율 변경 저장 시 기존 비율은 `revenue_split_history`에 보존 (append-only)
- 변경 전 비율은 해당 월까지 유효 → 이전 Invoice에 소급 적용되지 않음
- `View history` 버튼 → 변경 이력 목록 표시 (날짜 / 이전 비율 / 변경 후 비율)

```
예시:
2025-01 ~ 2025-02: Clinic 50% / Hicare 50%  ← 이전 이력
2025-03 ~        : Clinic 60% / Hicare 40%  ← 현재 적용
```

### 4.5 Biller Fee

청구 총액에서 차감되는 Biller 수수료. Hicare 수령액에서 차감.
회사가 부담해야 하는 경우 **마이너스 값** 입력 가능.

| 필드 | 타입 | 설명 |
|---|---|---|
| Fee type | select | Percentage (%) 또는 Fixed amount ($) |
| Fee value | number | 양수: Hicare에서 차감 / 음수: Hicare에 추가 (회사 부담) |
| Effective from | date | 이 요율이 적용되는 시작 월 |
| Note | text | 마이너스 적용 사유 등 비고 |

**계산 적용**

```
Fee type = Percentage:  Biller fee = Total invoice × fee%
Fee type = Fixed:       Biller fee = 고정금액 (월별 동일)

fee_value > 0:  Hicare 실수령 = Hicare share − Biller fee   (수수료 차감)
fee_value < 0:  Hicare 실수령 = Hicare share + |Biller fee| (회사 부담 추가)
```

- Biller Fee는 `biller_fee_history` 별도 테이블로 관리 (Revenue Split과 분리)
- 변경 이력 보존 (append-only)
- `View history` 버튼으로 이력 조회

### 4.6 EMR Access

클리닉별 EMR 시스템 바로가기 링크 관리.

| 컬럼 | 설명 |
|---|---|
| EMR name | AthenaHealth / Epic MyChart 등 이름 |
| URL | 바로가기 URL (monospace 폰트) |
| ↗ Open | 새 탭으로 열기 |
| ✕ | 해당 EMR 행 삭제 |

- 신규 추가: EMR name + URL 입력 후 `+ Add EMR`
- 로그인 연동 없음 — URL 이동만 제공

---

## 5. 클리닉 데이터 관리 플로우

### 5.1 클리닉 추가 (Sync로만 가능)

```
Sync 버튼 클릭
    → 외부 API 호출
        → 신규 클리닉 감지 시 clinics INSERT
            → sort_order 외부 수신값으로 설정
                → 사이드바 목록 자동 갱신
```

### 5.2 클리닉 정보 변경 (Sync로만 가능)

```
Sync 버튼 클릭
    → 외부 API 호출
        → 기존 클리닉 정보 변경 감지 시 clinics UPDATE
            → Basic Information 표시 자동 갱신
```

### 5.3 사용자가 직접 설정 가능한 항목

Basic Information을 제외하고 아래 항목만 UI에서 직접 수정 가능.

| 항목 | 수정 방법 |
|---|---|
| Service type | pill 토글 선택 |
| CMS-1500 정보 | 필드 직접 입력 |
| Revenue Split 비율 | 비율 입력 후 저장 |
| Biller Fee | 금액/비율 입력 후 저장 |
| EMR 링크 | 추가 / 삭제 |
| 클리닉 정렬 순서 | 드래그앤드롭 |

---

## 6. 클리닉 비활성화

`Deactivate clinic` 버튼 (설정 하단 위치).

- `clinics.is_active = false` 처리
- 사이드바에서 흐리게 표시 / 기본 목록에서 제외 가능 (필터 토글)
- 기존 Invoice / Payment / Billing 데이터 전부 보존
- Story-Invoice, Story-Billing에서 해당 클리닉 신규 입력 불가

> 삭제(DELETE) 기능 없음. 비활성화만 허용.

---

## 7. 데이터 동기화

### 7.1 동작 방식

- **수동 전용** — 자동 스케줄 없음
- Sync 버튼 클릭 시 외부 API 호출
- 수신 데이터: Clinic list + 상세 정보 + `sort_order` 값

### 7.2 Sync 처리 규칙

| 케이스 | 처리 |
|---|---|
| 신규 클리닉 | INSERT |
| 기존 클리닉 정보 변경 | UPDATE |
| 외부에서 삭제된 클리닉 | `is_active = false` (데이터 보존) |
| sort_order 변경 | UPDATE (사용자 수동 변경이 없었을 경우만 덮어쓰기) |

### 7.3 UI

- 사이드바에 `↺ Sync` 버튼 배치
- Sync 완료 후 `Last synced: YYYY-MM-DD HH:mm` 표시
- 실패 시 에러 메시지 표시

---

## 8. 데이터 모델 (DB 연결 기준)

### 8.1 사용 테이블

| 테이블 | 용도 |
|---|---|
| `clinics` | 클리닉 기본 정보, CMS-1500 정보, service_types, emr_links, 정렬 순서 |
| `revenue_split_history` | 서비스별 비율 변경 이력 (append-only) |
| `biller_fee_history` | Biller Fee 변경 이력 (append-only, 마이너스 허용) |

### 8.2 clinics 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | 클리닉 식별자 |
| name | varchar | 클리닉명 |
| code | varchar(3) UNIQUE | 대문자 3자리 고정, 변경 불가 |
| state | varchar(2) | 주 코드 |
| timezone | varchar | 타임존 |
| phone | varchar | 연락처 |
| address | text | 주소 |
| contact_name | varchar | 담당자명 |
| ein | varchar | Federal Tax ID (CMS-1500 Box 25) |
| npi | varchar | Billing Provider NPI (CMS-1500 Box 33a) |
| taxonomy_code | varchar | Taxonomy Code (CMS-1500 Box 33b) |
| pos_code | varchar(2) | Place of Service (CMS-1500 Box 24B) |
| accept_assignment | boolean | Accept Assignment (CMS-1500 Box 27) |
| service_types | varchar[] | ['RPM','CCM','BHI','PCM'] 등 |
| emr_links | jsonb | [{name, url}, ...] |
| sort_order | integer | 정렬 순서 (sync 수신값 / 사용자 변경 가능) |
| is_active | boolean | 활성 여부 |
| last_synced_at | timestamp | 마지막 sync 시각 |
| created_at | timestamp | 등록일 |

### 8.3 revenue_split_history 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| clinic_id | uuid FK | clinics 참조 |
| service_type | varchar | 'RPM' / 'CCM' / 'BHI' / 'PCM' (확장 가능) |
| clinic_pct | numeric(5,2) | 병원 수령 비율 |
| hicare_pct | numeric(5,2) | Hicare 수령 비율 |
| effective_from | date | 적용 시작월 (YYYY-MM-01) |
| changed_by | varchar | 변경자 |
| changed_at | timestamp | 변경일시 |

### 8.4 biller_fee_history 테이블 (신규)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| clinic_id | uuid FK | clinics 참조 |
| fee_type | varchar | 'pct' 또는 'fixed' |
| fee_value | numeric(8,2) | 양수: 차감 / 음수: 회사 부담 추가 |
| effective_from | date | 적용 시작월 (YYYY-MM-01) |
| note | text | 마이너스 적용 사유 등 비고 |
| changed_by | varchar | 변경자 |
| changed_at | timestamp | 변경일시 |

### 8.5 비율 조회 로직

**Revenue Split 조회**

```sql
SELECT clinic_pct, hicare_pct
FROM revenue_split_history
WHERE clinic_id = :clinic_id
  AND service_type = :service_type
  AND effective_from <= :billing_month
ORDER BY effective_from DESC
LIMIT 1
```

**Biller Fee 조회**

```sql
SELECT fee_type, fee_value
FROM biller_fee_history
WHERE clinic_id = :clinic_id
  AND effective_from <= :billing_month
ORDER BY effective_from DESC
LIMIT 1
```

**Biller Fee 계산**

```sql
-- fee_value 양수: 차감 / 음수: 추가 (모두 동일 공식으로 처리)
biller_fee = CASE
  WHEN fee_type = 'pct'   THEN total_invoice * fee_value / 100
  WHEN fee_type = 'fixed' THEN fee_value
END

hicare_실수령 = hicare_share - biller_fee
-- fee_value < 0 이면 biller_fee도 음수 → 결과적으로 hicare_share에 더해짐
```

---

## 9. Acceptance Criteria

### 클리닉 목록

- [ ] 클리닉명 / 코드 검색 실시간 필터링
- [ ] 활성 / 비활성 클리닉 시각적 구분
- [ ] 클릭 시 Main panel 해당 클리닉 데이터 로드
- [ ] 드래그앤드롭으로 순서 변경 가능
- [ ] 순서 변경 즉시 sort_order 업데이트

### Sync

- [ ] Sync 버튼 클릭 시 외부 API 호출
- [ ] 완료 후 Last synced 시각 업데이트
- [ ] Sync 중 로딩 인디케이터 표시
- [ ] 실패 시 에러 메시지 표시
- [ ] 자동 스케줄 없음 확인

### Basic Information

- [ ] 모든 필드 read-only로 표시 (입력/수정 불가)
- [ ] Sync 완료 후 변경된 데이터 자동 반영
- [ ] "데이터 변경은 Sync를 통해 갱신됩니다" 안내 문구 표시

### Service Type

- [ ] RPM / CCM 선택 시 Revenue Split 행 생성
- [ ] BHI / PCM 선택 시 service_types 저장만, Revenue Split 행 미생성
- [ ] 서비스 변경 시 Revenue Split 행 즉시 반영

### Revenue Split

- [ ] Clinic : Hicare 입력값 기반 % 자동 계산 및 뱃지 실시간 업데이트
- [ ] 비율 변경 저장 시 revenue_split_history에 이력 INSERT
- [ ] 기존 이력 수정 불가 (append-only)
- [ ] View history 클릭 시 변경 이력 목록 표시
- [ ] Story-Invoice에서 해당 월 비율 자동 참조

### Biller Fee

- [ ] Percentage / Fixed amount 전환 가능
- [ ] 마이너스 값 입력 가능 (회사 부담 케이스)
- [ ] 마이너스 입력 시 Note 필드 표시
- [ ] 변경 저장 시 biller_fee_history에 이력 INSERT
- [ ] 기존 이력 수정 불가 (append-only)
- [ ] View history 클릭 시 변경 이력 목록 표시
- [ ] Story-Invoice 계산에 자동 반영 (마이너스 포함)

### EMR Access

- [ ] EMR 추가 / 삭제 가능
- [ ] ↗ Open 버튼 클릭 시 새 탭으로 URL 열기
- [ ] 빈 URL 저장 불가

### 클리닉 데이터 관리

- [ ] 클리닉 추가/삭제 UI 버튼 없음
- [ ] Sync 완료 후 신규 클리닉 사이드바 자동 반영
- [ ] Sync 완료 후 변경된 Basic Information 자동 갱신

### 비활성화

- [ ] Deactivate 확인 다이얼로그 표시 후 처리
- [ ] 비활성화 후 기존 데이터 전부 보존 확인
- [ ] 비활성 클리닉은 Story-Invoice 입력 불가

---

## 10. 미확인 사항

모든 항목 확정 완료.

| # | 항목 | 확정 내용 |
|---|---|---|
| 1 | Clinic code 포맷 | 대문자 3자리 고정 (`varchar(3)`) |
| 2 | Biller Fee 이력 관리 | `biller_fee_history` 별도 테이블, 마이너스 허용 |
| 3 | BHI / PCM split | 현재 미사용, 확장 가능 구조로만 유지 |
| 4 | 클리닉 정렬 순서 | sync 수신 sort_order + 사용자 드래그앤드롭 변경 |
| 5 | 데이터 동기화 | 자동 없음, Sync 버튼으로만 수동 실행 |
| 6 | Basic Information | read-only. 외부 sync로만 수신, UI 수정 불가 |
| 7 | 클리닉 추가/삭제 | UI 버튼 없음. 외부 sync로만 관리 |

---

## 11. 디자인 토큰

> **기준 파일**: `story_clinic_settings_v4.html` — 모든 화면 디자인은 이 파일을 기준으로 한다.

### 폰트

| 용도 | 값 |
|---|---|
| 본문 | `'Inter', sans-serif` (Google Fonts) |
| 모노스페이스 | `'SF Mono', 'Fira Code', monospace` |
| 아이콘 | Material Symbols Outlined |

### 색상 — 커스텀 토큰 (Tailwind config)

| 토큰 | 값 | 용도 |
|---|---|---|
| `surface` | `#fcf9f8` | 앱 전체 배경 |
| `surface-container-low` | `#f6f3f2` | 클리닉 목록 사이드바 배경 |
| `surface-container` | `#f0eded` | 필터 탭 배경 |
| `on-surface` | `#1b1c1c` | 기본 텍스트 |
| `on-surface-variant` | `#414752` | 보조 텍스트, Read-only 뱃지 |
| `outline` | `#717783` | 테두리 |
| `outline-variant` | `#c1c6d4` | 연한 테두리 |
| `primary` | `#005dac` | 주요 액션 (버튼, 링크, 아이콘) |
| `on-primary` | `#ffffff` | primary 위 텍스트 |
| `tertiary` | `#006c1b` | Active 표시 (Active Provider 닷) |
| `tertiary-container` | `#278631` | Active 뱃지 텍스트 |
| `tertiary-fixed` | `#98f994` | Active 뱃지 배경 |
| `error` | `#ba1a1a` | 에러 |
| `error-container` | `#ffdad6` | 에러 배경 |
| `on-error-container` | `#93000a` | 에러 텍스트 |

### 색상 — Tailwind Slate (카드/패널 UI)

| 클래스 | Hex | 용도 |
|---|---|---|
| `bg-white` | `#ffffff` | 카드 배경 |
| `bg-slate-50` | `#f8fafc` | 카드 헤더 배경 |
| `bg-slate-900` | `#0f172a` | 글로벌 SideNav 배경 |
| `border-slate-200` | `#e2e8f0` | 카드 외곽 테두리 |
| `border-slate-100` | `#f1f5f9` | 카드 내부 구분선 |
| `text-slate-900` | `#0f172a` | 카드 내 주요 텍스트 |
| `text-slate-500` | `#64748b` | 카드 내 보조 텍스트 |
| `text-slate-400` | `#94a3b8` | 레이블, 플레이스홀더 |

### Border Radius

| 클래스 | 값 | 용도 |
|---|---|---|
| `rounded-xl` | `12px` | 카드 외곽 |
| `rounded-lg` | `8px` | 입력 필드, 알림 박스 |
| `rounded-full` | `9999px` | 뱃지, 상태 표시 |
| `rounded` | `2px` (커스텀) | 버튼 기본 |

### SideNav 스타일

| 항목 | 값 |
|---|---|
| 배경 | `bg-slate-900` (`#0f172a`) |
| 너비 | `w-64` (256px), fixed |
| 활성 메뉴 | `text-white bg-blue-600/20 border-r-4 border-blue-500` |
| 비활성 메뉴 | `text-slate-400 hover:text-white hover:bg-slate-800/50` |
| 활성 아이콘 | `text-blue-400` |
| 로고 텍스트 | `text-xl font-bold tracking-tighter text-white` |
| 서브 텍스트 | `text-[10px] uppercase tracking-widest text-slate-500` |

### Read-only 필드 스타일

| 속성 | 값 |
|---|---|
| 배경 | `#f6f3f2` |
| 텍스트 | `#1b1c1c` |
| 폰트 크기 | `0.8125rem` (13px) |
| 패딩 | `7px 10px` |
| Border radius | `4px` |
| 모노 폰트 크기 | `0.75rem` (12px) |

### Service 뱃지 색상

| Service | Background | Text | 상태 |
|---|---|---|---|
| RPM | `#E6F1FB` | `#0C447C` | 사용 중 |
| CCM | `#E1F5EE` | `#085041` | 사용 중 |
| BHI | `#EEEDFE` | `#3C3489` | 확장 예정 |
| PCM | `#FAEEDA` | `#633806` | 확장 예정 |

### Split 뱃지 색상

| 항목 | Background | Text |
|---|---|---|
| Clinic % | `#E6F1FB` | `#0C447C` |
| Hicare % | `#E1F5EE` | `#085041` |

### Biller Fee 표시

| 케이스 | 색상 |
|---|---|
| 양수 (차감) | `text-slate-900` (기본) |
| 음수 (회사 부담) | `#791F1F` (빨간색) + 마이너스 아이콘 |

---

*본 문서는 v1.2 기준 확정 명세서입니다. 미확인 사항 전체 확정 완료.*