# 스크롤 병합 인터랙션 — 구현 참고 자료

> Approach 섹션의 **스크롤 연동 원 병합**(세 원이 스크롤 진행도에 따라 중앙으로 모이는 연출)을 **직접 손코딩**할 때 옆에 두는 자료 모음.
> 이 프로젝트에서 검토한 인터랙션 중 **가장 어려운 축**이자 **첫 손코딩 섹션**이라(→ `SECTION_APPROACH_PLAN.md` §7), 개념·하위 문제·참고 링크를 한 곳에 모은다.
> **정답 코드는 담지 않는다** — 구현은 개발자 몫. 여기 있는 건 "무엇을 결정해야 하는가 + 어디를 보면 되는가"다.

관련 문서:

- 스펙(무엇이 어떤 순서로 움직이나): `SECTION_APPROACH_PLAN.md` §3
- framer-motion 훅 요약·성능·reduced-motion: `FRAMER_MOTION_GUIDE.md` §3·§5
- `transition` 값 시각화 도구(spring/tween): `FRAMER_MOTION_GUIDE.md` §8
- 지금까지의 설계·리뷰 논의: `CODE_REVIEW_LOG.md`(Approach 항목들)

---

## 1. "스크롤 병합"을 하위 문제로 쪼개기

한 덩어리로 보면 막막하다. 실제로는 **독립적으로 결정·구현할 수 있는 5~6개 조각**이다. 순서대로 하나씩 세우는 게 핵심.

| # | 하위 문제 | 결정/구현할 것 | 핵심 훅·개념 |
| --- | --- | --- | --- |
| A | **스크롤 진행도를 어디서 뽑나** | `useScroll`의 `target`(어느 요소 기준)·`offset`(언제 0, 언제 1) | `useScroll` |
| B | **스크롤 "거리"를 어떻게 확보하나** ⭐ | 병합이 진행되는 동안 화면이 머물 공간 — 섹션 높이 키우기 or **sticky 고정** | CSS `position: sticky` / 섹션 min-height |
| C | **진행도(0→1)를 각 원의 좌표로 매핑** | 원마다 시작(펼침)→끝(겹침) 좌표를 진행도에 연결 | `useTransform` |
| D | **라벨·융합형 등장 타이밍** | 라벨 페이드인 구간, 융합형 하이라이트 시점(진행도 ≈0.8~1) | `useTransform`(opacity 매핑) |
| E | **reduced-motion 정지 상태** | 스크롤 연동을 끄고 "이미 합쳐진 최종형"으로 | `useReducedMotion` 가드 |
| F | **성능** | 값은 `animate`가 아니라 `style`에 꽂기, 고빈도 값은 MotionValue | `useMotionValue` / `style` |

> **⭐ B가 진짜 난관이다.** "원이 모인다"는 C(좌표 매핑)만 보면 쉬워 보이지만, **그 애니메이션이 진행될 스크롤 거리를 어떻게 만드느냐**(섹션을 길게? sticky로 고정?)가 스크롤 인터랙션의 실제 벽이다. 아래 §3 튜토리얼들이 대부분 이 B를 다룬다.

---

## 2. 먼저 잡아야 할 개념 (막히면 여기부터)

- **`scrollYProgress`는 0~1 MotionValue다.** `useScroll({ target, offset })`이 "이 요소가 화면의 이 지점에 올 때 0, 저 지점에 올 때 1"을 계산해 준다. `target`/`offset`을 잘못 잡으면 애니메이션이 엉뚱한 스크롤 구간에서 일어난다 → **여기가 첫 디버깅 지점.**
- **`offset`은 [요소 기준점, 뷰포트 기준점] 쌍의 배열**이다(예: 요소 위가 뷰포트 아래에 닿을 때 시작 …). 정확한 토큰 문법은 아래 공식 `useScroll` 문서에서 확인 — 외워서 쓰지 말고 문서 대조.
- **매핑값은 `animate`가 아니라 `style`에 꽂는다.** `useTransform`이 만든 MotionValue를 `style={{ x, y }}`로 연결하면 **리렌더 없이 매 프레임 갱신**된다(`FRAMER_MOTION_GUIDE.md` §3 파랄랙스 예시가 이 패턴).
- **transform으로 움직여라(top/left 금지).** `x`/`y`/`scale`은 합성 단계라 부드럽고, `top`/`left`는 매 프레임 레이아웃 재계산 → 버벅임(`FRAMER_MOTION_GUIDE.md` §5.2).
- **라벨이 원의 자식이면 원의 transform을 상속한다.** "원만 움직이고 라벨은 제자리 페이드인"을 원하면 **구조(자식 vs 형제) 결정이 선행**돼야 한다 → 이미 논의됨(`CODE_REVIEW_LOG.md` 2026-07-18 라벨 구조 항목).
- **스크롤 값을 부드럽게** 하고 싶으면 `useSpring`으로 `scrollYProgress`를 한 번 감싼다 → 그때 spring 값 튜닝은 `FRAMER_MOTION_GUIDE.md` §8 도구.

---

## 3. 참고 자료 (검증된 링크)

### 3.1 공식 — 가장 먼저·가장 정확

| 자료 | 링크 | 무엇을 |
| --- | --- | --- |
| useScroll (스크롤 진행도) | https://motion.dev/docs/react-use-scroll | `target`·`offset`·`container` 옵션. **A의 정본** |
| React 스크롤 애니메이션 가이드 | https://motion.dev/docs/react-scroll-animations | scroll-linked·parallax 전반 개관 |
| Scroll-linked 예제 | https://motion.dev/examples/react-scroll-linked | 진행도→스타일 매핑 실동작 예제 |
| useTransform | https://motion.dev/docs/react-use-transform | 진행도(0~1)를 좌표·색·opacity로 매핑. **C·D의 정본** |

> ⚠ 공식 사이트는 최신 버전 기준. 설치 버전(12.42.0)과 어긋나면 **`.d.ts`가 이긴다** — 타입은 `node_modules/motion-dom/dist/index.d.ts`(→ `FRAMER_MOTION_GUIDE.md` §2.4.9·§8).

### 3.2 튜토리얼 — B(스크롤 거리 확보)·sticky 기법 위주

> ⚠ **유료/회원제 자료는 뺐다.** (예전에 있던 Build UI / Sam Selikoff 강의는 유료라 제외.) 아래는 **무료로 전문(全文) 열람 가능한** 것만 남겼고, 핵심 sticky 기법은 링크에 의존하지 않도록 **§3.2.1에 직접 설명으로** 정리했다.

| 자료 | 링크 | 메모 | 접근 |
| --- | --- | --- | --- |
| Motion 공식 — scroll-linked 예제 | https://motion.dev/examples/react-scroll-linked | 진행도→스타일 매핑 실동작. **가장 정확·무료**(§3.1에도) | 무료 |
| Motion 공식 — React scroll animations | https://motion.dev/docs/react-scroll-animations | scroll-linked·parallax 전반 + sticky 패턴 설명 | 무료 |
| Let's Build UI — Scroll-linked content reveal | https://www.letsbuildui.dev/articles/scroll-linked-content-reveal-animation/ | 진행도에 맞춰 콘텐츠가 드러나는 패턴(D 라벨 등장과 유사) | 무료 |
| LogRocket — React scroll animations with Framer Motion | https://blog.logrocket.com/react-scroll-animations-framer-motion/ | 글로 된 전반 개요. 개념 복습용 | 무료 |

> (Framer(노코드 툴) 전용 튜토리얼도 많은데, 개념은 같아도 코드가 다르니 **코드 예제는 framer-motion(React) 자료 위주로** 볼 것.)

### 3.2.1 sticky + tall 컨테이너 기법 — B의 핵심 (직접 설명)

병합처럼 "화면이 잠깐 **머물며** 진행되는" 효과의 표준 뼈대. 유료 강의 없이 이 절만 봐도 되도록 정리한다. **핵심은 "스크롤로 지나갈 거리"와 "그동안 화면에 붙잡아 둘 요소"를 분리하는 것**이다.

**구조 (두 겹)**
```
바깥 요소 (tall)     ← 세로로 길다. 이 "길이"가 곧 애니메이션이 진행될 스크롤 거리
  └ 안쪽 요소 (sticky) ← position: sticky; top: 0 → 바깥을 지나는 동안 뷰포트에 고정돼 보임
       └ 실제 병합 대상(원 3개 등)
```
- **바깥(tall)**: 예컨대 높이를 뷰포트의 2~3배로 준다. 사용자가 이 요소를 스크롤로 통과하는 **거리 전체**가 진행도 0→1에 대응한다. 길수록 병합이 천천히 진행된다.
- **안쪽(sticky)**: `position: sticky; top: 0`(높이는 대략 뷰포트 1개). 바깥 요소가 화면을 지나는 동안 **제자리에 붙어** 있어서, 사용자 눈엔 "화면이 멈춘 채 원만 모이는" 것으로 보인다. sticky가 없으면 원이 그냥 스크롤과 함께 위로 흘러가 버린다.

**진행도 연결**
- `useScroll({ target: 바깥(tall) ref, offset: ["start start", "end end"] })`.
- `"start start"` = 바깥 요소 **top이 뷰포트 top에 닿는 순간**(진행도 0). `"end end"` = 바깥 요소 **bottom이 뷰포트 bottom에 닿는 순간**(진행도 1).
- 그 사이, 즉 **바깥 요소가 화면을 통과하는 내내** `scrollYProgress`가 0→1로 흐르고, sticky 덕에 그 시간 동안 원들이 한자리에서 모인다.

**왜 이게 B의 답인가**
- "원이 모인다"(C: 좌표 매핑)는 진행도만 있으면 쉽다. 진짜 문제는 **그 진행도가 흐를 물리적 스크롤 공간을 어디서 확보하느냐**였고, 그 공간이 바로 **바깥 tall 요소의 높이**다. 고정은 **sticky**가 담당한다. 이 둘(거리=tall, 고정=sticky)이 세트로 B를 푼다.

**이 프로젝트에 옮길 때 정할 것**
- 지금 `<section id="approach">`는 `py-canvas` 정도의 **보통 높이**라 진행 거리가 거의 없다(→ 병합이 순식간). tall 바깥 + sticky 안쪽 **2겹 구조로 바꿀지**, 아니면 섹션 자체 `min-height`만 키우고 내부를 sticky로 잡을지가 **B의 선택지**(§4-3).
- sticky 요소는 새 **stacking context**를 만든다 → 겹침 알파(§ 색 채움)엔 영향 없지만(알파는 무관), 혹시 나중에 `mix-blend-mode`를 섞는다면 이 지점을 기억할 것(관련: `CODE_REVIEW_LOG.md` 알파 vs 블렌드 항목).
- ⚠ 대안: **CSS `position: sticky` 없이** framer-motion만으로도 흉내 낼 수 있으나(고정 위치 + transform), 스크롤 "머무름"의 자연스러움은 sticky가 가장 쉽고 견고하다. 먼저 sticky로 잡아볼 것.

### 3.3 대안 — CSS scroll-driven animations (라이브러리 없이)

스크롤 연동을 **CSS만으로**도 할 수 있다. 지원 브라우저면 JS 없이 가장 가볍다. 단 세밀한 제어·reduced-motion 분기·복잡한 매핑은 framer-motion이 유리 → **지금은 framer-motion으로 가되, 개념 이해·경량 대안으로 알아둘 것.**

| 자료 | 링크 |
| --- | --- |
| MDN — Scroll-driven animations | https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-driven_animations |
| Chrome for Developers — Scroll-driven animations | https://developer.chrome.com/docs/css-ui/scroll-driven-animations |

### 3.4 spring/tween 값 튜닝

라벨 페이드인·융합형 하이라이트나 `useSpring`으로 스크롤을 감쌀 때 값 조절 → `FRAMER_MOTION_GUIDE.md` §8 "값 시각화·실험 도구".

---

## 4. 아직 열려 있는 결정 (구현 전/중에 정할 것)

`SECTION_APPROACH_PLAN.md` §3과 `CODE_REVIEW_LOG.md`에서 이미 짚은, **코드로 옮기기 전에 정해야 하는** 지점:

1. **원의 시작(펼쳐진) 좌표** — 현재 `circleStyle` 좌표는 전부 **끝(겹친) 상태**뿐. 병합의 출발 위치를 정해야 매핑(C)이 가능.
2. **라벨: 원의 자식 vs 형제** — transform 상속 여부가 갈림(§2). "라벨은 제자리 페이드인"을 원하면 형제로.
3. **스크롤 거리 확보 방식(B)** — 섹션 min-height를 키울지, sticky로 고정할지.
4. **배열 구조(데이터 vs 데스크탑 전용 설정)** — 매핑·시작좌표 같은 per-circle 설정이 늘면 `circles` 배열을 어떻게 정리할지(→ `CODE_REVIEW_LOG.md` "7번 후속").
5. **reduced-motion 정지 상태(E)** — 이미 채워진 벤 = 최종형과 같게(이미 CSS로 완성됨 → 스크롤만 끄면 됨).

---

## 5. 권장 구현 순서 (뼈대만 — 정답 코드 아님)

로드맵 "마크업 → 스타일 → 인터랙션" 중 **인터랙션 단계**의 내부 순서 제안. 한 번에 다 하지 말고 **A부터 하나씩 확인**하며 쌓는다.

1. **A만 먼저** — `useScroll`로 `scrollYProgress`를 뽑아 화면 어딘가에 **숫자로 찍어** 본다(0→1이 원하는 스크롤 구간에서 도는지 확인). 여기서 `target`/`offset` 감을 잡는 게 먼저.
2. **C를 원 하나로** — 진행도를 원 하나의 `x`(또는 `y`)에 매핑해 **한 개만** 움직여 본다. 되면 나머지는 값만 다름.
3. **B 확보** — 병합이 너무 순식간이면 스크롤 거리(섹션 높이/sticky)를 조정.
4. **D** — 라벨·융합형 opacity를 진행도 후반 구간(≈0.8~1)에 매핑.
5. **E** — `useReducedMotion` 가드로 스크롤 연동을 끄고 정지 최종형 렌더.
6. **F** — 값이 `style`에 꽂혔는지, 리렌더 과한 곳은 없는지 점검.

> 막히면 §3.1 공식 문서(A·C) → §3.2 Build UI(B) 순으로. 안 움직이면 `FRAMER_MOTION_GUIDE.md` §7 디버깅 체크리스트.
