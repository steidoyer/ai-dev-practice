# Tailwind CSS 유틸리티 레퍼런스 (v4 기준)

이 프로젝트는 **Tailwind CSS v4**를 사용한다. 전체 유틸리티는 공식 문서를 정본으로 삼고,
이 문서는 **자주 쓰는 클래스 + 실무 팁**만 추려 둔다.

## 전체 목록 (출처)
- 공식 문서(전체 유틸리티): https://tailwindcss.com/docs
- 유틸리티 A–Z 레퍼런스: https://tailwindcss.com/docs/styling-with-utility-classes
- v3 → v4 업그레이드/변경점: https://tailwindcss.com/docs/upgrade-guide
- 전체 클래스 치트시트(비공식, 검색용): https://nerdcave.com/tailwind-cheat-sheet

> v4에서는 `tailwind.config.js` 대신 CSS의 `@theme` 블록으로 토큰을 정의한다.
> 이 프로젝트의 토큰 정의는 `src/app/globals.css` 참고.

---

## 자주 쓰는 클래스 (카테고리별 + 실무 팁)

### 1. Layout / Display
| 클래스 | 의미 |
|---|---|
| `flex` `grid` `block` `inline-block` `hidden` | display 지정 |
| `container` | 반응형 max-width 컨테이너 |
| `relative` `absolute` `fixed` `sticky` | position |
| `inset-0` `top-0` `left-1/2` | 위치 오프셋 |
| `z-10` `z-20` `z-50` | z-index |

**실무 팁**
- `flex`/`grid`만 쓰면 `flex-wrap: nowrap`이 **기본값**이다. 줄바꿈이 필요하면 `flex-wrap`을 명시.
- 중앙 정렬 관용구: `absolute left-1/2 -translate-x-1/2` (가로 중앙), `inset-0 m-auto`도 가능.
  - ⚠️ 그 요소를 **framer-motion으로 `x`/`y` 애니메이트**할 거면 `-translate-x-1/2`(transform)가 motion의 transform과 **충돌**한다(motion이 덮어씀). 이땐 transform을 안 쓰는 `inset-x-0 mx-auto`(폭 고정 + auto margin)나 음수 margin으로 센터링할 것.
- `sticky top-0`은 **조상(부모 포함) 중 하나라도** `overflow-hidden`이면 동작하지 않는다 — 조상 overflow를 먼저 의심.
  (원리·함정 상세: `CSS_ADVANCED.md` §3)
- `hidden md:block` / `md:hidden` 조합으로 뷰포트별 요소 노출·숨김을 처리(이 프로젝트 Header가 이 패턴).

### 2. Flexbox
| 클래스 | 의미 |
|---|---|
| `flex-row` `flex-col` | 주축 방향 |
| `flex-wrap` `flex-nowrap` | 줄바꿈 |
| `items-center` `items-start` `items-stretch` | 교차축 정렬(align-items) |
| `justify-between` `justify-center` `justify-end` | 주축 정렬(justify-content) |
| `flex-1` `flex-none` `shrink-0` `grow` | 크기 자동 조절 |
| `gap-4` `gap-x-2` `gap-y-6` | 자식 간 간격 |

**실무 팁**
- `gap-*`이 `margin`보다 낫다 — 마지막 요소 margin 제거 트릭이 필요 없음.
- 아이콘이 텍스트에 눌려 찌그러지면 `shrink-0`을 아이콘에 준다(이 프로젝트 아이콘들이 다 이 처리).
- `flex-col` + `md:flex-row`는 **모바일 세로 스택 → 데스크탑 가로**의 표준 반응형 패턴.
- `justify-between`은 자식이 넘칠 때 오히려 깨진다 — 좁은 화면에선 `flex-col`이나 `flex-wrap`으로 전환.

### 3. Grid
| 클래스 | 의미 |
|---|---|
| `grid-cols-1` `grid-cols-3` `grid-cols-12` | 열 개수 |
| `col-span-2` `col-start-1` | 셀 배치 |
| `auto-rows-fr` `grid-flow-col` | 흐름 제어 |
| `gap-6` | 셀 간격 |

**실무 팁**
- 반응형 카드 그리드 관용구: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (이 프로젝트 Projects).
- 열 폭을 내용에 맞추려면 `grid-cols-[auto_1fr]` 같은 **임의값(arbitrary)** 사용.
- `grid`는 자식 높이를 자동으로 맞춰줘서(`items-stretch` 기본) 카드 높이 정렬에 flex보다 편하다.

### 4. Spacing (margin / padding)
| 클래스 | 의미 |
|---|---|
| `p-4` `px-6` `py-2` `pt-8` | padding |
| `m-4` `mx-auto` `mt-2` `-mt-4` | margin (음수는 `-` 접두) |
| `space-x-4` `space-y-2` | 인접 자식 간격(구식, `gap` 권장) |

**실무 팁**
- `mx-auto` + `max-w-*` = 가로 중앙 정렬 컨테이너의 정석.
- 숫자 스케일은 `4 = 1rem = 16px` (즉 `1 = 0.25rem`). `p-4`는 16px.
- 반복되는 좌우 패딩·max-w는 유틸로 묶어라 — 이 프로젝트는 `@utility container-page`로 통일.

### 5. Sizing
| 클래스 | 의미 |
|---|---|
| `w-full` `w-1/2` `w-screen` `w-10` | width |
| `h-full` `h-screen` `min-h-screen` `h-40` | height |
| `max-w-7xl` `max-w-prose` `min-w-0` | 최대/최소 |
| `size-6` | width+height 동시(정사각) |

**실무 팁**
- 아이콘·아바타처럼 정사각이면 `size-6`이 `w-6 h-6`보다 간결.
- 고정 폭 `w-[600px]`은 모바일 넘침의 주범 → `w-full max-w-[600px]`로 바꿔 유동+상한.
- `min-w-0`은 flex 자식의 텍스트 말줄임(`truncate`)이 안 먹을 때 필수(flex 자식 기본 min-width는 auto).

**길이 토큰은 어떻게 정의되나 (v4 `@theme`)** — 길이 종류마다 네임스페이스(접두)가 다르다.
- **크기·간격 길이**(width/height/padding/margin/gap/inset) → **`--spacing-*`**. `--spacing-card: 2rem` **하나**가 `w-card`·`h-card`·`p-card`·`m-card`·`gap-card`·`size-card`·`inset-card`를 **모두** 생성(이 프로젝트의 `--spacing-*` 토큰들).
  - 접두 없는 `--spacing: 0.25rem`은 **숫자 스케일**(`p-4`=1rem …)의 기준 배수.
- **모서리** → **`--radius-*`** (`rounded-card` 등).
- **border 두께(border-width)는 전용 네임스페이스가 없다** → 내장 `border`(1px)/`border-2`/`border-4`/`border-8` 또는 임의값 `border-[1.5px]`, 이름이 필요하면 `@utility`. (그래서 `globals.css`엔 spacing·radius 토큰은 있어도 border-width 토큰이 없다.)
- **즉석 길이는 임의값**: `w-[35rem]`, `h-[22.5rem]`, `border-[1.5px]`. 한 번만 쓰는 특정 값이면 토큰보다 임의값이 간편.

### 6. Typography
| 클래스 | 의미 |
|---|---|
| `text-sm` `text-lg` `text-2xl` | 글자 크기 |
| `font-bold` `font-medium` | 굵기 |
| `leading-tight` `leading-relaxed` | line-height |
| `tracking-wide` | letter-spacing |
| `text-center` `text-right` | 정렬 |
| `truncate` `line-clamp-2` | 말줄임 |
| `whitespace-nowrap` `break-all` `text-balance` | 줄바꿈 제어 |

**실무 팁**
- `truncate`(한 줄) vs `line-clamp-2`(여러 줄 말줄임) 구분해서 사용.
- 제목 줄바꿈이 못생기면 `text-balance`(제목용), 본문 마지막 줄 처리엔 `text-pretty`.
- 긴 URL·이메일이 넘치면 `break-all`(이 프로젝트 CTA 이메일 칩).
- 반응형 폰트: `text-4xl md:text-6xl lg:text-7xl` (이 프로젝트 Hero 이름).

**기본 글자 크기 스케일 (v4 내장 — 임의값 쓰기 전에 여기부터 확인)**
`@theme`에 아무것도 안 써도 아래 `text-*`는 항상 쓸 수 있다. 값이 딱 맞으면 `text-[1rem]` 같은 임의값 대신
이 유틸을 쓰는 게 이 프로젝트 컨벤션(globals.css `--text-*`는 xs~2xl을 **일부러 생략** — 기본값이 디자인과 일치하기 때문).
아래는 **설치된 `node_modules/tailwindcss/theme.css` 기준 정확한 값**이다.

| 유틸 | font-size (rem) | = px | line-height |
|---|---|---|---|
| `text-xs`  | 0.75rem  | **12px**  | calc(1/0.75) ≈ 1.33 |
| `text-sm`  | 0.875rem | **14px**  | calc(1.25/0.875) ≈ 1.43 |
| `text-base`| 1rem     | **16px**  | 1.5 |
| `text-lg`  | 1.125rem | **18px**  | ≈ 1.56 |
| `text-xl`  | 1.25rem  | **20px**  | 1.4 |
| `text-2xl` | 1.5rem   | **24px**  | ≈ 1.33 |
| `text-3xl` | 1.875rem | **30px**  | 1.2 |
| `text-4xl` | 2.25rem  | **36px**  | ≈ 1.11 |
| `text-5xl` | 3rem     | **48px**  | 1 |
| `text-6xl` | 3.75rem  | **60px**  | 1 |
| `text-7xl` | 4.5rem   | **72px**  | 1 |
| `text-8xl` | 6rem     | **96px**  | 1 |
| `text-9xl` | 8rem     | **128px** | 1 |

- **px = rem × 16** (브라우저 기본 루트 폰트). Figma 시안이 px로 나오므로 **이 px 열로 바로 매칭**하면 된다.
- 그래서 `text-[1rem]` → **`text-base`**, `text-[1.5rem]` → **`text-2xl`**.
- **스케일에 딱 없는 px는 두 유틸 사이에 낀다.** 예: **32px는 30px(`text-3xl`)과 36px(`text-4xl`) 사이** → 가까운 유틸로 근사하거나 임의값 `text-[2rem]`(=32px)로 정확히 지정할지 판단(임의값은 line-height가 안 딸려오니 필요하면 `leading-*` 별도).
- **주의**: 이 유틸은 font-size와 함께 **line-height도 같이 온다**(`text-base`=1.5, `text-2xl`≈1.33). 임의값 `text-[1rem]`은
  line-height를 안 건드리므로, 바꾸면 세로 리듬이 달라질 수 있다 → 원하는 값이 아니면 `leading-*`로 눌러준다.
- 스케일에 **정확히 없는 값**은 임의값 유지 or 가장 가까운 유틸 선택을 판단.
- **이 표는 글자 크기 전용이다.** 같은 `3xl`이라는 이름이라도 `text-3xl`(글자)·`rounded-3xl`(모서리)·`max-w-3xl`(너비)은
  **서로 다른 네임스페이스**에서 온다 → 아래 "네임스페이스별 유틸 대응표" 참고. 위치·여백 값을 `text-*` 스케일로 판단하지 말 것.

**line-height 유틸 (`leading-*`) — font-size와 분리해서 줄 간격만 조정**
`text-*`가 딸려 주는 line-height가 마음에 안 들면(특히 **한글 제목이 2줄 되는 경우** → `CSS_ADVANCED.md` §2) 이걸로 덮어쓴다.

| 유틸 | 값 | 용도 |
|---|---|---|
| `leading-none` | 1 | 큰 제목(줄 붙임) |
| `leading-tight` | 1.25 | 제목 |
| `leading-snug` | 1.375 | 소제목 |
| `leading-normal` | 1.5 | 본문(기본) |
| `leading-relaxed` | 1.625 | 여유 본문 |
| `leading-loose` | 2 | 아주 넓게 |
| `leading-<n>` | `n × 0.25rem`(예: `leading-6`=1.5rem) | **고정 px형** line-height |
| `leading-[1.4]` | 임의 배수 | 스케일에 없는 값 |

- 숫자형 `leading-6`은 **배수가 아니라 고정 길이**(1.5rem)다 — font-size가 바뀌어도 줄 높이가 안 따라오니 주의. 배수를 원하면 `leading-normal`/`leading-[1.6]`.
- 반복되는 역할별 값이면 `@theme`의 `--leading-*` 네임스페이스로 토큰화(`--leading-heading: 1.3` → `leading-heading`).

### 7. Colors / Background / Border
| 클래스 | 의미 |
|---|---|
| `bg-white` `bg-black/50` | 배경(`/50` = 50% 투명) |
| `text-gray-500` | 글자색 |
| `border` `border-2` `border-t` | 테두리 두께/방향 |
| `border-gray-200` | 테두리 색 |
| `rounded-md` `rounded-full` | 모서리 |
| `shadow-sm` `shadow-lg` | 그림자 |
| `opacity-90` | 투명도 |

**실무 팁**
- `/투명도` 문법(`bg-black/50`, `text-white/70`)이 별도 rgba보다 간결.
- 이 프로젝트는 색을 **토큰으로만** 쓴다(`bg-surface`, `text-primary`) — 하드코딩 금지 규칙.
- `border`만 쓰면 1px + 기본색. 방향만 필요하면 `border-t`처럼 조합.
- **⚠️ 색 유틸 이름 = `--color-` 뒤 토큰명을 "그대로"** 쓴다. 이 프로젝트 토큰이 `--color-bg`이므로 색 유틸은 **`bg-bg`·`text-bg`·`border-bg`**다 — `--color-background` 같은 토큰이 없으면 `text-background`는 **색 유틸로는 생성되지 않는다**. 유효 색 이름: `bg`·`surface`·`border`·`primary`·`secondary`·`muted`·`accent`·`accent-subtle`(→ `globals.css @theme`).
  - **없는(정의 안 된) 클래스는 빌드 에러 없이 조용히 무시**된다(위 "네임스페이스별 유틸 대응표" §237 주석과 동일 원리) → "안 먹으면" 오타·미존재 클래스명을 먼저 의심하고 DevTools에서 규칙 존재를 확인.
  - **단, 같은 이름을 커스텀으로 만들 수는 있다**(색 유틸과 별개 경로): `@utility text-background { … }`나 raw `.text-background {}`로 직접 정의하면 그 클래스가 생긴다. **차이가 중요** — **`md:`/`hover:` 등 변형을 쓰려면 `@utility`여야** 한다(Tailwind는 자기가 아는 유틸에만 변형을 생성 → raw `.class`엔 `md:` 안 생김). 실제로 밟은 사례: `CODE_REVIEW_LOG.md` 2026-08-05(raw `.text-background`에 `md:text-background`를 써서 무시됨 → `@utility`로 해결).

**기본 모서리(radius) 스케일 (v4 내장 — 임의값 전에 확인)**
설치 소스(`node_modules/tailwindcss/theme.css`) 기준. 이 프로젝트 `globals.css`는 `--radius-xs~xl`을 **재정의**하므로(값 다름) 아래는 **Tailwind 원본값**이고, 실제 프로젝트에선 재정의된 값이 우선이다.

| 유틸 | Tailwind 기본값 | 비고 |
|---|---|---|
| `rounded-xs`  | 0.125rem | |
| `rounded-sm`  | 0.25rem  | |
| `rounded-md`  | 0.375rem | (프로젝트는 0.5rem로 재정의) |
| `rounded-lg`  | 0.5rem   | (프로젝트는 0.625rem) |
| `rounded-xl`  | 0.75rem  | |
| `rounded-2xl` | 1rem     | 프로젝트 미정의 → 기본값 사용 가능 |
| `rounded-3xl` | 1.5rem   | 〃 |
| `rounded-4xl` | 2rem     | 〃 |
| `rounded-full`| 9999px   | **완전한 원/알약**. 값이 매우 커서 정사각형이면 원, 비정사각형이면 알약 |
| `rounded-none`| 0        | |

- **`rounded-full` vs `--radius-circle: 50%`**: **정사각형**에선 결과가 같다(둘 다 원). **비정사각형**에선 다르다 — `rounded-full`(9999px)은 짧은 변 기준으로 **양끝만 반원(알약)**, `50%`는 **타원**. circle 요소는 w=h(정사각형)라 `rounded-full`로 충분하고, 이게 Tailwind 관용 표현. `50%` 타원 효과가 꼭 필요할 때만 `rounded-[50%]`/토큰.

**기타 자주 쓰는 기본 스케일 값** (임의값 쓰기 전에 대조용)
- **간격(spacing) 기준 배수**: `--spacing: 0.25rem`. `p-4`=1rem, `gap-6`=1.5rem … **`숫자 × 0.25rem`**. 즉 `pt-[8.5rem]` = `pt-34`(34×0.25=8.5)로도 표현 가능(단 의미 있는 간격은 `--spacing-*` 시맨틱 토큰 우선).
- **브레이크포인트**: `sm` 40rem(640) · `md` 48rem(**768**) · `lg` 64rem(**1024**) · `xl` 80rem(1280) · `2xl` 96rem(1536). → 이 프로젝트 규칙의 md=768/lg=1024와 **일치**(재정의 불필요).
- **max-width 컨테이너**: `max-w-sm` 24rem … `max-w-7xl` **80rem**(이 프로젝트 `container-page`가 쓰는 값) … `max-w-xs` 20rem 등 `--container-*`.
- **size 단축**: 가로=세로면 `w-x h-x` 대신 `size-x`(`size-4`, `size-[22.5rem]`).

---

## 네임스페이스별 유틸 대응표 — "이 이름이 이 속성에도 있나?"

**같은 이름(`3xl`, `card` …)이라도 어느 네임스페이스에 정의됐느냐에 따라 쓸 수 있는 유틸이 다르다.**
`--radius-3xl`이 있다고 `top-3xl`이 생기지 않는다. **이름을 붙이기 전에 "그 속성이 어느 네임스페이스를 읽는지" 먼저 확인할 것.**
(아래는 설치 소스 `node_modules/tailwindcss/dist/lib.js`의 themeKeys + 빌드 CSS 대조로 확인.)

| 네임스페이스 | 정의 예 | 생성되는 유틸 |
|---|---|---|
| **`--spacing-*`** | `--spacing-card: 2rem` | **크기·여백·위치 전부** (아래 상세) |
| `--radius-*` | `--radius-xl` | `rounded-*` (`rounded-t-*`, `rounded-tl-*` …) |
| `--container-*` | `--container-3xl` | `max-w-*`, `w-*`(컨테이너명), `@container` 쿼리 |
| `--text-*` | `--text-section` | `text-*` (글자 크기 전용) |
| `--leading-*` | `--leading-heading` | `leading-*` |
| `--font-*` | `--font-korean` | `font-*` |
| `--color-*` | `--color-accent` | `bg-*`, `text-*`, `border-*`, `fill-*`, `ring-*` … |
| **(없음)** | — | **border-width** — 내장 `border`/`border-2/4/8` 또는 임의값 `border-[1.5px]` |

### `--spacing-*` 하나로 생성되는 유틸 (전체)

`--spacing-card: 2rem` **하나**를 정의하면 아래가 **전부** 생긴다. 즉 **width·height·padding·margin·위치 오프셋이 같은 네임스페이스를 공유**한다.

| 분류 | 유틸 |
|---|---|
| **크기** | `w-*` `min-w-*` `max-w-*` `h-*` `min-h-*` `max-h-*` `size-*` |
| **논리 크기** | `inline-*` `min-inline-*` `max-inline-*` `block-*` `min-block-*` `max-block-*` |
| **padding** | `p-*` `px-*` `py-*` `pt-*` `pr-*` `pb-*` `pl-*` `ps-*` `pe-*` `pbs-*` `pbe-*` |
| **margin** | `m-*` `mx-*` `my-*` `mt-*` `mr-*` `mb-*` `ml-*` `ms-*` `me-*` `mbs-*` `mbe-*` |
| **위치 오프셋** | `inset-*` `inset-x-*` `inset-y-*` `top-*` `right-*` `bottom-*` `left-*` `inset-s/e/bs/be-*` |
| **간격** | `gap-*` `gap-x-*` `gap-y-*` `space-x-*` `space-y-*` |
| **기타** | `translate-*` `translate-z-*` `basis-*` `indent-*` `scroll-m-*` `scroll-p-*` `border-spacing-*` |

- 검증: 빌드 CSS에 `.p-card{padding:var(--spacing-card)}`, `.gap-section{gap:var(--spacing-section)}`,
  `.py-canvas{padding-block:var(--spacing-canvas)}`, `.px-layout{padding-inline:var(--spacing-layout)}` 생성 확인.
- 따라서 이 프로젝트 토큰(`card`·`section`·`canvas`·`layout`·`element` …)은 **`top-card`·`w-section`처럼 위치·크기에도 그대로 쓸 수 있다.**
- **없는 이름을 쓰면 클래스가 아예 생성되지 않고 조용히 무시된다**(에러 없음). 스타일이 안 먹으면 **DevTools에서 그 클래스 규칙이 존재하는지** 먼저 확인.

### 이름 말고 항상 쓸 수 있는 형태 (모든 spacing 계열 공통)

| 형태 | 예 | 의미 |
|---|---|---|
| 숫자 | `top-4` `p-6` | `숫자 × 0.25rem` (`--spacing` 기준 배수) |
| 음수 | `-top-4` `-mt-2` | 음수 오프셋 |
| 분수 | `top-1/2` `w-1/3` | 부모 대비 **퍼센트** |
| 키워드 | `top-full` `top-auto` `w-full` `w-screen` `m-auto` | 100% / auto 등 |
| `px` | `top-px` | 1px |
| 임의값 | `top-[1.88rem]` `w-[35rem]` | 스케일 밖 값 |
| CSS 변수 | `top-(--my-var)` | 변수 직접 참조 |

### 8. States / Variants (상태·조건 접두)
| 접두 | 의미 |
|---|---|
| `hover:` `focus:` `active:` `disabled:` | 상호작용 상태 |
| `focus-visible:` | 키보드 포커스만(마우스 클릭 제외) |
| `group-hover:` `peer-checked:` | 부모/형제 상태 연동 |
| `md:` `lg:` | 뷰포트(모바일 우선) → 기준·전체 목록은 아래 **"뷰포트·미디어 접두"** 절 |
| `dark:` | 다크 모드 |
| `aria-expanded:` `data-[state=open]:` | 속성 기반 |
| `first:` `last:` `odd:` `[&>svg]:` | 구조/임의 셀렉터 |

**실무 팁**
- **모바일 우선**: 접두 없는 게 모바일 기본, `md:`/`lg:`가 데스크탑 확장(이 프로젝트 규칙).
- 포커스 링은 `focus:` 대신 `focus-visible:`을 써야 마우스 클릭 시 안 튄다.
- 부모 hover로 자식을 움직이려면 부모에 `group`, 자식에 `group-hover:*`. (framer-motion을 쓰는 이 프로젝트는 variants 전파로 대체)
- 접두는 **중첩** 가능: `md:hover:bg-accent`, `dark:md:text-white`.
- 임의 셀렉터 `[&>svg]:size-4` 로 자식 태그를 직접 겨냥 가능(반복 클래스 줄이기).

## 뷰포트·미디어 접두 — 기준은 무엇이고 뭐가 있나

### 기준: `min-width` 미디어 쿼리, 모바일 우선

`md:` 같은 접두는 **"화면 폭이 그 값 **이상**일 때 적용"** 이다. `max-width`가 아니라 **`min-width`**가 기본이라
접두 없는 클래스 = 모든 화면(=모바일), `md:`부터 위로 덮어쓰는 **모바일 우선** 구조가 된다.

```
text-sm md:text-base    →  기본 sm, 768px 이상에서 base
```

v4가 실제로 뽑는 CSS는 옛 문법(`min-width:`)이 아니라 **range 문법**이다:

| 접두 | 생성되는 미디어 쿼리 | rem | px(기본 16px 기준) |
|---|---|---|---|
| `sm:` | `@media (width >= 40rem)` | 40rem | 640px |
| `md:` | `@media (width >= 48rem)` | 48rem | **768px** |
| `lg:` | `@media (width >= 64rem)` | 64rem | **1024px** |
| `xl:` | `@media (width >= 80rem)` | 80rem | 1280px |
| `2xl:` | `@media (width >= 96rem)` | 96rem | 1536px |

> 값의 출처는 `node_modules/tailwindcss/theme.css`의 **`--breakpoint-*`** 네임스페이스.
> 이 프로젝트 규칙(md=768 / lg=1024)은 **Tailwind 기본값과 완전히 동일**하므로 따로 재정의할 게 없다.

**⚠️ px이 아니라 rem이라는 점 (놓치기 쉬움)**
- 브레이크포인트는 `rem` 단위다. 그런데 **미디어 쿼리 안의 `rem`은 `html { font-size }`를 따르지 않고
  항상 브라우저 기본 글꼴 크기(보통 16px)를 기준**으로 계산된다.
- 즉 `html { font-size: 62.5% }` 같은 트릭을 써도 브레이크포인트는 안 흔들린다.
- 반대로 **사용자가 브라우저 기본 글꼴을 키우면 브레이크포인트도 같이 커진다.** 이건 버그가 아니라
  "글씨가 큰 사람에겐 더 일찍 모바일 레이아웃"이라는 **의도된 접근성 동작**이다.

### 방향·구간을 바꾸는 접두

| 형태 | 의미 | 쓰는 때 |
|---|---|---|
| `md:` | `width >= 48rem` | **기본. 모바일 우선** |
| `max-md:` | `width < 48rem` | 데스크탑 우선(역방향). 프로젝트 규칙상 예외적으로만 |
| `md:max-lg:` | `48rem <= width < 64rem` | **구간 한정** (태블릿만) |
| `min-[900px]:` | `width >= 900px` | 이름 없는 임의 브레이크포인트 |
| `max-[900px]:` | `width < 900px` | 임의값 역방향 |

- `max-*`와 `min-*`은 **접두를 겹쳐 구간**을 만든다 — 이게 "태블릿에서만"을 표현하는 정석.
- 임의값은 `px`/`rem` 아무거나 가능하지만, **반복되면 `--breakpoint-*` 토큰으로 승격**하는 게 맞다.

### 브레이크포인트 커스터마이즈 (`globals.css`)

```css
@theme {
  --breakpoint-md: 50rem;    /* 기존 이름 값 변경 */
  --breakpoint-3xl: 120rem;  /* 새 이름 추가 → 3xl: 유틸 생성 */
  --breakpoint-2xl: initial; /* 개별 제거 */
  --breakpoint-*: initial;   /* 전부 제거하고 새로 정의 */
}
```

이름을 추가하면 `3xl:` / `max-3xl:` 접두가 **자동 생성**된다. (→ 네임스페이스 규칙은 위 "네임스페이스별 유틸 대응표")

### ⚠️ 컨테이너 쿼리는 뷰포트가 아니다 — `@` 접두

혼동 주의. **`@`가 붙으면 뷰포트가 아니라 "부모 컨테이너의 폭"** 기준이다.

| 접두 | 기준 | 값의 출처 |
|---|---|---|
| `md:` | **뷰포트** 폭 | `--breakpoint-*` |
| `@md:` | **가장 가까운 `@container` 조상**의 폭 | `--container-*` |

```
<div class="@container">
  <div class="flex-col @md:flex-row">  ← 화면이 아니라 이 부모 div가 28rem 이상일 때
```

- 부모에 `@container`(= `container-type: inline-size`)를 **반드시** 붙여야 동작한다.
- `@max-md:`, `@min-[400px]:` 도 동일하게 지원. 이름 붙인 컨테이너는 `@container/sidebar` + `@md/sidebar:`.
- **판단 기준**: "화면 크기에 따라" = `md:` / "이 컴포넌트가 놓인 자리 폭에 따라" = `@md:`.
  재사용 컴포넌트(카드 등)는 후자가 옳은 경우가 많다.

### 그 밖의 미디어/환경 접두 (v4 내장, 전체)

브레이크포인트 외에 **미디어 쿼리로 생성되는 접두**들. (설치된 v4에서 확인)

| 접두 | 미디어 쿼리 | 메모 |
|---|---|---|
| `portrait:` `landscape:` | `orientation` | 화면 **방향**. 폭 기준이 아니라 가로/세로 비율 |
| `print:` | `print` | 인쇄용 스타일 |
| `dark:` | `prefers-color-scheme: dark` | (설정에 따라 class 전략으로 바꿀 수도 있음) |
| `motion-reduce:` `motion-safe:` | `prefers-reduced-motion` | **이 프로젝트 필수** — 모션 최소화 대응 |
| `contrast-more:` `contrast-less:` | `prefers-contrast` | 고대비 선호 |
| `forced-colors:` | `forced-colors: active` | Windows 고대비 모드 |
| `inverted-colors:` | `inverted-colors` | 색 반전 설정 |
| `pointer-coarse:` `pointer-fine:` `pointer-none:` | `pointer` | **주 입력장치** 정밀도(터치 vs 마우스) |
| `any-pointer-coarse:` `any-pointer-fine:` `any-pointer-none:` | `any-pointer` | 연결된 **아무** 입력장치 |
| `noscript:` | `scripting: none` | JS 꺼짐 |

**실무 팁**
- **"모바일이냐"를 폭(`md:`)으로 판단하지 말아야 할 때가 있다.** 터치 여부는 `pointer-coarse:`가 정확하다.
  예: hover 인터랙션은 `pointer-fine:hover:*`로 걸어야 터치 기기에서 hover가 눌어붙지 않는다.
- `motion-reduce:`는 CSS 레벨 대응이고, framer-motion은 `useReducedMotion()` 훅으로 JS 레벨에서 잡는다.
  **둘은 별개** — 이 프로젝트는 후자를 쓴다(→ `FRAMER_MOTION_GUIDE.md`).
- `dark:`는 이 프로젝트에선 무의미하다(항상 다크 배경 고정).

### 9. Transitions / Transform / Animation
| 클래스 | 의미 |
|---|---|
| `transition` `transition-colors` | 전환 대상 |
| `duration-300` `ease-out` `delay-150` | 타이밍 |
| `scale-105` `-translate-x-1/2` `rotate-45` | transform |
| `animate-spin` `animate-pulse` `animate-bounce` | 프리셋 애니메이션 |

**실무 팁**
- hover 확대: `transition hover:scale-105` — 단, `transition` 없으면 뚝 끊긴다.
- `transition-colors`처럼 **대상을 좁히면** 성능·의도가 명확(전체 `transition`보다 나음).
- 복잡한 인터랙션/시퀀스는 유틸보다 **framer-motion**이 유지보수에 유리(이 프로젝트 선택).
- framer-motion으로 애니메이트하는 요소의 **정적 위치**를 transform 유틸(`-translate-x-1/2`, `scale-*`, `rotate-*`)로 잡지 마라 — motion이 같은 transform 속성을 덮어쓴다. 위치는 `left`/`inset`/margin으로, 움직임은 motion으로 분리.

---

## 스타일 재사용: 인라인 / 컴포넌트 / @apply / @utility

같은 스타일이 반복될 때 Tailwind에서 묶는 방법은 4가지이고 **우선순위**가 있다.

| 방법 | 무엇 | 언제 |
|---|---|---|
| ① 인라인 유틸 반복 | 클래스를 요소에 직접 | 기본값. 특히 **`map`으로 순회 렌더**하면 마크업을 한 번만 쓰므로 "반복"이 아예 안 생긴다 |
| ② 컴포넌트 추출 | `<Circle>` 같은 (지역) 컴포넌트 | 마크업+동작이 복잡하거나 **여러 파일에서** 재사용될 때. Tailwind가 **가장 권장하는 재사용 수단** |
| ③ `@utility` (v4) | CSS에 커스텀 유틸 정의 | `md:`/`hover:` 같은 **variant와 함께** 써야 하는 순수 스타일이 여러 곳 반복될 때 (예: `container-page`) |
| ④ `@apply` | 커스텀 클래스에 유틸 묶기 | 최후의 수단. Tailwind 공식도 **아껴 쓰라** 권고 |

**핵심 원칙**
- Tailwind의 재사용은 **CSS 클래스를 새로 만드는 게 아니라 "컴포넌트로 빼는 것"**이 기본(utility-first).
- `@apply`/커스텀 CSS 클래스의 비용: 스타일이 마크업에서 **분리**돼 "마크업만 보면 스타일이 다 보인다"는 co-location 이점이 깨진다. 값을 CSS에 하드코딩하면 **디자인 토큰 시스템 밖으로** 나간다.
- **성급한 추상화(premature abstraction) 경계**: 2~3번 쓴다고 클래스를 만들 필요는 거의 없다. 특히 `map` 렌더면 이미 한 번만 작성한 것.

**판단 순서 (altitude)**
1. `map`으로 도는가? → 인라인 유틸로 충분 (반복 아님).
2. 마크업/동작이 복잡하거나 여러 곳에서? → **컴포넌트**.
3. variant 붙는 순수 스타일이 진짜 여러 곳 반복? → `@utility`.
4. 그래도 클래스가 필요? → `@apply` (신중히).

> 이 프로젝트 예: 반복 카드 = **컴포넌트**(`ProjectCard`), 공통 컨테이너 = **`@utility`**(`container-page`), 반복 데이터 = **배열+map**(각 섹션).

---

## React / Next.js에서 Tailwind 쓸 때 팁

### 클래스 관리
- **조건부 클래스는 문자열 결합 대신 `clsx`/`cn` 헬퍼**를 써라. 삼항 연산 남발은 가독성을 해친다.
  ```tsx
  className={cn('px-4 py-2', isActive && 'bg-accent', disabled && 'opacity-50')}
  ```
- **동적 클래스 이름을 문자열로 조립하지 마라.** Tailwind는 소스에서 **정적 문자열**을 스캔해 CSS를 생성하므로, `` `text-${color}-500` `` 같은 건 빌드에서 누락된다.
  → 완성형 클래스를 매핑으로 보관: `const map = { red: 'text-red-500', blue: 'text-blue-500' }`.
- 재사용 UI는 클래스를 컴포넌트로 캡슐화하거나, 진짜 반복되면 v4의 `@utility`(구 `@apply`)로 묶어라.
  이 프로젝트는 `container-page`를 `@utility`로 정의.

### 컴포넌트 라이브러리 패턴
- **`tailwind-merge`**로 중복/충돌 클래스를 정리한다. `px-2`와 `px-4`가 같이 오면 뒤 값이 이기게.
  보통 `clsx + tailwind-merge`를 합친 `cn` 유틸을 하나 만들어 쓴다(shadcn/ui 방식).
- 자식에게 스타일 오버라이드를 허용하려면 `className` prop을 받아 `cn(base, className)`으로 병합.
- 변형(variant)이 많은 컴포넌트는 **`cva`(class-variance-authority)** 로 관리하면 깔끔.

### Next.js 특화
- **서버 컴포넌트에서도 Tailwind는 그대로 동작**한다(빌드 타임 CSS라 런타임 무관). `"use client"`는 상호작용 훅이 필요할 때만 — 이 프로젝트는 hover 카드만 클라이언트로 분리(`ProjectCard.tsx`).
- **`next/font`** 로 폰트를 불러오면 CSS 변수로 주입되므로, v4에선 `@theme inline`으로 그 변수를 토큰에 연결한다(이 프로젝트 `--font-korean` 등).
- **다크 모드**: `next-themes` + `dark:` 접두가 표준. 클래스 전략(`class`)을 쓰면 FOUC 방지를 위해 스크립트 주입 순서 주의.
- Turbopack/App Router에서 새 클래스가 안 먹으면 **dev 서버 재시작**으로 소스 스캔을 갱신해보라.

### 성능·디버깅
- **미사용 클래스는 자동 제거(purge)** 되므로 번들 걱정 없이 유틸을 써도 된다 — 단, 위의 "동적 클래스" 함정 때문에 스캔 대상 파일 경로(v4는 자동 감지)를 벗어난 문자열은 누락될 수 있다.
- 클래스가 너무 길어져 읽기 힘들면: 논리 그룹 순서(레이아웃 → 박스 → 타이포 → 색 → 상태)를 지키면 리뷰가 쉽다. `prettier-plugin-tailwindcss`가 이 순서로 자동 정렬해준다.
- VS Code는 **Tailwind CSS IntelliSense** 확장으로 자동완성·호버 미리보기·오타 경고를 켜라.
