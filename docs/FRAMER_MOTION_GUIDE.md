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

| 파일                                      | 쓰인 기능                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/components/motion/FadeIn.tsx`        | `whileInView` 스크롤 진입 페이드업, `once`, `viewport margin`, `useReducedMotion` 가드                |
| `src/components/sections/Hero.tsx`        | `variants` + `staggerChildren` 순차 등장, `animate` keyframes 반복 바운스(`repeat: Infinity`)         |
| `src/components/sections/ProjectCard.tsx` | `whileHover`, 부모→자식 `variants` 전파(카드 hover 시 이미지 확대)                                    |
| `src/components/layout/Header.tsx`        | `AnimatePresence` + `motion.nav` height/opacity 슬라이드(모바일 드롭다운), reduced-motion 시 페이드만 |

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

| 상황                                | 추천                                                |
| ----------------------------------- | --------------------------------------------------- |
| 복잡한 타임라인/스크롤/SVG (바닐라) | **GSAP**                                            |
| 단순~중간, 번들 최소화 (바닐라)     | **Motion 바닐라** / WAPI                            |
| 아주 단순 (바닐라)                  | **CSS** transition/keyframes                        |
| React 프로젝트                      | **framer-motion** (선언적 + 컴포넌트 생명주기 통합) |

> 핵심은 우열이 아니라 **패러다임**이다: framer-motion = _선언적 + React 상태 연동_, GSAP = _명령형 + 타임라인 + 프레임워크 무관_.

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
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }} // 시작 상태
  animate={{ opacity: 1, y: 0 }} // 목표 상태 (여기로 보간)
  transition={{ duration: 0.4 }} // 어떻게 갈지
/>;
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
  - **stiffness ↑** → 더 급하고 빠르게 튕김 / **damping ↑** → 출렁임(오실레이션) 감소(0이면 무한 진동) / **mass ↑** → 무겁고 느리게, 오버슈트 커짐.
  - 대안 API: `stiffness/damping/mass` 대신 **`bounce`(0~1) + `visualDuration`**으로도 스프링을 잡을 수 있다. 시간 기반 애니메이션과 타이밍 맞추기 쉬움(이 둘을 주면 `stiffness`류는 무시됨).
- `ease`: `'easeInOut'` 같은 문자열, `[0.4, 0, 0.2, 1]` 큐빅 베지어 배열 모두 가능.

> **값이 어떻게 움직임을 바꾸는지 눈으로 보고 싶으면 → §8 "값 시각화·실험 도구".** 슬라이더로 stiffness/damping/mass·이징 곡선을 조절하며 실물 미리보기.

### 2.3 keyframes (배열 값)

값을 배열로 주면 순차 통과한다. 반복 바운스 등에 사용(→ Hero 화살표).

```tsx
<motion.div
  animate={{ y: [0, 8, 0] }}
  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
/>
```

- `repeat: Infinity`, `repeatType: 'loop' | 'reverse' | 'mirror'`, `repeatDelay` 조합.

### 2.4 `variants` — 상태에 이름 붙이고 부모→자식 전파

variants는 framer-motion에서 **가장 헷갈리는 개념**이자 가장 강력한 개념이다. 아래를 순서대로 읽으면 잡힌다.

#### 2.4.1 한 줄 정의 — "애니메이션 상태에 이름표를 붙이는 것"

지금까지(§2.1)는 값을 **직접** 넣었다:

```tsx
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} />
```

variants는 그 값 객체들에 **이름을 붙여 사전(dictionary)으로 빼두고**, props엔 **이름(문자열)만** 넘긴다:

```tsx
const item = {
  hidden: { opacity: 0, y: 20 },   // "hidden"이라는 이름의 상태
  show:   { opacity: 1, y: 0 },    // "show"라는 이름의 상태
}

<motion.div variants={item} initial="hidden" animate="show" />
//                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 객체가 아니라 문자열!
```

> **첫 번째 벽**: `initial`/`animate`가 **객체도 받고 문자열도 받는다**는 것. 문자열을 주면 "`variants` 사전에서 이 이름을 찾아 써라"라는 뜻이다. 위 두 코드는 **완전히 같은 동작**을 한다.

그럼 왜 굳이? → 이름이 생기면 **여러 요소가 같은 이름을 공유**할 수 있고, 그때부터 다음 기능이 열린다.

#### 2.4.2 진짜 이유 — 부모가 이름을 바꾸면 자식 전체에 전파된다

variants의 존재 이유는 이것 하나다. **부모의 variant 이름이 자식 트리로 자동으로 흘러내린다.**

```tsx
const parent = { hidden: {}, show: {} }
const child  = { hidden: { opacity: 0 }, show: { opacity: 1 } }

<motion.ul variants={parent} initial="hidden" animate="show">
  <motion.li variants={child} />   {/* initial/animate 안 줬는데 따라 움직임 */}
  <motion.li variants={child} />
</motion.ul>
```

- 자식엔 `initial`/`animate`를 **안 쓴다.** 부모가 "지금 show야"라고 하면 자식은 자기 사전에서 `show`를 찾아 실행한다.
- 연결고리는 오직 **이름의 일치**(`hidden`/`show`)다. 값이 달라도 이름만 같으면 된다 — 위에서 부모의 `show`는 비었지만 자식의 `show`는 opacity를 바꾼다.
- **전파는 깊이 제한이 없다.** 손자·증손자까지 `variants`만 있으면 계속 내려간다. (중간에 `motion` 아닌 일반 `<div>`가 껴 있어도 통과한다.)

> **두 번째 벽**: "자식에 `animate`를 안 줬는데 왜 움직이지?" → 부모가 준 것이다. 반대로 **자식에 `animate`를 직접 주면 전파가 끊긴다**(자식이 자기 자신을 제어하겠다고 선언한 셈). → §5.5

#### 2.4.3 `hidden: {}` 가 비어 있는 이유 (이 프로젝트 Hero의 실제 코드)

`src/components/sections/Hero.tsx`를 보면 컨테이너 variant가 이렇게 비어 있다:

```tsx
const container: Variants = {
  hidden: {}, // ← 비어 있음!
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
```

이걸 이해하려면 **전파가 어떻게 일어나는가**를 알아야 한다.

##### 전파의 실제 메커니즘

`framer-motion/dist/es/context/MotionContext/utils.mjs`의 `getCurrentTreeVariants()`가 핵심이다:

```js
// 부모가 initial/animate에 "문자열"을 갖고 있으면(= isVariantLabel),
// 그 문자열(라벨)을 React Context에 실어 자식에게 내려보낸다.
if (isControllingVariants(props)) {
  return { initial: <문자열 라벨>, animate: <문자열 라벨> }  // 예: "hidden", "show"
}
return context  // 아니면 부모에게서 받은 걸 그대로 다시 전달
```

- `isVariantLabel(v)` = `typeof v === "string" || Array.isArray(v)` — **값이 문자열이냐**만 본다.
- 즉 전파를 트리거하는 것은 부모의 `initial="hidden" animate="show"`라는 **문자열**이다. 컨테이너의 `variants` 객체 내용(키)이 아니다.
- 자식은 내려온 라벨 이름(`"hidden"`/`"show"`)을 **자기 자신의 `variants`(= `item`)에서** 찾아 실행한다.

> 컨테이너의 `variants` 객체는 **컨테이너 자신이 뭘 애니메이트할지** 정할 때만 쓰인다. 자식은 컨테이너의 사전을 읽지 않고, 내려온 라벨 문자열을 받아 **자기 사전**에서 찾는다.

##### `hidden: {}`의 역할

컨테이너의 `hidden`은 비어 있으므로 컨테이너 자신은 시각적으로 아무것도 하지 않는다. 자식 전파는 `animate="show"` **문자열**이 담당하므로, `hidden: {}`는 전파의 **필수 조건이 아니다**(기능적으로는 no-op). 그럼에도 남겨두는 이유:

- **대칭/가독성** — 자식이 `hidden`/`show` 두 상태를 가지므로 컨테이너도 같은 두 라벨을 명시하면 "이 트리는 hidden↔show로 움직인다"가 한눈에 보인다.
- **`initial="hidden"`이 정의된 라벨을 가리키게** — 의도가 분명해진다.
- **미래 대비** — 컨테이너 자체에 페이드 등을 줄 일이 생기면 `hidden`에 값만 채우면 된다.

> 한 줄 정리: `hidden: {}`는 "이 컨테이너는 hidden 상태에서 아무것도 안 한다"는 **명시적 문서**다.

#### 2.4.4 stagger — 자식들을 시간차로 등장시키기

```tsx
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15, // 자식마다 0.15초씩 밀어서 시작
      delayChildren: 0.1, // 첫 자식이 0.1초 뒤에 시작
      staggerDirection: 1, // 1=앞→뒤(기본), -1=뒤→앞
      when: "beforeChildren", // 부모 먼저 끝내고 자식 시작 ('afterChildren'도 있음)
    },
  },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
```

`transition`은 **variant 안**(`show: { transition: {…} }`)과 **엘리먼트 prop**(`<motion.ul transition={{…}}>`) 양쪽 모두에 놓을 수 있다. variant 안에 두면 **상태별로 다른 오케스트레이션**을 줄 수 있어 더 유연하다.

> **버전 주의(12.42.0)**: `staggerChildren`·`staggerDirection`은 이 버전에서 **`@deprecated`**다(동작은 함 — deprecated ≠ 제거). 새 API는 `delayChildren: stagger(interval)`.
>
> - `stagger(duration?, { startDelay, from, ease }?)` → `motion-dom/dist/index.d.ts`
> - `StaggerOptions` / `StaggerOrigin`(`"first" | "last" | "center" | number`) → 같은 파일
> - `delayChildren?: number | DynamicOption<number>` — `stagger()`의 반환 타입이 여기 들어맞는다.
>
> Hero의 현재 코드는 구(舊) API를 쓴다. 새 API로 바꿀지는 2단계 "사전 정비"에서 판단.

##### `staggerChildren`은 왜 항상 `transition:` 안에 있나 — 타입으로

variant 최상위(`show: { staggerChildren: … }`)에 놓으면 타입 오류가 난다. 타입 체인이 그 이유를 설명한다:

```
Variants  = { [key: string]: Variant }
Variant   = TargetAndTransition | TargetResolver
TargetAndTransition = Target & { transition?: Transition; transitionEnd?: ... }
Target    = DOMKeyframesDefinition   // CSS/스타일/트랜스폼 속성만 (opacity, x, y, scale, backgroundColor…)
Transition ⊃ AnimationOrchestrationOptions   // staggerChildren·delayChildren·when·staggerDirection 이 사는 곳
```

`show: { ... }`의 **최상위 자리는 `Target`**이라 CSS/애니메이트 가능한 스타일 속성만 받는다. `staggerChildren`은 스타일 속성이 아니라 **오케스트레이션 옵션**이라 `Target`엔 없다 → variant 최상위에 두면 타입이 거부한다.

놓을 수 있는 **타입상 합법한 자리는 둘**, 둘 다 동작한다:

```ts
// (A) variant 안의 transition — 상태별로 다르게 줄 수 있어 유연
const container: Variants = { show: { transition: { staggerChildren: 0.15 } } }

// (B) 엘리먼트의 transition prop — 그 요소의 모든 전환에 공통
<motion.section variants={container} transition={{ staggerChildren: 0.15 }} />
```

> **핵심**: `staggerChildren`은 "이 요소를 어떻게 그릴까(Target)"가 아니라 "전환을 어떻게 지휘할까(Transition)"에 속한다. 그래서 항상 `transition:` 안에 산다.

#### 2.4.5 variants는 제스처 props에도 이름으로 쓴다 (ProjectCard 패턴)

`initial`/`animate`만이 아니라 `whileHover`·`whileTap`·`whileInView`도 **문자열 이름**을 받는다. 이게 "부모 hover → 자식도 반응"을 가능하게 한다.

```tsx
const card  = { hover: { y: -8, scale: 1.02 } }
const image = { hover: { scale: 1.05 } }

<motion.a variants={card} whileHover="hover">   {/* 부모에만 hover 감지 */}
  <motion.div variants={image} />               {/* 자식도 같이 확대됨 */}
</motion.a>
```

- `src/components/sections/ProjectCard.tsx`가 정확히 이 구조 — **카드에 마우스를 올리면 카드가 뜨고 + 안의 이미지가 줌**된다. 이미지에는 hover 감지가 **없는데도** 반응하는 게 전파 덕분.
- `rest`(평상시) 상태는 **생략 가능**하다. hover를 떼면 원래 값으로 자동 복귀한다.

#### 2.4.6 동적 variants — `custom` prop으로 값 주입

variant를 **함수**로 쓰면 `custom` prop의 값을 인자로 받는다. index별 delay를 줄 때 유용.

```tsx
const item = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    // ← 함수 variant
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

{
  items.map((t, i) => (
    <motion.li
      key={t}
      custom={i}
      variants={item}
      initial="hidden"
      animate="show"
    >
      {t}
    </motion.li>
  ));
}
```

- `staggerChildren`으로 안 되는 **불규칙한 타이밍**(예: `delay: i * 0.1 + (i > 2 ? 0.5 : 0)`)이 필요할 때 쓴다.
- 단순 순차 등장이면 `staggerChildren`이 더 간단하다 — 둘 다 있을 필요 없음.

#### 2.4.7 `transition`을 어디에 쓸까 — variant 안 vs prop

```tsx
const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },  // ① 이 상태로 갈 때만 적용
}
<motion.div variants={item} transition={{ duration: 0.5 }} />  // ② 모든 상태 전환에 적용
```

- **① variant 안**: 상태별로 다른 트랜지션을 줄 수 있다(등장은 느리게, 퇴장은 빠르게).
- **② prop**: 이 요소의 모든 전환에 공통 적용. 상태가 하나뿐이면 이게 간단하다(→ ProjectCard가 이 방식).

#### 2.4.8 한눈에 보는 정리

| 궁금증                            | 답                                                                        |
| --------------------------------- | ------------------------------------------------------------------------- |
| `animate="show"`의 문자열이 뭐지? | `variants` 사전의 **키 이름**. 객체 대신 이름으로 상태를 지목.            |
| 자식에 `animate`를 왜 안 주지?    | 부모가 전파한다. 주는 순간 **전파가 끊긴다**.                             |
| `hidden: {}`는 왜 비었지?         | 컨테이너는 **지휘만** 하고 자기 시각 변화가 없어서. **지워도 전파는 그대로 됨**(전파는 부모의 문자열 라벨이 트리거 → §2.4.3). 남기는 건 문서/대칭용. |
| `staggerChildren`은 어디에?       | 반드시 `transition:` **객체 안**(variant 안 또는 prop, 둘 다 가능). variant 최상위엔 못 놓음 = `Target` 자리라서 → §2.4.4. 단 이 API는 **deprecated**(→ `stagger()`) |
| 자식 이름이 부모와 달라도 되나?   | 안 된다. **이름 일치가 유일한 연결고리**. 오타면 조용히 안 움직임.        |
| 전파는 몇 단계까지?               | 제한 없음. 중간에 일반 div가 껴도 통과.                                   |

#### 2.4.9 타입 정의를 직접 읽기

framer-motion API가 헷갈릴 때는 설치된 타입 정의가 가장 정확한 명세다.

- **오류 메시지의 타입 이름이 지도다**: `... does not exist in type 'XXXX'`에서 `XXXX`가 그 자리에 허용된 타입이다. 그 이름을 열면 **허용된 키 목록 = 그 자리의 실제 API**.
- **점프**: VS Code에서 타입/prop 위 **F12**(정의로 이동), **Ctrl+Space**(그 자리에 허용된 키 전부), hover(타입+JSDoc).
- **읽는 법**: `&`(교차 타입) = "이 둘을 합친 것만 허용", `extends` = "부모 인터페이스의 키를 물려받음". 이 둘만 읽을 줄 알면 대부분의 라이브러리 타입이 해독된다.
- **`.d.ts` > 공식 사이트**: 사이트는 최신 버전 기준, `node_modules/*/dist/*.d.ts`는 내가 설치한 바로 그 버전. 어긋나면 `.d.ts`가 이긴다(§2.4.4의 `@deprecated`가 그 예).
- **타입 오류를 `as any`/`@ts-ignore`로 덮지 말 것**: 오류는 사라져도 동작은 안 한다. 오류는 버그가 아니라 그 자리에 무엇을 놓을 수 있는지 알려주는 정보다. (`const container: Variants = {...}`처럼 타입 주석을 붙이면 이 정보를 미리 받는다.)

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
      key="menu" // 직계 자식에 고유 key 필수
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} // unmount 시 이 상태로
      transition={{ duration: 0.25 }}
    />
  )}
</AnimatePresence>
```

- `mode="wait"`: 이전 요소 exit가 끝난 뒤 새 요소 등장(교체 UI). `"sync"`(기본), `"popLayout"`도 있음.

---

## 3. 자주 쓰는 훅

| 훅                                 | 용도                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `useReducedMotion()`               | OS "동작 줄이기" 설정 여부(boolean). 접근성 가드에 필수.                   |
| `useScroll()`                      | 스크롤 진행도(`scrollYProgress` 0~1 등)를 MotionValue로.                   |
| `useTransform(mv, [0,1], [0,100])` | MotionValue를 다른 범위로 매핑(패럴럭스·진행바).                           |
| `useSpring(mv)`                    | 값에 스프링 물성 부여(스크롤 값 부드럽게).                                 |
| `useInView(ref, { once })`         | 요소가 뷰포트에 있는지 boolean으로(로직 분기용). `whileInView`는 스타일용. |
| `useAnimate()`                     | `[scope, animate]` — 명령형으로 순서 있는 시퀀스 제어.                     |
| `useMotionValue(0)`                | 리렌더 없이 갱신되는 애니메이션 값. 성능 민감한 곳.                        |
| `MotionConfig`                     | 하위 전체에 기본 `transition`/`reducedMotion` 주입(전역 설정).             |

### 스크롤 연동 예시(패럴럭스)

```tsx
const { scrollYProgress } = useScroll()
const y = useTransform(scrollYProgress, [0, 1], [0, -200]) // 스크롤에 따라 위로
<motion.div style={{ y }} />   // 애니메이트가 아니라 style에 MotionValue를 직접 연결
```

> 요령: `useScroll`/`useTransform` 값은 `animate`가 아니라 **`style`에 꽂는다**(리렌더 없이 매 프레임 갱신).
> 훅별 상세(문법·매개변수·역할·예시·주의)는 §3.4 `useTransform` · §3.5 `useMotionTemplate` · §3.6 `useMotionValue` · §3.7 `useMotionValueEvent` · §3.8 `useScroll`.

### 3.0 MotionValue란 — `useScroll`이 숫자가 아니라 "객체"를 주는 이유

`useScroll()`이 돌려주는 `scrollYProgress`는 **숫자(0~1)가 아니라 `MotionValue`라는 객체**다. `useScroll()`의 반환은 `{ scrollX, scrollY, scrollXProgress, scrollYProgress }`이고 **넷 다 MotionValue**다. 일부러 이렇게 만든 것으로, 이유는 **성능(React 리렌더 회피)**.

- **숫자였다면 매 프레임 리렌더**: 스크롤은 초당 수십 번 값이 바뀐다. 값이 숫자여서 바뀔 때마다 컴포넌트가 리렌더되면 스크롤 내내 고빈도 리렌더 → 성능 파탄.
- **MotionValue = 리렌더 없이 값이 바뀌는 "가변 컨테이너"**: 값이 그 안에서 조용히 바뀌고 **React 렌더 사이클을 건너뛴다.** `style`에 꽂으면 framer가 구독해 **DOM에 직접** 값을 쓴다(재조정 없음). → 부드러움의 핵심.
- **스냅샷이 아니라 "스트림"**: 숫자는 한 시점의 값 하나지만, MotionValue는 **살아있는 값 + 구독 시스템**(`.get()`, `.on('change')`, `useMotionValueEvent`)이며 `useTransform`/`useSpring`으로 **다른 MotionValue로 가공·연결**된다. 즉 "읽는 값"이 아니라 **"흘려보내는 파이프 소스"**.

**소비하는 3가지 방법** (렌더 안에서 숫자로 읽지 않는다):
1. **파이프로 연결(권장)** — `style={{ scaleY: mv }}` 또는 `useTransform(scrollYProgress, [..], [..])`에 그대로 꽂기. 리렌더 0.
2. **스냅샷 꺼내기** — `scrollYProgress.get()`으로 **현재 숫자**를 읽음(이벤트·핸들러 안에서. §3.2의 `latched.get()`이 이 경우).
3. **변화 감지** — `useMotionValueEvent(scrollYProgress, 'change', v => …)` — 콜백의 **`v`가 숫자**(현재 값). 진행도 확인용 `console.log(v)`가 여기 해당.

> **컨테이너 ↔ 안의 숫자를 구분**하면 헷갈림이 풀린다: `scrollYProgress`(MotionValue 객체) vs `v`/`.get()`(그 안의 숫자). 렌더에서 숫자가 꼭 필요해 `useMotionValueEvent`로 `setState`하면 리렌더가 되살아나므로, 성능 민감한 경로에선 피하고 1번(파이프)으로 간다.
>
> 관련: §3.1(값 구동 — style에 MotionValue), §3.2(latched·`.get()`·`useMotionValueEvent`), §5.6(리렌더 vs MotionValue).

### 3.1 두 가지 구동 방식 — 선언형 vs 값 구동 (한 속성엔 드라이버 하나)

framer-motion에서 하나의 속성(예: `x`, `opacity`)을 움직이는 길은 **성격이 다른 두 시스템**이 있다. 이 둘을 헷갈리면 "같은 속성을 두 번 지정해서 서로 밀어내는" 버그가 생긴다.

**① 선언형(목표 상태 기반)** — `initial` / `animate` / `whileInView` + `transition`
- "**시작 상태 → 목표 상태**"만 적으면, framer-motion이 그 사이를 `transition`의 시간·이징으로 **스스로 보간**한다.
- **드라이버 = 시간.** 트리거(마운트·뷰 진입 등) 시점부터 `duration`만큼 흘러가며 값이 목표로 이동한다.
- 예: `initial={{opacity:0}} whileInView={{opacity:1}} transition={{duration:0.8}}` → 뷰에 들어오면 0.8초 동안 페이드인.

**② 값 구동(외부 MotionValue)** — `style={{ x }}` 에 MotionValue 연결
- `useScroll`/`useTransform`이 만든 MotionValue를 `style`에 꽂으면, 그 속성 값이 **외부 소스(스크롤 위치)에 매 프레임 직접 종속**된다.
- **드라이버 = 그 외부 소스(스크롤).** 시간이 아니라 "지금 스크롤이 얼마나 진행됐나"가 값을 정한다. 스크롤을 되감으면 값도 되감긴다.
- 예: `const x = useTransform(scrollYProgress,[0,1],[-80,0]); <motion.div style={{x}} />` → 스크롤 0%면 x=-80, 100%면 x=0.

**왜 섞으면 안 되나 — "주인이 둘"**
한 속성(예: `x`)을 ①과 ② **둘 다로 지정하면**, "이 속성 값을 누가 정하는가"의 주인이 둘이 된다. 시간 기반 보간과 스크롤 종속이 같은 `x`를 두고 서로 밀어내므로 **결과가 의도대로 나오지 않는다**(어느 쪽이 이기는지는 상황에 따라 달라 신뢰할 수 없다). 공식 문서도 이 충돌의 승자를 규정하지 않는다 — 즉 **"이기게 만드는" 게 아니라 애초에 한 속성엔 드라이버를 하나만 두는 게 정답이다.**

```tsx
// ❌ x를 두 시스템이 동시에 지정 — whileInView(시간)와 style MotionValue(스크롤)가 충돌
<motion.div
  initial={{ x: -80 }} whileInView={{ x: 0 }} transition={{ duration: 0.8 }}
  style={{ x }}   // ← useTransform(scroll) 결과
/>

// ✅ 스크롤로 움직일 거면 x는 값 구동 하나만. 선언형 x는 빼기
<motion.div style={{ x }} />
```

**리터럴 값을 style에 주는 세 번째 경우** — `style={{ opacity: 1 }}`처럼 **MotionValue가 아닌 고정 숫자**를 주면, 그건 애니메이션도 스크롤 구동도 아닌 **그냥 고정**이다. 이러면 `initial:0 → whileInView:1`로 짜둔 페이드가 나타날 자리를 덮어써서, 페이드가 안 보이고 항상 1로 박힌다. → "왜 등장 페이드가 안 먹지?"의 흔한 원인.

**정리**: 속성마다 **① 선언형 / ② 값 구동 / ③ 고정** 중 **하나만** 고른다. "스크롤로 움직인다" = ②, "뷰 진입 시 1회 페이드" = ①. 한 속성에 둘을 겹쳐 쓰지 않는다. (관련: §5.6 리렌더 vs MotionValue, §3 스크롤 예시)

### 3.2 값 구동을 한 방향으로 — latched 진행도 (되감김 없음)

§3.1 ②(값 구동)의 본질은 **양방향**이다: `scrollYProgress`를 `useTransform`에 직접 넣으면 스크롤을 내릴 때 진행하고 **올리면 그대로 되감긴다**. "한 번 진행하면 스크롤을 올려도 그 상태로 멈춰 있게" 하려면, 스크롤 위치 대신 **"여태 도달한 최댓값"** 을 애니메이션 입력으로 삼는다 — 즉 드라이버(입력값)를 **단조 증가(오르기만)** 로 바꾼다.

**3단계**

1. 최댓값을 담을 그릇: `const latched = useMotionValue(0)`
2. 오를 때만 갱신:
   ```tsx
   useMotionValueEvent(scrollYProgress, 'change', (v) => {
     if (v > latched.get()) latched.set(v)   // 더 클 때만 → 단조 증가
   })
   ```
   내려갈 땐 `v < latched.get()`이라 `set`을 안 해 **최댓값을 유지**한다.
3. `useTransform`들의 **입력을 전부 `scrollYProgress` → `latched`** 로 교체. (하나라도 `scrollYProgress`로 남기면 **그것만** 스크롤 올릴 때 되감긴다.)

→ 내릴 땐 스크롤에 맞춰 진행(스크럽 느낌 유지), 올려도 `latched`가 안 내려와 **최고 상태에서 정지**. 지금의 sticky+스크롤 구조는 **그대로 두고 입력만** 바꾼다.

**`useMotionValue(0)`이 하는 일**
- framer가 관리하는 **값 하나짜리 반응형 컨테이너**(초깃값 0).
- **리렌더를 안 일으킨다** — 값이 바뀌어도 컴포넌트를 다시 안 그리고, 구독한 `useTransform`만 조용히 갱신 → 매 프레임 스크롤에도 성능이 안 나빠진다(§5.6).
- **렌더 간 안정적** — 리렌더돼도 같은 객체가 유지돼 콜백의 `.get()`이 항상 현재 최댓값을 읽고, `useTransform`이 물린 대상도 안 바뀐다.
- **`latched = 0` = "아직 아무 것도 진행 안 된 최초 화면"**: 입력 0에서 모든 `useTransform`이 시작값을 낸다(예: 원은 멀리·`opacity 0`으로 안 보이고, 텍스트 `opacity 0`, 색은 흰색). 이게 정상 시작 상태다.

**주의**
- `useMotionValue`·`useMotionValueEvent`는 훅 → **컴포넌트 최상위**에서 호출(`map`/조건 안 금지).
- **초기 진입 엣지케이스**: 아래 섹션에서 스크롤을 올려 이 섹션에 진입하면, 첫 `change`에서 `scrollYProgress`가 이미 커서 `latched`가 확 튀어 **애니메이션이 중간/끝부터** 보일 수 있다. 위→아래 정상 흐름에선 0부터라 문제없다.

> **reduced-motion 가드에 응용 (근원 가드)**: `latched`가 값 구동의 **단일 입력**이므로, reduced면 이 값을 **끝값(1)으로 고정**하면 그걸 입력으로 쓰는 모든 `useTransform`이 자동으로 **최종형(정지 완결)**을 낸다 — 속성마다 `reduce ? 최종 : mv`로 분기(**잎마다 가드**)하는 것보다 **한 곳만** 손대면 되고 빠뜨림이 없다. 훅은 조건부 호출 금지라 `useScroll`/`useMotionValueEvent`는 그대로 두고 **값만** effect에서 1로 세팅(단조 핸들러가 `v>get()`이라 1을 유지). 단 **latched 밖의 모션**(hover 등)과 **레이아웃 높이**(`reduce ? 'md:h-auto' : …`)는 별도 가드. (근원 vs 잎 판단 배경 → `AI_COLLAB_NOTES.md`.) ⚠️ Approach는 현재 잎마다 가드(B)로 되어 있어, 이 근원 가드(A)로 리팩터링 예정.

배경·A/B 트레이드오프·결정 경위는 `STICKY_SESSION_NOTE.md`("A vs B(스크롤 되감김)" 절), 확정 스펙은 `SECTION_APPROACH_PLAN.md` §3.2. **"코드는 latched인데 되감긴다"** 처럼 코드와 안 맞는 증상이면 §7 이전에 stale 번들(`NEXTJS_GUIDE.md` §7.1)을 먼저 의심할 것.

### 3.3 값 구동(스크럽) vs 시간 구동 — 언제 무엇을 고르나

§3.1이 "한 속성엔 드라이버 하나", §3.2가 "값 구동을 한 방향으로"였다면, 여기선 **애초에 값 구동(스크롤 스크럽)과 시간 구동(선언형) 중 무엇을 고를지**의 판단 기준을 정리한다. Approach 인터랙션을 만들며 실제로 부딪힌 논점이다.

**먼저 흔한 오해 하나 — "시간 구동은 '안 보였다가 점점 보이는'을 못 한다"**

아니다. 그건 시간 구동의 **기본기**다. `initial`에 시작 상태(투명 + 떨어짐), `animate`/`whileInView`에 끝 상태(보임 + 모임)를 주면 `transition`이 그 사이를 시간으로 보간한다 → **투명하고 떨어진 상태에서 서서히 보이며 모인다.** 이 프로젝트 `FadeIn`(투명 y+24 → 불투명 y0)이 바로 그 패턴이다.

Approach에서 예전에 whileInView가 "원이 떨어진 채로 보여서 안 예뻤"던 건 시간 구동의 한계가 **아니라 하이브리드의 타이밍 어긋남**이었다:

- opacity만 `whileInView`(트리거 = **섹션이 뷰포트에 진입**),
- x/y는 스크롤(트리거 = **스크롤을 얼마나 내렸나**).

두 트리거가 달라서, 섹션이 보이자마자 opacity=1이 되는데 스크롤은 아직 조금 → **원이 떨어진 채로 보여버린다.** opacity와 x/y를 **둘 다 같은 시간 구동으로 묶었다면**(같은 `initial→animate` + 같은 `transition`) 완벽히 동기화돼 "투명+떨어짐 → 보임+모임"이 어긋남 없이 나왔을 것이다. → §3.1 "한 속성 = 드라이버 하나"의 응용: **서로 관련된 속성은 같은 드라이버로 묶어라.**

**그럼 값 구동(스크럽)을 고르는 "진짜" 이유 = 진행 속도를 스크롤에 매고 싶을 때**

핵심 차이는 **누가 진행 속도를 쥐느냐**다.

- **값 구동(스크럽)**: 사용자가 스크롤로 진행을 직접 돌린다(영상 타임라인을 손으로 긁는 느낌).
- **시간 구동(선언형)**: 트리거되면 정해진 시간(예: 0.6초)으로 한 번 재생(컷신). 스크롤 속도와 무관.

**상황별 사용자 경험**

| 상황 | 값 구동(스크럽) | 시간 구동(선언형 once) |
|---|---|---|
| 천천히 음미 | **여기서 빛남** — 조립을 프레임 단위로 제어, "내가 맞추고 있다"는 촉각 | 아무리 천천히 봐도 정해진 속도로만 재생, 늦출 수 없음 |
| 빠르게 휙 넘김 | sticky+긴 섹션이 그 구간을 강제로 지나가게 잡지만, 너무 빠르면 순식간에 합쳐져 안 보일 수도 | 스크롤 속도와 무관하게 **항상 같은 속도**로 보여줌(대신 그새 벗어나면 놓침) |
| 중간에서 멈춤 | 반쯤 합쳐진 채 정지 → 스틸컷처럼 예쁠 수도, 어중간할 수도(중간 포즈가 늘 봐줄 만해야) | 멈춰도 끝까지 완주 |
| 다시 위로 스크롤 | latch면 최고 상태 유지 | once면 유지 — **차이 없음** |
| 바닥에서 새로고침 | latch면 완성 표시 | once면 이미 뷰라 완성 표시 — **차이 없음** |
| reduced-motion | 드라이버(`latched`)를 **끝값 1로 고정**하면 파생값이 전부 최종형 → **한 곳만 가드**(§3.2) | 가드 간단(최종 정지형만 렌더) |

**비용 측면**

- 값 구동은 **긴 섹션 + sticky 뼈대**가 필수라 스크롤 지면을 크게 먹고(예: Approach 100rem), latch·범위·(이번의) stale HMR 같은 엣지케이스 비용이 붙는다.
- 시간 구동은 **일반 높이 섹션**으로 충분하고 구조가 단순해 그 비용 대부분이 없다.

**결정 프레임 (한 질문)**

> **"사용자가 이 움직임을 손으로 제어하며 머물러 보길 원하나?"**

- **예 → 값 구동(스크럽).** 정체성 선언·시선 잡는 순간(hero moment)처럼 dwell(머물러 보게)시킬 값어치가 있는 곳.
- **아니오 → 시간 구동.** 깔끔한 1회 리빌이면 충분한 곳. 더 단순·튼튼.

**섹션 성격에 매핑(이 프로젝트)**

- **Approach**(융합형 조립) → 스크럽. 사용자가 조립을 제어하는 게 서사와 맞음.
- **Journey**(선 그리기 `pathLength`) → 스크럽. 스크롤에 선이 그려지는 성격.
- **Services**(hover/펼치기) → 상호작용·시간 구동. 스크롤과 무관한 제스처.

즉 "스크럽이냐 시간이냐"는 라이브러리 기능 문제가 아니라 **섹션이 사용자에게 무엇을 시키고 싶은가**의 문제다. (관련: §3.1 드라이버 하나, §3.2 latched, 결정 배경 `STICKY_SESSION_NOTE.md`.)

### 3.4 `useTransform` 오버로드 4형태 — 범위 매핑 vs 함수형

`useTransform`은 **한 MotionValue를 다른 MotionValue로 가공**하는 훅이다(파이프 개념 §3.0). 오버로드가 4개인데, **셋째 인자의 모양**과 **함수를 넘기느냐**로 갈린다. (시그니처 출처: `node_modules/framer-motion/dist/index.d.ts:1144·1193·1213·1233`.)

**기본형 — 한 범위를 다른 범위로 매핑**
```tsx
const y = useTransform(scrollYProgress, [0, 1], [0, -200])
// 진행도 0→1 을 y 0→-200 으로 선형 매핑. style={{ y }} 로 연결.
```

#### 매개변수 역할 (공통)
| 인자 | 이름 | 뜻 |
|---|---|---|
| 1 | `value`(입력) | 가공할 원본 MotionValue (예: `latched`) |
| 2 | `inputRange` | **입력 구간** — 늘 숫자 배열 `[a, b, …]`, 단조(증가 또는 감소) |
| 3 | `outputRange` **또는** `outputMap` | **출력** — 이 자리 모양이 형태를 가른다(아래) |
| 4 | `options?` | 선택. `clamp`(기본 `true`)·`ease`. **생략 가능** |

#### 질문의 핵심: 셋째 인자가 배열이냐 객체냐 (인자 3개/4개가 아님)

두 호출의 진짜 차이는 **인자 개수가 아니라 셋째 인자의 타입**이다. `options`(넷째)는 **양쪽 다 생략 가능**하므로 개수는 곁가지다.

```tsx
// A. 셋째가 '배열' → 단일 출력값 하나            (index.d.ts:1193)
useTransform(latched, seg, [0, 1], {})
//           value   input  output  options(생략가능)
//  → MotionValue<number> 하나. seg 구간을 0~1 로 매핑.

// B. 셋째가 '객체' → 여러 개의 이름붙은 출력      (index.d.ts:1144)
useTransform(latched, [0, 1], { x: [-100, 0], opacity: [0, 1] })
//           value   input   outputMap
//  → { x: MotionValue, opacity: MotionValue }  (객체로 분해해 각각 style에)
```

- **A (outputRange 배열)**: 결과가 **MotionValue 하나**. `lineTop`·`textColor`처럼 한 속성만 몰 때.
- **B (outputMap 객체)**: 한 입력에서 **여러 값을 한꺼번에** 파생. 결과는 **같은 키의 객체**(`{x, opacity}`)라 `style={card}`처럼 통째로 꽂거나 `const { x, opacity } = …`로 분해. 이 프로젝트의 `card`·`dot`이 이 형태.
- **헷갈림 포인트**: A의 `seg`도, B의 `[0,1]`도 똑같이 **둘째 인자 = `inputRange`**다. A는 그 자리에 변수(`seg = [a,b]`)를, B는 리터럴(`[0,1]`)을 썼을 뿐 — 형태를 가르는 건 **둘째가 아니라 셋째**.
- ⚠️ B의 **`outputMap` 키는 렌더마다 고정**이어야 한다(조건부로 키를 넣다 뺐다 하면 안 됨 — 타입 정의 주석에 명시).

#### 함수형 — 셋째 인자 대신 '함수'를 넘긴다 (index.d.ts:1213)

범위 매핑이 아니라 **직접 계산**하고 싶을 때, 둘째 인자로 **변환 함수(transformer)**를 넘긴다.

```tsx
const y = useTransform(x, (value) => value * 2)   // y 는 늘 x 의 2배
```

- **콜백이 받는 값**: `input`(첫 인자 MotionValue)의 **현재 값**이 매번 콜백 인자로 들어온다. 위에선 `value`, 우리 코드에선 `v` — **이름은 자유**(그냥 매개변수명), 뜻은 "**지금 이 순간 `latched`의 숫자**". 입력이 바뀔 때마다 함수가 다시 실행돼 그 반환값이 새 MotionValue가 된다.
- **범위 매핑과의 차이**: 매핑형은 두 범위 사이를 **연속 보간**(중간값 다 나옴 — *밝기 조절기*). 함수형은 **작성한 대로** — 조건 분기로 **딱 둘 중 하나**만 낼 수도 있다(*온도조절기*: 기준 넘으면 켜짐/꺼짐, 중간 없음).

```tsx
// 이산(기준값) 출력 예 — Journey: 카드가 다 등장하기 전엔 hover 차단
const pointerEvents = useTransform(latched, (v) => v >= appear[1] ? 'auto' : 'none')
// v(현재 진행도)가 등장완료 지점(appear[1]) 미만 → 'none'(마우스 통과), 이상 → 'auto'.
//  style={{ pointerEvents }} 로 연결. (opacity:0 은 포인터를 안 막으므로 pointer-events가 정답.)
```

- **다중 입력 함수형**(index.d.ts:1233): 여러 MotionValue를 합칠 땐 **배열**로 넣고 콜백이 배열을 받는다 — `useTransform([x, y], ([lx, ly]) => lx * ly)`.

#### options — `clamp` / `ease` (범위 매핑형에만)
- `clamp`(기본 **`true`**): 입력이 `inputRange`를 벗어나면 출력을 **끝값에 고정**. `false`면 범위 밖으로 **외삽**(계속 늘어남).
- `ease`: 각 구간 보간에 이징 적용(입력 구간이 n개면 이징 배열은 n-1개).
- 함수형엔 options가 없다 — 반환값을 함수가 전부 정하니까.

#### 주의사항
- **훅**이라 컴포넌트 **최상위**에서만 호출 — `.map()`/조건문/반복문 안에서 호출 금지(훅 순서 규칙). 항목마다 값을 파생하려면 **자식 컴포넌트로 분리**해 각자 최상위에서 호출(이 프로젝트 `JourneyItem` 패턴 → `DEV_QNA.md` "map 안 useTransform").
- `inputRange`는 **단조**(증가 또는 감소)여야 한다. 뒤죽박죽이면 보간이 깨진다.
- `outputRange`의 값들은 **전부 같은 타입·형식**(전부 숫자, 또는 전부 색 등). 색은 `var(--…)` 문자열 말고 **실제 색값**을 줘야 보간된다(`CSS_ADVANCED.md` §5.1).
- `outputMap`(객체형) 키는 **렌더마다 고정**.

#### 기타
- `import { useTransform } from "framer-motion"`.

> 시그니처 출처: `index.d.ts:1144`(outputMap)·`1193`(outputRange)·`1213`(함수형 단일)·`1233`(함수형 다중). 관련: §3.0(MotionValue), §3.1(값 구동), §3.5(문자열 조립은 `useMotionTemplate`).

---

### 3.5 `useMotionTemplate` — 여러 MotionValue를 "문자열 CSS"로 합치기

`useTransform`은 **숫자 하나**를 다른 숫자/객체로 매핑한다. 그런데 `box-shadow`·`filter`·`background`·`clip-path`처럼 **값이 문자열인 CSS 속성**은 숫자 매핑만으로는 못 만든다(예: `box-shadow: 0 0 0 8px …`의 `8px` 부분만 숫자로 바꾸고 나머지는 문자열). 이럴 때 **여러 MotionValue·숫자·문자열을 하나의 문자열 MotionValue로 조립**하는 것이 `useMotionTemplate`이다.

- **형태(태그드 템플릿)**: 함수 호출 괄호가 아니라 **백틱**을 바로 붙인다. 반환은 `MotionValue<string>`.
  ```tsx
  const spread = useTransform(latched, [0.8, 1], [0, 8])        // 숫자 MotionValue (px 값)
  const boxShadow = useMotionTemplate`0 0 0 ${spread}px var(--color-accent)`
  return <motion.div style={{ boxShadow }} />                    // 문자열 MotionValue를 style에 연결
  ```
  - 스크롤이 진행되면 `spread`가 0→8로 바뀌고, `boxShadow` 문자열이 매 프레임 다시 조립돼 **후광 반경이 퍼진다**.
- **보간 규칙**: `${}` 안에는 **`MotionValue` | 숫자 | 문자열**을 넣는다. 단위(`px`·`%`)나 함수(`rgba(...)`)는 **템플릿의 고정 문자열**로 적고, 변하는 숫자만 MotionValue로 뺀다. (`${spread}px`처럼 값과 단위를 분리.)
- **왜 `useTransform`으로 안 되나**: `useTransform`의 출력은 숫자(또는 숫자 객체)라 `box-shadow` 같은 **복합 문자열**을 못 만든다. 문자열 조립은 `useMotionTemplate`의 몫. 반대로 숫자→숫자는 `useTransform`이 맞다(둘을 조합: 숫자는 `useTransform`, 문자열화는 `useMotionTemplate`).
- **성능 주의(§5.2)**: `box-shadow`·`filter` 애니메이션은 `transform`/`opacity`보다 무겁다(매 프레임 페인트). "요소가 커지는 느낌"이면 `scale`(transform)이 가볍고, **후광 반경이 실제로 퍼지는** 효과가 꼭 필요할 때만 `box-shadow`+`useMotionTemplate`을 쓴다. 남발 금지.
- **정적 유틸과 겹치지 말 것**: `style`로 `boxShadow`를 구동하면 Tailwind `ring-*`/`shadow-*`(정적 box-shadow) 클래스는 **제거**한다(같은 속성 충돌).

> `import { useMotionTemplate } from "framer-motion"`. 관련: §3.0(MotionValue), §3.1(값 구동 — style에 MotionValue), §5.2(성능).

---

### 3.6 `useMotionValue` — 리렌더 없이 갱신되는 값 그릇

#### 기본 문법
```tsx
import { useMotionValue } from "framer-motion"
const x = useMotionValue(0)     // 초깃값 0
```

#### 매개변수 / 반환
| | 이름 | 뜻 |
|---|---|---|
| 인자 | `initial: T` | 초깃값(숫자·문자열·색 등). 이 타입이 그대로 `MotionValue<T>`가 됨 |
| 반환 | `MotionValue<T>` | 리렌더 없이 값이 바뀌는 "가변 컨테이너" |

(시그니처: `index.d.ts:1033` — `useMotionValue<T>(initial: T): MotionValue<T>`.)

#### 역할
값을 **React state 밖**에 두어, 값이 바뀌어도 **컴포넌트를 리렌더하지 않고** DOM·파이프에 직접 흘린다. 스크롤·드래그·마우스처럼 초당 수십 번 바뀌는 고빈도 값에 쓴다. `useScroll`이 돌려주는 것도 내부적으로 이것(§3.0).

#### MotionValue 주요 메서드 (반환 객체가 가진 것)
| 메서드 | 뜻 |
|---|---|
| `.get()` | 현재 값(숫자 등) 읽기 |
| `.set(v)` | 값 쓰기(렌더 구독자에 통지) |
| `.jump(v)` | 값 쓰되 **진행 중 애니메이션 중단 + 속도 0** |
| `.getPrevious()` | 직전 값 |
| `.getVelocity()` | 현재 속도(숫자 아니면 0) |
| `.on('change', cb)` | 변화 구독(해제 함수 반환) — 훅에선 `useMotionValueEvent`(§3.7)가 정리까지 대신함 |

#### 예시 — latched(도달 최댓값) 그릇
```tsx
const latched = useMotionValue(0)
useMotionValueEvent(scrollYProgress, 'change', (v) => {
  if (v > latched.get()) latched.set(v)   // 더 클 때만 → 단조 증가(되감김 없음, §3.2)
})
```

#### 주의사항
- **훅**이라 컴포넌트 **최상위**에서만 호출(`map`/조건/반복문 안 금지 — 훅 순서 규칙). 항목마다 값이 필요하면 **자식 컴포넌트로 분리**(이 프로젝트 `JourneyItem` → `DEV_QNA.md`).
- `.set()`은 **렌더 중에 호출하지 말 것**(effect·이벤트 콜백·프레임 콜백에서). 렌더 중 값 변경은 버그.
- 렌더에 **숫자 자체가 필요**해 `useMotionValueEvent`+`setState`를 쓰면 **리렌더가 되살아난다** → 성능 경로에선 파이프(`style`/`useTransform`)로(§3.0·§5.6).
- 초깃값 타입이 곧 값 타입 — 숫자 그릇에 문자열 넣지 말 것.

#### 기타
한 MotionValue는 **한 번에 하나의 애니메이션**만 구동 가능(타입 정의 주석). 관련: §3.0(왜 객체인가)·§3.2(latched)·§3.7(변화 구독).

---

### 3.7 `useMotionValueEvent` — MotionValue 이벤트 구독(자동 정리)

#### 기본 문법
```tsx
import { useMotionValueEvent } from "framer-motion"
useMotionValueEvent(scrollYProgress, 'change', (latest) => {
  console.log(latest)   // latest = 현재 숫자값
})
```

#### 매개변수 / 반환
| 인자 | 이름 | 뜻 |
|---|---|---|
| 1 | `value` | 구독할 MotionValue |
| 2 | `event` | 이벤트 이름(아래 표 중 하나) |
| 3 | `callback` | 이벤트 발생 시 실행. `'change'`면 **현재 값**을 인자로 받음 |
| 반환 | `void` | 구독 해제는 **언마운트 시 자동** |

(시그니처: `index.d.ts:970`.)

#### 이벤트 종류 (`MotionValueEventCallbacks`, motion-dom `index.d.ts:2403`)
| 이벤트 | 콜백 | 언제 |
|---|---|---|
| `change` | `(latest) => void` | 값이 바뀔 때(가장 흔함) |
| `animationStart` | `() => void` | 이 값 구동 애니메이션 시작 |
| `animationComplete` | `() => void` | 애니메이션 완료 |
| `animationCancel` | `() => void` | 애니메이션 취소 |
| `destroy` | `() => void` | MotionValue 파기 |

#### 역할
`motionValue.on(event, cb)`의 **훅 래퍼**. 직접 `.on()`을 쓰면 `useEffect`에서 **해제 함수를 반환해 정리**해야 하는데, `useMotionValueEvent`는 그 **구독+정리를 자동**으로 해준다. "스크롤 값이 바뀔 때 무언가 실행"의 표준 도구.

#### 예시 — 도달 최댓값 latch (§3.2 실사용)
```tsx
useMotionValueEvent(scrollYProgress, 'change', (v) => {
  if (v > latched.get()) latched.set(v)
})
```

#### 주의사항
- 콜백이 **`setState`를 부르면 리렌더가 되살아난다.** 매 프레임 바뀌는 값(스크롤)에 남발하면 성능 파탄 → 값을 화면에 흘리는 게 목적이면 `useTransform`/`style` 파이프로(§3.0·§5.6). 이건 **로직 분기·로깅·latch**처럼 "값을 읽어 판단"할 때 쓴다.
- **훅**이라 최상위 호출(§3.6과 동일).
- 콜백의 클로저가 옛 값을 잡을 수 있다 — latch처럼 `.get()`으로 **그때그때 읽으면** 안전.
- HMR 함정: MotionValue 구독을 빠르게 반복 편집하면 **옛 구독이 남을 수 있음** → 이상하면 새로고침(`NEXTJS_GUIDE.md`).

#### 기타
내부적으로 `.on()`(motion-dom `index.d.ts:2543`)을 호출하고 언마운트에서 해제. 관련: §3.0(MotionValue 소비 3방식)·§3.2(latch)·§3.6(`useMotionValue`).

---

### 3.8 `useScroll` — 스크롤 진행도를 MotionValue로

#### 기본 문법
```tsx
import { useScroll } from "framer-motion"

const { scrollYProgress } = useScroll()               // 페이지 전체 세로 진행도 0~1

// 또는 특정 요소 기준:
const ref = useRef(null)
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
```

#### 매개변수 (옵션 객체, 전부 선택)
| 옵션 | 타입 | 뜻 |
|---|---|---|
| `container` | `RefObject` | 스크롤 컨테이너. **생략 시 뷰포트(window)** |
| `target` | `RefObject` | 진행도를 잴 **대상 요소**. 생략 시 컨테이너 자체의 스크롤 |
| `offset` | `ScrollOffset` | 진행 0/1을 **어느 교차 지점**에 맞출지(아래 상세) |
| `axis` | `"x" \| "y"` | 축. 기본 **`"y"`** |

(시그니처: `index.d.ts:1039` — 옵션 타입 `UseScrollOptions`.)

#### 반환 (넷 다 `MotionValue<number>`)
| 값 | 뜻 |
|---|---|
| `scrollX` / `scrollY` | 스크롤 **픽셀** 위치 |
| `scrollXProgress` / `scrollYProgress` | **진행도 0~1** (스크럽에 쓰는 값) |

#### 역할
스크롤 위치를 리렌더 없이 **MotionValue로** 흘려, `useTransform`으로 좌표·opacity·색 등에 매핑(§3.4)한다. `target` + `offset`을 주면 "그 요소가 화면을 지나가는 구간"을 **0~1로 정규화**해준다 → 이 프로젝트 스크럽·`latched`의 입력(§3.2).

#### ⭐ `offset` — start/end의 기준
`offset`은 **`[진행 0 지점, 진행 1 지점]`** 두 개의 "교차(intersection)"다. 각 교차는 **`"<대상 모서리> <컨테이너 모서리>"`** 두 토큰(공백 구분)으로 적는다.

- **첫 토큰 = 대상(target)의 모서리**, **둘째 토큰 = 컨테이너(보통 뷰포트)의 모서리**.
- 세로축(`y`)에서 `start` = **위 모서리(top)**, `end` = **아래 모서리(bottom)**, `center` = 가운데. (`px`·`%`·`vh` 숫자도 가능.)
- 예: `"start end"` = "**대상의 위**가 **뷰포트의 아래**와 만나는 순간" = 요소가 화면 **아래에서 막 들어올 때**.

**이 프로젝트 값 `["start start", "end end"]` 읽기**
- `"start start"`(진행 0) = 대상의 **위**가 뷰포트의 **위**에 닿을 때 → 섹션 top이 화면 top에 온 순간.
- `"end end"`(진행 1) = 대상의 **아래**가 뷰포트의 **아래**에 닿을 때 → 섹션 bottom이 화면 bottom에 온 순간.
- 결과: 진행 0→1이 **(섹션 높이 − 뷰포트 높이)** 만큼의 스크롤에 매핑된다 → 그래서 스크럽엔 **긴 섹션 + sticky**가 필요(§3.2 · `SCROLL_MERGE_GUIDE.md`). 섹션이 뷰포트만 하면 이 거리가 ≈0이라 애니가 순간에 끝난다.

자주 쓰는 다른 값:
- `["start end", "end start"]` = 요소가 **화면에 처음 들어올 때 0 → 완전히 빠져나갈 때 1**. 요소가 뷰에 머무는 전 구간을 추적(패럴럭스에 흔함).

#### 주의사항
- `useScroll`은 **훅** → 컴포넌트 최상위에서 호출(§3.6과 동일).
- `target` ref는 **실제 DOM에 붙어야** 진행도가 잡힌다(마운트 전엔 0).
- 반환값은 `animate`가 아니라 **`style`/`useTransform`에 꽂는다**(리렌더 없이 매 프레임, §3.1).
- 진입 엣지케이스(아래서 올라와 진입 시 `latched`가 튐)는 §3.2 주의 참고.

#### 기타
`import { useScroll } from "framer-motion"`. 관련: §3.0(왜 MotionValue인가)·§3.2(latched 입력)·§3.4(진행도→값 매핑)·`SCROLL_MERGE_GUIDE.md`(거리 확보·sticky).

---

## 4. 실무 사용 예시 (일반 패턴)

> 아래는 라이브러리 사용법을 보여주는 **일반 예시**다. 이 프로젝트에서 각 패턴이 실제로 어떻게 쓰였는지는 §0의 파일들을 참고.

### 4.1 스크롤 진입 페이드업 (가장 흔함)

```tsx
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
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

모션 최소화 사용자에겐 **큰 이동/무한 반복을 끄거나 페이드만** 남긴다.

**⚠️ SSR 함정 (가장 중요)**: framer의 `useReducedMotion()`은 **서버=false / 클라=true**(서버엔 `matchMedia`가 없어 기본 false)라, 이 값으로 **렌더 출력(className·style·variants·initial)을 분기하면 하이드레이션 불일치**가 난다(reduced 켠 사용자에게만, 그래서 놓치기 쉬움). → **렌더 분기엔 SSR-안전한 `useReducedMotionSafe`**(`useSyncExternalStore` + `getServerSnapshot=()=>false`. 이 프로젝트 `src/hooks/useReducedMotionSafe.ts`)를 쓴다. raw `useReducedMotion()`은 **렌더 출력이 아닌 이벤트 핸들러 분기**(예: `scrollIntoView` behavior)엔 그대로 써도 된다. (배경 → `NEXTJS_GUIDE.md` §5.6)

**두 가지 처리 방식**

1. **`<MotionConfig reducedMotion="user">` (선언형에 깔끔)** — 하위 framer 컴포넌트에 상속. framer가 런타임에서 **이동(transform)만 끄고 `opacity`는 유지**한다. variants를 손대지 않으니 **SSR-안전 + 아래의 "갇힘" 버그 없음**. 단 **`style`에 꽂은 스크롤 MotionValue(값 구동)는 "애니메이션"이 아니라 안 걸린다** → 그건 2번으로. (client 경계 필요: `layout`이 서버 컴포넌트면 작은 `'use client'` 래퍼 안에서 감쌀 것.)
2. **`useReducedMotionSafe`로 직접 분기** — 값 구동(스크롤)·CSS(className)엔 이걸로. ⚠️ **`variants = reduce ? undefined : …`처럼 `undefined`로 뽑지 말 것**: 마운트-후 값이 뒤집히는 순간 `show` 타깃이 사라져 **내용이 안 보이는 버그**가 난다. 대신 **정의된 reduced 변형**(예: `show:{ opacity:1, transition:{ duration:0 } }`)이나 **`transition`만 분기**(`transition={reduce ? {duration:0} : {…}}`)해서 **항상 보이는 상태로 스냅**시킨다.

**한계 — "완전 즉시(페이드 0)"는 어렵다**: 서버가 reduced 여부를 모르니 hidden 상태로 SSR → 클라는 짧게 페이드가 보였다 스냅된다(값이 뒤집히는 창). SSR 등장 애니메이션의 구조적 대가다. reduced-motion의 본질은 **이동 제거**이므로 **짧은 opacity 페이드는 일반적으로 허용**된다. 정말 0으로 만들려면 등장을 **CSS로 옮기고 `motion-reduce:`로 끄는** 수밖에 없다.

**JS 스크롤 주의**: `scrollIntoView({behavior:'smooth'})`는 이 설정을 자동으로 안 지킨다 — `behavior`를 직접 분기(→ Hero 화살표, 이벤트 핸들러라 훅 종류 무관). → `A11Y_CHECKLIST.md` §7.

### 5.4 AnimatePresence 함정

- 직계 자식에 **고유 `key`** 없으면 exit가 안 먹는다.
- 조건부 렌더를 `AnimatePresence` **밖**에 두면 exit 전에 사라진다 — 반드시 안쪽에.
- 리스트에서 여러 개가 들락날락하면 `mode="popLayout"` 고려.

### 5.5 variants 전파 끊김

- 자식에 `animate`를 직접 주면 부모 상태 전파가 끊긴다(§2.4.2). 전파를 원하면 자식엔 **variant 이름만**.
- 부모·자식 variant **이름 오타**면 조용히 안 움직인다 — 이름 일치 먼저 의심. (에러도 경고도 안 난다.)
- `staggerChildren`을 **부모 variant의 도착 상태 안**(`show: { transition: {…} }`)이 아니라 `transition` **prop**이나 **자식**에 넣으면 안 먹는다(§2.4.4).
- 전파가 안 될 때 의심할 것은 **부모의 `initial`/`animate`가 문자열 라벨인지**다(문자열이라야 Context로 내려간다 → §2.4.3). 컨테이너 variant에 `hidden` 같은 키가 있는지는 전파의 조건이 아니다.
- 함수 variant를 썼는데 `custom` prop을 안 넘기면 인자가 `undefined`가 된다(§2.4.6).

### 5.6 리렌더 vs MotionValue

- `useState`로 매 프레임 값을 바꾸면 리렌더가 과도하게 발생. 스크롤/드래그처럼 고빈도 값은 `useMotionValue`+`style`로 **리렌더 없이** 애니메이트.

### 5.7 SSR/hydration 깜빡임

- `initial`을 안 주면 서버 렌더 결과와 최종 상태가 달라 깜빡일 수 있다. 등장 애니메이션엔 `initial`을 명시.
- **reduced-motion 분기로 인한 불일치**: framer `useReducedMotion()`을 render 출력 분기에 쓰면 서버(false)/클라(true)가 달라 **하이드레이션 불일치**가 난다. → §5.3의 `useReducedMotionSafe`/`MotionConfig`로 해결. (원인·범위 `NEXTJS_GUIDE.md` §5.6)

### 5.8 Tailwind v4 `scale`/`rotate`/`translate` 클래스와 framer `style` 겹침 (덮이지 않고 곱해진다)

framer로 `scale`(또는 `x`/`y`/`rotate`)을 `style`로 구동할 때, **정적 Tailwind 변형 클래스를 같이 두면 서로 덮어쓰지 않고 합성(곱)** 되어 예측이 어긋난다.

- **원인 — 서로 다른 CSS 속성**: Tailwind v4는 `scale-[1.2]`를 **개별 CSS 속성 `scale:`** 로 내보낸다(`scale: var(--tw-scale-x) var(--tw-scale-y)`; 소스 확인). framer의 `style={{ scale }}`는 **`transform:` 속성**(`transform: scale(...)`)으로 적용한다. CSS 규격상 `scale`·`translate`·`rotate`(개별 longhand)와 `transform`은 **별개 속성이라 둘 다 적용(합성)** 된다 → **override가 아니라 곱셈**.
- **증상**: 정적 `scale-[1.2]` + framer `scale`(1→1.2)이면 실제 배율은 `1.2×1=1.2` → `1.2×1.2=1.44`. 정적 1.2가 **baseline으로 안 사라져** framer 값만으로 1까지 못 내려가고, "framer scale이 안 먹는다"처럼 보인다(실은 곱해지는 중).
- **해결**: 한 속성은 **한 곳에서만** 구동. framer로 애니메이트하면 **정적 변형 클래스(`scale-*`/`translate-*`/`rotate-*`) 제거**. 반대로 정적이면 framer `style`에서 빼기.
- **확인법(DevTools)**: 대상 요소 Computed 패널에서 **`scale`과 `transform`이 둘 다** 잡혀 있으면 겹친 것.
- (같은 `transform`끼리라면 inline(framer)이 클래스를 이기지만, v4가 `scale`을 개별 속성으로 빼면서 이 "곱셈 겹침"이 생긴다. `opacity` 등 비-변형 속성은 해당 없음.)

---

## 6. 번들 경량화 (LazyMotion + `m`)

`motion` 전체는 기능이 많아 무겁다. 트리 흔들기가 잘 되게 하려면 `m` 컴포넌트 + 필요한 기능만 로드:

```tsx
import { LazyMotion, domAnimation, m } from "framer-motion";

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} /> {/* motion.div 대신 m.div */}
</LazyMotion>;
```

- `domAnimation`(기본) vs `domMax`(드래그·레이아웃까지). 앱 전역을 감싸면 효과적.
- 애니메이션이 많아질수록 이득. 지금처럼 소규모면 필수는 아님(→ 필요 시 도입).

---

## 7. 디버깅 체크리스트 (안 움직일 때)

1. 이 컴포넌트에 **`"use client"`** 있나? (App Router에서 가장 흔한 원인)
2. `initial`과 `animate` **값이 실제로 다른가?** (같으면 보간할 게 없음)
3. variants면 부모·자식 **이름이 일치**하나? 자식에 `animate`를 잘못 준 건 아닌가?
   - stagger가 안 되면: `staggerChildren`이 **부모 variant의 도착 상태 안**에 있나? (prop에 두면 안 먹음 → §2.4.4)
   - 부모의 `initial`/`animate`가 **문자열**로 들어가 있나? (전파의 실제 조건 → §2.4.3)
4. exit가 안 되면: `AnimatePresence`로 감쌌나? 직계 자식 **key** 있나? 조건부가 안쪽인가?
5. 스크롤 값이면 `animate`가 아니라 **`style`**에 MotionValue를 꽂았나?
6. reduced-motion 설정 때문에 꺼진 건 아닌가? reduced일 때 애니메이션을 죽이도록 분기하므로(→ §5.3), 그럼 **무엇을 바꾸든 아무 일도 안 일어난다**. (⚠️ `variants`를 `undefined`로 뽑는 방식은 마운트-후 값이 뒤집힐 때 **내용이 안 보이는** 버그 → §5.3. 렌더 분기는 `useReducedMotionSafe`로.)
7. **타입 오류가 났다면 우회하지 말 것** — 오류 메시지의 타입 이름이 곧 그 자리의 API 명세다. → §2.4.9

---

## 8. 더 볼 것

- 공식 문서(React): https://motion.dev/docs/react
- 제스처/애니메이션/레이아웃 API 레퍼런스: 위 사이트의 각 페이지
- 이 프로젝트 실물 코드: §0 표의 4개 파일

### 값 시각화·실험 도구 (tween / spring)

`transition` 값(§2.2)이 실제 움직임을 어떻게 바꾸는지 **슬라이더로 조절하며 미리보는** 도구들. tween과 spring은 조절 값이 달라 도구도 갈린다.

**Spring (`stiffness` / `damping` / `mass`)** — 인터랙티브 시뮬레이터

| 도구 | 링크 | 메모 |
| --- | --- | --- |
| Motion Spring Visualizer | https://www.motion-spring-visualizer.com/ | 세 값을 슬라이더로 → 실물 요소가 그 값으로 움직임. **Motion(framer-motion) 값과 직접 대응** → 이 프로젝트에 가장 잘 맞음 |
| Framer Motion Spring Generator | https://rapidtoolset.com/en/tool/framer-motion-spring-generator | 값 조절 → 실시간 미리보기 + 복붙용 config 출력 |
| 공식 문서(인터랙티브) | https://motion.dev/docs/spring · https://motion.dev/docs/react-transitions | 문서 예제를 직접 조작. **값의 의미가 가장 정확** |
| Maxime Heckel — 스프링 물리 원리 | https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/ | 감쇠 곡선을 그래프로 → "damping 낮추면 왜 출렁이나"가 눈에 들어옴 |

**Tween (`duration` / `ease`)** — 이징 곡선(cubic-bezier)

| 도구 | 링크 | 메모 |
| --- | --- | --- |
| cubic-bezier.com | https://cubic-bezier.com/ | 베지어 곡선을 손으로 끌며 미리보기. `ease: [0.4, 0, 0.2, 1]` 배열이 이것 |
| easings.net | https://easings.net/ | `easeInOut`·`easeOutCubic` 등 **이름 있는 이징** 한눈에 비교. 문자열/배열로 그대로 사용 |

> **이 프로젝트 연결**: 스크롤 병합(Approach §3)은 `useTransform`으로 **스크롤 진행도=위치**를 직접 매핑하는 방식이라 엄밀히는 tween/spring "transition"이 아니다. 위 도구는 **라벨 페이드인·융합형 하이라이트처럼 트리거되면 재생되는 부분**, 또는 `useSpring`으로 스크롤 값을 감쌀 때 유용하다.

### 설치된 소스/타입 (사이트보다 우선 — §2.4.9)

공식 사이트는 최신 버전 기준이라 **설치 버전과 어긋날 수 있다.** 아래는 지금 이 프로젝트(12.42.0)의 실제 명세다.

| 무엇을 볼 때                  | 경로                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| **타입 전체**(대부분 여기)    | `node_modules/motion-dom/dist/index.d.ts`                   |
| variants·transition 타입 체인 | 위 파일의 `Variants` / `Variant` / `TargetAndTransition` / `Transition` / `AnimationOrchestrationOptions` |
| `stagger()` 시그니처·옵션     | 위 파일의 `declare function stagger` / `StaggerOptions` / `StaggerOrigin` |
| **전파가 결정되는 실제 코드** | `framer-motion/dist/es/context/MotionContext/utils.mjs`, `motion-dom/dist/es/render/utils/is-controlling-variants.mjs`, `.../is-variant-label.mjs` |
| React 바인딩 구현             | `framer-motion/dist/es/` 아래 (`.mjs` — 읽을 수 있는 소스)  |

> `dist/es/**/*.mjs`는 난독화되지 않은 소스다. **"왜 이렇게 동작하지?"는 문서보다 여기서 더 빨리 풀린다.**
