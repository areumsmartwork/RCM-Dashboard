# HCN RCM — Backend

NestJS + TypeORM + MySQL 기반 RCM(Revenue Cycle Management) 백엔드 서버.

---

## 기술 스택

| 항목 | 버전 |
|---|---|
| Node.js | 20+ |
| NestJS | 11 |
| TypeORM | 0.3 |
| MySQL | 8.0 |
| TypeScript | 5.7 |

---

## 시작하기

### 1. 환경변수 설정

`backend/.env` 파일을 생성합니다.

```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=rcm_root
DB_PASSWORD=rcm00!!
DB_DATABASE=rcm_db
```

> MySQL은 루트 프로젝트의 `docker-compose.yml`로 실행합니다.

### 2. MySQL 실행 (Docker)

```bash
# 프로젝트 루트에서 실행
docker compose up -d
```

### 3. 백엔드 실행

```bash
cd backend
npm install
npm run start:dev   # 개발 (watch 모드)
npm run start:prod  # 프로덕션
```

개발 모드에서는 `synchronize: true`가 활성화되어 Entity 변경 시 테이블이 자동으로 생성/수정됩니다.

서버 주소: `http://localhost:3001/api`

---

## 아키텍처 원칙

각 도메인 모듈은 **Controller → Service → Repository** 3계층으로 엄격히 분리됩니다.

| 계층 | 역할 | 금지 사항 |
|---|---|---|
| Controller | HTTP 파라미터 파싱 → Service 호출 → 결과 반환 | 비즈니스 로직, DB 직접 접근 |
| Service | 비즈니스 로직, 트랜잭션, 유효성 검사 | HTTP 컨텍스트 (`@Req`, `@Res`) |
| Repository | TypeORM Entity I/O만 | 비즈니스 판단 |

### DTO 규칙

- `@Body()` 타입은 반드시 `dto/` 폴더의 **class DTO**를 사용합니다. `Partial<Entity>`를 컨트롤러 body 타입으로 직접 쓰지 않습니다.
- Route param(`clinicId` 등)을 body에 병합하는 작업(`{ ...body, clinicId }`)은 **Service에서** 처리합니다. Controller는 param과 body를 분리된 인수로 Service에 넘깁니다.
- `class-validator` + `class-transformer`를 설치하면 DTO에 데코레이터를 추가하고 `main.ts`에 `ValidationPipe`를 활성화해 런타임 검증을 적용할 수 있습니다.

---

## 프로젝트 구조

```
src/
├── app.module.ts                  # 루트 모듈 — ConfigModule, TypeORM 설정
├── main.ts                        # 진입점 — CORS, /api prefix
│
├── clinics/                       # 클리닉 기본 정보
│   ├── dto/
│   │   └── update-clinic.dto.ts
│   ├── entities/clinic.entity.ts
│   ├── clinics.module.ts
│   ├── clinics.service.ts
│   ├── clinics.service.spec.ts    # 단위 테스트
│   └── clinics.controller.ts
│
├── revenue-split/                 # 수익 분배 이력
│   ├── dto/
│   │   └── create-revenue-split.dto.ts
│   ├── entities/revenue-split-history.entity.ts
│   ├── revenue-split.module.ts
│   ├── revenue-split.service.ts
│   └── revenue-split.controller.ts
│
├── biller-fee/                    # 빌러 수수료 이력
│   ├── dto/
│   │   └── create-biller-fee.dto.ts
│   ├── entities/biller-fee-history.entity.ts
│   ├── biller-fee.module.ts
│   ├── biller-fee.service.ts
│   └── biller-fee.controller.ts
│
└── invoice-entry/                 # 월별 청구 입력 + HicareNet 입금 확인
    ├── dto/
    │   ├── save-invoice.dto.ts
    │   └── save-ci.dto.ts
    ├── entities/invoice-entry.entity.ts
    ├── invoice-entry.module.ts
    ├── invoice-entry.service.ts
    ├── invoice-entry.service.spec.ts  # 단위 테스트
    └── invoice-entry.controller.ts
```

---

## DB 설계 (ERD)

### clinics

클리닉 기본 정보. CMS-1500 청구서에 사용되는 필드를 포함합니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID 자동 생성 |
| `name` | varchar | 클리닉 명 |
| `code` | varchar(3) UNIQUE | 3자리 고유 코드 — 생성 후 변경 불가 |
| `state` | varchar(2) | 주(State) 코드 |
| `timezone` | varchar | 타임존 |
| `phone` | varchar | 대표 전화 |
| `address` | text | 주소 |
| `contact_name` | varchar | 담당자 이름 |
| `ein` | varchar | CMS-1500 Box 25 |
| `npi` | varchar | CMS-1500 Box 33a |
| `taxonomy_code` | varchar | CMS-1500 Box 33b |
| `pos_code` | varchar(2) | CMS-1500 Box 24B |
| `accept_assignment` | boolean | CMS-1500 Box 27 (기본값: true) |
| `service_types` | json | 계약 서비스 — RPM·CCM·BHI·PCM |
| `emr_links` | json | 연동 EMR 목록 `[{name, url}]` |
| `sort_order` | int | 목록 정렬 순서 (드래그 변경 가능) |
| `is_active` | boolean | 활성 여부 |
| `last_synced_at` | timestamp | 마지막 동기화 시각 |
| `created_at` | timestamp | 생성일 |

### revenue_split_history

클리닉별·서비스 종류별 수익 분배 비율 변경 이력. `clinic_pct + hicare_pct = 100`.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `clinic_id` | varchar(36) FK | clinics.id |
| `service_type` | varchar | RPM·CCM·BHI·PCM |
| `clinic_pct` | decimal(5,2) | 클리닉 정산 비율 (%) |
| `hicare_pct` | decimal(5,2) | Hicare 정산 비율 (%) |
| `effective_from` | date | 적용 시작일 |
| `changed_by` | varchar | 변경자 |
| `changed_at` | timestamp | 변경일시 |

### biller_fee_history

클리닉별 빌러 수수료 변경 이력.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `clinic_id` | varchar(36) FK | clinics.id |
| `fee_type` | varchar | `pct` (%) 또는 `fixed` ($/mo) |
| `fee_value` | decimal(8,2) | 수수료 값. 음수: 청구 차감(클리닉 부담), 양수: Hicare 부담 |
| `effective_from` | date | 적용 시작일 |
| `note` | text | 비고 (마이너스 사유 등) |
| `changed_by` | varchar | 변경자 |
| `changed_at` | timestamp | 변경일시 |

### invoice_entries

클리닉별 월별 청구 입력 + HicareNet 입금 확인 레코드. `(clinic_id, billing_year, billing_month)` 조합은 UNIQUE.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `clinic_id` | varchar(36) FK | clinics.id |
| `billing_year` | smallint | 청구 연도 |
| `billing_month` | tinyint | 청구 월 (1–12) |
| `rpm_invoice` | decimal(12,2) | RPM 청구 금액 |
| `ccm_invoice` | decimal(12,2) | CCM 청구 금액 |
| `rpm_pts` | smallint | RPM 환자 수 |
| `ccm_pts` | smallint | CCM 환자 수 |
| `ci_amount` | decimal(12,2) | HicareNet 실 입금액 |
| `ci_date` | date | 입금일 |
| `ci_method` | varchar | `ACH` · `Zelle` · `Check` |
| `ci_reference` | varchar | 참조 번호 (Check # 등) |
| `ci_remark` | text | 비고 |
| `status` | varchar | `unpaid` · `paid` |
| `created_at` | timestamp | 생성일 |
| `updated_at` | timestamp | 수정일 |

### 관계

```
clinics 1 ──< N revenue_split_history
clinics 1 ──< N biller_fee_history
clinics 1 ──< N invoice_entries
```

---

## API 엔드포인트

Base URL: `http://localhost:3001/api`

### Clinics

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/clinics` | 클리닉 목록 (sort_order ASC) |
| `GET` | `/clinics/:id` | 클리닉 상세 (split/fee 이력 포함) |
| `PATCH` | `/clinics/:id` | 클리닉 정보 수정 |
| `PATCH` | `/clinics/:id/sync` | 마지막 동기화 시각 갱신 |

### Revenue Split

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/clinics/:clinicId/revenue-split` | 수익 분배 이력 전체 |
| `GET` | `/clinics/:clinicId/revenue-split?serviceType=RPM` | 서비스 종류별 이력 |
| `POST` | `/clinics/:clinicId/revenue-split` | 새 분배 비율 등록 |

### Biller Fee

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/clinics/:clinicId/biller-fee` | 수수료 이력 |
| `POST` | `/clinics/:clinicId/biller-fee` | 새 수수료 등록 |

### Invoice Entry

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/invoice-entries/clinic/:clinicId` | 클리닉 전체 입력 이력 |
| `GET` | `/invoice-entries/clinic/:clinicId/:year/:month` | 특정 월 단건 조회 |
| `POST` | `/invoice-entries` | Invoice 저장 (upsert — 없으면 생성, 있으면 업데이트) |
| `PATCH` | `/invoice-entries/:id/ci` | HicareNet 입금(CI) 저장 |
| `PATCH` | `/invoice-entries/:id/status` | 상태 변경 (`paid` / `unpaid`) |

---

## 타입 매핑 (PostgreSQL ERD → MySQL)

ERD는 PostgreSQL 표기를 사용했으나 실제 DB는 MySQL 8.0입니다.

| ERD 타입 | MySQL 실제 타입 | 비고 |
|---|---|---|
| `uuid` | `varchar(36)` | TypeORM `@PrimaryGeneratedColumn('uuid')` |
| `varchar[]` | `json` | service_types 배열 |
| `jsonb` | `json` | emr_links 객체 배열 |
| `numeric(8,2)` | `decimal(8,2)` | fee_value |
| `numeric` | `decimal(5,2)` | clinic_pct, hicare_pct |
