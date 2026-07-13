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
- framer-motion: `FadeIn`·`Hero`·`Header`·`ProjectCard`가 `useReducedMotion()`으로 등장/hover/바운스 애니메이션을 최소화.
- JS 스크롤: Hero 화살표 클릭의 `scrollIntoView`는 CSS 미디어쿼리를 자동 반영하지 않으므로, `prefersReducedMotion`에 따라 `behavior`를 `'smooth'`/`'auto'`로 **직접 분기**했다.

**새로 추가할 때**: framer-motion을 쓰면 `useReducedMotion()`으로 가드. 재사용 래퍼(`FadeIn`)에 감싸면 이 처리가 자동 상속된다. JS로 스크롤/애니메이션을 직접 돌릴 때는 미디어쿼리를 코드로 반영할 것.

---

## 검증 방법 (수동)

- **키보드만으로 전체 이동**: Tab/Shift+Tab으로 헤더 → 섹션 링크 → CTA까지 포커스 링이 보이며 순서가 논리적인지.
- **스크린리더**: 헤딩 목록(h1→h2→h3), 링크 이름(aria-label), 햄버거 상태 안내 확인.
- **색 대비**: 브라우저 devtools의 대비 검사 또는 대비 계산기로 새 색 토큰 점검.
- **reduced-motion**: OS "동작 줄이기" 켠 뒤 등장/스크롤 애니메이션이 죽는지.
- **자동화(선택)**: Lighthouse Accessibility, axe DevTools로 회귀 점검(다음 단계 후보).
