# framer-motion (Motion for React) 가이드

> 직접 코딩하며 옆에 두고 참고하는 문서. **개념·사용법·실무 패턴·주의점**을 정리한다.
> 이 프로젝트 버전: **framer-motion 12.42.0** (라이브러리 통칭이 "Motion"으로 바뀌었고 신규 패키지는 `motion`이지만, 여기선 설치돼 있는 `framer-motion`을 쓴다. import 경로만 다를 뿐 API는 같다.)
> 공식 문서: https://motion.dev/docs/react — 최신 API 시그니처는 항상 여기서 확인.

관련 문서:
- 이 프로젝트의 애니메이션 **적용 방식 결정**(래퍼 vs 직접): `DEV_QNA.md` Q11
- 접근성(reduced-motion) 기준: `A11Y_CHECKLIST.md` 7번
- 애니메이션 **성능** 원리: `PERFORMANCE_NOTES.md` 7번

---

## 0. 이 프로젝트에서 이미 쓰인 곳 (실물 예시)

새 걸 만들기 전에, 아래 실제 코드를 먼저 읽어보면 개념이 빨리 잡힌다.

| 파일 | 쓰인 기능 |
|---|---|
| `src/components/motion/FadeIn.tsx` | `whileInView` 스크롤 진입 페이드업, `once`, `viewport margin`, `useReducedMotion` 가드 |
| `src/components/sections/Hero.tsx` | `variants` + `staggerChildren` 순차 등장, `animate` keyframes 반복 바운스(`repeat: Infinity`) |
| `src/components/sections/ProjectCard.tsx` | `whileHover`, 부모→자식 `variants` 전파(카드 hover 시 이미지 확대) |
| `src/components/layout/Header.tsx` | `AnimatePresence` + `motion.nav` height/opacity 슬라이드(모바일 드롭다운), reduced-motion 시 페이드만 |

> **읽는 순서 추천**: FadeIn(가장 단순) → ProjectCard(variants 전파) → Hero(stagger+keyframes) → Header(AnimatePresence).

---

## 1. 역할 — 왜 framer-motion인가

**선언적(declarative) 애니메이션 라이브러리.** "어떻게 프레임을 그릴지"가 아니라 **"어떤 상태로 갈지"**를 props로 선언하면 라이브러리가 사이를 채워 준다.

주는 것:
- `motion.*` 컴포넌트에 상태(`animate`)만 주면 트윈/스프링 보간
- 제스처(hover/tap/drag/inView)를 props 한 줄로
- **레이아웃 애니메이션**(`layout`) — 요소 위치/크기 변화를 자동 트랜지션 (CSS로는 매우 까다로운 영역)
- **mount/unmount 애니메이션**(`AnimatePresence`) — React에서 사라지는 요소에 exit 효과 (순수 CSS로 거의 불가)
- 스크롤 연동(`useScroll`), 접근성(`useReducedMotion`)

### 언제 framer-motion을 쓰고, 언제 CSS로?
- **CSS `transition`/`animation`으로 충분**: 단순 hover 색/그림자 변화, 무한 회전 스피너 등 상태가 단순하고 진입/이탈이 없을 때. (번들 0, 가장 가볍다.)
- **framer-motion이 유리**: 여러 요소 **순차 등장(stagger)**, **unmount 시 exit**, **레이아웃 변경 애니메이션**, 스크롤 진행에 값 연동, 제스처 상태 조합. → CSS로 하면 코드가 복잡해지는 지점.
- 이 프로젝트가 GSAP 대신 framer-motion을 고른 이유: **React 컴포넌트/상태와 자연스럽게 맞물리기 때문**(§ CLAUDE.md 핵심 결정).

> 판단 기준 한 줄: **"상태 전환 + React 생명주기(mount/unmount/리스트)"가 얽히면 framer-motion, 아니면 CSS.**

### 1.1 React가 아니라면 — GSAP · Motion(바닐라) · CSS

framer-motion은 **React 전용**이다(`motion.*`·훅이 전부 React 위에서 돈다). 그래서 순수 HTML/CSS/JS 환경에선 아예 선택지에서 빠지고, 아래를 쓴다.

- **GSAP** — 프레임워크에 독립적. `gsap.to(el, {...})` 명령형 제어 + **Timeline**(정밀 시퀀스) + **ScrollTrigger**·SVG morph 등 플러그인. 복잡한 스크롤/타임라인이면 바닐라의 사실상 표준. (2025년 기준 모든 플러그인 포함 완전 무료로 풀림.)
- **Motion (바닐라)** — motion.dev의 `animate()`/`scroll()`/`inView()`. **Web Animations API 기반이라 매우 가벼움**(수 kb). 단순~중간 규모에 적합. (구 "Motion One" — 아래 참고.)
- **CSS `transition`/`@keyframes`, Web Animations API(직접)** — 아주 단순한 hover·페이드·스피너. 번들 0.
- **CSS scroll-driven animations**(`animation-timeline`) — 최신 스크롤 효과를 라이브러리 없이.

| 상황 | 추천 |
|---|---|
| 복잡한 타임라인/스크롤/SVG (바닐라) | **GSAP** |
| 단순~중간, 번들 최소화 (바닐라) | **Motion 바닐라** / WAPI |
| 아주 단순 (바닐라) | **CSS** transition/keyframes |
| React 프로젝트 | **framer-motion** (선언적 + 컴포넌트 생명주기 통합) |

> 핵심은 우열이 아니라 **패러다임**이다: framer-motion = *선언적 + React 상태 연동*, GSAP = *명령형 + 타임라인 + 프레임워크 무관*.

#### 참고: "Motion"과 "framer-motion"은 같은 프로젝트다 (React판 / 바닐라판이 따로 있음)

motion.dev("Motion")는 한 프로젝트 아래 **두 갈래 API**를 제공한다:
- **Motion for React** — 패키지 `motion` (`import { motion } from "motion/react"`). **`framer-motion`은 이 React판의 옛 패키지명**으로, 지금도 별칭으로 유지된다. **이 프로젝트가 쓰는 게 이것.**
- **Motion 바닐라** — `import { animate, scroll, inView, stagger } from "motion"`. React 없이 순수 DOM에서 동작. **예전 이름이 "Motion One".**

즉 **바닐라 버전이 따로 존재한다.** 브랜드는 같고, 바닐라는 Web Animations API 기반이라 가볍고, React판(framer-motion)은 그 위에 컴포넌트·제스처·레이아웃 애니메이션을 얹은 것이다. (그래서 "React면 framer-motion, 바닐라면 GSAP 또는 Motion 바닐라"라는 정리가 된다.)

---

## 2. 핵심 개념 & 기본 사용법

### 2.1 `motion` 컴포넌트
일반 태그 앞에 `motion.`을 붙이면 애니메이트 가능한 버전이 된다.
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}   // 시작 상태
  animate={{ opacity: 1, y: 0 }}    // 목표 상태 (여기로 보간)
  transition={{ duration: 0.4 }}    // 어떻게 갈지
/>
```
- `initial`: 마운트 시 시작 값. `initial={false}`로 주면 초기 애니메이션을 건너뛴다(이미 최종 상태로 시작).
- `animate`: 현재 목표 상태. 이 값이 바뀌면 그때마다 다시 보간한다(상태/props로 제어 가능).
- 커스텀 컴포넌트를 감싸려면: `const MotionCard = motion.create(Card)` (구버전 `motion(Card)`의 대체). 감싼 컴포넌트는 `ref`를 forward해야 한다.

### 2.2 `transition` — 트윈 vs 스프링
```tsx
transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}   // tween(시간 기반)
transition={{ type: 'spring', stiffness: 300, damping: 30 }}  // spring(물리 기반)
```
- **tween**: `duration`+`ease`로 시간 제어. 등장/사라짐처럼 정해진 시간이 어울릴 때.
- **spring**: `stiffness`(강성)·`damping`(감쇠)·`mass`로 탄성. hover/드래그처럼 감각적인 인터랙션에 자연스럽다. `x`/`scale` 같은 물리적 이동에 특히 잘 맞음.
- `ease`: `'easeInOut'` 같은 문자열, `[0.4, 0, 0.2, 1]` 큐빅 베지어 배열 모두 가능.

### 2.3 keyframes (배열 값)
값을 배열로 주면 순차 통과한다. 반복 바운스 등에 사용(→ Hero 화살표).
```tsx
<motion.div
  animate={{ y: [0, 8, 0] }}
  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
/>
```
- `repeat: Infinity`, `repeatType: 'loop' | 'reverse' | 'mirror'`, `repeatDelay` 조합.

### 2.4 `variants` — 상태에 이름 붙이고 부모→자식 전파
값 객체를 컴포넌트 밖에서 이름을 붙여 정의. **부모가 상태를 바꾸면 자식들에게 자동 전파**된다 — stagger의 핵심.
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }, // 자식 0.15s 간격
  },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((t) => (
    <motion.li key={t} variants={item}>{t}</motion.li>  // animate 안 줘도 부모 따라감
  ))}
</motion.ul>
```
- 자식은 `variants`의 **같은 이름(hidden/show)**만 가지면 부모 상태를 따라간다.
- **주의**: 자식에 `animate`를 직접 주면 부모 전파가 끊긴다(자식이 스스로 제어). 전파를 원하면 자식엔 이름만.

### 2.5 제스처 props
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ ... }}
  whileInView={{ opacity: 1 }}          // 뷰포트 진입 시
  viewport={{ once: true, margin: '-80px' }}  // 한 번만, 80px 미리 트리거
/>
```
- `whileHover`/`whileTap`은 뗄 때 자동으로 원상 복귀.
- `whileInView` + `viewport`는 스크롤 진입 등장에 사용(→ FadeIn). `once: true`면 한 번만.

### 2.6 `AnimatePresence` — 사라지는 요소에 exit
React에서 컴포넌트가 unmount되면 보통 즉시 사라진다. `AnimatePresence`로 감싸면 **나가는 애니메이션(exit)**을 줄 수 있다(→ Header 드롭다운).
```tsx
<AnimatePresence>
  {open && (
    <motion.nav
      key="menu"                              // 직계 자식에 고유 key 필수
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}        // unmount 시 이 상태로
      transition={{ duration: 0.25 }}
    />
  )}
</AnimatePresence>
```
- `mode="wait"`: 이전 요소 exit가 끝난 뒤 새 요소 등장(교체 UI). `"sync"`(기본), `"popLayout"`도 있음.

---

## 3. 자주 쓰는 훅

| 훅 | 용도 |
|---|---|
| `useReducedMotion()` | OS "동작 줄이기" 설정 여부(boolean). 접근성 가드에 필수. |
| `useScroll()` | 스크롤 진행도(`scrollYProgress` 0~1 등)를 MotionValue로. |
| `useTransform(mv, [0,1], [0,100])` | MotionValue를 다른 범위로 매핑(패럴럭스·진행바). |
| `useSpring(mv)` | 값에 스프링 물성 부여(스크롤 값 부드럽게). |
| `useInView(ref, { once })` | 요소가 뷰포트에 있는지 boolean으로(로직 분기용). `whileInView`는 스타일용. |
| `useAnimate()` | `[scope, animate]` — 명령형으로 순서 있는 시퀀스 제어. |
| `useMotionValue(0)` | 리렌더 없이 갱신되는 애니메이션 값. 성능 민감한 곳. |
| `MotionConfig` | 하위 전체에 기본 `transition`/`reducedMotion` 주입(전역 설정). |

### 스크롤 연동 예시(패럴럭스)
```tsx
const { scrollYProgress } = useScroll()
const y = useTransform(scrollYProgress, [0, 1], [0, -200]) // 스크롤에 따라 위로
<motion.div style={{ y }} />   // 애니메이트가 아니라 style에 MotionValue를 직접 연결
```
> 요령: `useScroll`/`useTransform` 값은 `animate`가 아니라 **`style`에 꽂는다**(리렌더 없이 매 프레임 갱신).

---

## 4. 실무 사용 예시 (일반 패턴)

> 아래는 라이브러리 사용법을 보여주는 **일반 예시**다. 이 프로젝트에서 각 패턴이 실제로 어떻게 쓰였는지는 §0의 파일들을 참고.

### 4.1 스크롤 진입 페이드업 (가장 흔함)
```tsx
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
/>
```
언제: 섹션·카드가 스크롤로 나타날 때. **재사용 래퍼로 빼두면**(→ FadeIn) 매번 안 적어도 된다.

### 4.2 리스트 순차 등장 (stagger)
§2.4 variants 예시가 그대로 이 패턴. 카드 목록·태그 목록 등장에.

### 4.3 hover 카드 (부모 hover → 자식 확대)
```tsx
const card = { rest: {}, hover: { y: -8, scale: 1.02 } }
const image = { rest: { scale: 1 }, hover: { scale: 1.05 } }

<motion.a variants={card} initial="rest" whileHover="hover">
  <motion.div variants={image} style={{ overflow: 'hidden' }}>…</motion.div>
</motion.a>
```
포인트: 부모의 `whileHover="hover"` 하나로 자식 이미지까지 **동기 확대**. 이미지 컨테이너에 `overflow:hidden`으로 확대분 클립.

### 4.4 모달/드롭다운 (exit 필요)
§2.6 AnimatePresence 예시. 조건부 렌더(`{open && …}`)를 `AnimatePresence` **안**에 두는 게 핵심.

### 4.5 무한 반복 (스피너·바운스)
§2.3 keyframes + `repeat: Infinity`.

### 4.6 레이아웃 애니메이션
`layout` prop만 붙이면 크기/위치 변화가 자동 트랜지션된다.
```tsx
<motion.div layout />                    // 이 요소의 레이아웃 변화 애니메이트
<motion.div layoutId="hero-image" />     // 서로 다른 위치의 두 요소를 공유 전환(shared layout)
```
탭 인디케이터 이동, 목록 재정렬, 상세 열림 등에 강력. (단 비용이 크니 남발 금지 — §5.)

---

## 5. 주의점 / 흔한 함정

### 5.1 ⚠️ Next App Router: motion은 클라이언트 컴포넌트다 (가장 중요)
`motion.*`·훅은 브라우저 API/상태를 쓰므로 **`"use client"`가 있는 컴포넌트에서만** 동작한다. 서버 컴포넌트에 바로 쓰면 에러.
- **문제**: 섹션 전체에 `"use client"`를 붙이면 그 하위가 다 클라이언트 번들로 들어간다.
- **해결(이 프로젝트 방식)**: 애니메이션만 하는 **얇은 클라이언트 래퍼**(→ FadeIn)를 만들어 그걸로 감싸면, 섹션 자체는 **서버 컴포넌트로 유지**된다(RSC의 children 전달 원리). → 상세: `DEV_QNA.md` Q11.

### 5.2 성능: transform / opacity만 애니메이트
- `x`,`y`,`scale`,`rotate`,`opacity`는 **합성(compositing)** 단계라 layout/paint를 안 건드려 부드럽다.
- `width`,`height`,`top`,`left`,`margin` 애니메이션은 매 프레임 레이아웃 재계산 → 버벅임. 피할 것.
- `will-change`는 필요할 때만(남용 시 메모리 낭비). → `PERFORMANCE_NOTES.md` 7번.

### 5.3 접근성: prefers-reduced-motion 존중
- `useReducedMotion()`으로 분기해 **큰 이동/무한 반복을 끄거나 페이드만** 남긴다.
```tsx
const reduce = useReducedMotion()
<motion.div animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }} />
```
- 전역으로는 `<MotionConfig reducedMotion="user">`로 한 번에 처리 가능.
- **주의**: JS 스크롤(`scrollIntoView({behavior:'smooth'})`)은 이 설정을 **자동으로 안 지킨다** — 직접 분기해야 함(→ Hero의 화살표 스크롤이 그렇게 처리). → `A11Y_CHECKLIST.md` 7번.

### 5.4 AnimatePresence 함정
- 직계 자식에 **고유 `key`** 없으면 exit가 안 먹는다.
- 조건부 렌더를 `AnimatePresence` **밖**에 두면 exit 전에 사라진다 — 반드시 안쪽에.
- 리스트에서 여러 개가 들락날락하면 `mode="popLayout"` 고려.

### 5.5 variants 전파 끊김
- 자식에 `animate`를 직접 주면 부모 상태 전파가 끊긴다(§2.4). 전파를 원하면 자식엔 **variant 이름만**.
- 부모·자식 variant **이름 오타**면 조용히 안 움직인다 — 이름 일치 먼저 의심.

### 5.6 리렌더 vs MotionValue
- `useState`로 매 프레임 값을 바꾸면 리렌더가 과도하게 발생. 스크롤/드래그처럼 고빈도 값은 `useMotionValue`+`style`로 **리렌더 없이** 애니메이트.

### 5.7 SSR/hydration 깜빡임
- `initial`을 안 주면 서버 렌더 결과와 최종 상태가 달라 깜빡일 수 있다. 등장 애니메이션엔 `initial`을 명시.

---

## 6. 번들 경량화 (LazyMotion + `m`)

`motion` 전체는 기능이 많아 무겁다. 트리 흔들기가 잘 되게 하려면 `m` 컴포넌트 + 필요한 기능만 로드:
```tsx
import { LazyMotion, domAnimation, m } from 'framer-motion'

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />   {/* motion.div 대신 m.div */}
</LazyMotion>
```
- `domAnimation`(기본) vs `domMax`(드래그·레이아웃까지). 앱 전역을 감싸면 효과적.
- 애니메이션이 많아질수록 이득. 지금처럼 소규모면 필수는 아님(→ 필요 시 도입).

---

## 7. 디버깅 체크리스트 (안 움직일 때)

1. 이 컴포넌트에 **`"use client"`** 있나? (App Router에서 가장 흔한 원인)
2. `initial`과 `animate` **값이 실제로 다른가?** (같으면 보간할 게 없음)
3. variants면 부모·자식 **이름이 일치**하나? 자식에 `animate`를 잘못 준 건 아닌가?
4. exit가 안 되면: `AnimatePresence`로 감쌌나? 직계 자식 **key** 있나? 조건부가 안쪽인가?
5. 스크롤 값이면 `animate`가 아니라 **`style`**에 MotionValue를 꽂았나?
6. reduced-motion 설정 때문에 꺼진 건 아닌가?

---

## 8. 더 볼 것

- 공식 문서(React): https://motion.dev/docs/react
- 제스처/애니메이션/레이아웃 API 레퍼런스: 위 사이트의 각 페이지
- 이 프로젝트 실물 코드: §0 표의 4개 파일
