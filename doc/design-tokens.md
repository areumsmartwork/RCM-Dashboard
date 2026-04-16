# Design Tokens — RCM Dashboard

**단일 정본(Single Source of Truth)**  
이 파일의 값을 `rcm-dashboard`의 `tailwind.config.ts`에 그대로 사용한다.  
값 변경 시 이 파일을 먼저 수정하고 코드에 반영한다.

---

## 1. Color Tokens

### Surface (배경 레이어)

Surface는 물리적 레이어처럼 쌓인다. 선 대신 배경색 차이로 영역을 구분한다.

| Token | Hex | 용도 |
|---|---|---|
| `surface` | `#fcf9f8` | 페이지 최하단 베이스 |
| `surface-bright` | `#fcf9f8` | 활성 행 강조 |
| `surface-dim` | `#dcd9d9` | 비활성/흐림 처리 영역 |
| `surface-container-lowest` | `#ffffff` | 최상위 카드, 모달 (가장 밝음) |
| `surface-container-low` | `#f6f3f2` | 사이드바, 중첩 데이터 그룹 |
| `surface-container` | `#f0eded` | 일반 컨테이너 |
| `surface-container-high` | `#eae7e7` | 테이블 헤더 행 |
| `surface-container-highest` | `#e5e2e1` | Sentinel Insight 카드 배경 |
| `surface-variant` | `#e5e2e1` | 글래스모픽 모달 베이스 (70% opacity) |
| `background` | `#fcf9f8` | — |

### Primary (브랜드 블루)

| Token | Hex | 용도 |
|---|---|---|
| `primary` | `#005dac` | 주요 버튼, 차트 라인, 포커스 테두리 |
| `primary-container` | `#1976d2` | 그라디언트 CTA 끝 색상 |
| `primary-fixed` | `#d4e3ff` | — |
| `primary-fixed-dim` | `#a5c8ff` | — |
| `on-primary` | `#ffffff` | Primary 배경 위 텍스트 |
| `on-primary-container` | `#fffdff` | — |
| `on-primary-fixed` | `#001c3a` | — |
| `on-primary-fixed-variant` | `#004786` | — |
| `inverse-primary` | `#a5c8ff` | — |
| `surface-tint` | `#005faf` | — |

### Secondary (보조 색상)

| Token | Hex | 용도 |
|---|---|---|
| `secondary` | `#466270` | 아이콘, 보조 텍스트 강조 |
| `secondary-container` | `#c6e4f4` | Secondary 버튼 배경 |
| `secondary-fixed` | `#c9e7f7` | — |
| `secondary-fixed-dim` | `#adcbda` | Data Chip 배경 |
| `on-secondary` | `#ffffff` | — |
| `on-secondary-container` | `#4a6774` | Secondary 버튼 텍스트 |
| `on-secondary-fixed` | `#001f2a` | — |
| `on-secondary-fixed-variant` | `#2e4b57` | — |

### Tertiary (성공/긍정 — 초록)

| Token | Hex | 용도 |
|---|---|---|
| `tertiary` | `#006c1b` | 활성 상태 dot, 성공 텍스트 |
| `tertiary-container` | `#278631` | 성공 Status Chip 텍스트 색 |
| `tertiary-fixed` | `#98f994` | 성공 Status Chip 배경 |
| `tertiary-fixed-dim` | `#7ddc7a` | — |
| `on-tertiary` | `#ffffff` | — |
| `on-tertiary-container` | `#f9fff3` | — |
| `on-tertiary-fixed` | `#002204` | — |
| `on-tertiary-fixed-variant` | `#005313` | — |

### Error (오류/경고 — 빨강)

| Token | Hex | 용도 |
|---|---|---|
| `error` | `#ba1a1a` | 오류 아이콘, 경고 텍스트 |
| `error-container` | `#ffdad6` | 오류 Status Chip 배경 |
| `on-error` | `#ffffff` | — |
| `on-error-container` | `#93000a` | 오류 Status Chip 텍스트 색 |

### Neutral (텍스트 및 경계)

| Token | Hex | 용도 |
|---|---|---|
| `on-surface` | `#1b1c1c` | 본문 텍스트 (순수 #000000 사용 금지) |
| `on-surface-variant` | `#414752` | 보조 텍스트, 테이블 헤더 |
| `on-background` | `#1b1c1c` | — |
| `outline` | `#717783` | 포커스 외곽선 |
| `outline-variant` | `#c1c6d4` | Ghost Border 기본값 (15% opacity로 사용) |
| `inverse-surface` | `#303030` | — |
| `inverse-on-surface` | `#f3f0ef` | — |

### Navigation Sidebar

코드에서 Tailwind 기본 색상(`slate-900`, `slate-800` 등)을 그대로 사용한다.  
토큰으로 추상화하지 않고 아래 값을 그대로 참조한다.

| 역할 | 값 | 비고 |
|---|---|---|
| 사이드바 배경 | `#0f172a` (`slate-900`) | 다크 모드에서는 `#000000` |
| 활성 메뉴 배경 | `blue-600/20` | 20% opacity |
| 활성 메뉴 accent border | `#3b82f6` (`blue-500`) | 우측 4px 세로 선 |
| 비활성 메뉴 텍스트 | `#94a3b8` (`slate-400`) | hover → white |
| New Clinic 버튼 | `#2563eb` (`blue-600`) | hover → `blue-700` |

---

## 2. Typography Tokens

서체는 **Inter** 단일 사용. 다양한 weight와 크기 조합으로 계층 구조 표현.

| Token | Size | Weight | Letter Spacing | 용도 |
|---|---|---|---|---|
| `display-lg` | `3.5rem` (56px) | 800 | -0.02em | 포트폴리오 최상위 합계 수치 |
| `display-md` | `2.25rem` (36px) | 700 | -0.02em | 주요 금액 표시 (e.g. 60/40 split) |
| `headline-sm` | `1.25rem` (20px) | 600 | — | 섹션 제목 (spacing-12 위쪽 여백) |
| `body-md` | `0.875rem` (14px) | 400 | — | 테이블 데이터 주요 값 |
| `body-sm` | `0.75rem` (12px) | 400 | — | 보조 메타데이터, 타임스탬프 |
| `label-md` | `0.625rem` (10px) | 700 | +0.1em (widest) | 테이블 헤더, 섹션 레이블 — 항상 대문자 |
| `label-sm` | `0.5625rem` (9px) | 700 | +0.1em | 차트 축 레이블, 상태 배지 |

```js
// tailwind.config.ts → theme.extend.fontFamily
fontFamily: {
  headline: ["Inter", "sans-serif"],
  body: ["Inter", "sans-serif"],
  label: ["Inter", "sans-serif"],
}
```

---

## 3. Border Radius Tokens

"정밀함(Precision)"을 표현하기 위해 작고 sharp한 반경 사용.

| Token | Value | 용도 |
|---|---|---|
| `DEFAULT` | `0.125rem` (2px) | 버튼, 입력 필드 — 기본값 |
| `lg` | `0.25rem` (4px) | 배지, 소형 칩 |
| `xl` | `0.5rem` (8px) | 카드, 모달 |
| `full` | `0.75rem` (12px) | Status Chip, Avatar |

```js
// tailwind.config.ts → theme.extend.borderRadius
borderRadius: {
  DEFAULT: "0.125rem",
  lg: "0.25rem",
  xl: "0.5rem",
  full: "0.75rem",
}
```

---

## 4. Shadow & Elevation Rules

그림자 대신 **Tonal Layering**으로 깊이 표현. 아래 두 경우에만 그림자 사용.

| 용도 | 값 |
|---|---|
| 떠있는 카드 (드롭다운, 팝오버) | `0 12px 32px rgba(27,28,28,0.05)` |
| 플로팅 드로어, 모달 | `0 0 40px rgba(27,28,28,0.06)` |
| 활성 버튼 accent | `0 4px 12px rgba(0,93,172,0.10)` |

> Material Design 기본 그림자 사용 금지.  
> `box-shadow` 색상은 항상 `on-surface`(`#1b1c1c`) 기반 — 순수 black 금지.

---

## 5. Spacing Scale

Tailwind 기본 spacing scale 사용. 주요 가이드라인:

| 상황 | 권장 spacing |
|---|---|
| 카드 내부 padding | `p-6` (24px) ~ `p-8` (32px) |
| 테이블 셀 padding | `px-4 py-3` |
| 섹션 제목 위 여백 | `mt-12` (48px) |
| 리스트 아이템 사이 | `py-3` — 선(divider) 대신 여백으로 구분 |
| 인접 콘텐츠 구분 | 선 추가 금지, `space-y-4` → `space-y-6`으로 확대 |

---

## 6. Design Rules (코드 작성 시 반드시 준수)

### 금지 사항

| 금지 | 대안 |
|---|---|
| 1px solid border로 영역 구분 | 배경색 전환으로 구분 |
| 리스트 아이템 사이 horizontal divider | `py-3` 여백 + hover 배경으로 구분 |
| 100% opacity border | `outline-variant` 15% opacity 사용 |
| Material Design 기본 drop shadow | Ambient Shadow (위 규칙 참조) |
| 본문 텍스트에 `#000000` | `on-surface` `#1b1c1c` 사용 |

### 허용 사항

| 패턴 | 조건 |
|---|---|
| Ghost Border | 고밀도 데이터 테이블에서 접근성 필요 시 — `outline-variant` 15% opacity |
| Glassmorphic 모달 | `surface-variant` 70% opacity + `backdrop-blur-xl` |
| 그라디언트 CTA | Hero 버튼에 한정 — `primary` → `primary-container` 135도 |
| Sentinel Insight 카드 | 좌측 2px accent border — `secondary` 또는 `error` token |

---

## 7. Tailwind Config (rcm-dashboard 적용용)

`rcm-dashboard/tailwind.config.ts`의 `theme.extend`에 아래 내용을 그대로 붙여 넣는다.

```js
theme: {
  extend: {
    colors: {
      // Surface
      "surface":                   "#fcf9f8",
      "surface-bright":            "#fcf9f8",
      "surface-dim":               "#dcd9d9",
      "surface-container-lowest":  "#ffffff",
      "surface-container-low":     "#f6f3f2",
      "surface-container":         "#f0eded",
      "surface-container-high":    "#eae7e7",
      "surface-container-highest": "#e5e2e1",
      "surface-variant":           "#e5e2e1",
      "background":                "#fcf9f8",

      // Primary
      "primary":                   "#005dac",
      "primary-container":         "#1976d2",
      "primary-fixed":             "#d4e3ff",
      "primary-fixed-dim":         "#a5c8ff",
      "on-primary":                "#ffffff",
      "on-primary-container":      "#fffdff",
      "on-primary-fixed":          "#001c3a",
      "on-primary-fixed-variant":  "#004786",
      "inverse-primary":           "#a5c8ff",
      "surface-tint":              "#005faf",

      // Secondary
      "secondary":                 "#466270",
      "secondary-container":       "#c6e4f4",
      "secondary-fixed":           "#c9e7f7",
      "secondary-fixed-dim":       "#adcbda",
      "on-secondary":              "#ffffff",
      "on-secondary-container":    "#4a6774",
      "on-secondary-fixed":        "#001f2a",
      "on-secondary-fixed-variant":"#2e4b57",

      // Tertiary (Success)
      "tertiary":                  "#006c1b",
      "tertiary-container":        "#278631",
      "tertiary-fixed":            "#98f994",
      "tertiary-fixed-dim":        "#7ddc7a",
      "on-tertiary":               "#ffffff",
      "on-tertiary-container":     "#f9fff3",
      "on-tertiary-fixed":         "#002204",
      "on-tertiary-fixed-variant": "#005313",

      // Error
      "error":                     "#ba1a1a",
      "error-container":           "#ffdad6",
      "on-error":                  "#ffffff",
      "on-error-container":        "#93000a",

      // Neutral
      "on-surface":                "#1b1c1c",
      "on-surface-variant":        "#414752",
      "on-background":             "#1b1c1c",
      "outline":                   "#717783",
      "outline-variant":           "#c1c6d4",
      "inverse-surface":           "#303030",
      "inverse-on-surface":        "#f3f0ef",
    },
    fontFamily: {
      headline: ["Inter", "sans-serif"],
      body:     ["Inter", "sans-serif"],
      label:    ["Inter", "sans-serif"],
    },
    borderRadius: {
      DEFAULT: "0.125rem",
      lg:      "0.25rem",
      xl:      "0.5rem",
      full:    "0.75rem",
    },
  },
},
```

---

## 8. Status Chip 조합 레퍼런스

| 상태 | 배경 | 텍스트 | 비고 |
|---|---|---|---|
| Active / Paid / Approved | `tertiary-fixed` (#98f994) | `tertiary-container` (#278631) | — |
| Denied / Error / Flagged | `error-container` (#ffdad6) | `on-error-container` (#93000a) | — |
| Pending / Partial | `secondary-fixed` (#c9e7f7) | `on-secondary-fixed-variant` (#2e4b57) | — |
| Inactive / Void | `surface-container-high` (#eae7e7) | `on-surface-variant` (#414752) | italic 처리 권장 |

모든 Chip은 `rounded-full` 적용.

---

*최종 업데이트: 2026-04-08*
