# "여정(Journey)" 섹션 기획 (SECTION_JOURNEY_PLAN)

> 개발자가 **직접 손코딩**할 섹션의 확정 기획. `SECTION_APPROACH_PLAN.md`와 같은 형식(무엇이 어떤 순서로 + 무엇을 결정할지).
> **정답 코드는 담지 않는다** — 구현은 개발자 몫. 콘텐츠는 브랜드(`DEV STUDIO`)와 마찬가지로 **플레이스홀더**(실제 경력 아님).
> **이 섹션은 "스크롤·시각 인터랙션을 한곳에 모은 밀도 높은 쇼케이스"로 확정**(§3). 짝이 되는 다른 신설 섹션은 `SECTION_SERVICES_PLAN.md`(펼치기 + hover 인터랙션).
> 관련 문서: 스크롤 훅 `FRAMER_MOTION_GUIDE.md` §3·§3.1 · 스크롤 거리/sticky `SCROLL_MERGE_GUIDE.md` · 색/와이프 `CSS_ADVANCED.md` §5 · 접근성 `A11Y_CHECKLIST.md`.

---

## 0. 왜 이 섹션을 골랐나 (선정 이유)

여러 후보(경력 타임라인 / 가로 스크롤 갤러리 / 숫자 카운트업 / FAQ 아코디언 / 후기)를 두고 **여정 타임라인**을 골랐다.

- **새 기술 연습 가치**: 지금까지 안 해 본 **SVG 선 그리기(`pathLength`)** + **그라데이션/발광 스트로크**를 연습한다. framer-motion이 1급 지원, 스크롤 연동과 궁합이 좋다.
- **배운 것 재활용**: `useScroll`/`scrollYProgress`(Approach에서 익힘)를 재사용하되, 출력을 "원 좌표"가 아니라 "선의 그려진 길이 + 노드 강조"로 바꾼다 → 같은 뼈대의 확장.
- **sticky 불필요**: Approach와 달리 **sticky/tall 컨테이너가 필요 없다**(선은 섹션을 지나가는 스크롤에 맞춰 제자리에서 그려짐). 구조 부담이 없는 만큼, **대신 여러 인터랙션을 한 섹션에 모아** 폭넓게 연습하는 쪽으로 방향을 잡았다(§3).
- **서사 공백을 메움**: "누구(Hero) → 어떻게 생각하나(Approach) → …"에 **"어떤 길을 걸어왔나"**가 빠져 있다.
- **기존 섹션과 연결**: 마지막 마일스톤을 Approach의 **"융합형"** 정체성으로 수렴시키고, 그 단어에 §5 색 와이프를 재활용해 섹션 간 서사를 잇는다.

> 차선책(참고): 가로 스크롤 핀 갤러리는 sticky+useScroll **반복** 성격이 강하고, 숫자 카운트업은 서사 기여가 약하다.

---

## 1. 목적 / 역할 / 배치

- **역할**: 개발자가 걸어온 흐름(입문 → 실무 → 심화 → 융합)을 **시간 순 타임라인**으로. Hero·Approach가 "지금의 나"라면 여기는 "거기까지의 경로".
- **배치(두 섹션 추가 후 전체 순서)**: `Hero → Approach → **Journey** → Projects → Skills → **Services** → CTA`.
  - Journey = Approach(관점)의 "유래"를 보인 뒤 결과물 Projects로 넘어가는 다리.
  - Services(`SECTION_SERVICES_PLAN.md`)는 Skills 뒤·CTA 앞.
- **앵커/네비**: 섹션 `id="journey"`. Header 네비에 라벨 추가(예: `Journey`/`Path`). → 확정 시 `Header.tsx` `navLinks`·`CLAUDE.md` 섹션 목록 갱신.

---

## 2. 콘텐츠 구조 (플레이스홀더)

시간 순 **마일스톤 4개**(개수는 §8 확정). 각 항목 = `연도 + 제목 + 한 줄 설명`. 반복 데이터라 **배열로 분리해 map 렌더**.

| # | 연도(placeholder) | 제목(placeholder) | 한 줄 설명 |
|---|---|---|---|
| 1 | 3000 | 개발 입문 | 시작점 |
| 2 | 3002 | 첫 실무 프로젝트 | 실전 투입 |
| 3 | 3004 | 프론트엔드 심화 | 인터랙션·성능 |
| 4 | 3005 | 기획·디자인·개발의 **융합형** | Approach 정체성과 수렴 + 색 강조 대상 |

> 실제 이력이 아니라 **연습용 플레이스홀더**임을 코드 주석/문서로 명시. **연도는 누가 봐도 허수임이 드러나게 3000년대**로 둔다(실제 경력 오해 방지).

> **디자인 시안(Figma)**: `journey`(데스크탑) / `journey-mobile`(모바일) 프레임 = node **`106:2`** / **`111:2`**. 색·폰트·간격은 approach 시안과 동일(bg `#0A0A0A`, accent `#6366F1`, Geist / Geist Mono). 구현 시 좌표·크기는 이 프레임을 `get_metadata`로 뽑아 레퍼런스로 참조.

---

## 3. 인터랙션 = 핸드오프 모션 스펙 (framer-motion) — 밀도 높은 쇼케이스

> **트리거**: 섹션이 뷰포트를 지나가는 스크롤(+ 카드 hover). 타이밍·이징 수치는 구현 단계에서 직접 결정.
> 아래 5가지를 **한 섹션에 모아** 연습한다. 단 §3.끝의 "밀도 주의"를 지킬 것.

1. **스파인 선 그리기 + 선 머리 발광 (핵심·새 기술)**
   - **[구현 반영] 스파인은 SVG `<path>`가 아니라 CSS 마디(각 `<li>`의 연결선 `div`)로 확정.** 단일 `<path>`로는 선이 첫 점~마지막 점에서 딱 멈추면서 카드 높이에 맞춰 늘어나게 하기 어려워 좌표를 손으로 찍게 된다. 그래서 마커열을 `[윗선·점·아랫선]`으로 나눠 `flex-1`로 자동 정렬(좌표 하드코딩 0). 상세: `JOURNEY_SESSION_NOTE.md`·`WORK_LOG.md`.
   - **선 그리기**: 각 마디를 **`scaleY` 0→1**(+`transform-origin: top`)로 펼친다. `scrollYProgress`를 마디별 구간에 매핑(진행도 비례) 또는 `whileInView`(진입 시). `pathLength` 대신 `scaleY`.
   - **선 머리 발광**: CSS 마디에는 SVG `linearGradient` 스트로크를 못 쓴다 → **`box-shadow` glow / 이동 발광 `div`**로 대체하거나 **축소**(밀도 주의). 발광이 꼭 필요하면 스파인만 별도 SVG 오버레이로 재도입하는 안도 있음(트레이드오프 §8.2).
   - `useScroll({ target: 섹션 ref, offset })`로 진행도 확보(Approach와 동일 훅, sticky 불필요).
2. **마일스톤 노드 등장**
   - 각 노드(점 + 카드)는 선이 그 지점에 닿을 즈음 **등장**: 점이 accent로 채워지고 카드가 **페이드+살짝 슬라이드**.
3. **선끝이 닿는 노드를 "현재"로 강조 (새 연습)**
   - 그려지는 **선 머리가 지나가는 노드**를 active로: 점이 커지거나 빛나고 카드가 살짝 부각, 지나간 노드는 톤 정리.
   - 진행도(`scrollYProgress`)를 **노드별 구간(threshold)**에 매핑해 active 계산. → **2번(노드 등장)도 threshold로 통합**하는 게 자연스럽다(둘 다 같은 스크롤 위치 기반, §8).
4. **마지막 "융합형" 노드 색 와이프 (확정)**
   - `CSS_ADVANCED.md` §5의 `background-clip: text` **왼→오 와이프**를 재활용해 "융합형"을 강조. 서사적 마침표이자 Approach 색 강조와 통일감.
5. **카드 hover/tap 마이크로 인터랙션 (새 연습)**
   - `whileHover`(살짝 떠오름/보더 accent), `whileTap`(살짝 눌림). 카드가 "볼 만하다/누를 만하다"는 촉각 신호.
   - **포인터 전용**이므로 hover로만 정보를 숨기지 말 것(§5).

### 밀도 주의 (중요)
- 5가지가 **동시에 과하게** 움직이면 가독성이 깨진다. 발광·와이프는 **장식** 강도로 절제.
- **각 인터랙션마다 reduced-motion 정지 상태**를 함께 설계한다(아래).

### 접근성 / 모션 최소화 (reduced-motion)
- `prefers-reduced-motion`이면 **스크롤 연동·발광·와이프를 끄고** "선 다 그려짐 + 모든 노드 보임 + 융합형은 accent로 칠해진" **정지 최종형**으로 렌더.
- 이 정지 상태 = **마크업만으로 완결되는 형태**. `useReducedMotion` 가드는 처음부터 포함. (가드 패턴 `FRAMER_MOTION_GUIDE.md` §5.3)

---

## 4. 반응형 (모바일 우선)

- **공통(기본=모바일)**: **단일 컬럼**. 왼쪽 스파인 선, 오른쪽 노드 카드 세로 스택.
- **데스크탑(md+)**: (A) 좌측 선 + 우측 카드 단일 컬럼(단순) vs (B) 중앙 선 + 좌우 교차 카드(전형적, 난이도↑) — §8.
- 선 그리기·노드 강조 로직은 폭과 무관(좌표만 다름). 모바일은 스크롤 연동 유지하되 **발광 등 장식은 축소 가능**. hover는 터치에서 사실상 tap → `whileTap` 위주.

---

## 5. 접근성 / 시맨틱

- 타임라인 = **순서 있는 목록** → `<ol>`/`<li>`(시간 순서를 의미로). 스파인 선(CSS 마디 `div`)·발광은 **장식** — 의미 없는 빈 요소라 스크린리더가 무시(별도 처리 불필요). *(발광용으로 SVG를 재도입하면 그 SVG엔 `aria-hidden`.)*
- 정지 상태(모션 없이)에서 **연도·제목·설명이 모두 읽혀야** 한다 → 마크업 우선.
- **색만으로 의미 전달 금지**(WCAG 1.4.1): "융합형" 강조는 텍스트로도 완결(와이프가 안 돼도 읽힘).
- **hover 강조는 포인터 전용** → hover 없이(키보드/터치)도 모든 정보 접근 가능. hover는 강조일 뿐, 내용 은닉 금지.
- 상세: `A11Y_CHECKLIST.md`.

---

## 6. 새로 연습하는 기술 + 참고

- **신규**: ① CSS 마디 **`scaleY`** 선 그리기(scrollYProgress 연동) *(당초 SVG `pathLength` 계획 → 정렬 문제로 CSS 마디로 변경, §3.1)*, ② 선 머리 **발광**(`box-shadow`/이동 `div`; SVG `linearGradient`는 CSS 마디에선 불가), ③ **`whileHover`/`whileTap`** 제스처.
- **재사용**: `useScroll`/`scrollYProgress`(Approach), 진행도 threshold 매핑·`useTransform`(Approach), `background-clip` 와이프(`CSS_ADVANCED.md` §5).
- 참고:
  - framer-motion `pathLength`·gestures: https://motion.dev/docs/react-motion-component — 정확한 API는 설치 버전 `.d.ts` 대조.
  - MDN SVG `<path>` / `stroke-dasharray`(선 그리기 원리): https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray
  - MDN SVG `linearGradient`: https://developer.mozilla.org/docs/Web/SVG/Element/linearGradient
  - `useScroll`: https://motion.dev/docs/react-use-scroll
  - 내부: `FRAMER_MOTION_GUIDE.md` §3·§3.1, `SCROLL_MERGE_GUIDE.md`, `CSS_ADVANCED.md` §5.

> 구현 착수 시 `FRAMER_MOTION_GUIDE.md`에 "`pathLength` 선 그리기 + gesture(whileHover/tap)" 하위 절을 새로 정리하면 좋다(Approach 때 §3.1을 만든 것처럼).

---

## 7. 권장 구현 순서 (마크업 → 스타일 → 인터랙션)

1. **마크업 먼저**(모션 없이, 정지에서 의미 완결): `<ol>` 타임라인 + 각 `<li>` 연도/제목/설명, 스파인 선 자리(정적 **CSS 마디**: `div` 연결선).
2. **스타일**(Tailwind·토큰): 선·점·카드 배치, 색은 토큰, 좌측(또는 중앙) 선 정렬.
3. **인터랙션(하나씩 쌓기)**:
   ① `useScroll` 진행도 확인(숫자로 찍기) → ② 마디 `scaleY` 연결(그려지는지) → ③ 노드 등장/선끝 강조(threshold) → ④ 선 머리 발광 → ⑤ 융합형 색 와이프 → ⑥ 카드 `whileHover`/`whileTap` → ⑦ `useReducedMotion` 정지 최종형.
   > 한 번에 다 넣지 말고 ①→⑦ 순서로 **하나 확인하고 다음**. 막히면 그 단계에서 멈춰 점검.

> 마크업(1단계) 개념 상세는 별도 세션 노트 `JOURNEY_SESSION_NOTE.md` 참고.

---

## 8. 아직 열린 결정 (구현 전/중 확정)

1. **[확정]** 레이아웃 = 데스크탑·모바일 모두 **(A) 좌측 선 단일 컬럼**(왼쪽 스파인 + 오른쪽 카드).
2. **선 머리 발광 방식**(3단계): 스파인이 CSS 마디라 `linearGradient` 스트로크 불가 → **`box-shadow` glow** vs **팁 추적 발광 `div`** vs **발광 생략** 중 택. *(당초 "발광 때문에 SVG 확정, scaleY div 제외"는 철회 — 정렬 문제로 CSS 마디 `scaleY` 채택, §3.1.)*
3. **노드 등장 + 선끝 강조 구동**(3단계): 둘을 **진행도 threshold로 통합**(권장) vs 등장은 `whileInView` once + 강조만 threshold. (통합이 스크롤 위치 일관성 有)
4. **[확정]** 마일스톤 **4개**, 연도 허수(3000/3002/3004/3005), 문구는 §2 표대로.
5. **hover 세부**(3단계): lift 정도·보더 처리, `whileTap` 유무, 터치기기 대체 동작.
6. **[확정]** 네비 라벨 **`Road`**(`#journey`) — `Header.tsx`·`CLAUDE.md` 반영 완료.
