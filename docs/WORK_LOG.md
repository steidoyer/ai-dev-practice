# 작업 기록 (WORK_LOG)

프로젝트에서 부딪힌 **문제 → 원인 → 해결**을 기록한다. (해결 중심 로그.)

- **리뷰 로그(`CODE_REVIEW_LOG.md`, 비커밋)** = 멘토의 리뷰·의견. **이 문서(커밋됨)** = 문제 해결 기록.
- **정제된 권장 패턴**은 각 가이드 문서(`FRAMER_MOTION_GUIDE.md` 등)에 있고, 여기엔 조사·해결 서사를 담는다(가이드로 링크).
- 날짜 대신 **주제 단위**로 쌓는다.

---

## reduced-motion 렌더 분기 → SSR 하이드레이션 불일치

**대상**: `src/components/sections/Approach.tsx`, `src/components/sections/Hero.tsx`, `src/components/motion/FadeIn.tsx`
**증상**: DevTools에서 **prefers-reduced-motion을 ON**으로 켜면 콘솔에 하이드레이션 경고("A tree hydrated but some attributes of the server rendered HTML didn't match the client properties…"). 서버 재시작·강력 새로고침·`.next` 삭제로도 안 사라짐. Hero에서는 reduced 시 **내용이 안 보이는 버그((c))** 도 동반.

### 원인 — framer `useReducedMotion()`은 SSR에서 렌더를 분기하면 깨진다
framer 소스(`use-reduced-motion.mjs`)는 `const [shouldReduceMotion] = useState(prefersReducedMotion.current)` 꼴이다.
- **서버**: `matchMedia`가 없어 기본값 **false** → 서버 HTML은 "동작 줄이기 아님" 기준으로 그려짐.
- **클라이언트 첫 렌더**: 실제 `matchMedia` 값(reduced ON이면 **true**)을 바로 읽음.

→ 이 값으로 **className·style·variants·initial 같은 렌더 출력**을 분기하면 **서버 HTML ≠ 클라 첫 렌더** → 속성 불일치. (reduced OFF면 양쪽 false라 안 뜸 → 그래서 켰을 때만 나타남.) DevTools 에뮬레이션만의 문제가 아니라 **실제 reduced-motion 사용자에게 그대로 발생** — 가드가 필요한 바로 그 사용자에게 버그가 나는 셈.

### 왜 서버·클라 reduce 값이 다른가 (matchMedia 부재 + 설정이 요청에 안 실림)
- **기계적 이유**: `matchMedia`는 **브라우저(window) API**다. **서버(SSR 시 Node)엔 window가 없어** 못 부른다 → framer가 서버에선 기본 **`false`** 로 둠(`initPrefersReducedMotion()`이 window 없어 초기화 못 함 → `prefersReducedMotion.current`=false 유지). 클라이언트는 `matchMedia('(prefers-reduced-motion: reduce)').matches`로 **실제 값**을 읽음 → **서버 false / 클라 true**.
- **더 근본적 이유**: reduced-motion은 **사용자 기기/브라우저 설정**이라 **HTTP 요청에 실려 오지 않는다** — 서버는 애초에 이 사용자가 동작 줄이기를 켰는지 **알 방법이 없다**. (Client Hints `Sec-CH-Prefers-Reduced-Motion` 헤더가 있으나 기본 미사용, 이 프로젝트도 안 씀.)
- 그래서 SSR 정석 = **"서버는 모르니 일단 false로 가정 → 마운트 후 클라에서 실제 값으로 보정"**. `useSyncExternalStore`의 `getServerSnapshot = () => false`가 정확히 그 **"서버는 false 가정"** 부분이다. (같은 원리로, 반응형 브레이크포인트도 JS `matchMedia` 대신 CSS `hidden`/`md:hidden`으로 처리 — `SECTION_APPROACH_PLAN.md` 62행.)

### 추적 경위 (헷갈렸던 부분 포함)
1. 처음엔 Approach로 의심 → Approach의 reduce 분기를 **`useSyncExternalStore`(SSR-안전)로 교체**해서 Approach 쪽 불일치는 막음. **그런데 경고가 계속 남음.**
2. 콘솔 스택 확인: 맨 위 **`overrideMethod`는 React DevTools가 `console.error`를 감싼 래퍼일 뿐(버그 아님)**. 의미 있는 신호는 **컴포넌트 스택이 `Hero.tsx` 55행 `<motion.div>`를 가리킨다**는 것.
3. 즉 **남은 경고는 Approach가 아니라 Hero발**이었다. Approach 수정은 정상. 서버 재시작·`.next` 삭제로도 안 없어진 이유 = 원인이 딴 파일이라서.

### Hero 55행 메커니즘 (왜 불일치인가)
Hero는 `useReducedMotion()`(26행) 값으로 variants를 분기(`const itemVariants = prefersReducedMotion ? undefined : item`, 29~31행)하고, 55행 `<motion.div variants={itemVariants}>` + 부모 `initial="hidden"`(51행)이 걸려 있다.
- **서버**: reduced=false → `itemVariants=item` → `initial="hidden"`이 `item.hidden={opacity:0, y:20}`로 해석 → **SSR style = `opacity:0; transform: translateY(20px)`**.
- **클라(reduced ON)**: reduced=true → `itemVariants=undefined` → "hidden" 변형 없음 → **`opacity:1`, transform 없음**.

→ 서버 style ≠ 클라 style → 55행에서 불일치. (47·72·80행 다른 motion 요소도 같은 이유로 후보.)

### 같은 지뢰가 프로젝트 전반에
`FadeIn.tsx`도 `const hidden = prefersReducedMotion ? {opacity:1,y:0} : {opacity:0,y:24}`로 **똑같이** framer `useReducedMotion`을 렌더에 분기한다 → reduced ON이면 여기서도 서버(opacity:0)/클라(opacity:1) 불일치. **패턴 문제**.

### 해결 — SSR-안전 감지를 공용 훅으로
`useSyncExternalStore`는 "서버/클라에서 다르고 바뀔 수도 있는 외부 값"을 SSR-안전하게 읽는 React 정식 도구(미디어쿼리가 교과서 사례). 이걸 **공용 훅 하나**로 빼서 Hero·FadeIn·Approach가 같이 쓰게 한다.

**공용 훅 구조** — `src/hooks/useReducedMotionSafe.ts`. 모듈 최상위에:
- `getServerSnapshot = () => false` (서버는 항상 false → 하이드레이션 일치)
- `getSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches`
- `subscribe = (cb: () => void) => { const m = matchMedia('(prefers-reduced-motion: reduce)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }` (콜백 타입 명시로 TS7006 방지)
```ts
export function useReducedMotionSafe() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```
- 반환은 `boolean`. `subscribe`/`getSnapshot`은 **모듈 최상위**에 둬야 참조가 안정적(재구독 방지). 브라우저 API는 `getSnapshot`/`subscribe`에서만 만져서 **서버에선 호출 안 됨**(서버는 `getServerSnapshot`).

**적용 (세 곳에서 framer `useReducedMotion` → 공용 훅)**
- **Approach**: 인라인으로 흩어둔 store 함수들을 지우고 `const reduce = useReducedMotionSafe()` 한 줄로.
- **Hero**(26행)·**FadeIn**: `useReducedMotion()` → `useReducedMotionSafe()`.

**왜 이걸로 해결되나 (Hero 기준)**: 서버=false → `itemVariants=item` → `hidden` 상태로 SSR. 하이드레이션도 false(`getServerSnapshot`) → **동일** → 불일치 0. reduced 반영은 하이드레이션 **이후** 재렌더로.

### 후속 정정 (중요) — `undefined` 스왑은 (c) "내용 안 보임" 버그
처음엔 "Hero의 variants 분기(undefined 스왑)를 그대로 둬도 SSR-안전"이라 봤는데 **틀렸다.** `variants = reduce ? undefined : …`는 마운트-후 값이 뒤집히는 순간 `show` 타깃이 사라져 **내용이 안 보이는 (c) 버그**가 났다(reduced 사용자 화면이 빈다). → **`undefined` 대신 "정의된 reduced 변형"으로** 해결:
- **Hero**: `itemReduced`(`show:{opacity:1, transition:{duration:0}}`) — 항상 보이는 상태로 스냅.
- **FadeIn**: `initial` 분기는 마운트 이후엔 안 먹으므로 무효 → **`transition`을 분기**(`transition={reduce ? {duration:0} : {…}}`). 아래쪽 섹션은 뷰 진입 시점엔 reduce가 이미 정착돼 **즉시 스냅**(페이드 없음).
- **Approach**: 값 구동(스크롤)·CSS(className)라 MotionConfig가 안 걸림 → style·className에 `reduce` 직접 분기.
- 이벤트 핸들러 분기(예: `scrollIntoView` behavior)는 render 출력이 아니라 raw `useReducedMotion`도 무방.

### 트레이드오프 — "완전 즉시(페이드 0)"는 SSR과 충돌
서버가 reduced 여부를 모르니 hidden 상태로 SSR → 클라는 짧게 페이드가 보였다 스냅된다(값이 뒤집히는 창). SSR 등장 애니메이션의 구조적 대가. reduced-motion의 본질은 **이동 제거**이므로 **짧은 opacity 페이드는 일반적으로 허용**된다(이동은 제거됨). 정말 0으로 만들려면 등장을 CSS로 옮기고 `motion-reduce:`로 끄는 수밖에 없다. (MotionConfig `reducedMotion="user"`도 opacity 페이드는 유지하므로 이 "즉시"는 못 만든다.)

### 이슈 범위 (신뢰 출처 기반 조사)
내 개발환경/로컬 한정이 **아니라 범용 React SSR 이슈**. 서버엔 `matchMedia`가 없어 `useReducedMotion`이 **서버=false / 클라=true** → reduced-motion 사용자에게 불일치. **dev는 콘솔 경고**로 뜨고, **prod는 경고 없이도 동작으로 발생**(React가 해당 서브트리를 클라에서 재생성/복구 → 깜빡임·SSR 이점 손실, 불일치 속성은 서버 값 유지·텍스트만 갱신). Next.js 한정이 아니라 Remix·Astro 등 SSR 전반. (출처: react.dev `hydrateRoot`, Next.js `messages/react-hydration-error`.)

### 교훈 + 정제 문서
- **교훈**: 클라 전용 값(`matchMedia`/`useReducedMotion`/`localStorage` 등)으로 **render 출력을 분기하면 SSR 하이드레이션이 깨진다.** 렌더 분기엔 `useSyncExternalStore`(서버 스냅샷). reduced-motion은 `undefined` 스왑 대신 **정의된 reduced 변형**으로.
- **정제 문서**: `FRAMER_MOTION_GUIDE.md` §5.3(권장 패턴)·§5.7·§7-6, `NEXTJS_GUIDE.md` §5.6, `A11Y_CHECKLIST.md` §7.
- **관련 소스**: framer `use-reduced-motion.mjs`(SSR 기본 false), React `useSyncExternalStore`(getServerSnapshot).
