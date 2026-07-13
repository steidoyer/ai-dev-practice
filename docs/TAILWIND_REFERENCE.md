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
- `sticky top-0`은 부모가 `overflow-hidden`이면 동작하지 않는다 — 조상 overflow를 먼저 의심.
- `hidden md:block` / `md:hidden` 조합으로 뷰포트별 요소 노출·숨김을 처리(이 프로젝트 Header가 이 패턴).

### 2. Flexbox
| 클래스 | 의미 |
|---|---|
| `flex-row` `flex-col` | 주축 방향 |
| `flex-wrap` `flex-nowrap` | 줄바꿈 |
| `items-center` `items-start` `items-stretch` | 교차축 정렬(align-items) |
| `justify-between` `justify-center` `justify-end` | 주축 정렬(justify-content) |
| `flex-1` `flex-none` `shrink-0` `grow` | 신축 |
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

### 8. States / Variants (상태·조건 접두)
| 접두 | 의미 |
|---|---|
| `hover:` `focus:` `active:` `disabled:` | 상호작용 상태 |
| `focus-visible:` | 키보드 포커스만(마우스 클릭 제외) |
| `group-hover:` `peer-checked:` | 부모/형제 상태 연동 |
| `md:` `lg:` | 뷰포트(모바일 우선) |
| `dark:` | 다크 모드 |
| `aria-expanded:` `data-[state=open]:` | 속성 기반 |
| `first:` `last:` `odd:` `[&>svg]:` | 구조/임의 셀렉터 |

**실무 팁**
- **모바일 우선**: 접두 없는 게 모바일 기본, `md:`/`lg:`가 데스크탑 확장(이 프로젝트 규칙).
- 포커스 링은 `focus:` 대신 `focus-visible:`을 써야 마우스 클릭 시 안 튄다.
- 부모 hover로 자식을 움직이려면 부모에 `group`, 자식에 `group-hover:*`. (framer-motion을 쓰는 이 프로젝트는 variants 전파로 대체)
- 접두는 **중첩** 가능: `md:hover:bg-accent`, `dark:md:text-white`.
- 임의 셀렉터 `[&>svg]:size-4` 로 자식 태그를 직접 겨냥 가능(반복 클래스 줄이기).

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
