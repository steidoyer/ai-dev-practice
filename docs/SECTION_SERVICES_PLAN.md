# "Services / 함께 일하기" 섹션 기획 (SECTION_SERVICES_PLAN)

> 개발자가 **직접 손코딩**할 신설 섹션. **연습 목표 인터랙션이 먼저 정해진** 섹션이다 — ① 카드 펼치기(`AnimatePresence` + `layout`), ② hover/tap(`whileHover`/`whileTap`). 그 두 인터랙션이 가장 자연스러운 콘텐츠로 "제공 가치(Services)"를 얹었다.
> **정답 코드는 담지 않는다** — 구현은 개발자 몫. 콘텐츠는 브랜드(`DEV STUDIO`)처럼 **플레이스홀더**.
> 짝 섹션: `SECTION_JOURNEY_PLAN.md`(스크롤·시각 인터랙션 쇼케이스). 이 문서는 **레이아웃 변화 + 포인터 제스처** 갈래 담당.
> 관련 문서: framer-motion `FRAMER_MOTION_GUIDE.md` · 오버레이/모달 원리(펼침을 모달로 갈 경우) `CSS_ADVANCED.md` §4·§4.7 · 접근성 `A11Y_CHECKLIST.md`.

---

## 0. 왜 이 섹션 / 이 인터랙션인가

- **연습 목표가 먼저**: 실무 인터랙션은 크게 (a)마운트/언마운트 전환, (b)레이아웃 변화, (c)포인터 제스처로 나뉜다. 지금까지 스크롤·페이드 위주라 **(b)·(c)를 거의 안 해봤다.** 이 섹션이 그 공백을 채운다.
  - **(a)+(b) 카드 펼치기** = `AnimatePresence`(상세 mount/unmount) + **`layout`**(크기·위치 변화 자동 애니메이트). `AnimatePresence`는 Header 모바일 메뉴에서 살짝 써봤고, **`layout` prop이 진짜 새 개념**이다. 아코디언·확장 리스트·"더 보기"에 어디서나 쓰는, 전이 가치 큰 기술.
  - **(c) hover/tap** = `whileHover`/`whileTap`. 모든 버튼·카드의 기본기.
  - **덤(오케스트레이션)**: 카드가 화면에 들어올 때 **부모 variants의 `staggerChildren`/`delayChildren`**로 순차 등장시켜, 리스트·메뉴에 두루 쓰는 **스태거 오케스트레이션**도 함께 익힌다. 개별 `whileInView`를 카드마다 거는 것의 **정식 업그레이드**(새 갈래라기보다 등장 방식의 격상).
- **콘텐츠 선택 이유**: 펼치기 + hover가 가장 자연스러운 형태 = **카드형**. Projects(결과물)·Skills(역량)와 겹치지 않는 **"무엇을 함께 할 수 있나"** 각도라 서사도 새롭다.
- **대안(참고)**: FAQ 아코디언도 펼치기에 맞지만 텍스트 위주라 **hover가 살 카드 표면이 적다.** 카드형 Services가 두 인터랙션 모두에 무대를 준다. (원하면 FAQ로 콘텐츠만 갈아끼워도 인터랙션 구조는 동일 — §8.)

---

## 1. 목적 / 역할 / 배치

- **역할**: "이렇게 함께 일할 수 있다"를 카드로 제시. Skills(무엇을 아는가) 다음에서 **"그래서 무엇을 해줄 수 있는가"**로 이어 CTA(연락)로 넘긴다.
- **배치(두 섹션 추가 후 전체 순서)**: `Hero → Approach → Journey → Projects → Skills → **Services** → CTA`.
- **앵커/네비**: 섹션 `id="services"`. Header 네비 라벨(예: `Services`/`Work with me`). → 확정 시 `Header.tsx` `navLinks`·`CLAUDE.md` 갱신.

---

## 2. 콘텐츠 구조 (플레이스홀더)

**카드 3~4개.** 각 카드 = `아이콘 + 제목 + 짧은 요약(접힘 상태)`, 펼치면 `상세 설명 + 불릿 몇 개`. 반복 데이터라 **배열 분리 map**.

| # | 제목(placeholder) | 요약(접힘) | 펼침 상세(placeholder) |
|---|---|---|---|
| 1 | 웹 프론트엔드 구축 | 접근성 있는 UI를 처음부터 | 컴포넌트 설계·반응형·상태관리 … |
| 2 | 인터랙션 · 모션 | 스크롤·제스처 기반 연출 | framer-motion·성능·reduced-motion … |
| 3 | 성능 · 접근성 | 빠르고 모두가 쓰는 화면 | CLS/LCP·시맨틱·키보드 … |
| 4 | 기획–디자인–개발 브리지 | 경계 사이를 잇는 역할 | Approach "융합형"과 연결 |

> 실제 서비스가 아니라 **연습용 플레이스홀더**임을 코드 주석/문서로 명시.

---

## 3. 인터랙션 = 핸드오프 모션 스펙 (framer-motion)

1. **카드 펼치기 (핵심·새 기술)**
   - 카드를 클릭하면 **상세가 확장**된다. **한 번에 하나만**(아코디언식) — 다른 카드가 열려 있으면 닫힌다(§8에서 다중 허용 여부 결정).
   - `AnimatePresence`로 상세 블록의 **등장/퇴장**을, **`layout`**으로 카드 크기·이웃 재배치를 **부드럽게**.
   - **열림 상태(어느 카드가 열렸나)** 를 state로 관리. 카드 컴포넌트가 그 상태를 받아 상세를 조건부 렌더.
2. **hover / tap 마이크로 인터랙션 (새 기술)**
   - `whileHover`: 살짝 떠오름(`y`) 또는 보더 accent. `whileTap`: 살짝 눌림(`scale`).
   - 데스크탑은 hover가 주, 터치는 사실상 tap.
3. **카드 등장 스태거 오케스트레이션 (덤·연습)**
   - 섹션이 뷰에 들어오면 카드들이 **순차로** 등장. 개별 카드에 `whileInView`를 각각 거는 대신, **부모 컨테이너 variants**가 **`staggerChildren`**(자식 간 간격)·**`delayChildren`**(시작 지연)으로 **등장을 지휘**한다.
   - 리스트·메뉴 등장에 두루 쓰는 정식 오케스트레이션 패턴. `viewport={{ once: true }}`로 1회.
4. **밀도 주의**: 펼침·hover·스태거가 동시에 튀지 않게 절제. 각 인터랙션마다 reduced-motion 정지 상태 설계(아래).

### 접근성 (인터랙티브라 필수 — 이 섹션의 핵심 연습)
- 펼치기 **트리거는 `<button>`** (div+onClick 금지). **`aria-expanded`**(열림 여부) + **`aria-controls`**(상세 영역 id) 연결 → **disclosure(폭로) 패턴**.
- **키보드**: Enter/Space로 토글, 포커스 링 유지, Tab 순서 자연스럽게.
- **hover는 포인터 전용** → hover 없이(키보드/터치)도 모든 내용 접근 가능. hover로 정보 숨기지 말 것.
- **reduced-motion**: 펼침 **기능 자체는 동작**하되 `layout`/페이드 **애니메이션만 즉시/축소**. (모션만 끄고 기능은 유지)
- 상세: `A11Y_CHECKLIST.md`, 패턴: WAI-ARIA APG Disclosure.

> **이 접근성 비용은 부담이 아니라 실무에 꼭 필요한 연습이다.** 인터랙티브 요소(펼치기)엔 항상 **버튼 시맨틱·키보드·`aria-expanded`**가 따라오고, reduced-motion에서도 **기능은 살리고 모션만 줄이는** 분기를 설계해야 한다 — 이 섹션을 고른 이유 중 하나다.

---

## 4. 반응형 (모바일 우선)

- **모바일(기본)**: 카드 **1열 세로 스택**. 펼치면 그 카드가 아래로 확장(자연스러움). hover 대신 `whileTap`.
- **데스크탑(md+)**: **2~4열 그리드**. hover lift. 클릭 펼침 시 그 카드가 확장되며 이웃이 `layout`으로 재배치.
  - 그리드에서 **펼침 확장 방식**이 관건(§8): (a) 카드 제자리에서 확장(그리드 밀림), (b) 그 행 전체폭으로 확장, (c) 모달/오버레이로 띄우기.

---

## 5. 접근성 / 시맨틱 (3의 접근성 확장)

- 카드 목록 = `<ul>`/`<li>`. 각 카드 헤더 = `<button>`(disclosure). 상세 = 버튼의 `aria-controls` 대상.
- 정지 상태(모션 없이)에서 요약이 읽히고, 펼치면 상세가 읽혀야 한다.
- 펼침을 **모달로 갈 경우**: 포커스 트랩·`inert`·Esc·복귀 포커스 + 배경 스크롤 잠금이 세트 → `CSS_ADVANCED.md` §4(스크롤 잠금)·§4.6(접근성)·§4.7(`fixed`+transform 함정, 포털) 반드시 참고. (framer-motion 트리 안이라 **포털 필요** 가능성 높음.)

---

## 6. 새로 연습하는 기술 + 참고

- **신규**: **`layout` prop**(자동 레이아웃 애니메이션 — 진짜 새 개념), **`whileHover`/`whileTap`**(제스처), **부모 variants 스태거**(`staggerChildren`/`delayChildren` — 개별 `whileInView`의 격상). `AnimatePresence`는 재확인(Header에서 경험).
- **재사용**: 조건부 렌더 + state, variants(등장), reduced-motion 가드.
- 참고:
  - framer-motion `AnimatePresence`: https://motion.dev/docs/react-animate-presence
  - framer-motion layout animations: https://motion.dev/docs/react-layout-animations
  - framer-motion gestures(`whileHover`/`whileTap`): https://motion.dev/docs/react-gestures
  - framer-motion 오케스트레이션(variants·`staggerChildren`/`delayChildren`): https://motion.dev/docs/react-transitions — 정확한 옵션은 설치 버전 `.d.ts` 대조.
  - WAI-ARIA APG — Disclosure: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
  - 내부: `FRAMER_MOTION_GUIDE.md`, `CSS_ADVANCED.md` §4(모달로 갈 경우), `A11Y_CHECKLIST.md`.

> 구현 착수 시 `FRAMER_MOTION_GUIDE.md`에 "`layout`·`AnimatePresence`·gesture" 하위 절을 정리하면 좋다.

---

## 7. 권장 구현 순서 (마크업 → 스타일 → 인터랙션)

1. **마크업 먼저**(모션 없이, 접근성 DOM): `<ul>` 카드 + 각 카드 `<button>`(요약) + 상세 블록. **정적으로 펼침/접힘 둘 다 의미가 통하게.** `aria-expanded`/`aria-controls`부터 건다.
2. **스타일**(Tailwind·토큰): 그리드, 카드, 아이콘, 접힘/펼침 상태 스타일.
3. **인터랙션(하나씩)**: ① 열림 state + 조건부 상세 렌더(모션 없이 토글부터) → ② `AnimatePresence`로 상세 등장/퇴장 → ③ `layout`으로 재배치 매끄럽게 → ④ `whileHover`/`whileTap` → ⑤ `useReducedMotion`으로 모션만 축소 → ⑥ 키보드/포커스 마무리.

---

## 8. 아직 열린 결정 (구현 전/중 확정)

1. **콘텐츠**: Services(카드형) 유지 vs FAQ(문답형)로 교체 — 인터랙션 구조는 동일.
2. **카드 수·문구**, 그리드 **열 수**(2 vs 3 vs 4).
3. **펼침 확장 방식**: 제자리 확장 / 행 전체폭 확장 / **모달**(→ §5·`CSS_ADVANCED.md` §4). 모달이면 `layoutId` 공유 요소 morph도 선택지(고급).
4. **한 번에 하나 vs 다중 열기**.
5. **hover 세부**: lift 정도, `whileTap` 유무, 터치 대체.
6. **카드 등장 스태거**: 적용 여부, `staggerChildren` 간격·`delayChildren` 지연 값, 트리거(`whileInView` once).
7. **네비 라벨**, 배치(Skills 뒤 확정?).
