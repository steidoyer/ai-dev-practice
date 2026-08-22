# 접근성(a11y) 기준 체크리스트

이 프로젝트에서 실제로 적용한 접근성 기준과 **다음 컴포넌트를 추가할 때 지켜야 할 규칙**을 정리한다.
기준은 WCAG 2.1 AA를 목표로 한다. (구현 상세 로그가 아니라 "무엇을·왜·어떻게 확인"을 담는다.)

## 요약 체크리스트

| 항목 | 기준 | 이 프로젝트 상태 |
|---|---|---|
| 이미지 대체텍스트 | 의미 있는 `alt`, 장식은 `alt=""`/`aria-hidden` | ✅ (래스터 이미지 없음, SVG 플레이스홀더는 `aria-hidden`) |
| 아이콘 전용 링크/버튼 | 텍스트 없으면 `aria-label` | ✅ |
| 키보드 포커스 표시 | `:focus-visible`로 보이는 포커스 링 | ✅ 전역 규칙 |
| 색 대비 | 본문 4.5:1, 큰 텍스트/비텍스트 3:1 | ✅ 전 토큰 AA |
| 헤딩 계층 | h1 → h2 → h3, 건너뜀 없음 | ✅ |
| 상태 있는 위젯 | `aria-expanded`/`aria-controls` 등 | ✅ 햄버거 메뉴 |
| 모션 | `prefers-reduced-motion` 존중 | ✅ CSS + framer-motion |

---

## 1. 이미지 대체텍스트

**기준**
- 정보를 전달하는 이미지: 내용을 설명하는 `alt`.
- 순수 장식 이미지: `alt=""`(빈 문자열) 또는 컨테이너에 `aria-hidden="true"` — 스크린리더가 건너뛰게.

**이 프로젝트**
- 현재 `<img>`/`next/image`로 렌더되는 **실제 래스터 이미지는 없다.** 카드 썸네일 자리는 인라인 SVG 플레이스홀더이고 `aria-hidden="true"`로 감춰 장식 처리했다.
- `ProjectCard`는 `image` prop이 들어오면 `next/image`로 렌더하며, 이때 `alt`는 `imageAlt ?? \`${title} 미리보기\``로 **항상 의미 있는 값**을 갖도록 했다. (파일: `src/components/sections/ProjectCard.tsx`)

**새로 추가할 때**
- 프로젝트 스크린샷 등 정보성 이미지는 `imageAlt`로 구체적 설명을 넘긴다("ShopFlow 대시보드 화면" 등).
- 순수 장식이면 `alt=""` + 필요 시 `aria-hidden`.

## 2. 아이콘 전용 링크/버튼

**기준**: 보이는 텍스트가 없는 상호작용 요소는 접근 가능한 이름(accessible name)이 있어야 한다 → `aria-label`.

**이 프로젝트**
- Hero 스크롤 화살표(`motion.a`): 보이는 "Scroll" 텍스트 + `aria-label="Scroll to projects"`.
- 햄버거 버튼: `aria-label`이 열림/닫힘 상태에 따라 `"Open menu"`/`"Close menu"`로 바뀜.
- CTA·Footer 소셜 링크: 아이콘 옆에 **텍스트 라벨**(`GitHub`, `LinkedIn` 등)이 함께 있어 별도 `aria-label` 불필요.

**새로 추가할 때**
- 아이콘만 있는 링크/버튼이면 반드시 `aria-label`.
- 아이콘 옆에 텍스트가 있으면 그 텍스트가 이름이 되므로 중복 `aria-label`은 넣지 않는다.
- 장식용 아이콘 SVG는 `aria-hidden="true"`(react-icons는 부모가 이름을 가지면 아이콘을 감추는 게 자연스럽다).

## 3. 키보드 포커스 표시 (focus-visible)

**기준**: 키보드로 이동할 때 지금 어디에 포커스가 있는지 **시각적으로 보여야** 한다. 단, 마우스 클릭 시엔 굳이 안 떠도 된다 → `:focus-visible`.

**이 프로젝트** — 전역 규칙으로 일괄 적용 (파일: `src/app/globals.css`)
```css
a:focus-visible,
button:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```
- 색은 `--color-accent` 토큰(하드코딩 없음). `outline-offset`으로 요소에서 살짝 띄우고, 요소의 기존 `radius`를 따라 모서리도 둥글게 그려진다.
- `:focus`가 아니라 `:focus-visible`이라 마우스 클릭 시엔 링이 안 뜬다(디자인 방해 없음), 키보드 Tab 이동 시에만 표시.

**새로 추가할 때**: 커스텀 인터랙션 요소(예: `role="button"` div)는 `tabindex="0"`을 주면 위 전역 규칙이 자동 적용된다. `outline: none`으로 포커스 링을 지우지 말 것.

## 4. 색 대비 (WCAG AA)

**기준**(배경 `#0a0a0a` 기준): 본문 텍스트 4.5:1, 큰 텍스트(≥24px 또는 ≥19px bold)·비텍스트(경계/아이콘) 3:1.

**이 프로젝트** — 전 텍스트 토큰 AA 충족:

| 토큰 | 값 | 대비 | 판정 |
|---|---|---|---|
| `text-primary` | `#ffffff` | ≈19.5:1 | AAA |
| `text-secondary` | `#a3a3a3` | ≈7.8:1 | AAA |
| `text-muted` | `#808080` | ≈5.0:1 | AA (원래 `#666`=3.4:1이라 상향) |
| `text-accent`(텍스트) | `#6366f1` | ≈4.4:1 | 경계 — 작은 라벨에만 제한적 사용 |

- `text-muted`는 원래 `#666666`(3.4:1)로 Footer 저작권 작은 글씨에서 AA 미달이라 **`#808080`으로 상향**했다.
- `--color-accent`(`#6366f1`)는 텍스트로 쓰면 4.4:1로 4.5에 근소 미달이지만, **버튼 배경/보더/포커스 링(비텍스트 3:1 기준)** 용도는 통과. 브랜드 색이라 유지하고, 작은 accent 라벨에만 제한적으로 쓴다.

**새로 추가할 때**
- 새 색을 토큰에 추가하면 배경 위 대비를 먼저 계산(4.5:1 이상 권장).
- accent 위에 텍스트를 얹을 땐 크게/굵게(큰 텍스트 3:1) 쓰거나 `text-primary`(흰색)를 얹는다.

## 5. 헤딩 계층

**기준**: 페이지에 `h1`은 하나, 이후 단계를 건너뛰지 않고 내려간다(h1→h2→h3).

**이 프로젝트** (확인: `<h1..6>` grep)
```
h1  Hero          "DEV STUDIO"           (페이지 유일 h1)
h2  Projects      "Selected Work"
h2  Skills        "Skills & Stack"
h2  CTA           "같이 만들어봐요"
h3  ProjectCard   프로젝트 제목
```
건너뜀 없이 논리적. `<main>`은 `layout.tsx`에 하나, 각 섹션은 `<section id>`.

**새로 추가할 때**: 시각적 크기는 `text-*` 토큰으로 조절하고, **의미 계층은 태그(h2/h3)로** 표현한다(크기 때문에 계층을 건너뛰지 말 것).

## 6. 상태 있는 위젯 (햄버거 메뉴)

**기준**: 열리고 닫히는 컨트롤은 현재 상태와 제어 대상을 프로그램적으로 노출 → `aria-expanded`, `aria-controls`.

**이 프로젝트** (파일: `src/components/layout/Header.tsx`)
- 토글 버튼: `aria-expanded={open}`, `aria-controls="mobile-menu"`, 상태별 `aria-label`.
- 메뉴 패널: 대응하는 `id="mobile-menu"`, `aria-label="Mobile navigation"`.
- 앵커 클릭 시 메뉴 자동 닫힘(포커스 흐름/사용성).

**새로 추가할 때**: 아코디언·드롭다운·탭 등 상태 위젯은 `aria-expanded`/`aria-controls`(+ 필요 시 `aria-selected`, `role`)를 짝지어 준다.

## 7. 모션 — prefers-reduced-motion 존중

**기준**: 모션 최소화를 선호하는 사용자에게는 애니메이션을 끄거나 약하게.

**이 프로젝트** — CSS와 JS 양쪽 처리:
- CSS: `@media (prefers-reduced-motion: reduce)`에서 `scroll-behavior: auto`(부드러운 스크롤 비활성화). (`globals.css`)
- framer-motion: `FadeIn`·`Hero`·`Approach`·`Header`·`ProjectCard`가 reduced일 때 등장/hover/바운스를 최소화. **렌더 출력 분기는 SSR-안전한 `useReducedMotionSafe`** 훅으로 한다 — framer의 `useReducedMotion()`을 render 분기에 쓰면 **하이드레이션 불일치**(서버=false/클라=true). (→ `FRAMER_MOTION_GUIDE.md` §5.3, `NEXTJS_GUIDE.md` §5.6)
- JS 스크롤: Hero 화살표 클릭의 `scrollIntoView`는 CSS 미디어쿼리를 자동 반영하지 않으므로, reduced에 따라 `behavior`를 `'smooth'`/`'auto'`로 **직접 분기**했다(이벤트 핸들러라 훅 종류 무관).

**새로 추가할 때**: framer render 출력을 reduced로 분기하면 **`useReducedMotionSafe`로 가드**(SSR-안전). 선언형 등장은 `<MotionConfig reducedMotion="user">`도 방법(이동만 끄고 opacity 유지). 재사용 래퍼(`FadeIn`)에 감싸면 이 처리가 자동 상속된다. JS로 스크롤/애니메이션을 직접 돌릴 때는 미디어쿼리를 코드로 반영할 것.

## 8. 개발자도구(DevTools)로 접근성 확인하기

브라우저 개발자도구에는 접근성 점검 도구가 여러 개 들어 있다. 아래는 **Chrome/Edge**(Chromium) 기준, Firefox는 §8.6.

### 8.1 Accessibility(접근성) 탭 — 요소 하나가 스크린리더에 어떻게 잡히나
- **열기**: `F12` → **Elements** 패널 → 요소 선택 → 오른쪽 사이드바 **`Accessibility`** 탭(안 보이면 `»`(More tabs) 안에).
- 보여주는 것:
  - **Accessibility Tree** — 이 노드의 role/name과 트리 위치. `aria-hidden`이 실제로 먹어 요소가 트리에서 빠졌는지(무시됨)를 여기서 확인. *(Approach 벤 다이어그램 컨테이너를 숨겼는지 확인하는 데 쓴 게 이 뷰.)*
  - **ARIA Attributes** — 그 요소에 적용된 `aria-*` 속성 목록 → **§6** 상태 위젯(`aria-expanded`/`aria-controls`)이 실제로 붙었는지 확인.
  - **Computed Properties** — 계산된 **접근 가능한 이름(accessible name)**·role. 아이콘 버튼의 `aria-label`이 이름으로 잡혔는지(**§2**), 요소가 무시됐다면 그 **이유**까지.
  - **Source Order Viewer** (`Show source order` 체크) — 뷰포트 위에 요소의 **DOM 소스 순서**를 번호로 그려준다. 시각 순서와 DOM 순서가 어긋나면 키보드/SR 사용자가 혼란 → "제목 → 보완설명" 같은 **읽기 순서** 검증에 유용.

### 8.2 페이지 전체 접근성 트리
- Accessibility 탭의 **`Show accessibility tree`** 토글(또는 Elements 우상단 **사람 모양 아이콘**) → DOM 트리 자리에 **페이지 전체 접근성 트리**가 뜬다. SR이 페이지를 통째로 어떻게 훑는지 확인. → **§5** 헤딩 계층(h1→h2→h3)이 트리에서 논리적인지 보기 좋다.

### 8.3 색 대비 검사 (→ §4)
- **Styles**에서 색 값 옆 **색 견본**을 클릭 → 색상 선택기 안에 **Contrast ratio** 수치와 AA/AAA 통과선이 표시된다. 새 색 토큰을 배경 위에 얹을 때 즉석 확인.
- 여러 요소를 한꺼번에 보려면 **CSS Overview** 패널의 대비 문제 목록.

### 8.4 Rendering 탭 — 사용자 조건을 에뮬레이트
- **열기**: `⋮`(More tools) → **Rendering**.
- 접근성 관련 옵션:
  - **Emulate vision deficiencies** — Blurred vision, Reduced contrast, Protanopia(적)/Deuteranopia(녹)/Tritanopia(청) 색각, Achromatopsia(전색맹). → **색만으로** 정보를 구분하고 있지 않은지 점검(교집합·라벨을 accent 색 하나로만 구분하면 여기서 드러남).
  - **Emulate CSS `prefers-reduced-motion`** — OS 설정을 건드리지 않고 모션 최소화 상태를 테스트 (→ **§7**). 스크롤 병합 인터랙션을 붙인 뒤 정지 상태가 제대로 나오는지 확인.
  - **Emulate CSS `prefers-color-scheme`** / **`prefers-contrast`** / **`prefers-reduced-transparency`** / **forced-colors**(강제 색 모드).
  - **Emulate a focused page** — 포커스가 페이지에 있는 상태를 유지 → 포커스 링·드롭다운 등 **포커스 의존 UI** 디버깅 (→ **§3**).

### 8.5 Lighthouse / axe — 자동 감사
- **Lighthouse** 패널 → **Accessibility** 카테고리 체크 → **Generate report**. 대비·이름 없는 버튼·헤딩 순서 등을 자동 검출. **회귀 점검용**이며 수동 확인을 대체하진 못한다(자동 도구는 문제의 일부만 잡는다).
- 더 깊은 규칙은 **axe DevTools** 확장.

### 8.6 Firefox
- 별도 **Accessibility** 패널이 내장돼 있다(개발자도구 탭 목록에서 켜기). 접근성 트리 + **`Check for issues`**(대비·키보드·텍스트 라벨 자동 점검), 색각 시뮬레이션, **`Show Tabbing Order`**(탭 순서를 화면에 번호로 시각화)까지 제공 — 탭 순서 확인은 Firefox 쪽이 편하다.

---

## 검증 방법 (수동)

- **키보드만으로 전체 이동**: Tab/Shift+Tab으로 헤더 → 섹션 링크 → CTA까지 포커스 링이 보이며 순서가 논리적인지.
- **스크린리더**: 헤딩 목록(h1→h2→h3), 링크 이름(aria-label), 햄버거 상태 안내 확인.
- **색 대비**: 브라우저 devtools의 대비 검사 또는 대비 계산기로 새 색 토큰 점검. (도구: §8.3)
- **reduced-motion**: OS "동작 줄이기" 켠 뒤 등장/스크롤 애니메이션이 죽는지. (OS를 안 건드리고 볼 땐 §8.4 에뮬레이트)
- **접근성 트리 / aria 확인**: 요소가 SR에 어떻게 잡히는지·`aria-hidden`이 먹었는지 → §8.1~8.2.
- **자동화(선택)**: Lighthouse Accessibility, axe DevTools로 회귀 점검(도구: §8.5).
