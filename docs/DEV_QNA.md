# 개발 중 질문 & 답변 노트

> 포트폴리오 개발 세션에서 나온 개념 질문과 답변 모음. 개인 공부용.
> Q2~Q8은 Tailwind 관련 항목을 학습 흐름대로 묶어 정렬했다:
> 파이프라인(Q2) → 네이밍(Q3) → 네임스페이스 매핑(Q4) → 커스텀 유틸리티(Q5) → `@theme` 지시자(Q6) → 폰트 적용 사례(Q7·Q8).
> Q12~Q14는 Next.js Metadata / SEO 묶음이다:
> 메타데이터 주입 원리(Q12) → OG 이미지 정의·소비(Q13) → opengraph-image로 OG 이미지 생성(Q14).

---

## Q1. `/run` 스킬은 어떻게 동작하나?

**답변:**  
Claude Code의 `/run` 스킬은 앱을 직접 실행하고 브라우저 스크린샷으로 결과를 확인하는 자동화 도구다.

실행 순서:
1. `npm run dev`로 개발 서버를 백그라운드에서 실행
2. `localhost:3000`이 응답할 때까지 대기
3. Playwright(Chromium)로 실제 브라우저처럼 페이지를 열고 스크린샷 캡처
4. 화면을 확인하고 문제가 있으면 수정까지 진행

터미널에서 직접 실행하려면 `! npm run dev`처럼 `!` 접두사를 붙이면 명령 결과가 대화에 바로 들어온다.

---

## Q2. Tailwind는 실제로 CSS를 어떻게 생성하나 — 전체 파이프라인

> Q3은 "유틸리티 **이름**이 어떻게 정해지나"(네임스페이스 → 클래스명)를 다루고, Q6은 `@theme` vs `@theme inline`의 차이를 다룬다.
> 이 항목은 그보다 한 단계 위 — **빌드 시 Tailwind가 CSS 파일을 통째로 만들어내는 과정 전체**를 본다. (Q3·Q6은 이 파이프라인의 일부다.)

### 핵심: "on-demand(JIT) 생성" — 쓰는 클래스만 만든다

Tailwind는 가능한 모든 유틸리티를 미리 뽑아두지 않는다. **소스 코드에서 실제로 쓰인 클래스 이름만** 찾아 그때그때 CSS 규칙을 만든다(Just-In-Time). `text-accent`를 아무데도 안 쓰면 그 규칙은 최종 CSS에 아예 없다. 그래서 프로젝트가 커도 출력 CSS가 작게 유지된다.

### 생성 4단계

```
1. @import "tailwindcss"   →  진입점. theme·preflight·utilities 레이어를 끌어온다
2. 소스 스캔 (content detection)  →  .tsx/.jsx 등에서 "클래스처럼 생긴 문자열" 후보 수집
3. 후보 매칭 (JIT)  →  각 후보를 @theme 토큰·네임스페이스 규칙과 대조해 CSS 규칙 생성
4. 레이어 조립 + 출력  →  reset → 토큰(:root) → 유틸리티 순서로 하나의 CSS로 묶음
```

**1단계 — 진입점 `@import "tailwindcss"`**
v4는 `tailwind.config.js` 없이 CSS 파일 하나가 설정이다(우리 `globals.css`). 이 import가 세 덩어리를 가져온다:
- **theme** — 기본 디자인 토큰 + 우리가 `@theme`에 추가한 값
- **preflight** — 브라우저 기본 스타일 초기화(reset)
- **utilities** — 유틸리티 클래스가 생성되어 들어갈 자리

**2단계 — 소스 스캔 (content detection)**
v4는 프로젝트 파일을 자동 감지한다(v3의 `content: [...]` 배열 수동 지정이 기본적으로 불필요). `.gitignore`를 존중하고 소스 파일들을 훑어 **"클래스일 수 있는 문자열"을 통째로 후보로** 뽑는다. 이때 Tailwind는 코드를 실행하지 않고 **텍스트로만** 본다 — 그래서 `` `text-${color}` `` 같은 동적 조합은 못 잡는다(정적 문자열로 써야 하는 이유).

**3단계 — 후보 매칭 (여기서 Q3이 작동)**
후보 하나하나를 규칙에 대입한다:
- `bg-accent` → `bg-` 프리픽스 + `@theme`의 `--color-accent`가 있나? → 있으면 `.bg-accent { background-color: var(--color-accent) }` 생성 (Q3의 네임스페이스 매칭)
- `w-[37.5rem]` → 대괄호 = **임의값(arbitrary value)**. 토큰에 없어도 `[]` 안의 값을 그대로 써서 `.w-\[37\.5rem\] { width: 37.5rem }` 생성 (우리 Hero의 `w-[37.5rem]`, Skills의 `gap-[1.25rem]`가 이 경로)
- `flex`, `items-center` → 토큰과 무관한 정적 유틸리티는 내장 정의로 생성
- 매칭 실패(오타 등) → 아무것도 생성 안 함(조용히 무시)

**4단계 — 레이어 조립 + 캐스케이드 순서**
생성된 규칙들을 네이티브 CSS `@layer`에 넣는다. 순서는 **`theme → base → components → utilities`**이고, **뒤에 선언된 레이어일수록 우선순위가 높다**. 그래서 유틸리티(utilities)가 preflight reset(base)이나 theme보다 항상 우선한다. `@theme`이 만든 `:root` 변수(Q6의 ①)는 theme 레이어에서 함께 출력된다. (이 순서를 누가·어디서 정하는지, 바꿀 수 있는지는 아래 "레이어 순서는 어디서 정의되나" 참고.)

### `@theme` / `@theme inline`이 파이프라인에서 하는 역할 (Q6 연계)

| | 파이프라인에서의 위치 |
|---|---|
| `@theme` | 3단계 매칭이 참조할 **토큰 사전**을 채우고, 4단계에서 `:root` 변수로도 출력 |
| `@theme inline` | 토큰 사전 채우기는 같으나, `:root` 변수 출력을 **건너뛰고** 유틸리티가 외부 변수를 직접 참조 (Q6 참고) |

즉 `@theme`은 "3단계가 무엇을 만들 수 있는지"의 **재료**를, 소스 스캔은 "그중 무엇을 실제로 만들지"의 **주문서**를 담당한다. 둘이 만나는 3단계에서 최종 유틸리티 집합이 결정된다.

### 레이어 순서는 어디서 정의되나 — 고정 기본값 + 프로젝트 커스터마이즈

**어디서 정의되나 — 패키지 진입점**
`@import "tailwindcss"`가 실제로 가져오는 파일(`node_modules/tailwindcss/index.css`)의 **첫 줄**에 순서가 박혀 있다:
```css
/* node_modules/tailwindcss/index.css (v4.3.1) */
@layer theme, base, components, utilities;   /* ← 이 한 줄이 우선순위 순서를 정함 */

@layer theme     { @theme default { --color-red-500: …; } }   /* 3번째 줄~  기본 토큰 */
@layer base      { /* preflight: 브라우저 reset */ }           /* 534번째 줄~ */
@layer utilities { /* 유틸리티 */ }                            /* 942번째 줄~ */
```
- `@layer a, b, c, d;`는 Tailwind 문법이 아니라 **네이티브 CSS 기능**이다. 규칙은 "**나중에 선언된 레이어가 우선순위 높음**" → `theme`(최하) < `base` < `components` < `utilities`(최상).
- `components`는 순서 선언에는 있지만 기본 콘텐츠는 비어 있다 — 사용자/컴포넌트 스타일용으로 예약된 자리다.
- (직접 확인: `index.css`의 1·3·534·942번째 줄에 각 레이어 선언이 있다. Q10의 react-icons 확인과 같은 방식으로 실제 패키지를 열어봄.)

**프로젝트마다 바꿀 수 있나 — 그렇다**
`@import "tailwindcss"`는 위 진입점을 통째로 가져오는 **축약형**일 뿐이다. 순서·구성을 제어하려면 이 축약을 풀어 개별 import로 바꾸면 된다:
```css
/* @import "tailwindcss" 를 풀어 쓴 형태 — 순서·구성을 내가 제어 */
@layer theme, base, components, utilities;    /* 순서를 직접 선언 */
@import "tailwindcss/theme.css"     layer(theme);
@import "tailwindcss/preflight.css" layer(base);       /* ← 이 줄을 빼면 reset 비활성화 */
@import "tailwindcss/utilities.css" layer(utilities);
```
이렇게 하면:
- **순서 변경**: 첫 줄 `@layer …` 나열 순서를 바꾸면 우선순위가 바뀐다.
- **일부 제외**: preflight(reset)를 안 쓰려면 `preflight.css` import만 빼면 된다.
- **내 레이어 활용**: `@layer components { .btn { … } }`처럼 내 스타일을 특정 레이어에 넣어 유틸리티와의 우선순위를 명시적으로 통제.

**정리**: 기본 순서는 **Tailwind 패키지가 고정으로 제공**하므로 대부분 프로젝트가 동일하지만, 진입점을 풀어 쓰면 **프로젝트마다 순서·구성을 커스터마이즈할 수 있다**. 우리 `globals.css`는 축약형 `@import "tailwindcss"` 하나만 쓰므로 기본 순서를 그대로 따른다.

### 심화: CSS `@layer` 규칙 자체 (Tailwind 밖의 표준 CSS)

**cascade layer = 우선순위를 "선택자 명시도(specificity)보다 위" 단계에서 묶는 장치**

원래 CSS 충돌 해결 순서는 (1) origin/importance → (2) 선택자 명시도 → (3) 소스 등장 순서다. cascade layer는 여기에 한 칸을 더 끼운다: **레이어 우선순위는 명시도보다 먼저 따진다.** 그래서 낮은 레이어의 `#id.a.b.c`(명시도 높음)보다, 높은 레이어의 `.x`(명시도 낮음)가 **이긴다.**

**도입 시기 · 브라우저 지원**
- **스펙**: [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/)에서 새로 정의된 기능(이전 레벨엔 없었다).
- **브라우저**: 2022년 봄에 주요 브라우저가 일제히 지원 시작 —
  | 브라우저 | 지원 버전 | 시기 |
  |---|---|---|
  | Chrome / Edge | **99** | 2022-03 |
  | Firefox | **97** | 2022-02 |
  | Safari | **15.4** | 2022-03 |
- 즉 2022년 봄 이후 최신 브라우저에선 안전하게 쓸 수 있고(Web Platform Baseline 2022년 진입), 그 이전 버전에선 `@layer` 규칙이 무시된다.
- 주의: 이건 **`@layer`(레이어)** 지원 기준이다. 앞서 나온 Tailwind `properties` 레이어의 폴백은 **다른 기능인 `@property`**의 지원 경계(Safari <16.4, Firefox <128 등)라 서로 다른 버전선이니 헷갈리지 말 것.

문법:
```css
/* 1) 순서만 먼저 선언 (권장) — 나중에 나열된 것 = 높은 우선순위 */
@layer base, components, utilities;

/* 2) 각 레이어에 규칙 채우기 (채우는 순서는 자유) */
@layer base       { a { color: gray; } }
@layer utilities  { .link { color: black; } }   /* utilities가 더 나중 레이어 → 이김 */
```
- `@layer a, b, c;`로 **순서를 미리 확정**할 수 있다(내용은 나중에 아무 순서로 채워도 됨).
- 같은 이름 레이어에 여러 번 넣으면 합쳐진다.
- `@import "..." layer(name);`으로 외부 CSS를 특정 레이어에 넣는다(Tailwind가 이 방식을 씀).

**우선순위 규칙 (헷갈림 포인트) — 자세히**

헷갈리는 이유는 규칙이 **두 가지 경우로 갈리고, 그중 하나(`!important`)는 순서가 거꾸로**이기 때문이다. 하나씩 예시로 본다.

**먼저 큰 원칙 하나**: `!important` 선언은 레이어와 무관하게 **항상** 일반(normal) 선언을 이긴다. 레이어 순서 다툼은 "normal끼리" 또는 "important끼리"일 때만 따진다.

**경우 1 — 일반(normal) 선언: 나중 레이어가 강함, 그리고 unlayered가 최강**

```css
@layer base, theme;              /* base 먼저(약함), theme 나중(강함) 으로 순서 선언 */
@layer base  { p { color: red;  } }
@layer theme { p { color: blue; } }
```
→ `<p>`는 **파랑**. 나중에 선언된 `theme`가 `base`를 이긴다.

여기에 **레이어에 안 넣은(unlayered)** 규칙을 더하면:
```css
@layer theme { p { color: blue; } }   /* 가장 강한 레이어 */
p { color: green; }                    /* @layer 밖 = unlayered */
```
→ `<p>`는 **초록**. **unlayered normal은 어떤 레이어보다도 세다.** 이게 제일 헷갈리는 지점 — "레이어 안 쓴 평범한 CSS가 오히려 제일 강하다."
(그래서 우리 `globals.css`의 `body {}`, `section[id] {}`처럼 `@layer` 밖에 쓴 규칙이 Tailwind의 레이어 스타일을 항상 이긴다 = 트리의 `5: implicit outer layer`가 최강인 이유.)

**경우 1-보충 — 레이어는 "명시도"도 무시한다**
```css
@layer base  { p#intro.on { color: red; } }  /* 명시도 매우 높음 */
@layer theme { p          { color: blue; } } /* 명시도 매우 낮음 */
```
→ 그래도 **파랑**. 레이어 순서(theme가 나중)가 명시도보다 먼저 판정되므로, 명시도가 아무리 높아도 낮은 레이어면 진다.

**경우 2 — `!important` 선언: 순서가 거꾸로 (먼저 레이어가 강함, unlayered가 최약)**

경우 1과 똑같은 구조에 `!important`만 붙여보면 결과가 **뒤집힌다**:
```css
@layer base, theme;
@layer base  { p { color: red  !important; } }
@layer theme { p { color: blue !important; } }
```
→ `<p>`는 **빨강**. `!important`끼리는 **먼저 선언된 레이어(base)가 이긴다** (경우 1과 정반대!).

unlayered도 마찬가지로 뒤집힌다:
```css
@layer base { p { color: red   !important; } }
p          { color: green !important; }   /* unlayered important */
```
→ **빨강**. unlayered `!important`는 **가장 약한 important**가 된다 (경우 1에선 최강이었는데 정반대).

**왜 뒤집히나 (의도)**: 낮은(기초) 레이어에 `!important`를 박는 건 보통 "이건 무슨 일이 있어도 지켜라"는 강한 의도다. 그래서 나중 레이어가 `!important`로 함부로 못 덮게 순서를 뒤집어, **기초 레이어의 `!important`가 최강**이 되도록 설계됐다.

**한 장 정리 (우선순위 낮음 → 높음)**

| normal 선언 | `!important` 선언 |
|---|---|
| 첫 레이어 (약) | unlayered `!important` (약) |
| … 중간 레이어 … | … 나중 레이어 … |
| 마지막 레이어 | … 먼저 레이어 … |
| **unlayered (최강)** | **첫 레이어 `!important` (최강)** |

그리고 이 표 전체에서 **오른쪽(모든 important) > 왼쪽(모든 normal)**. 즉 `!important`는 늘 normal을 이기고, 그 안에서만 위 순서를 따진다.

**실전 질문 1 — 뒤 레이어(utilities)에서 앞 레이어의 선언을 덮으려면?**

먼저 짚을 것: **상세도(specificity)는 레이어 경계를 못 넘는다.** 레이어 판정이 상세도 판정보다 *먼저* 일어나므로, 상세도는 "같은 레이어(또는 둘 다 unlayered) 안에서 동점일 때"만 tie-break으로 쓰인다. 따라서 무엇을 덮느냐로 갈린다.

- **(a) 앞 레이어의 normal 선언을 덮기** — utilities는 나중 레이어라 `!important` 없이도 그냥 이긴다. (Tailwind 유틸리티가 preflight를 명시도 전쟁 없이 덮는 원리.)
- **(b) 앞 레이어의 `!important` 선언을 덮기** — 여기가 함정. important끼리는 순서가 뒤집혀 **앞 레이어가 강하다.**
  ```css
  @layer base { a { color: red !important; } }   /* 앞 레이어 */
  /* utilities 레이어에서 무엇을 해도… */
  @layer utilities { a.super#x { color: blue !important; } }
  ```
  → 링크는 여전히 **빨강**. utilities에서 `!important`를 붙여도, **상세도를 아무리 올려도**(레이어가 먼저 갈리니까), 심지어 **unlayered `!important`로 써도**(unlayered important는 최약체) 전부 진다.
  → 결론: **뒤 레이어에서 앞 레이어의 `!important`는 사실상 못 덮는다.** 유일한 길은 (1) 같거나 더 앞선 레이어에서 `!important`로 쓰거나(같은 레이어면 그다음 상세도→소스순서), (2) 애초에 앞 레이어에 `!important`를 안 쓰는 것. → 지렛대는 **상세도가 아니라 레이어 위치**다.

**실전 질문 2 — unlayered끼리 다시 덮으려면?**

"unlayered가 최강"은 *레이어 대 레이어* 판정에서의 얘기다. **unlayered normal끼리 붙으면 레이어 변수가 사라져 평범한 케스케이드로 돌아간다:**

1. 상세도 높은 쪽 승
2. 상세도가 같으면 → **소스 순서상 뒤에 나온 쪽 승**

즉 "상세도를 올리거나, 못 올리면 소스코드를 뒤에 오게 한다"가 맞다. (최후 수단으로 `!important`를 붙이면 어떤 normal이든 이기지만 — unlayered important는 최약 important라도 여전히 모든 normal보다 위 — 지양.)

### `@layer`가 Tailwind 규칙을 적용하는 예시

`@import "tailwindcss"`가 만드는 구조(위쪽 참고): `@layer theme, base, components, utilities;` — 우선순위 `theme(약) → utilities(강)`.

```html
<a class="text-accent" href="#">링크</a>
```
- `base` 레이어(preflight)에 `a { color: inherit }` 류 reset이 있고,
- `utilities` 레이어에 `.text-accent { color: var(--color-accent) }`가 있다.
- 둘 다 `<a>` 색을 건드리지만 **utilities가 더 나중 레이어라 무조건 이긴다.** → 명시도를 억지로 안 올려도 유틸리티 한 개가 reset을 덮는다. 이게 Tailwind가 "유틸리티는 항상 예측 가능하게 이긴다"를 명시도 전쟁 없이 보장하는 방법이다.

**함정**: 유틸리티끼리는 **같은 레이어**라 레이어로 못 가린다. `text-accent`와 `text-primary`를 한 요소에 같이 주면, 다음 기준인 **CSS 소스 순서**(생성된 유틸리티가 CSS 파일에 등장하는 순서)로 정해진다 — **HTML class에 쓴 순서가 아니다.** 그래서 상충하는 유틸리티를 한 요소에 같이 주는 건 피한다.

### 크롬 개발자도구의 "레이어" — 이름 같은 두 기능, 그리고 실제로 본 것

DevTools에는 "layer"가 붙은 기능이 **둘** 있고 서로 **완전히 무관**하다. **이 프로젝트에서 본 것은 (A) cascade layers다** — 트리에 `theme·base·components·utilities`(Tailwind 레이어 이름)와 `implicit outer layer`가 보였기 때문. (B) 합성 레이어 패널이면 이런 이름이 절대 안 나온다.

#### (A) Elements ▸ Styles 패널의 cascade layers — **실제로 본 것**

관찰된 트리 (DevTools는 우선순위 **낮음→높음**을 0번부터 매긴다):
```
0: properties            ← 가장 약함
1: theme
2: base
3: components
4: utilities
5: implicit outer layer  ← 가장 강함
```
빌드 산출 CSS(`.next/.../globals...css`)로 직접 확인한 실제 선언 순서와 정확히 일치한다:
```css
@layer properties { … }
@layer theme { … }
@layer base { … }
@layer components;      /* 선언만, 내용 비어 있음 */
@layer utilities { … }
```
- **번호 = 우선순위이고, 낮은 번호가 약하다.** cascade layer는 "먼저 선언된 레이어가 더 약함" 규칙이라(Q2 위쪽), 소스에 먼저 나온 `properties`가 0(최약), 나중 `utilities`가 4(강). 어디에도 안 속한 **`implicit outer layer`가 5(최강)**.

**각 번호 설명:**

- **0 · `properties`** — Tailwind v4가 자동으로 넣는 **내부 폴백 레이어**. 빌드 결과 실물:
  ```css
  @layer properties {
    @supports (…@property 미지원 브라우저 감지 조건…) {
      *, ::before, ::after, ::backdrop {
        --tw-translate-x: 0; --tw-rotate-y: initial;
        --tw-border-style: solid; --tw-font-weight: initial; …
      }
    }
  }
  ```
  Tailwind는 `--tw-translate-x`, `--tw-border-style` 같은 **내부 헬퍼 변수**를 최신 브라우저에선 `@property`로 등록해 타입·초기값을 준다. 하지만 `@property`를 모르는 구형 브라우저(Safari <16.4, Firefox <128 등)를 위해, `@supports`로 그런 브라우저만 골라 같은 초기값을 모든 요소에 수동으로 박아두는 **하위호환 장치**가 이 레이어다. 어디까지나 초기값이라 **가장 약한 레이어(0)**에 둬서 실제 유틸리티가 항상 덮게 한다. (그래서 우리가 직접 만든 게 아닌데도 트리 맨 아래에 보인다.)
- **1 · `theme`** — `@theme`가 만든 `:root` 디자인 토큰 변수(`--color-*`, `--spacing-*`, `--font-*` …). (Q6)
- **2 · `base`** — preflight, 즉 브라우저 기본 스타일 **reset**(margin 0, box-sizing border-box, 제목 폰트 크기 초기화 등).
- **3 · `components`** — 컴포넌트성 클래스용 자리. 우리 프로젝트는 **비어 있다**(위 CSS의 `@layer components;` — 순서 예약만 하고 내용 없음). `@apply`로 만든 컴포넌트 클래스 등을 여기에 두는 용도(Q5).
- **4 · `utilities`** — 실제 유틸리티(`bg-accent`, `p-card`, `font-korean`, `flex` …). 우리가 마크업에서 쓰는 대부분이 여기서 나온다.
- **5 · `implicit outer layer`** — 어느 `@layer`에도 안 들어간 **레이어 없는(unlayered) 스타일**. 일반 선언에선 **모든 레이어보다 우선**한다(Q2의 "unlayered가 최상" 규칙). 우리 `globals.css`에서 `@layer` 밖에 그냥 쓴 규칙들 — `html { scroll-behavior }`, `body { … }`, `section[id] { scroll-margin-top }` — 이 전부 여기 속한다.

> 참고: 이 목록보다 더 아래(더 약함)에 브라우저 내장 CSS인 **`user agent stylesheet`**도 보이는데, 그건 `@layer`가 아니라 **별도 origin**이다. CSS 원천 순서 `user-agent(브라우저 내장) < user < author(내 CSS)`에서 이미 최하위이고, `@layer`는 author 안에서만 층을 나눈다. 즉 "브라우저 내장 CSS"를 찾는다면 cascade layer 트리가 아니라 이 `user agent stylesheet` 항목이다.

#### (B) 참고 — 이름만 같은 딴 기능: 독립 "Layers" 패널의 합성 레이어 tree (**이번에 본 건 아님**)

혼동 방지를 위해 남겨둔다. 이건 CSS `@layer`와 **아무 상관 없다.**
- **무엇인가**: 브라우저 렌더 엔진(Blink)은 페이지를 한 판에 안 그리고, 여러 **합성 레이어(compositing layer)**로 쪼개 각각 그린 뒤 GPU에서 합쳐(composite) 최종 화면을 만든다. 독립 **Layers 패널**은 이 합성 레이어 트리를 보여주는 **렌더링/성능 디버깅 도구**다.
- **여기서의 0번(root) 레이어**: 문서 루트 합성 레이어 — "브라우저 내장 CSS"가 아니라 렌더 엔진이 만든 **그리기 단위**. 클릭 시 뜨는 값(크기·페인트 횟수·합성 이유 등)은 CSS 속성이 아니라 **렌더링 메타데이터**다.
- **레이어 생성 계기**: 3D `transform`, `will-change`, `position: fixed`·`sticky`, `<video>`·`<canvas>`, opacity·transform 애니메이션 등.
- **우리 프로젝트 연결**: framer-motion 등장 애니메이션은 `opacity`·`transform(y)`을 움직이는데, 이 둘은 **합성 친화적** 속성이라 애니메이션 중 해당 요소가 자기 합성 레이어로 승격돼 이 패널에 뜰 수 있다. (transform/opacity 애니메이션이 layout·repaint 유발 애니메이션보다 부드러운 이유.)

#### Chrome 독자적인가

- **(A) cascade layers(`@layer`)** 와 `implicit outer layer` 개념은 **표준 CSS** — Chrome·Edge·Firefox·Safari 모두 지원. DevTools에서 보여주는 UI 모양만 브라우저마다 다르다.
- **(B) 합성 레이어 tree(Layers 패널)** 는 표준이 아니라 **Chromium 계열 DevTools 고유** 도구다(Edge 등 Chromium 기반엔 유사하게 있고, Firefox/Safari는 형태가 다르거나 없음).

### 요약

- Tailwind CSS = **"소스에서 쓴 클래스"(주문) × "@theme 토큰 + 내장 규칙"(재료)** 의 교집합만 생성.
- 전역 CSS를 미리 다 만들어두는 게 아니라 JIT로 필요한 것만 → 출력이 작다.
- 레이어 우선순위 순서(`theme → base → components → utilities`)는 패키지 진입점의 `@layer` 한 줄이 정하며, 진입점을 풀어 쓰면 바꿀 수 있다.
- CSS `@layer`는 표준 기능이고 **명시도보다 먼저** 우선순위를 가른다(나중 레이어 > 먼저 레이어, unlayered가 최상). `!important`는 순서가 뒤집힘.
- 크롬 DevTools의 "레이어"는 둘 — **Styles의 cascade layers(=`@layer`)** 와 **Layers 패널의 합성 레이어 tree(렌더링용, Chromium 고유)** 로 서로 무관.
- 이름 규칙의 상세는 Q3, `@theme` vs `inline` 차이는 Q6.

---

## Q3. Tailwind v4 유틸리티 클래스는 어떻게 생성되고, 이름은 어떻게 정해지나?

**핵심 원리: 변수명 하나가 "어떤 속성" + "무슨 이름"을 동시에 정한다**

`@theme`에 정의한 `--[네임스페이스]-[이름]: 값`을 Tailwind는 **두 조각으로 쪼개** 읽는다:

```
--color-accent : #6366f1
  ^^^^^ ^^^^^^
  │     └ 이름(suffix)     → 생성될 클래스명의 뒷부분이 됨
  └ 네임스페이스(prefix)    → 어떤 CSS 속성/유틸리티를 만들지 결정
```

**규칙 1 — 앞의 네임스페이스가 "속성군"을 정한다.**
`color`면 색 관련 유틸리티(`bg-`·`text-`·`border-`·`ring-`·`fill-` …), `spacing`이면 길이 관련(`p-`·`m-`·`gap-`·`w-` …), `radius`면 `rounded-`. 네임스페이스는 Tailwind가 이름의 뜻을 추론하는 게 아니라 **미리 정해진 키워드**다 — 그 전체 목록과 "이게 고정 규칙인지"는 Q4에서 다룬다.

**규칙 2 — 네임스페이스를 뗀 나머지(이름)가 클래스명 꼬리로 그대로 붙는다.**
`--color-accent`의 `accent`, `--spacing-card`의 `card`, `--radius-xl`의 `xl`이 클래스명 뒷부분이 된다. 우리가 시맨틱하게 지은 이름이 손대지 않고 그대로 쓰인다.

### 네임스페이스 → 생성되는 유틸리티 (규칙 1+2 조합)

`[속성군이 정한 접두사] + [이름]`으로 클래스가 만들어진다:

| `@theme` 변수 | 네임스페이스 → 접두사 | 이름 | 생성되는 클래스 |
|---|---|---|---|
| `--color-accent: #6366f1` | `color` → `bg-`·`text-`·`border-` … | `accent` | `bg-accent`, `text-accent`, `border-accent` … |
| `--spacing-card: 2rem` | `spacing` → `p-`·`m-`·`gap-`·`w-` … | `card` | `p-card`, `gap-card`, `w-card` … |
| `--text-hero: 7.5rem` | `text` → `text-` (font-size) | `hero` | `text-hero` |
| `--font-body: 'Geist'` | `font` → `font-` (font-family) | `body` | `font-body` |
| `--radius-xl: 0.75rem` | `radius` → `rounded-` | `xl` | `rounded-xl` |

(대표 예시만 추린 것 — 어떤 네임스페이스가 접두사를 여러 개 만드는지/하나만 만드는지의 전체 매핑은 Q4.)

정리하면, 이름을 어떻게 짓든 **접두 네임스페이스만 정확하면** 클래스명은 위 두 규칙으로 기계적으로 결정된다. 이 원리만 알면 `bg-bg`처럼 헷갈려 보이는 이름도 바로 풀린다(바로 아래).

> `--text-*`·`--font-*`은 `--text-hero--line-height` 같은 **companion 변수**도 함께 인식해 한 유틸리티에 여러 속성을 담는다. → 아래 "companion 변수" 절에서 자세히.

### 헷갈리는 케이스: `--color-bg` → 유틸리티는 `bg-bg`

우리 프로젝트의 `--color-bg: #0a0a0a`가 대표적인 혼동 지점이다. 이 토큰으로 "배경색" 유틸리티를 만들면 이름이 **`bg-bg`**가 된다.

```
--color-bg
   ^^^^^ ^^
   |     └ 색 이름(suffix) = "bg"
   └ 네임스페이스 = "color"

background-color 유틸리티(bg-)  +  색 이름(bg)  →  bg-bg
        ^^^                          ^^
   유틸리티 접두사               색 이름(우연히 같은 글자)
```

- **앞의 `bg-`** = "background-color를 세팅하는 유틸리티" (모든 `--color-*`가 공통으로 갖는 접두사)
- **뒤의 `bg`** = "`bg`라는 **이름**의 색" (우리가 `--color-bg`로 지은 시맨틱 이름)

두 `bg`는 철자만 같을 뿐 서로 무관하다. Tailwind는 `bg`가 "배경"이라는 뜻인지 **모른다** — 그냥 이름이 `bg`인 색으로 취급한다. 그래서 이 색으로는 배경뿐 아니라 다른 색 유틸리티도 전부 생성된다:

| 유틸리티 | 효과 |
|---|---|
| `bg-bg` | `background-color: var(--color-bg)` (의도한 용도) |
| `text-bg` | `color: var(--color-bg)` — 글자색을 `#0a0a0a`로 |
| `border-bg` | `border-color: var(--color-bg)` |
| `fill-bg` / `stroke-bg` | SVG fill/stroke |

`--color-accent`가 `bg-accent`/`text-accent`가 되는 것과 완전히 같은 규칙이다. 단지 색 이름이 하필 `bg`라서 `bg-bg`처럼 접두사와 겹쳐 보일 뿐이다. (`--color-surface` → `bg-surface`, `--color-primary` → `text-primary`처럼 이름이 겹치지 않으면 헷갈리지 않는다.)

### companion 변수 — 유틸리티 하나가 여러 속성을 세팅하는 법

**companion(동반) 변수 = 메인 토큰에 `--` 하나를 더 붙여 딸린 보조 변수.** Tailwind는 이걸 별도 유틸리티로 만들지 않고, **메인과 같은 유틸리티 안에 추가 선언으로 접어 넣는다.**

문법은 대시 개수로 구분된다:
```
--text-hero              ← 메인 토큰   (대시 1묶음: 네임스페이스-이름)
--text-hero--line-height ← companion  (대시 2개 --로 이어 붙인 하위 속성)
     ^^^^      ^^^^^^^^^^
     메인 이름   딸릴 속성
```

**왜 있나.** `font-size`는 실무에서 거의 항상 `line-height`와 짝으로 움직인다. 그래서 `--text-*` 네임스페이스는 크기 하나만 받지 말고, 관련 속성을 같은 이름 아래 묶을 수 있게 companion을 지원한다. 덕분에 `text-hero` **한 클래스**로 크기·행간을 한 번에 맞춘다.

**예시 1 — companion 있음 vs 없음 (우리 프로젝트)**
```css
/* 있음 — globals.css */
@theme {
  --text-hero: 7.5rem;
  --text-hero--line-height: 1;
}
```
생성 결과:
```css
.text-hero { font-size: 7.5rem; line-height: 1; }   /* 두 속성 */
```
companion을 빼면:
```css
@theme { --text-hero: 7.5rem; }        /* line-height 없음 */
/* 생성 결과 */
.text-hero { font-size: 7.5rem; }      /* font-size만! 행간은 브라우저/상속값 그대로 */
```
→ 그래서 우리 `globals.css`는 `--text-*`마다 `--…--line-height`를 항상 짝지어 뒀다.

**예시 2 — `--text-*`가 받는 companion들**

`--text-*`는 line-height 외에 letter-spacing·font-weight도 companion으로 인식한다:
```css
@theme {
  --text-hero: 7.5rem;
  --text-hero--line-height: 1;
  --text-hero--letter-spacing: -0.02em;
  --text-hero--font-weight: 700;
}
```
생성 결과 — 넷을 `text-hero` 하나에 전부 담는다:
```css
.text-hero {
  font-size: 7.5rem;
  line-height: 1;
  letter-spacing: -0.02em;
  font-weight: 700;
}
```

**예시 3 — companion을 받는 또 다른 네임스페이스: `--font-*` (font-family)**

`--text-*`만 companion을 쓰는 게 아니다. **`--font-*`(글꼴)도 companion 2종**을 인식한다 — `--font-feature-settings`, `--font-variation-settings`:
```css
@theme {
  --font-display: 'Oswald', sans-serif;
  --font-display--font-feature-settings: 'cv02', 'cv03';
  --font-display--font-variation-settings: 'opsz' 32;
}
```
생성 결과 — `font-display` 하나에 글꼴 + 피처/베리에이션 세팅까지:
```css
.font-display {
  font-family: 'Oswald', sans-serif;
  font-feature-settings: 'cv02', 'cv03';
  font-variation-settings: 'opsz' 32;
}
```

**companion을 받는 네임스페이스 정리**

| 네임스페이스 | 메인 속성 | 인식하는 companion |
|---|---|---|
| `--text-*` | `font-size` | `--line-height`, `--letter-spacing`, `--font-weight` |
| `--font-*` | `font-family` | `--font-feature-settings`, `--font-variation-settings` |

**주의 — 이 둘 말고는 companion이 없다.** companion은 "그 유틸리티가 자연스럽게 함께 세팅할 속성"이 정의된 네임스페이스에서만 동작하고, 실질적으로 위 **타이포그래피 계열 두 개**(글자 크기↔행간, 글꼴↔피처세팅)뿐이다. `--color-*`·`--spacing-*`·`--radius-*`·`--shadow-*` 등은 "하나의 값 → 하나의 속성"이라 딸림 속성 개념이 없어서, `--color-accent--foo` 같은 걸 붙여도 무시된다. (companion으로 **임의** 속성을 묶고 싶은 거라면 그건 네임스페이스가 아니라 `@utility`의 영역 → Q5.)

> 정리: **companion은 "네임스페이스가 정한 메인 속성 + 미리 약속된 딸림 속성"을 한 유틸리티로 묶는 기능**이고, 내가 원하는 임의 속성 조합을 묶는 건 아니다. 후자는 `@utility`(Q5)다.

### 네임스페이스마다 만드는 유틸리티 개수가 다르다

같은 이름이라도 네임스페이스에 따라 생성 개수가 다르다 — `--spacing-card` 하나는 `p-card`·`m-card`·`gap-card`·`w-card`·`inset-card` … 수십 개를 만들지만, `--font-body`는 `font-body` 하나만 만든다. **왜 어떤 건 다수이고 어떤 건 1개인지의 규칙은 Q4에서 다룬다** (여기 Q3은 "이름이 어떻게 조립되나"까지가 범위).

### `@theme`과의 연결: 두 가지를 동시에 생성

```css
@theme {
  --color-accent: #6366f1;
}
```

Tailwind가 이걸 보면:

```css
/* ① :root에 CSS 변수 주입 */
:root {
  --color-accent: #6366f1;
}

/* ② 유틸리티 클래스 생성 (color 네임스페이스 → 색상 관련 모든 속성) */
.text-accent   { color: var(--color-accent); }
.bg-accent     { background-color: var(--color-accent); }
.border-accent { border-color: var(--color-accent); }
/* ... */
```

유틸리티 클래스는 하드코딩된 값이 아니라 `var(--color-accent)`를 참조한다.  
덕분에 `:root`의 변수 하나만 바꾸면 `text-accent`, `bg-accent` 등 모든 곳이 동시에 변경된다.

### `@theme inline`과의 차이

`@theme inline`은 ①(`:root` CSS 변수)을 만들지 않고 ②(유틸리티 클래스)만 만든다.  
유틸리티 클래스의 값이 변수 참조 대신 원래 값을 인라인으로 직접 쓴다:

```css
/* @theme inline { --font-korean: var(--font-noto-sans-kr); } 결과 */
.font-korean { font-family: var(--font-noto-sans-kr); }  /* :root 변수 없음 */
```

> `@theme` vs `@theme inline`의 **왜(변수 해석 스코프)·언제 무엇을 쓰나**는 Q6에서 자세히 다룬다.

---

## Q4. 네임스페이스 → 속성 매핑은 고정된 규칙인가? (font-korean이 font-family만 만드는 이유)

> Q3은 "네임스페이스가 클래스명을 정한다"까지 봤다. 이 항목은 그 뒤 질문 — **"그럼 어떤 네임스페이스가 어떤 CSS 속성을 만드는지는 누가 정하나"** 에 답한다.

### 결론: Tailwind 엔진에 **하드코딩된 고정 목록**이다

네임스페이스는 Tailwind가 이름의 뜻을 해석해서 즉석에서 정하는 게 아니다. **엔진이 미리 알고 있는 정해진 키워드 집합**이고, 각 키워드가 만들 유틸리티·속성이 코드에 박혀 있다. `--font-*`는 "폰트니까 font-family겠지"라고 추론하는 게 아니라, **`font` 네임스페이스 = `font-family` 유틸리티**라고 규칙표에 등록돼 있는 것이다.

### 공식 네임스페이스 매핑 (주요 항목)

> 전체 목록·정의는 공식 문서: [Tailwind CSS — Theme variable namespaces](https://tailwindcss.com/docs/theme#theme-variable-namespaces)
> (아래 표는 그중 우리가 쓰는 주요 항목만 추린 것)
> 기준 버전: Tailwind CSS **v4.3.1** (이 프로젝트 설치 버전, 2026-07-03 확인). 네임스페이스 목록은 버전에 따라 추가/변경될 수 있으니 최신은 위 문서 확인.

| `@theme` 네임스페이스 | 생성되는 유틸리티 / CSS 속성 | 대응 속성 개수 |
|---|---|---|
| `--color-*` | `bg-*` `text-*` `border-*` `ring-*` `fill-*` `stroke-*` `outline-*` `decoration-*` … | **다수** |
| `--font-*` | `font-*` → **font-family** | 1 |
| `--text-*` | `text-*` → **font-size** (+ companion으로 line-height 등) | 1(+companion) |
| `--font-weight-*` | `font-*` → font-weight | 1 |
| `--tracking-*` | `tracking-*` → letter-spacing | 1 |
| `--leading-*` | `leading-*` → line-height | 1 |
| `--spacing-*` | `p-*` `m-*` `gap-*` `w-*` `h-*` `inset-*` `translate-*` `size-*` … | **다수** |
| `--radius-*` | `rounded-*` → border-radius | 1 |
| `--shadow-*` | `shadow-*` → box-shadow | 1 |
| `--breakpoint-*` | `sm:` `md:` … 반응형 변형(variant) | (변형 생성) |
| `--container-*` | `max-w-*` + `@container` 쿼리 | 다수 |
| `--ease-*` | `ease-*` → transition-timing-function | 1 |
| `--animate-*` | `animate-*` → animation | 1 |

> 그래서 **`font-korean`은 `font-family` 하나만** 만든다 — `--font-*` 네임스페이스가 규칙표에서 `font-family` 유틸리티에만 매핑돼 있기 때문이다.

### 왜 어떤 건 1개, 어떤 건 여러 개를 만드나

네임스페이스가 나타내는 **값의 종류**가 CSS에서 몇 개 속성에 쓰이느냐로 갈린다:

- `--color-*` → "색"은 CSS에서 글자색·배경·테두리·링·SVG fill 등 **여러 속성**이 받는다 → 유틸리티도 여러 개
- `--spacing-*` → "길이"는 padding·margin·gap·width·height·inset 등 **여러 속성**이 받는다 → 여러 개
- `--font-*` → "폰트 패밀리" 값은 오직 `font-family` **한 속성**만 의미가 있다 → `font-*` 하나
- `--radius-*` → `border-radius` 하나만

즉 매핑 규칙 자체가 "이 종류의 값이 CSS에서 실제로 쓰이는 속성들"을 그대로 반영한다.

### 중요한 한계 — 아무 네임스페이스나 되는 게 아니다

이 목록에 **없는** 네임스페이스를 만들면 유틸리티가 안 생긴다. `:root` CSS 변수로만 남는다:
```css
@theme {
  --wobble-1: 10px;   /* wobble은 알려진 네임스페이스가 아님 */
}
/* → :root { --wobble-1: 10px } 은 나오지만
     wobble-1 이라는 유틸리티 클래스는 생성되지 않는다 */
```
내가 원하는 임의 속성의 유틸리티를 새로 만들려면 네임스페이스가 아니라 별도 지시자 **`@utility`**(v4)를 써야 한다. (→ Q5)

### 우리 프로젝트와 연결

`globals.css`의 토큰들이 정확히 이 규칙을 따른다:
- `--color-accent` → `text-accent`/`bg-accent`/`border-accent` (다수)
- `--spacing-card` → `p-card`/`gap-card`/`w-card` (다수)
- `--font-korean` → `font-korean` (1개, font-family)
- `--radius-xl` → `rounded-xl` (1개)
- `--text-hero` → `text-hero` (font-size, `--text-hero--line-height` companion 동반 — Q3 참고)

이름을 우리가 시맨틱하게 지어도(`accent`, `card`, `korean`) **접두 네임스페이스(`color`/`spacing`/`font`)만 정확하면** Tailwind가 올바른 속성 그룹을 만들어주는 이유가 이 고정 매핑이다.

---

## Q5. 고정 네임스페이스 밖의 커스텀 유틸리티 — `@utility`와 `@apply`

> Q4에서 "네임스페이스는 고정 목록이라 그 밖의 임의 속성 유틸리티는 못 만든다"고 했다.
> 그 한계를 넘는 v4 도구가 **`@utility`**(새 유틸리티 정의)와 **`@apply`**(기존 유틸리티를 시맨틱 클래스로 묶기)다.
> 특히 "`.box--main-primary { border-color; background-color; color }`처럼 여러 속성을 변수 값으로 묶은 클래스를 형식만 정해 자동 생성"하는 패턴이 여기에 해당한다.

### 1. `@utility` 기본형 — 단일/복수 속성 정적 유틸리티

```css
@utility content-auto {
  content-visibility: auto;
}
```
→ `.content-auto` 생성. 일반 유틸리티처럼 **변형(variant)도 자동 지원**: `hover:content-auto`, `md:content-auto`.

**여러 속성 묶기** (질문에서 본 패턴) — 선언을 여러 줄 넣으면 된다:
```css
@utility card-panel {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-card);
  color: var(--color-primary);
}
```
→ `.card-panel` 하나로 배경 + 테두리 + radius + padding + 글자색을 한 번에. 값은 전부 `@theme` 토큰(`var(--...)`)이라 하드코딩이 아니고, 토큰만 바꾸면 이 유틸리티를 쓴 모든 곳이 함께 바뀐다.

중첩·의사요소도 가능:
```css
@utility scrollbar-hidden {
  &::-webkit-scrollbar { display: none; }
}
```

### 2. `@utility name-*` 함수형 — "형식만 정하면 family 자동 생성"

질문의 직감이 정확하다. 이름에 `*`를 두고 `--value()`를 쓰면 **값만 다른 유틸리티 여러 개가 자동 생성**된다. 하나하나 손으로 안 쓴다.

**(a) theme 토큰에서 자동 생성**
```css
@theme {
  --tab-size-2: 2;
  --tab-size-4: 4;
  --tab-size-github: 8;
}
@utility tab-* {
  tab-size: --value(--tab-size-*);
}
```
→ `tab-2`, `tab-4`, `tab-github` 자동 생성. `--tab-size-*`에 토큰을 추가하면 유틸리티가 저절로 늘어난다.

**(b) 질문의 `.box--main-primary` 패턴 재현** — 같은 토큰 값을 여러 속성에 묶기
```css
@theme {
  --box-main:   #6366f1;
  --box-danger: #ef4444;
  --box-muted:  #6b7280;
}
@utility box-* {
  border-color:     --value(--box-*);
  background-color:  --value(--box-*);
  color:            #fff;
}
```
→ `box-main`, `box-danger`, `box-muted` 자동 생성. 각 클래스는 매칭된 토큰 값 하나로 `border-color`와 `background-color`를 동시에 채운다. **형식(위 블록)만 한 번 정의**하고, 실제 클래스는 `--box-*` 토큰 개수만큼 자동으로 만들어진다. 새 색을 `@theme`에 추가하면 유틸리티도 자동 증가.

**(c) bare value(맨 숫자)도 허용**
```css
@utility tab-* {
  tab-size: --value(integer);
}
```
→ `tab-1`, `tab-13`, `tab-76` … 토큰에 없어도 임의 정수 허용.

**(d) arbitrary value(대괄호)도**
```css
@utility tab-* {
  tab-size: --value([integer]);
}
```
→ `tab-[123]`.

**(e) 셋 다 한꺼번에** (토큰 + bare + arbitrary)
```css
@utility tab-* {
  tab-size: --value(--tab-size-*, integer, [integer]);
}
```

**(f) modifier(`/`)까지** — `--modifier()`
```css
@utility text-* {
  font-size:   --value(--text-*);
  line-height: --modifier(--leading-*);
}
```
→ `text-hero/tight`처럼 `/뒤` 값을 별도 속성으로.

### 3. `@apply` — 기존 유틸리티를 시맨틱 클래스로 묶기

`@utility`가 "새 유틸리티를 정의"라면, `@apply`는 "**이미 있는 유틸리티들을 하나의 일반 클래스 안에 인라인**"한다. 질문에서 본 `.box--main-primary { ... }` 같은 컴포넌트성 시맨틱 클래스에 가장 가깝다.

```css
.btn-primary {
  @apply bg-accent text-primary rounded-md px-card py-3;
}
```
→ `.btn-primary`가 저 유틸리티들의 속성을 그대로 갖는다. 마크업에선 `class="btn-primary"`만 쓰면 된다.

### `@utility` vs `@apply` 비교

| | `@utility` | `@apply` |
|---|---|---|
| 무엇 | **새 유틸리티(클래스)** 정의 | 기존 유틸리티를 **일반 커스텀 클래스**에 인라인 |
| 변형(`hover:`/`md:`) | 정의한 유틸리티에 자동 적용됨 | 커스텀 클래스 자체엔 자동으로 안 붙음(일반 CSS 클래스라서) |
| 함수형(`*` 자동 생성) | 가능 (`--value()`) | 불가 |
| 적합한 때 | 재사용 유틸리티, family 자동 생성 | 컴포넌트성 묶음, 마크업 반복 제거 |

### 그럼 다른 사이트의 `.box--main-primary`는 뭘로 만든 걸까

가능성은 둘이고, Tailwind로 각각 재현할 수 있다:

1. **손으로 쓴 CSS + CSS 변수** — `.box--main-primary { border-color: var(--c-primary); ... }`를 직접 작성. 값만 변수라 "형식 자동 생성"까지는 아니다(클래스는 하드코딩, 값만 토큰). → Tailwind에선 **`@apply`**로 재현.
2. **전처리기/빌드로 자동 생성** — Sass `@each`로 색 map을 돌려 `.box--{name}`을 여러 개 찍어냄. 이게 "형식→자동" 방식. → Tailwind에선 **`@utility box-*` + `--value(--box-*)`**로 재현.

### 우리 프로젝트에선?

지금은 커스텀 유틸리티가 필요 없다. 카드·버튼 스타일은 **React 컴포넌트(JSX)** 안에서 유틸리티를 나열하는 것으로 충분하다 — 컴포넌트 자체가 이미 재사용 단위이기 때문이다. 같은 유틸리티 조합이 여러 컴포넌트에 반복돼 관리가 번거로워지면 그때 `@apply`(묶기)나 `@utility`(유틸리티화)를 검토하면 된다. Tailwind 철학도 "먼저 유틸리티 조합, 진짜 반복될 때만 추출"이다.

### 헷갈림 방지 — `text-section`처럼 "정의도 사용처도 안 보이는" 유틸리티는 `@utility`/`@apply`가 아니다

프로젝트에서 `text-section`(Projects·Skills 제목), `text-hero`, `text-display`, `text-subtitle` 같은 클래스를 보고 "`@utility`나 `@apply`로 만든 커스텀 유틸리티 같은데 globals.css에 정의도 없고 `@apply`로 쓴 흔적도 없다"고 느끼기 쉽다. **셋 다 아니다.** 이건 Q3·Q4에서 다룬 **`@theme` 네임스페이스 자동 생성**의 결과다.

> **선행 개념은 companion(Q3).** 이 오해의 뿌리는 "`text-section` 하나가 `font-size`+`line-height` **두 속성**을 세팅한다 → 그럼 누가 묶었지? → `@utility`/`@apply`인가?"라는 추론이다. 하지만 그 "두 속성 묶음"은 커스텀이 아니라 **`--text-*` 네임스페이스의 companion 규칙**(Q3의 "companion 변수" 절)이 만든 것이다. 그러니 이 항목보다 **Q3의 companion 개념을 먼저 이해하면** 아래가 전부 자명해진다 — 커스텀 유틸리티(`@utility`/`@apply`)를 의심할 필요 자체가 없어진다.

- **정의는 있다 — 형태가 다를 뿐.** `.text-section { … }` 같은 *클래스*를 쓴 게 아니라, `globals.css`의 `@theme`에 **변수**로 정의돼 있다:
  ```css
  @theme {
    --text-section: 3rem;              /* text 네임스페이스 → text-* 유틸리티 생성 */
    --text-section--line-height: 1;    /* companion → 같은 유틸리티에 line-height도 */
  }
  ```
  `--text-section`이 있으면 Tailwind가 빌드 때 `.text-section { font-size: 3rem; line-height: 1 }`를 **자동으로 찍어낸다.** 그래서 `.text-section {}`이라고 손으로 쓴 코드가 globals.css에 안 보이는 게 정상이다 — 애초에 안 쓴다.
- **왜 `@utility`/`@apply`처럼 "여러 속성 한 클래스"로 보였나 (← 이게 핵심).** `text-section` 하나가 `font-size` + `line-height` 두 속성을 세팅하니 묶음 유틸리티처럼 보인다. 하지만 이 묶음은 **companion**이 만든 것이다 — `--text-section`(메인) 옆에 `--text-section--line-height`(companion)를 두면 Tailwind가 둘을 **같은 `text-section` 유틸리티 안에** 접어 넣는다(Q3 "companion 변수" 절). `@utility`로 직접 여러 줄을 묶은 것과 **결과 CSS는 비슷해 보여도 출처가 다르다**: companion은 네임스페이스가 미리 약속한 딸림 속성(line-height·letter-spacing·font-weight)만 붙는 반면, `@utility`는 내가 고른 아무 속성이나 묶는다. `text-section`은 전자다.
- **사용처는 있다.** `src/components/sections/Projects.tsx`·`Skills.tsx`의 `<h2 className="… text-section …">`, Hero의 `text-hero`/`text-subtitle`, CTA의 `text-display`. JSX className으로 쓰이므로 CSS 파일 안에서 grep하면 안 잡힐 뿐이다.

**판별법**: 클래스 이름의 접두어가 `text-`/`bg-`/`border-`/`font-`/`gap-`/`rounded-` 등 **알려진 네임스페이스**면 → `@theme` 변수(`--text-*` 등)에서 자동 생성된 것. 그 목록에 없는 접두어(예: `box-…`, `card-…`)인데 유틸리티로 동작한다면 → 그때가 진짜 `@utility`/`@apply`로 만든 커스텀이다.

---

## Q6. Tailwind v4의 `@theme`과 `@theme inline`은 어떻게 다른가?

**핵심 차이: CSS 변수를 만드느냐 안 만드느냐**

### `@theme` (일반)
```css
@theme {
  --color-accent: #6366f1;
}
```
Tailwind가 **두 가지**를 동시에 생성:
```css
/* 1. :root에 CSS 변수 */
:root { --color-accent: #6366f1; }

/* 2. 유틸리티 클래스 */
.text-accent  { color: var(--color-accent); }
.bg-accent    { background-color: var(--color-accent); }
```

### `@theme inline`
```css
@theme inline {
  --font-korean: var(--font-noto-sans-kr);
}
```
CSS 변수 생성 없이 **유틸리티 클래스만** 생성:
```css
/* :root 변수 없음 */
.font-korean { font-family: var(--font-noto-sans-kr); }
/* → 런타임에 html 요소에서 --font-noto-sans-kr 값을 찾아옴 */
```

### 왜 `inline`이 필요한가 — 변수 해석 스코프 문제
(CSS 변수는 선언 순서와 무관하게 런타임에 해석되므로, "변수가 아직 없다"거나 "순환 참조"의 문제는 아니다. 진짜 이유는 **어느 요소에서 값이 해석되느냐**다.)

`@theme`(non-inline)으로 정의하면 이렇게 된다:
```css
:root { --font-korean: var(--font-noto-sans-kr); }   /* ① :root에 등록 */
.font-korean { font-family: var(--font-korean); }    /* ② 유틸리티는 --font-korean 참조 */
```
`--font-korean`의 값 `var(--font-noto-sans-kr)`은 **`:root` 레벨에서 해석**된다. 그런데 next/font는 `--font-noto-sans-kr`를 `<html className={...}>`처럼 특정 요소에 주입한다. 그 변수가 `:root`(=`<html>`)에 있지 않으면 `--font-korean`은 해석에 실패한다.

`@theme inline`은 `:root` 변수 단계(①)를 건너뛰고 유틸리티가 외부 변수를 직접 참조한다:
```css
.font-korean { font-family: var(--font-noto-sans-kr); }
```
이러면 값이 **유틸리티가 실제로 적용된 요소**에서 해석되므로, 그 요소가 `--font-noto-sans-kr`를 상속받기만 하면 정상 작동한다.

### 언제 무엇을 쓰나

| | `@theme` | `@theme inline` |
|---|---|---|
| `:root` CSS 변수 생성 | O | X |
| 유틸리티 클래스 생성 | O | O |
| 적합한 값 | 정적 값 (`#fff`, `1rem`) | 외부 주입 변수 (`var(--xxx)`) |
| 대표 예시 | 색상, spacing, radius | next/font 변수 |

---

## Q7. globals.css에서 폰트 관련 변경을 왜 했나?

**배경:**  
Hero 섹션에서 `font-korean` 유틸리티를 사용하기 위해 Noto Sans KR을 추가할 때, 기존 `@theme` 방식으로는 폰트가 제대로 로드되지 않는 문제가 있었다.

**변경 내용:**

| | 변경 전 | 변경 후 |
|---|---|---|
| globals.css | `@theme { --font-korean: 'Noto Sans KR' }` | `@theme inline { --font-korean: var(--font-noto-sans-kr) }` |
| layout.tsx | Noto Sans KR 로드 없음 | `next/font/google`으로 로드, `variable: "--font-noto-sans-kr"` |

**이유:**  
`@theme`에 `'Noto Sans KR'`을 적으면 `:root`에 CSS 변수가 만들어지고 유틸리티 클래스가 생성된다. 하지만 실제 폰트 파일을 로드하는 코드가 없으면 브라우저는 시스템 폰트에서 `'Noto Sans KR'`을 찾다가 없으면 `sans-serif`로 폴백한다 — 에러 없이 조용히.

`next/font/google`으로 로드하면 빌드 타임에 폰트 파일을 서버에 다운로드하고, `html` 요소에 `style="--font-noto-sans-kr: '__NotoSansKR_abc123'"` 형태로 실제 폰트 참조를 주입한다. `@theme inline`으로 이 변수를 참조해야 실제 로드된 폰트가 적용된다. (해석 스코프의 상세는 Q6.)

---

## Q8. 원래 globals.css에 버그가 있었나?

**결론: 버그라기보다 "미완성 상태"였다.**

기존 코드:
```css
@theme {
  --font-korean: 'Noto Sans KR', sans-serif;
}
```

이 코드는 에러를 내지 않는다. `font-korean` 유틸리티 클래스는 생성된다. 다만 실제 폰트 파일을 로드하는 코드(`next/font` or `@import`)가 아무데도 없었다. 브라우저는 시스템에 Noto Sans KR이 설치돼 있는지 찾다가, 없으면 `sans-serif`로 폴백 — 에러 없이, 조용히.

**버그로 보기 어려운 이유:**  
당시 `font-korean`을 실제로 사용하는 컴포넌트가 없었다. Hero 섹션을 만들면서 처음 사용하게 됐으므로, 그 전까지는 "아직 연결 안 된 토큰" 상태였다. Hero 컴포넌트를 만드는 시점에 같이 완성한 것이다.

| | 변경 전 | 변경 후 |
|---|---|---|
| 토큰 정의 | O | O |
| 폰트 실제 로드 | X (선언만 있음) | O (`next/font`) |
| `font-korean` 사용 시 | sans-serif 폴백 | Noto Sans KR 실제 렌더링 |

---

## Q9. react-icons 아이콘 색을 부모에서 `text-*`로 주고 `currentColor`로 상속시키는 원리는?

**핵심: SVG의 `fill="currentColor"`**

react-icons가 렌더링하는 SVG는 내부적으로 이렇게 생겼다:
```svg
<svg fill="currentColor" ...>
  <path d="..." />
</svg>
```

`currentColor`는 CSS 키워드로, **"지금 이 요소에 적용된 `color` 값을 쓰겠다"** 는 뜻이다. SVG의 `fill`이 `currentColor`면, CSS의 `color` 속성 값이 채워진다.

**CSS `color`는 자식으로 자동 상속된다:**
```tsx
<li className="text-primary">        {/* color: #ffffff 설정 */}
  <Icon className="size-4" />        {/* color 없음 → #ffffff 상속 → fill도 #ffffff */}
  <span>{name}</span>                {/* color 없음 → #ffffff 상속 */}
</li>
```

**왜 부모에서 주는 게 좋은가:**

| 방식 | 문제 |
|---|---|
| `<Icon color="#ffffff" />` | 하드코딩, 토큰 밖의 값 |
| `<Icon className="text-primary" />` | 아이콘마다 개별 지정 필요 |
| 부모에 `text-primary`, 아이콘은 무지정 | 한 곳만 바꾸면 아이콘 + 텍스트 동시 변경 ✅ |

토큰(`text-primary`, `text-secondary` 등)만 바꾸면 아이콘과 텍스트 색이 함께 바뀌므로 디자인 시스템과의 일관성이 유지된다.

---

## Q10. react-icons 컴포넌트 내부가 SVG인 건 어떻게 확인했나?

**3단계로 실제 소스와 렌더링 결과를 직접 확인했다.**

### 1단계: 컴포넌트 소스 코드 확인

```js
// node_modules/react-icons/si/index.js 에서 SiReact 정의
function SiReact(props) {
  return GenIcon({
    "tag": "svg",
    "attr": { "role": "img", "viewBox": "0 0 24 24" },
    "child": [{ "tag": "path", "attr": { "d": "M14.23 12.004..." } }]
  });
}
```

아이콘 데이터가 `tag: "svg"`를 루트로 하는 JSON 트리다.

### 2단계: GenIcon / IconBase 구현 확인

```js
// node_modules/react-icons/lib/index.js
function GenIcon(data) {
  return props => React.createElement(IconBase, { attr: data.attr, ...props },
    Tree2Element(data.child)
  );
}

function IconBase(props) {
  // computedSize, className 처리 후...
  return React.createElement("svg", {
    stroke: "currentColor",
    fill: "currentColor",   // ← 여기서 기본값으로 주입
    strokeWidth: "0",
    ...data.attr,
    ...svgProps
  }, children);
}
```

`fill="currentColor"`는 아이콘 데이터에 없어도 **`IconBase`가 기본값으로 주입**한다.

### 3단계: 실제 렌더링 결과 확인

```js
// renderToStaticMarkup으로 실제 HTML 출력
const html = renderToStaticMarkup(React.createElement(SiReact));
```

결과:
```html
<svg
  stroke="currentColor"
  fill="currentColor"
  stroke-width="0"
  role="img"
  viewBox="0 0 24 24"
  height="1em"
  width="1em"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M14.23 12.004..."/>
</svg>
```

**`fill="currentColor"`와 `stroke="currentColor"` 모두 `IconBase` 기본값으로 붙는다.**  
기본 크기는 `1em` — 부모 font-size를 따라간다 (우리가 `size-4` className으로 override함).

### 결론

| 확인 방법 | 내용 |
|---|---|
| 소스 코드 (`node -e "...toString()"`) | 아이콘이 JSON 트리 → SVG React 엘리먼트로 변환됨을 확인 |
| `GenIcon` / `IconBase` 구현 | `fill="currentColor"` 기본값이 `IconBase`에서 주입됨을 확인 |
| `renderToStaticMarkup` | 실제 렌더링된 HTML이 `<svg fill="currentColor" ...>`임을 확인 |

---

## Q11. framer-motion을 어떻게 적용할까 — 섹션에 직접 vs 재사용 래퍼

### 대전제: framer-motion은 클라이언트 전용

`motion` 컴포넌트는 내부적으로 상태·이펙트·컨텍스트(`useState`, `useEffect` 등)를 쓴다. 따라서 framer-motion을 쓰는 코드에는 **어느 방식이든 `"use client"`가 최소 한 곳은 반드시** 들어간다. 두 방식의 차이는 "use client를 쓰냐 마냐"가 아니라 **그 경계를 어디에 긋느냐**다. (import: `framer-motion@12` 기준 `import { motion } from "framer-motion"`)

---

### 방식 A: 섹션에 직접 `"use client"`

Hero, Projects 같은 섹션 파일 맨 위에 `"use client"`를 붙이고 그 안에서 바로 `motion.div`를 쓴다.

```tsx
"use client"
import { motion } from "framer-motion"

export default function Projects() {
  return (
    <motion.section id="projects"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* ... */}
    </motion.section>
  )
}
```

**장점** — 단순하다. 새 파일이 필요 없고, "이 섹션이 어떻게 움직이는지"가 한 파일에 다 모여 있다. 섹션마다 애니메이션이 제각각이라 공통 패턴이 없을 때 잘 맞는다.

**단점**
1. **섹션 전체가 클라이언트 컴포넌트가 된다.** 텍스트·아이콘처럼 서버에서 렌더링해도 될 정적 부분까지 전부 클라이언트 번들로 넘어간다. 포트폴리오 규모에선 성능 체감차는 거의 없지만, App Router의 "가능한 한 서버 컴포넌트로" 원칙과 어긋난다.
2. **중복.** "스크롤 시 아래→위 페이드인" 같은 동일 애니메이션을 Projects·Skills·CTA에 각각 다시 쓰게 된다. duration이나 easing을 바꾸려면 여러 곳을 고쳐야 한다.

---

### 방식 B: 재사용 래퍼

애니메이션 로직만 담은 얇은 클라이언트 컴포넌트(`src/components/motion/FadeIn.tsx`)를 만들고, 섹션에서는 감싸기만 한다.

```tsx
// FadeIn.tsx
"use client"
import { motion } from "framer-motion"

export default function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```
```tsx
// Projects.tsx — "use client" 없음, 서버 컴포넌트 유지
import FadeIn from "@/components/motion/FadeIn"

export default function Projects() {
  return <FadeIn><section id="projects">{/* ... */}</section></FadeIn>
}
```

**왜 섹션이 서버 컴포넌트로 남는가 (원문에서 빠졌던 핵심 원리)**
RSC(React Server Components)에는 두 가지 규칙이 있다:
1. **서버 컴포넌트가 클라이언트 컴포넌트를 import해서 써도, 서버 컴포넌트는 그대로 서버 컴포넌트다.** `"use client"`는 그 파일과 거기서 import되는 하위로만 전파된다. Projects가 FadeIn(클라이언트)을 쓴다고 Projects까지 클라이언트가 되지는 않는다.
2. **클라이언트 컴포넌트에 `children`으로 넘긴 콘텐츠는 서버에서 렌더링된 채 전달된다.** 즉 `<FadeIn>{정적 콘텐츠}</FadeIn>`에서 FadeIn만 클라이언트고, 그 안의 텍스트·아이콘은 서버 렌더링을 유지한다.

이 두 규칙 덕분에 "`"use client"`는 래퍼 하나에만, 정적 콘텐츠는 서버에" 가 성립한다.

**장점**
1. **섹션이 서버 컴포넌트로 유지된다** (위 원리).
2. **한 곳만 고치면 전체 반영.** 등장 패턴이 대부분 섹션에 반복되므로, 래퍼의 duration·easing·이동 거리를 바꾸면 사이트 전체가 일관되게 바뀐다.
3. 섹션 코드가 애니메이션 로직으로 지저분해지지 않는다.

**단점**
1. 파일이 한두 개 는다.
2. `stagger`(부모-자식 순차 등장)는 래퍼만으로 안 되고 약간의 설계가 더 필요하다. → `staggerContainer`(부모: `staggerChildren` transition) + `staggerItem`(자식: variants) 형태로 확장하면 해결된다.

---

### 접근성 — 두 방식 공통 (보충)

우리는 이미 `globals.css`에 `prefers-reduced-motion` 가드(부드러운 스크롤 비활성화)를 넣었다. framer-motion에도 대응 훅 `useReducedMotion()`이 있어, 모션 최소화 선호 시 애니메이션을 끄거나 약하게 만들 수 있다. **재사용 래퍼(B)라면 이 처리를 래퍼 한 곳에만 넣으면 전 섹션에 적용**되므로 방식 B의 이점이 접근성까지 확장된다.

---

### 정리 및 결론

| 판단 기준 | 유리한 방식 |
|---|---|
| 같은 애니메이션이 여러 섹션에 반복됨 | **B (재사용 래퍼)** |
| 섹션마다 완전히 다른 특수 효과 | A (직접) |
| 서버 컴포넌트 유지 / 번들 최소화 | B |
| 초기 작업량 최소 (파일 안 늘림) | A |

핵심 기준은 **"같은 애니메이션이 여러 섹션에 반복되는가"**다. 이 프로젝트의 계획(스크롤 시 각 섹션 페이드·업 등장)은 전형적인 반복 패턴이라 방식 B가 유리하다. 래퍼 하나 만드는 초기 비용을 빼면 이후 작업이 훨씬 빠르다 — 새 섹션은 `<FadeIn>`으로 감싸기만 하면 된다.

**결론(내 판단도 원문과 동일):** 공통 등장은 재사용 래퍼(B)를 기본으로 깔고, Hero 텍스트 순차 등장(stagger)처럼 한 번만 쓰이는 특수 효과는 직접(A) 넣는 **혼합**이 가장 실용적이다.

한 가지 보강 — "직접 넣기(A)"에도 정도가 있다. Hero의 stagger를 위해 **Hero 전체를 `"use client"`로 만들 수도**, **애니메이션 대상 부분만 별도 클라이언트 컴포넌트로 분리할 수도** 있다. Hero는 거의 전체(라벨·이름·직함·설명)가 순차 등장 대상이라 Hero 전체를 클라이언트로 둬도 무방하다. 반대로 섹션 일부만 움직인다면 그 부분만 잘라내는 편이 서버 렌더링 범위를 더 남긴다.

---

## Q12. `layout.tsx`의 `metadata` 객체는 어떻게 실제 HTML `<meta>`로 주입되나?

**결론: Next.js(App Router)가 자동으로 처리한다. 주입 코드를 직접 쓰지 않는다.**

우리 `layout.tsx`에는 `export const metadata = { … }`만 있고, `<head>`나 `<meta>`를 손으로 넣은 코드가 없다. 그런데도 빌드 결과 HTML의 `<head>`에는 `<title>`, `og:title`, `twitter:card` 같은 태그가 들어간다. 그 사이를 잇는 게 App Router의 **Metadata API**다.

### 원리 — 약속된 export를 프레임워크가 수거해 `<head>`에 주입

- `metadata`는 **아무 이름이나 되는 게 아니라 Next이 인식하는 예약된 export 이름**이다. 이 이름(또는 `generateMetadata` 함수)이어야 프레임워크가 집어간다. 다른 이름으로 export하면 무시된다.
- 서버 렌더링 단계에서 Next이 각 세그먼트의 `metadata`를 **평가 → 병합 → `<title>`/`<meta>`/`<link>` 태그로 변환 → `<head>`에 스트리밍**한다.
- 그래서 `layout.tsx`에 `<head>` 마크업이 없는 게 정상이다. 렌더러가 대신 넣는다.

### 서버 컴포넌트 전용 — `"use client"`에선 못 쓴다

`metadata`/`generateMetadata` export는 **서버 컴포넌트에서만** 동작한다(`layout.tsx`·`page.tsx`는 기본이 서버 컴포넌트라 가능). 파일 맨 위에 `"use client"`가 붙은 컴포넌트에서 `metadata`를 export하면 적용되지 않는다. 그래서 우리 프로젝트에서도 상호작용이 필요한 `Header`·`Hero` 등은 `"use client"`지만, 메타데이터는 서버 컴포넌트인 `layout.tsx`에 둔 것.

### 병합 규칙 — 루트 layout → page 순으로 얕은 병합

여러 세그먼트(`app/layout.tsx`, 하위 `layout.tsx`, `page.tsx`)가 각각 `metadata`를 가질 수 있고, Next은 **루트에서 해당 라우트까지 내려오며 얕게(shallow) 병합**한다.
- 같은 최상위 필드는 **더 깊은(페이지에 가까운) 세그먼트가 덮어쓴다.** 예: 루트 `title`을 페이지가 재정의.
- `openGraph`·`twitter` 같은 **중첩 객체는 필드 단위로 깊게 병합되지 않고 통째로 교체**된다. 하위에서 `openGraph`를 다시 주면 그 객체 전체가 새로 쓰이므로, 필요한 필드를 다시 적어야 한다.
- 우리는 1페이지라 루트 `layout.tsx` 한 곳에서 전부 정의 → 병합 이슈가 없다.

### 정적 `metadata` vs 동적 `generateMetadata`

| | `export const metadata` | `export async function generateMetadata()` |
|---|---|---|
| 값 | 빌드 시 고정 | 요청/파라미터(`params`)·데이터 fetch로 **동적 생성** |
| 쓰는 때 | 값이 고정인 페이지(우리 포트폴리오) | 글마다 title이 다른 블로그·상세 페이지 등 |

동적 예:
```tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return { title: post.title, openGraph: { title: post.title } }
}
```

### `title.template` — 하위 페이지 제목 자동 포맷 (참고)

멀티 페이지에서 유용. 루트에서 템플릿을 잡아두면 하위 페이지 `title`이 자동으로 감싸진다:
```tsx
// 루트 layout
title: { default: 'DEV STUDIO | 개발자 포트폴리오', template: '%s | DEV STUDIO' }
// 하위 page 에서 title: 'About' → 최종 <title>About | DEV STUDIO</title>
```
1페이지인 우리는 문자열 `title` 하나로 충분해 템플릿을 쓰지 않았다.

### 파일 기반 메타데이터도 같은 API의 일부

`metadata` 객체(코드 기반) 말고, **정해진 파일명을 두는 것만으로도** Next이 관련 `<link>`/`<meta>`를 주입한다 — `favicon.ico`, `icon.png`, `apple-icon.png`, `opengraph-image.*`, `robots.txt`, `sitemap.xml` 등. 즉 Metadata API = **객체 기반 + 파일 기반** 두 갈래다. (OG 이미지의 파일 기반 방식은 Q14.)

### Pages Router와의 차이 (역사적 맥락)

구버전 **Pages Router**에서는 `next/head`의 `<Head>` 컴포넌트 안에 `<meta>`를 직접 나열했다:
```tsx
// (구) pages 방식
import Head from 'next/head'
<Head><title>…</title><meta property="og:title" content="…" /></Head>
```
App Router는 이 명령형 방식을 **선언형 `metadata` 객체**로 대체했다. 그래서 App Router 프로젝트에서 `<Head>`를 찾으면 없는 게 정상이다.

### 확인 방법

- `npm run build` 후 산출 HTML, 또는 브라우저 **페이지 소스 보기**(개발자도구 Elements 아님 — JS로 조작 전의 원본 HTML) → `<head>`에 `og:*`·`twitter:*`가 구워져 있음.
- `metadataBase`가 상대경로 이미지(`/og-image.png`)를 절대 URL로 바꿔주는지도 여기서 확인(→ Q13).

---

## Q13. OG 이미지란 무엇이고 어디에 쓰이나?

### OG = Open Graph — 링크 미리보기용 메타데이터 표준

Open Graph는 페이스북이 만든 프로토콜로, HTML `<head>`에 `property="og:..."` 형태의 `<meta>` 태그를 넣어 **그 페이지가 공유될 때 어떻게 보일지**를 지정한다. `og:image`는 그중 **미리보기 썸네일 이미지**를 가리킨다.

핵심 태그:
| 태그 | 뜻 |
|---|---|
| `og:title` | 미리보기 카드 제목 |
| `og:description` | 카드 설명 |
| `og:image` | **썸네일 이미지 URL** |
| `og:type` | 콘텐츠 종류(`website`, `article` …) |
| `og:url` | 정규 URL |
| `og:site_name` / `og:locale` | 사이트명 / 언어 |

우리 `layout.tsx`의 `openGraph: { title, description, type: 'website', url, siteName, locale: 'ko_KR', images: [...] }`가 이 태그들로 변환된다.

### 어디서 쓰이나 — 페이지 화면이 아니라 "공유했을 때"

**OG 이미지는 페이지에 렌더링되지 않는다.** `<head>` 메타로만 존재하고, **URL을 공유했을 때 그 링크를 긁어가는 크롤러(스크레이퍼)** 가 읽어 카드로 그린다.
- 카카오톡·슬랙·디스코드·iMessage·라인에 링크 붙이면 뜨는 썸네일 카드
- 페이스북·링크드인 공유 미리보기
- 검색·북마크 프리뷰 일부

즉 소비자는 사람이 아니라 **봇**이다. 그래서 화면엔 안 보여도 SEO/공유 체감에 큰 영향을 준다.

### Twitter(X) 카드 — 별도 네임스페이스

X는 `og:*`도 읽지만 **`twitter:*`를 우선**한다. 그래서 둘 다 지정했다.
| `twitter:card` 값 | 모양 |
|---|---|
| `summary` | 작은 정사각 썸네일 |
| `summary_large_image` | **큰 가로 이미지 카드** (우리가 쓴 값) |

### 왜 `metadataBase`가 필요한가 — 절대 URL 요구

`og:image`는 **외부 크롤러가 읽으므로 절대 URL**(`https://도메인/og-image.png`)이어야 한다. 상대경로만 적으면 봇이 이미지를 못 찾는다. `metadataBase: new URL(SITE.url)`를 설정하면 Next이 **상대경로 `/og-image.png`를 `metadataBase + 경로`로 합쳐 절대 URL로** 만들어준다.
```
metadataBase = https://example.dev
images: ['/og-image.png']  →  https://example.dev/og-image.png  (자동 변환)
```
그래서 배포 도메인이 정해지면 `SITE.url`만 실제 값으로 바꾸면 OG/Twitter 이미지 URL이 전부 맞춰진다.

### 권장 규격

- **크기 1200×630**(1.91:1) — 대부분 플랫폼의 큰 카드(summary_large_image) 표준.
- PNG/JPG, 용량은 수 MB 이하(플랫폼별 상한 있음, 대략 5–8MB).
- `og:image:width`/`height`/`alt`를 함께 주면 렌더가 안정적 — 우리 `images` 배열에 `width/height/alt`를 넣은 이유.

### 캐싱 주의 — 바꿔도 즉시 안 바뀐다

공유 플랫폼은 OG 데이터를 **공격적으로 캐시**한다. 이미지를 교체해도 카톡/페북 미리보기가 그대로일 수 있다. 갱신하려면 각 플랫폼 디버거로 캐시를 강제로 다시 긁게 한다:
- 페이스북 Sharing Debugger, X Card Validator, 링크드인 Post Inspector 등
- 카카오톡은 캐시 무효화가 제한적이라 파일명에 버전(`og-image-v2.png`)을 붙이는 우회가 흔하다.

### 우리 프로젝트 현재 상태

`images: ['/og-image.png']`로 **경로만 연결**돼 있고 실제 파일은 아직 없다(TODO). `public/og-image.png`(1200×630)를 넣으면 자동 연결된다. 파일 없으면 크롤러에서 404만 날 뿐 빌드는 통과. → 정적 파일 대신 **코드로 생성**하는 방법이 Q14.

---

## Q14. `opengraph-image`로 OG 이미지를 생성한다는 게 무엇인가?

App Router의 **파일 컨벤션 기반 OG 이미지**다. 라우트 폴더(`src/app/`)에 정해진 이름의 파일을 두면 Next이 OG 이미지를 처리하고 `og:image` 메타(+ 크기·타입·해시 URL)까지 **자동 주입**한다. 두 형태가 있다.

### (a) 정적 이미지 — 파일만 두기

`src/app/opengraph-image.png`(또는 `.jpg`)를 두면 끝. `metadata.openGraph.images`를 안 적어도 Next이 URL·크기·타입을 자동으로 넣는다. alt는 `opengraph-image.alt.txt`로 지정. 트위터용은 `twitter-image.png`.

### (b) 코드로 생성 — `opengraph-image.tsx` + `ImageResponse`

정적 파일 대신 **JSX를 이미지(PNG)로 렌더**한다.
```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }   // 규격 자동 반영
export const contentType = 'image/png'
export const alt = 'DEV STUDIO 포트폴리오'

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', justifyContent: 'center',
        background: '#0a0a0a', color: '#fff', padding: 80,
      }}>
        <div style={{ fontSize: 64, fontWeight: 700 }}>DEV STUDIO</div>
        <div style={{ fontSize: 32, color: '#a3a3a3' }}>Full-Stack Developer</div>
      </div>
    ),
    { ...size },
  )
}
```
- 파일명 규칙이 곧 메타로 연결되므로, 이 파일을 두면 `metadata.openGraph.images`는 지워도 된다(중복 지정 방지).
- `size`·`contentType`·`alt`를 named export로 함께 내보내면 그대로 메타에 반영된다.

### 원리 — 브라우저 렌더가 아니라 Satori

`ImageResponse`는 내부적으로 **Satori**(HTML/CSS → SVG) + **resvg**(SVG → PNG) 파이프라인이다. 그래서 브라우저의 모든 CSS가 아니라 **Satori가 지원하는 제한된 서브셋**만 그려진다.

### 되는 것 (텍스트만은 아님)

- 텍스트 + 커스텀 폰트, 굵기, 색
- **Flexbox 레이아웃**(`display: flex`, `justify/align`, `flex-direction`)
- **실제 이미지 삽입** — `<img src="절대URL 또는 data:base64">`로 로고·아바타·배경사진 **합성** (단 `width/height` 명시 필요)
- 그라디언트(`linear-gradient`), 배경색, `border-radius`, `box-shadow`(제한적), 절대 위치, 투명도, 인라인 SVG, 이모지

→ "배경 이미지 위 제목", "로고 + 이름 + 직함 카드" 같은 조합은 충분히 된다.

### 안 되는 것

- **`display: grid` 없음** — 레이아웃은 전부 flexbox로
- `float`, JS, 애니메이션, `filter` 등 상당수 미지원
- 자식이 여러 개인 요소는 거의 항상 `display: flex` 명시 필요
- 픽셀 단위로 정교한 그래픽·차트 → 부적합
- Tailwind 클래스는 기본 미적용 — 인라인 `style`이 안전(옵션 `tw` prop은 제한적)

### 실무에서 많이 쓰는 패턴

"코드로 그린다"는 특성상 **동적으로 바뀌는 단순 카드**에 압도적으로 많이 쓴다:
1. **블로그/문서 글마다 제목을 넣은 OG 카드** — `app/blog/[slug]/opengraph-image.tsx`에서 제목·작성자를 데이터로 받아 템플릿에 렌더. 글이 많아도 이미지를 손으로 안 만든다.
2. **브랜드 템플릿 + 가변 텍스트** — 고정 배경/로고 위 제목만 교체.
3. **배경 사진 + 오버레이 텍스트**, **프로필/제품 카드**(아바타 + 이름 + 소개).

1페이지 사이트는 페이지가 하나라 "동적 생성" 이점은 적지만, 색·문구를 사이트 토큰과 맞춰 일관되게 두고 파일 관리를 없앤다는 장점은 있다.

### 이 프로젝트의 함정 — 한글 폰트

**Satori 기본 폰트는 한글(CJK)을 못 그린다.** OG 이미지에 “같이 만들어봐요” 같은 한글을 넣으면 네모/공백으로 깨진다. 넣으려면 **폰트 바이너리를 직접 로드**해야 한다:
```tsx
export default async function OGImage() {
  const notoKR = await fetch(
    new URL('./NotoSansKR-Bold.ttf', import.meta.url), // 폰트 파일 준비 필요
  ).then((r) => r.arrayBuffer())

  return new ImageResponse(( /* JSX */ ), {
    width: 1200, height: 630,
    fonts: [{ name: 'Noto Sans KR', data: notoKR, weight: 700 }],
  })
}
```
- OG 문구가 영문(`DEV STUDIO`, `Full-Stack Developer`)이면 기본 폰트로도 OK.
- 한글을 넣을 거면 폰트 로드가 필수 → 이 경우는 **디자인 확정된 정적 PNG(Figma export)** 가 더 간단할 수 있다.

### 여러 이미지가 필요하면 — `generateImageMetadata`

한 라우트에서 크기·언어별로 OG 이미지를 여러 장 만들려면 `generateImageMetadata`로 배열을 반환해 각 이미지를 개별 생성할 수 있다(블로그 다국어 등). 1페이지 포트폴리오엔 불필요.

### 언제 정적 PNG vs 코드 생성

| 상황 | 추천 |
|---|---|
| 페이지마다 제목이 바뀜(블로그/문서) | **`opengraph-image.tsx` 코드 생성** |
| 텍스트+로고 정도 단순 카드, 토큰 재사용 | 코드 생성 OK |
| 사진·정교한 디자인 중요 | **정적 PNG**(Figma export) |
| 1페이지 포트폴리오 | 둘 다 무난 — 한글 넣으면 정적 PNG가 편함 |

> 출처: [Next.js — Metadata & OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [`opengraph-image` 파일 컨벤션](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), [`ImageResponse` (next/og)](https://nextjs.org/docs/app/api-reference/functions/image-response)

---

## Q15. Rules of Hooks — 왜 훅을 반복문·조건문 안에서 부르면 안 되나?

> React 개념(Next 특화 아님). Approach 섹션 스크롤 병합 구현 중, 원마다 `useTransform`을 `.map()` 안에서 부르려다 막힌 데서 나온 질문.
> 관련 리뷰: `CODE_REVIEW_LOG.md` 2026-07-26 항목(핵심 1번), framer-motion 훅: `FRAMER_MOTION_GUIDE.md` §3.

### 두 가지 규칙

React 공식 문서가 정한 훅 사용 규칙은 둘이다:

1. **훅은 항상 최상위(top level)에서만 호출한다.** 반복문(`for`/`.map`)·조건문(`if`)·중첩 함수·`return` 이후(early return 뒤)에서 부르지 않는다.
2. **훅은 React 함수 컴포넌트 또는 커스텀 훅 안에서만 호출한다.** 일반 JS 함수에서 부르지 않는다.

여기서 문제되는 건 **규칙 1**이다.

### 왜 그런가 — React는 훅을 "호출 순서"로 식별한다

React는 각 훅 호출에 이름표를 붙이지 않는다. 대신 **컴포넌트가 렌더될 때마다 훅이 불리는 순서**로 각 훅과 그 내부 상태(state·memo·MotionValue 등)를 짝짓는다. 즉 "이 렌더의 1번째 훅 = 저 렌더의 1번째 훅"으로 위치를 기준 삼아 상태를 이어 붙인다.

그래서 **매 렌더에서 훅의 개수와 순서가 항상 같아야** 짝이 안 어긋난다. 반복문·조건문 안에서 부르면 이 전제가 깨진다:

```jsx
// ❌ 규칙 위반 — map 길이가 바뀌면 훅 개수가 렌더마다 달라짐
{circles.map((item) => {
  const { x, y } = useTransform(scrollYProgress, [0, 1], item.circleTransform)
  return <motion.div style={{ x, y }} />
})}
```

`circles`가 3개면 훅 3개, 2개로 줄면 훅 2개 → React가 "3번째 훅"에 저장해둔 상태를 다음 렌더에서 찾지 못해 상태가 밀리거나 깨진다. 조건문도 마찬가지다:

```jsx
// ❌ 조건에 따라 훅을 건너뛰면 그 아래 훅들의 순서가 통째로 밀림
if (isDesktop) {
  const v = useSomething()
}
```

### 우회법 — "훅은 밖에서 고정 개수로, 결과만 안에서 인덱싱"

반복 대상마다 훅 값이 필요하면, **훅 호출 자체는 최상위에 고정 개수로 펼쳐 두고**, 그 결과를 배열에 모아 반복문 안에서는 **배열을 인덱싱만** 한다. 인덱싱·구조분해는 훅 호출이 아니므로 규칙에 안 걸린다.

```jsx
// ✅ 훅은 최상위에서 3번, 항상 같은 순서로 호출 (개수 고정)
const circle1 = useTransform(scrollYProgress, [0, 1], { x: [-80, 0], y: [-80, 0] })
const circle2 = useTransform(scrollYProgress, [0, 1], { x: [ 80, 0], y: [-80, 0] })
const circle3 = useTransform(scrollYProgress, [0, 1], { x: [  0, 0], y: [ 80, 0] })
const circleArray = [circle1, circle2, circle3]

// map 안에서는 훅을 부르지 않고 결과만 꺼내 씀 (인덱싱 = 훅 아님 → 안전)
{circles.map((item, index) => {
  const { x, y } = circleArray[index]
  return <motion.div style={{ x, y }} />
})}
```

이 방식이 성립하는 조건은 **반복 개수가 고정(여기선 원 3개)**이라는 점이다. 개수가 런타임에 가변이면 이 패턴을 못 쓰고, 대신 "각 항목을 자체 컴포넌트로 분리해 그 컴포넌트 안에서 훅 1번씩" 부르는 구조로 바꾼다(컴포넌트 하나당 훅 개수는 고정이므로 규칙 충족).

### 헷갈리는 경계 — 배열 리터럴 안 훅 호출은 되는데, `.map`은 왜 안 되나

훅 결과를 배열/객체에 **담는 것 자체**는 규칙과 무관하다. 규칙이 보는 건 오직 **훅을 어디서 *호출*하느냐**다. 그래서 아래처럼 배열 리터럴 안에서 훅을 부르는 건 — 자주 위험해 보이지만 — **사실 규칙 위반이 아니다**:

```jsx
// ✅ (규칙상) 유효 — 손으로 쓴 3개 고정, 감싸는 조건/반복 없음
const circles = [
  { text: '기획',   data: useTransform(scrollYProgress, [0,1], { x:[-100,0], opacity:[0,1] }) }, // 1번째
  { text: '디자인', data: useTransform(scrollYProgress, [0,1], { x:[ 100,0], opacity:[0,1] }) }, // 2번째
  { text: '개발',   data: useTransform(scrollYProgress, [0,1], { y:[ 100,0], opacity:[0,1] }) }, // 3번째
]
```

배열 리터럴은 컴포넌트 본문에서 **위에서 아래로 순서대로** 평가되므로, 훅이 **항상 3번, 항상 같은 순서**로 불린다. 배열 리터럴은 "반복문·조건·중첩 함수" 어디에도 해당하지 않아 **최상위(top level) 호출**로 친다. 그래서 규칙을 지킨다 — *우연히*가 아니라 실제로 유효하다.

**그럼 무엇이 위험한가.** "지금 틀렸다"가 아니라 **깨지기 쉬운(fragile) 구조**라는 점이다. 데이터 배열처럼 생겨서, 다음 두 리팩터로 자연스럽게 유도되는데 그 순간 규칙이 깨진다:

```jsx
// ❌ (a) .map 으로 만들면 — 훅이 콜백(중첩 함수) 안으로 들어감 + 개수가 데이터 길이에 종속
const circles = data.map((d) => ({ ...d, data: useTransform(scrollYProgress, [0,1], d.range) }))
//                            ^^^ 이 화살표 함수 안에서의 훅 호출 = "중첩 함수" 위반
//   게다가 data.length가 렌더마다 바뀌면 → "Rendered more/fewer hooks than during the previous render" 크래시

// ❌ (b) 조건부로 항목을 넣으면 — 호출 개수·순서가 렌더마다 흔들림
const circles = [
  cond && { data: useTransform(...) }, // cond=false면 이 호출이 건너뛰어져 아래 슬롯이 밀림
  { data: useTransform(...) },
]
```

즉 **리터럴(고정 3개)은 유효, `.map`/조건부는 위반**이다. 경계가 헷갈리므로, 데이터처럼 보이는 자리에 훅을 섞기보다 위 §우회법대로 **데이터와 훅 결과를 분리**해 두는 편이 안전하다(리팩터해도 안 깨지고, "여기서 훅이 불린다"는 신호도 또렷해진다).

### 강제 도구 — ESLint

이 규칙은 눈으로 지키는 게 아니라 **`eslint-plugin-react-hooks`**가 정적으로 잡아준다. Next.js 기본 ESLint 설정에 포함돼 있어 `npm run lint`에서 위반이 걸린다.

**단, 무엇을 잡고 무엇을 안 잡는지**는 위 경계와 같다:
- 잡는다 → 훅을 **반복문·조건·중첩 함수(예: `.map` 콜백)·early return 이후**에서 호출할 때.
- (대개) 안 잡는다 → **배열 리터럴 안 고정 호출**처럼 최상위 실행에 해당하는 경우. 구조상 반복/조건/중첩이 아니므로 규칙 위반이 아니라서다. → 그래서 "리터럴은 ESLint를 통과하지만 fragile"이라는 상황이 생긴다(통과했다고 안전한 리팩터가 보장되는 건 아님).

### 요약

- React는 훅을 **호출 순서**로 상태와 짝짓는다 → 매 렌더 훅 개수·순서가 같아야 한다.
- 그래서 반복문·조건문·early return 뒤에서 훅을 부르면 순서가 흔들려 상태가 깨진다.
- 규칙이 보는 건 훅을 **어디서 호출하느냐**지, 결과를 어디에 담느냐가 아니다 → 훅 결과를 배열/객체에 저장하는 건 자유.
- 그래서 **고정 개수 배열 리터럴 안 호출은 유효**하지만, `.map`(중첩 콜백)·조건부로 바꾸면 위반이 된다 → 리터럴은 ESLint를 통과해도 fragile.
- 반복마다 훅 값이 필요하면 **훅은 최상위에 고정 개수로 펼치고 결과 배열을 인덱싱**하거나, **항목을 컴포넌트로 분리**한다.
- `eslint-plugin-react-hooks`(Next 기본 포함)가 반복/조건/중첩 안 호출을 잡아준다.

> 출처: [React — Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks), [React — eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks)
