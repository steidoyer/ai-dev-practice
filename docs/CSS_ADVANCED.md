# CSS 고급 기능 & 개념 노트

순수 **CSS의 고급/덜 흔한 기능·개념**을 한곳에 모으는 문서. (Tailwind 유틸리티 치트시트는 `TAILWIND_REFERENCE.md`, 여기는 CSS 원리 자체.)
직접 코딩용 참고 — 정답 코드가 아니라 "무엇을 검색하고 무엇을 고민할지"를 담는다. CSS 주제가 새로 나오면 이 문서에 **섹션으로 추가**한다.

## 목차
1. [블렌드 모드 (mix-blend-mode) — 겹치는 색 섞기](#1-블렌드-모드-mix-blend-mode--겹치는-색-섞기)
2. [line-height와 한글 — line-box, 폰트 메트릭, 2줄 문제](#2-line-height와-한글--line-box-폰트-메트릭-2줄-문제)
3. [position — 5가지 값, containing block, sticky가 안 먹는 이유](#3-position--5가지-값-containing-block-sticky가-안-먹는-이유)
4. [스크롤 잠금 (scroll lock) — dim 오버레이 / 모달 패턴](#4-스크롤-잠금-scroll-lock--dim-오버레이--모달-패턴)
5. [글자 색 와이프 — `background-clip: text`로 하이라이트 쓸기](#5-글자-색-와이프--background-clip-text로-하이라이트-쓸기)

> 앞으로 추가 후보: `clip-path`, scroll-driven animations(`animation-timeline`), CSS 변수·`@property`, container queries 등. 필요할 때 섹션으로 붙인다.

---

## 1. 블렌드 모드 (mix-blend-mode) — 겹치는 색 섞기

**요소가 겹칠 때 색을 섞는 법**(예: 벤 다이어그램 교집합). 관련: `SECTION_APPROACH_PLAN.md`(이 프로젝트 벤 다이어그램 기획), 겹침 레이아웃은 `TAILWIND_REFERENCE.md`.

### 1.1 블렌드 모드란

한 요소의 색이 **뒤에 있는 것(backdrop)**과 **어떻게 합쳐질지**를 정하는 규칙이다.
기본값은 `normal`(위 요소가 아래를 그냥 덮음). 블렌드 모드를 주면 두 픽셀의 색을 **수식으로 계산**해 섞는다.

- **`mix-blend-mode`**: 그 요소 **전체**가 뒤 요소들과 섞인다. (겹치는 원끼리 섞을 때 이것)
- **`background-blend-mode`**: 한 요소 **내부**의 배경 레이어끼리 섞는다(`background-image` + `background-color`). 요소 간이 아님.

### 1.2 자주 쓰는 값 — 배경 밝기가 관건

**어두운 배경**이냐 **밝은 배경**이냐에 따라 "겹칠수록 밝아질지/어두워질지"가 갈린다.

| 값 | 효과 | 어두운 배경(#0a0a0a)에서 |
|---|---|---|
| `screen` | 가산 계열, 밝아짐 | 겹칠수록 **밝고 선명** ✅ |
| `lighten` | 더 밝은 픽셀 채택 | 밝아짐 ✅ |
| `plus-lighter` | 순수 가산(빛처럼 더함) | 겹침이 **빛나듯** 밝아짐 ✅ |
| `multiply` | 곱셈, 어두워짐 | 거의 안 보임(검정에 곱하면 검정) ❌ |
| `darken` | 더 어두운 픽셀 채택 | 어두워짐 ❌ |
| `overlay` `soft-light` | 대비 강조 | 상황따라 |
| `color-dodge` `hard-light` | 강한 대비/발광 | 강렬, 과할 수 있음 |

> **규칙**: 어두운 배경 = `screen`/`lighten`/`plus-lighter`(겹침이 밝아짐), 밝은 배경 = `multiply`/`darken`(겹침이 진해짐).
> 이 프로젝트는 배경이 `#0a0a0a`(어두움)이므로 **`screen` 계열**이 자연스럽다.

### 1.3 `isolation: isolate` — 블렌드 범위 가두기 (중요 키워드)

블렌드 모드는 기본적으로 **뒤에 있는 모든 것**(형제 요소 + 페이지 배경까지)과 섞인다.
그래서 원들이 **페이지 배경과도** 섞여 의도치 않은 결과가 나올 수 있다.

**부모 컨테이너에 `isolation: isolate`**(Tailwind `isolate`)를 주면 새 stacking context가 생겨,
그 안의 자식들끼리만 블렌드되고 **바깥 배경은 건드리지 않는다.**

> 겹치는 원 그룹은 컨테이너에 `isolate`를 주는 걸 기본으로 생각할 것.

### 1.4 Tailwind 클래스

| 클래스 | CSS |
|---|---|
| `mix-blend-screen` `mix-blend-lighten` `mix-blend-plus-lighter` | `mix-blend-mode` |
| `mix-blend-multiply` `mix-blend-overlay` 등 | 나머지 모드 |
| `bg-blend-screen` 등 | `background-blend-mode` |
| `isolate` / `isolation-auto` | `isolation` |

### 1.5 이 프로젝트 벤 다이어그램에 적용 — 두 갈래

교집합을 드러내는 방법은 두 가지고, 둘 다 유효하다.

**(A) 알파 스택 (반투명 겹침)** — Figma 시안이 쓴 방식
- 각 원을 **반투명 accent**(예: `bg-accent-subtle`, 또는 accent + 낮은 opacity)로.
- 겹치는 부분은 불투명도가 **누적**돼 자연히 진해진다. 블렌드 모드 불필요.
- 가장 단순하고 시안과 일치 → **여기서 시작하는 걸 권장.**

**(B) mix-blend-mode** — 더 선명한 교집합
- accent 원 + `mix-blend-screen`(어두운 배경) → 겹침이 **빛나듯** 밝아짐.
- 컨테이너에 `isolate`로 범위를 가둘 것.
- (A)로 부족하다 느낄 때 실험.

> 판단: **먼저 (A) 알파 스택으로 정적 룩을 맞추고**, 교집합을 더 강조하고 싶으면 (B)를 얹는다.

### 1.6 주의점

- **접근성 / 가독성**: 텍스트 라벨(기획/디자인/개발/융합형)을 블렌드 레이어 **위/밖**에 둬라. 텍스트까지 블렌드되면 배경과 섞여 **대비(contrast)가 깨진다.** 원은 블렌드해도 라벨은 블렌드 안 되게 분리.
- **stacking context**: `mix-blend-mode`·`isolate`·`transform`·`opacity` 등은 새 stacking context를 만든다 → `z-index` 계산이 바뀔 수 있으니 겹침 순서가 이상하면 여기부터 의심.
- **성능**: 큰 영역을 블렌드하면 비용이 있지만, 이 규모(원 3개)는 무방.
- **transform 충돌**: 원을 framer-motion으로 움직이면 `x`/`y`가 transform을 쓴다 — 블렌드 자체와는 무관하지만, 위치 트릭(`-translate-x-1/2`)과는 충돌하니 주의(→ `TAILWIND_REFERENCE.md`).

### 1.7 더 볼 것

- MDN `mix-blend-mode`: https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode
- MDN `<blend-mode>` 값 목록: https://developer.mozilla.org/docs/Web/CSS/blend-mode
- MDN `isolation`: https://developer.mozilla.org/docs/Web/CSS/isolation

---

## 2. line-height와 한글 — line-box, 폰트 메트릭, 2줄 문제

**배경**: Approach h2에서 "크기(3rem)는 같은데 한글은 line-height가 달라야 할 것 같아 `--text-section-kor`를 따로 뒀다"는
판단이 나옴. 이 절은 **왜 한글이 같은 line-height에서 더 좁아 보이는지**(폰트 메트릭)와, **1줄일 땐 티가 안 나다가 2줄에서
드러나는 이유**, 그리고 **토큰을 언어로 나누는 게 맞는 기준인지**를 정리한다. (토큰/유틸 값 자체는 `TAILWIND_REFERENCE.md` §6.)

### 2.1 line-height는 "글자 크기"가 아니라 "줄 상자(line-box) 높이"

`line-height`는 글자 자체 크기가 아니라 **한 줄이 차지하는 세로 상자(line-box)의 높이**를 정한다.
단위 없는 값(`1`, `1.5`)이면 **font-size의 배수**다. `line-height: 1` = 줄 상자 높이가 font-size와 같음.

브라우저는 글자를 그릴 때 line-box 높이에서 **글자가 실제 차지하는 높이(content-area)를 빼고, 남은 여백을
위·아래로 절반씩(half-leading)** 나눠 넣는다. 즉 **줄 사이 간격 = line-box − 글자가 실제 채우는 높이**.

### 2.2 왜 한글은 같은 line-height에서 더 "꽉 차" 보이나 — 폰트 메트릭

핵심: **content-area(글자가 실제 채우는 높이)는 font-size가 아니라 폰트 내부 메트릭(ascent/descent)이 정한다.**
그리고 라틴 폰트와 한글(CJK) 폰트는 이 메트릭이 다르다.

- **라틴 폰트(Geist 등)**: 소문자 기준선 위주로 디자인돼 글자가 em 상자(정사각형)를 **덜 채운다**. 위아래로 빈 공간이
  많아서 `line-height: 1`이어도 **여유 있어 보인다.**
- **한글/CJK 폰트(Noto Sans KR 등)**: 글자가 **네모 틀(em 상자)을 거의 꽉 채우도록** 설계된다. 그래서 같은
  `line-height: 1`에서도 글자가 상자 위아래에 **바짝 붙어** 더 답답하고, 줄 사이에 남는 여백이 적다.

> 그래서 **"같은 3rem·같은 line-height 1"인데 한글이 더 좁아 보인다"**는 관찰은 착시가 아니라 **폰트 메트릭 차이**가 맞다.

### 2.3 1줄에서는 왜 티가 안 나나 (지금 상태) — 2줄에서 터지는 이유

- **1줄**: 줄 사이 간격이라는 게 **존재하지 않는다.** line-height는 그 한 줄의 상자 높이(=요소 높이, 수직 정렬)에만
  영향을 줄 뿐, 글자끼리 부딪힐 다음 줄이 없다. → **그래서 지금은 1로 둬도 문제가 안 보인다.**
- **2줄 이상**: 이제 아랫줄 글자의 윗부분과 윗줄 글자의 아랫부분 **사이 간격**이 생긴다. 이 간격이
  `line-height − 글자가 채우는 높이`인데, 한글은 채우는 높이가 커서 이 간격을 **거의 다 먹는다.** → `line-height: 1`이면
  두 줄이 **맞닿거나 겹쳐** 읽기 어려워진다. 라틴은 여유가 있어 같은 1에서도 덜 심하다.

> **개발자의 직관(지금 1줄이라도 2줄 상황을 감안해 미리 잡는다)은 옳다.** 반응형/번역/문구 수정으로 제목은 쉽게 2줄이 된다.
> 다만 "그래서 **언어별 토큰**을 만든다"가 그 직관을 담는 **최선의 그릇인지는 별개 문제**(→ 2.5).

### 2.4 유명 한글 사이트·가이드는 어떻게 하나 (레퍼런스)

- **KRDS(대한민국 정부 디자인 시스템)**: 본문 행간 **최소 1.5, 기본 1.75 권장**(WCAG 1.4.12 문단 간격 기준과 연결). 제목은
  본문보다 **좁은** 행간을 쓰는 경향(제목 26px에 32px ≈ 1.23 사례).
- **일반 한글 웹 관행**(사례 수집): 본문 **1.5~1.8**, 제목 **1.2~1.4**. 즉 line-height는 **"한글이냐"가 아니라
  "본문이냐 제목이냐(역할)"로 갈리는 게 보통이다.** 큰 제목일수록 값을 낮춘다.
- **디자인 시스템(Toss TDS, LINE DS 등)**: line-height를 **font-size와 묶어 "역할 이름의 텍스트 스타일"**(예: `heading-1`,
  `body-1`)로 정의한다. **언어 접미사(`-kor`)로 폰트 크기를 쪼개지 않는다.** 기준은 **역할**이지 언어가 아니다.

### 2.5 그래서 토큰을 어떻게? — 기준은 "언어"가 아니라 "역할 + line-height 분리"

문제 재정의: 지금 `--text-section`과 `--text-section-kor`는 **font-size가 3rem으로 동일**, 다른 건 **line-height뿐**이다.
즉 만든 건 사실상 **line-height 결정을 font-size 토큰 안에 숨긴 것**이고, 이름표(`-kor`)는 실제 갈린 기준(line-height)과 어긋난다.

선택지(트레이드오프):

**(A) 언어별 font-size 토큰** — 지금 방식
- ✅ 쓰는 쪽은 클래스 하나(`text-section-kor`)로 끝.
- ❌ font-size는 같은데 굳이 복제 → **모든 크기마다 `-kor` 쌍**이 필요해져 토큰이 배로 증식. 확장성 나쁨.
- ❌ 이름이 실제 차이(line-height)를 안 가리킴.

**(B) font-size 토큰 1개 + 사용처에서 `leading-*`** — 두 속성을 분리
- font-size 토큰은 언어와 무관하게 하나. line-height는 **필요한 곳에서** `leading-tight`(≈1.25)·`leading-snug` 등으로 지정.
- ✅ 토큰 안 늘어남, 두 속성이 명확히 분리됨. ✅ 프로젝트가 원래 "타이포는 가볍게(raw `text-*` + line-height companion)" 가는 방향과 일치.
- △ 사용처마다 leading을 기억해야 함(반복되면 C로).

**(C) line-height를 별도 시맨틱 토큰으로** — `--leading-heading`, `--leading-body`
- v4 `@theme`의 `--leading-*` 네임스페이스 → `leading-heading` 유틸 생성. 역할별로 **한 번 정하고** 재사용.
- ✅ 성숙한 디자인 시스템(Toss/LINE)이 하는 "역할 기반" 방식에 가장 가깝다. 재사용 많으면 최선.

**(D) 사이트가 한글 주력이면 전역 기본 line-height를 한글에 맞춤**
- body 기본을 1.6 근처로 두면 대부분 자연히 해결. 제목만 예외적으로 낮춤.

**(E) 최신 CSS(키워드만)**: `text-box-trim` / `text-box-edge`(옛 `leading-trim`)로 폰트 위아래 여백을 잘라 언어차를 줄이거나,
`@font-face`의 `ascent-override`/`descent-override`/`line-gap-override`로 한글 폰트 메트릭을 라틴에 맞춰 보정. 브라우저 지원·난이도 있어 지금은 **개념만**.

> **의견(요청에 따른 권고, 최종 결정은 개발자)**: 방향(2줄 대비)은 맞다. 다만 **언어로 font-size를 쪼개는 (A)는 기준이 어긋나고 확장성이 나쁘다.**
> 유명 사이트/디자인 시스템의 공통 해법은 **"line-height를 font-size에서 떼어내 역할(제목/본문)로 정하는 것"**이다.
> 이 프로젝트 규모에선 **(B) 사용처 `leading-*`부터 시작 → 반복되면 (C) `--leading-*` 토큰으로 승격**이 가장 자연스럽다.
> 스스로 확인 질문: *"내가 나눈 기준이 언어인가 역할인가? `-kor` 쌍을 모든 크기에 만들 건가? 아니라면 기준을 잘못 잡은 신호."*

### 2.6 더 볼 것

- MDN `line-height`: https://developer.mozilla.org/docs/Web/CSS/line-height
- KRDS 타이포그래피 가이드: https://www.krds.go.kr/html/site/style/style_03.html
- 웹 사이트들의 한글 타이포그래피(lqez): https://lqez.github.io/blog/hangul-typo-on-web.html
- Toss Design System — Typography: https://tossmini-docs.toss.im/tds-react-native/foundation/typography/
- `text-box-trim`(MDN): https://developer.mozilla.org/docs/Web/CSS/text-box-trim

---

## 3. position — 5가지 값, containing block, sticky가 안 먹는 이유

**배경**: `TAILWIND_REFERENCE.md` §1의 "`sticky top-0`은 조상 `overflow-hidden`이면 동작 안 함" 한 줄에서 나온 질문
("조상은 부모를 포함하나? 부모가 아니라 조부모여도 깨지나?")을 원리까지 풀어 정리한다.
유틸리티 클래스 목록은 `TAILWIND_REFERENCE.md` §1, 여기는 **왜 그렇게 동작하는가**.

### 3.1 값은 5개가 전부다

`static` / `relative` / `absolute` / `fixed` / `sticky` — CSS 표준 `position` 값은 이게 전부다.
(`absolute`·`relative`·`fixed`를 알고 있다면 **`static`의 함정**과 **`sticky`**만 남는다.)

| 값 | 문서 흐름에서 | 자리(공간)를 | offset(`top`/`left`…)의 기준 | Tailwind |
|---|---|---|---|---|
| `static` | 남음 | 차지함 | **offset·z-index 무시됨** | `static` |
| `relative` | 남음 | **원래 자리를 그대로 차지함** | 자기 원래 위치 | `relative` |
| `absolute` | **빠짐** | 차지 안 함 | 가장 가까운 **positioned 조상** | `absolute` |
| `fixed` | **빠짐** | 차지 안 함 | **뷰포트** (단, 예외 있음 → 3.2) | `fixed` |
| `sticky` | 남음 | **차지함** | 가장 가까운 **스크롤 컨테이너 조상** | `sticky` |

**`static`의 함정 (알아둘 것)**
- `position: static`은 기본값이고, 여기에 `top`/`left`/`z-index`를 줘도 **전부 무시된다.** 조용히 무시라 디버깅이 어렵다.
- `z-index`는 원칙적으로 **positioned 요소(static이 아닌 것)에만** 적용된다. 예외는 **flex/grid 자식**으로,
  이건 `static`이어도 `z-index`가 먹는다. "z-index가 안 먹는다" → 첫 번째로 `position`을 의심.

**`relative`의 성질 (헷갈리는 지점)**
- 오프셋을 줘서 움직여도 **원래 자리는 그대로 비워둔 채** 시각적으로만 이동한다. 주변 요소 레이아웃은 안 밀린다.
- 그래서 `relative`의 실제 용도 8할은 **"움직이려고"가 아니라 자식 `absolute`의 기준점을 만들려고**다.

### 3.2 containing block — `absolute`/`fixed`가 무엇을 기준으로 잡히나

**containing block(포함 블록)** = 그 요소의 `top`/`left`/`%` 값이 계산되는 **기준 상자**.

- **`absolute`**: 조상을 위로 올라가며 찾다가 만나는 **첫 번째 positioned 요소**(= `position`이 `static`이 아닌 것)의 **padding box**.
  끝까지 없으면 **초기 포함 블록**(대략 문서 루트)이 기준이 된다.
- **`fixed`**: 원칙적으로 **뷰포트**. 그래서 스크롤해도 안 움직인다.

> ⚠️ **`fixed`를 깨뜨리는 조상 속성 — 이 프로젝트에서 실제로 밟을 수 있는 함정**
>
> 조상 중 하나라도 아래 속성이 `none`이 아니면, 그 조상이 **`fixed`의 containing block이 되어버린다.**
> `fixed`가 뷰포트가 아니라 그 조상에 갇혀서 **같이 스크롤된다.**
>
> - `transform`, `translate`, `rotate`, `scale`
> - `filter`, `backdrop-filter`
> - `perspective`
> - `will-change`에 위 속성 이름이 들어간 경우
> - `contain: layout / paint / strict / content`
>
> **framer-motion으로 애니메이트하는 요소는 거의 다 `transform`이 붙는다.** 즉 모션 래퍼 안에 `fixed`를 두면
> 조용히 깨진다. (`absolute`도 같은 규칙으로 기준이 바뀔 수 있다 — transform이 붙은 요소는 positioned가 아니어도
> containing block이 되므로.)

### 3.3 `position: sticky` — 원리

`sticky`는 **`relative`와 `fixed`의 하이브리드**다. 평소엔 `relative`처럼 흐름 안에서 자기 자리를 차지하고 있다가,
스크롤이 지정한 임계선(`top: 0` 등)에 닿는 순간부터 그 자리에 **고정된 것처럼** 보인다.

**꼭 알아야 할 성질 5가지**

1. **오프셋을 최소 하나는 줘야 한다.** `position: sticky`만 쓰고 `top`/`bottom`/`left`/`right`를 안 주면
   임계선이 없어서 **아무 일도 안 일어난다.** (`sticky` 단독은 사실상 `relative`)
2. **흐름에서 빠지지 않는다.** `fixed`와 달리 원래 자리를 계속 차지한다 → 고정될 때 아래 콘텐츠가 위로 튀지 않는다.
3. **기준이 둘이고, 서로 다른 요소다** — 여기가 핵심.

   | 무엇 | 기준 요소 | 몇 단계 위? |
   |---|---|---|
   | **무엇의 스크롤에 반응하나** | 가장 가까운 **스크롤 컨테이너** 조상 | 몇 단계 위든 상관없음 |
   | **어디까지 따라오다 놓아주나** | **직계 부모**의 박스 | 부모 한 단계 |

4. **부모 높이가 곧 활동 범위다.** 부모가 화면 밖으로 나가면 sticky도 같이 나간다.
   부모가 자기 콘텐츠 높이밖에 안 되면 붙어 있을 구간 자체가 없어서 **아무 일도 안 일어난 것처럼 보인다.**
   - flex/grid에서 특히 잘 밟는다: 기본 `align-items: stretch`면 아이템이 세로로 늘어나 sticky가 잘 동작하는데,
     `align-self: start`(Tailwind `self-start`)를 주는 순간 아이템이 콘텐츠 높이로 줄어들어 **sticky가 죽는다.**
5. **`sticky`는 새 stacking context를 만든다.** 겹침 순서가 이상하면 이걸 의심(→ §1.6과 같은 맥락).

### 3.4 그래서 왜 조상 `overflow-hidden`이 sticky를 죽이나

**"조상(ancestor)"은 부모를 포함한다.** 부모 = 가장 가까운 조상이고, 그 위 전부가 조상이다.
그리고 **부모가 아니라 조부모·증조부모여도 똑같이 깨진다.** 이유:

1. `overflow`가 `hidden` / `auto` / `scroll` 중 하나면 그 요소는 **스크롤 컨테이너**가 된다.
   → **`hidden`도 스크롤 컨테이너를 만든다**는 게 핵심. 사람들이 `auto`/`scroll`만 그런 줄 안다.
2. sticky는 **가장 가까운 스크롤 컨테이너 조상**을 기준으로 삼는다. 중간에 `overflow-hidden` 조상이 생기면
   기준이 **페이지 스크롤에서 그 조상으로 갈아탄다.**
3. 그런데 `overflow: hidden`은 **사용자가 스크롤할 수 없는** 컨테이너다. 스크롤 이동량이 0이니
   임계선에 닿을 일이 영원히 없다.
4. 결과: 에러도 없고 클래스도 살아 있는데 **그냥 일반 요소처럼 페이지와 같이 흘러간다.**

**같이 밟는 함정 2개**

- **`overflow-x-hidden`만 줘도 깨진다.** 명세상 한 축이 `hidden`이고 다른 축이 `visible`이면,
  그 `visible`은 **`auto`로 계산된다.** 한 축만 막았다고 생각해도 결과적으로 양방향 스크롤 컨테이너가 된다.
  → *"가로 스크롤 막으려고 래퍼에 `overflow-x-hidden`"* 이 안쪽 sticky를 전멸시키는 대표 사고.
- **`overflow: hidden`은 `absolute` 자식도 잘라낸다** — 단, 그 컨테이너가 자식의 containing block일 때만.
  `relative`가 없는 `overflow-hidden` 조상은 `absolute` 자식을 못 자른다.

**우회: `overflow: clip`**

`overflow: clip`(Tailwind `overflow-clip`)은 잘라내는 효과는 `hidden`과 같지만
**스크롤 컨테이너를 만들지 않는다.** → **sticky를 깨뜨리지 않는다.**
- `overflow-clip-margin`으로 잘라내는 경계를 바깥으로 밀 수도 있다.
- 지원: Chrome/Edge 90+, Firefox 81+, Safari 16+ (Baseline 널리 사용 가능). 지금 쓰기에 안전.

**sticky가 안 될 때 점검 순서**
1. `top`/`bottom` 같은 오프셋을 줬나?
2. 조상 전체를 훑어 `overflow`가 `visible`이 아닌 게 있나? (부모만 보지 말 것)
3. 부모 높이가 sticky 요소보다 충분히 큰가? (flex `self-start` 여부)
4. 조상에 `transform`/`filter`가 붙어 containing block이 바뀌지 않았나?

### 3.5 그럼 모달 열 때 `body`에 건 `overflow: hidden`은 sticky를 죽이나?

dim 레이어 + 중앙 모달을 만들 때 배경 스크롤을 막으려고 `body { overflow: hidden }`을 거는 그 패턴.
**결론부터: `html`/`body`에 건 것이라면 sticky를 영구히 망가뜨리지 않는다.** 3.4의 규칙에 **예외**가 있기 때문이다.

#### 루트 요소의 overflow는 "뷰포트로 승격"된다

CSS Overflow Level 3 §3.1.4의 특별 규칙:

> UA는 **루트 요소(`html`)의 overflow 값을 뷰포트에 적용**해야 한다.
> 다만 `html`의 overflow가 (양축 모두) `visible`이고 자식으로 `body`가 있으면,
> **`body`의 overflow 값을 대신 뷰포트에 적용**한다.
> 그리고 **값을 넘겨준 그 요소 자신의 used overflow는 `visible`이 된다.**

마지막 문장이 핵심이다. `body { overflow: hidden }`을 써도:

- 그 `hidden`은 **뷰포트로 올라가** 페이지 스크롤을 멈춘다 ✅ (원하는 효과)
- **`body` 자신은 `visible`로 취급**된다 → **`body`는 스크롤 컨테이너가 되지 않는다** ✅

즉 안쪽 sticky 요소가 올려다보는 "가장 가까운 스크롤 컨테이너"는 **여전히 뷰포트**다. 기준이 갈아타지 않는다.
다만 그 뷰포트가 **모달이 열려 있는 동안만** 스크롤을 멈춘 것이라, 그동안 sticky가 "동작 안 하는 것처럼" 보이는 건
당연하다 — 애초에 스크롤이 없으니까. **모달을 닫고 스타일을 되돌리면 sticky는 원래대로 동작한다.**

> 정리: 3.4의 함정은 **"중간 래퍼"** 에 걸었을 때의 이야기고, **루트(`html`/`body`)는 이 승격 규칙 덕분에 예외**다.
> (단, `html`이나 `body`에 `contain`을 쓰면 이 특별 처리가 **비활성화**된다 — 명세 명시.)

#### ⚠️ 진짜 위험한 건 이쪽

| 어디에 `overflow: hidden`을 걸었나 | 스크롤 컨테이너 생성? | sticky |
|---|---|---|
| `html` 또는 `body` | ❌ (뷰포트로 승격) | 잠금 해제하면 정상 |
| **중간 래퍼 div** (`#__next`, `<div id="root">`, 레이아웃 div) | ✅ 됨 | **영구히 깨짐** |
| `html`/`body` + `contain: *` | ✅ 됨 | 깨짐 |

Next.js에서 "스크롤 잠금"을 구현할 때 `document.body` 대신 **레이아웃 래퍼 div에 클래스를 토글**하면
정확히 이 두 번째 줄을 밟는다. **잠금은 `html`/`body`에.**

> 이 잠금 패턴 자체(계보·직접 구현 시 함정·접근성·대안)는 분량이 있어 **§4로 따로 분리**했다.

### 3.6 최신 스펙 — CSS 앵커 포지셔닝 (알아둘 가치 있음)

`absolute`의 고질적 한계는 **"기준 조상이 DOM 상 조상이어야 한다"**는 점이다. 툴팁·드롭다운·팝오버를
"이 버튼 옆에" 붙이려면 DOM을 그 버튼 안에 넣거나 JS로 좌표를 계산해야 했다.

**앵커 포지셔닝**은 **DOM 관계와 무관하게** 임의의 요소를 기준으로 위치를 잡게 해준다.

- 기준 요소에 `anchor-name: --my-anchor`
- 붙일 요소에 `position: absolute` + `position-anchor: --my-anchor`
- 위치는 `position-area`(예: `block-end center`) 또는 `anchor()` / `anchor-size()` 함수로 지정
- `position-try-fallbacks`로 **화면 밖으로 나갈 때 자동으로 반대편에 붙이는** 폴백까지 CSS만으로 처리

**브라우저 지원 (2026-07 기준, caniuse)**: Chrome/Edge **125+**, Safari **26.0+**, Firefox **147+** — 전역 약 **82%**.
3사 엔진 모두 구현을 마쳐 **표준으로 자리잡는 중**이지만, 구버전 사용자가 남아 있으므로
**핵심 레이아웃에 쓰기보단 진행적 향상(progressive enhancement)** 으로 얹는 게 지금 단계의 판단.
Tailwind에는 전용 유틸이 없어 임의 속성(`[anchor-name:--x]`)이나 CSS 파일로 쓴다.

> 이 프로젝트(포트폴리오 1페이지)에는 당장 쓸 자리가 없다. **"툴팁/드롭다운 = 앵커 포지셔닝"** 정도로 이름만 기억해둘 것.

### 3.7 더 볼 것

- MDN `position`: https://developer.mozilla.org/docs/Web/CSS/position
- MDN Containing block(포함 블록): https://developer.mozilla.org/docs/Web/CSS/CSS_display/Containing_block
- MDN `overflow`: https://developer.mozilla.org/docs/Web/CSS/overflow
- MDN CSS 앵커 포지셔닝: https://developer.mozilla.org/docs/Web/CSS/CSS_anchor_positioning
- caniuse — CSS anchor positioning: https://caniuse.com/css-anchor-positioning
- caniuse — `overflow: clip`: https://caniuse.com/mdn-css_properties_overflow_clip
- CSS Overflow 3 §3.1.4 뷰포트 승격 규칙(원문): https://drafts.csswg.org/css-overflow-3/#overflow-propagation
- MDN `overscroll-behavior`: https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior
- MDN `scrollbar-gutter`: https://developer.mozilla.org/docs/Web/CSS/scrollbar-gutter

---

## 4. 스크롤 잠금 (scroll lock) — dim 오버레이 / 모달 패턴

**배경**: §3.5에서 "모달 열 때 `body`에 `overflow: hidden`" 이야기가 나왔다. 이 절은 **그 패턴 자체**를 다룬다 —
정말 쓰이는 패턴인지, 지금도 손으로 쓰는지, 직접 구현하면 어디서 깨지는지.
(sticky와의 관계·`overflow` 승격 원리는 §3.4~3.5. 여기는 **패턴과 실무**.)

### 4.1 정체 — 표준 관용구가 맞다

배경을 어둡게 덮는 레이어(dim/overlay/backdrop) 위에 모달을 띄울 때,
**뒤 페이지가 같이 스크롤되는 걸 막으려고 `<body>`에 `overflow: hidden`을 거는 것**. 이건 검증된 표준 패턴이다.

- **Bootstrap이 대중화**시켰다. 모달을 열면 `<body>`에 `.modal-open` 클래스를 붙이고 그 클래스가 `overflow: hidden`을 걸었다.
  Bootstrap 3~4가 사실상 웹 표준처럼 쓰이던 시기에 이 관용구가 굳었다. (5는 클래스 대신 인라인 스타일, 원리는 동일)
- 딸린 부작용 보정(**스크롤바 폭 15px만큼 `padding-right`**)까지 세트로 알려져 있었다 → 지금은 불필요(4.4).
- **지금도 살아 있다.** 다만 라이브러리 내부로 들어갔다:
  - `body-scroll-lock` — iOS 대응 포함 대표 라이브러리
  - `react-remove-scroll` — **Radix UI / Headless UI / MUI 등이 내부에서 쓰는 것**
  - 즉 Radix `<Dialog>` 하나 쓰면 이 잠금이 자동으로 걸린다.

### 4.2 어디에 쓰이나 — "화면을 덮는 오버레이" 전부

모달만의 것이 아니다.

| 사례 | 메모 |
|---|---|
| **모바일 햄버거 풀스크린 메뉴** | 모달만큼, 혹은 더 흔하다 |
| 오프캔버스 사이드바 / 드로어 | |
| 이미지 라이트박스 (PhotoSwipe 등) | |
| 바텀 시트 (모바일) | |
| 온보딩 투어 / 스포트라이트 오버레이 | |
| 차단형 쿠키 동의, 연령 확인 게이트 | |

> 이 프로젝트에서 마주칠 지점: **Header 모바일 메뉴를 오버레이로 만들 때.**

### 4.3 원리 한 줄

`body { overflow: hidden }`은 **뷰포트로 승격**되어 페이지 스크롤을 멈추고, **`body` 자신은 `visible`로 남는다.**
→ 스크롤 컨테이너가 새로 생기지 않으므로 **안쪽 sticky를 영구히 깨뜨리지 않는다.** (상세 §3.5)
**단, 잠금을 `body`가 아니라 중간 래퍼 div에 걸면 진짜로 깨진다.**

### 4.4 곁들이는 CSS — 예전 해킹을 대체한 것들

| 문제 | 예전 해법 | 지금 해법 |
|---|---|---|
| 스크롤바가 사라지며 콘텐츠가 15~17px 오른쪽으로 **덜컥** 밀림 | JS로 스크롤바 폭 계산 → `body`에 `padding-right` | **`html { scrollbar-gutter: stable }`** — 스크롤바 자리를 늘 비워둬 애초에 안 흔들림 |
| 모달 패널 끝까지 스크롤하면 **뒤 페이지로 전파**(scroll chaining) | 이벤트 `preventDefault` | 패널에 **`overscroll-behavior: contain`** (Tailwind `overscroll-contain`) |
| 배경 요소가 Tab으로 잡힘 | `aria-hidden` + tabindex 조작 | **`inert` 속성** (4.6) |

- `scrollbar-gutter: stable`은 **`html`에** 거는 게 보통이다. `both-edges`로 양쪽 대칭도 가능.
- `overscroll-behavior`는 잠금과 **병행**할 것 — 서로 다른 문제를 막는다.

### 4.5 직접 구현할 때 — 손으로 쓰는 게 여전히 정상이다

오버레이 하나 때문에 헤드리스 UI 라이브러리를 통째로 들이는 건 과한 경우가 많다.
게다가 손으로 쓰기 쉬워졌다: `scrollbar-gutter`가 폭 계산 해킹을 없앴고,
React `useEffect`의 **cleanup이 "닫힐 때 원복"을 구조적으로 보장**해준다(jQuery 시절 최대 버그원이 사라짐).

그리고 선택지가 "직접 구현 vs 무거운 라이브러리" 둘뿐인 게 아니다 — 접근성까지 필요한 **진짜 모달**이라면
네이티브 **`<dialog>` + `showModal()`** 이 가벼운 세 번째 길이다. 배경 `inert` 처리·top layer·Esc 닫기를
**브라우저가 대신 해주므로**, 손으로는 **스크롤 잠금만** 이 절의 방식으로 얹으면 된다.
(단 `<dialog>`는 스크롤 잠금까지는 명세로 보장하지 않는다 → 상세 §4.6.)

**그래도 실제로 무너지는 지점 — 체크리스트**

| 함정 | 내용 |
|---|---|
| **중첩 오버레이** | 모달 위에 또 모달/시트가 뜨면, 안쪽이 닫힐 때 잠금을 풀어 바깥이 열려 있는데 배경이 스크롤된다. **boolean이 아니라 "열린 개수 카운터"** 로 관리해야 한다 — 가장 많이 놓치는 것 |
| **원복 방식** | 닫을 때 `'auto'`/`'visible'` 같은 값을 **박아 넣지 말 것**. 그렇다고 `style.overflow = ''`로 **그냥 지우는 것도 안전하지 않다** — 잠그기 전에 인라인 `overflow`가 이미 있었다면 그 값까지 날아간다. **잠그기 직전 값을 변수에 저장했다가 그 값으로 되돌리는 것**이 정답. (`''`는 "원래 인라인 스타일이 없었을 때"만 우연히 맞다) |
| **모든 닫힘 경로** | 버튼·배경 클릭·Esc·링크 이동·라우트 변경·컴포넌트 언마운트 — **전부에서 풀리나?** (아래 별도 설명) |
| **iOS Safari** | 역사적으로 `body { overflow: hidden }`을 무시해 `position: fixed; top: -{scrollY}px` 기법이 필요했다. 최근 버전은 개선됐지만 **편차가 있어 실기기 확인이 필요한 영역** — 라이브러리를 쓰는 가장 큰 이유 |
| **`position: fixed` 기법의 대가** | body를 흐름에서 빼므로 안쪽 sticky 전제가 무너지고 레이아웃이 흔들린다. 닫을 때 `scrollTo`로 위치 복원 필수 |
| **SSR / 하이드레이션** | 렌더 중 `document`를 만지면 서버에서 터진다. 반드시 effect 안에서 |
| **접근성은 이 표에 없다** | 이 체크리스트는 **"스크롤"만** 다룬다. 스크롤을 막아도 키보드 포커스는 배경으로 샌다 — **포커스 트랩·`inert`·복귀 포커스·Esc는 §4.6을 반드시 같이 볼 것** |

**"닫히는 모든 경로에서 / 언마운트될 때 잠금이 정말 풀리나?" — 두 질문의 답**

- **핵심 구조**: 잠금을 이벤트 핸들러 안에서 직접 걸지 말고, **열림 상태(`isOpen`)에 묶은 `useEffect`의 cleanup**에 원복을 맡긴다.
  `useEffect(() => { 잠금; return () => 원복; }, [isOpen])` 꼴이면 **잠금과 원복이 한 쌍으로 상태를 따라간다.** (아래 예시 코드의 방식)
- **모든 닫힘 경로에서 풀리나?** → 위 구조라면 각 경로(닫기 버튼·배경 클릭·Esc·링크)가 할 일은 **`isOpen`을 `false`로 바꾸는 것 하나뿐**이다.
  상태만 내려가면 effect가 알아서 원복한다. **버그는 상태를 거치지 않고 닫는 경로**(DOM을 직접 만지거나, 상태를 안 내린 채 이동)에서 난다.
- **라우트 이동은 특히 함정**: App Router에서 Header가 레이아웃에 있으면 **페이지를 옮겨도 언마운트되지 않는다.** `isOpen`이 `true`로 남아
  메뉴·잠금이 **화면 전환 뒤에도 살아 있는다.** → `usePathname()` 변화를 감지해 `isOpen`을 내려주는 처리를 따로 넣어야 한다.
- **언마운트될 때는?** → cleanup은 **언마운트 시 자동 실행**되므로 잠긴 채 사라져도 원복이 보장된다. 이게 effect에 묶는 가장 큰 이득.
  반대로 잠금을 effect 밖(핸들러·모듈 스코프)에서 걸면 이 안전망이 사라진다.

> 남는 자가확인 질문: *"오버레이가 두 개 겹치면?"*(→ 중첩 카운터), *"인라인 `overflow`를 원래 갖고 있던 요소였다면 `''`로 지웠을 때 문제없나?"*(→ 원복 방식)

### 4.5.1 예시 코드 — 손으로 쓸 때

> 참고용 뼈대다. 이 프로젝트의 실제 과제(Header 모바일 메뉴)는 이걸 **그대로 붙이는 게 아니라 자기 구조에 맞춰 손으로 옮기는 것**.
> 아래는 "무엇을 어디에 두는가"를 보이는 최소 예시이며, 값·마크업은 필요에 맞게 바꾼다.

**(A) 네이티브 `<dialog>` — 접근성/dim을 브라우저에 맡기는 길**

```html
<button id="open">열기</button>

<dialog id="dlg">
  <h2>제목</h2>
  <p>내용…</p>
  <button id="close">닫기</button>
</dialog>
```

```css
dialog {
  border: none;
  border-radius: 0.75rem;
  padding: 1.5rem;
  /* top layer에 떠서 부모 transform·z-index 영향을 안 받는다 (§4.7) */
}
dialog::backdrop {        /* dim 레이어를 CSS만으로 */
  background: rgb(0 0 0 / 0.6);
}
```

```js
open.onclick  = () => dlg.showModal();  // 배경 inert 처리 + Esc 닫기까지 자동
close.onclick = () => dlg.close();
```

> `showModal()`이 해주지 않는 건 **배경 스크롤 잠금**뿐. 필요하면 아래 (C)를 병행한다.

**(B) 직접 만든 dim 오버레이 + 모달 — HTML/CSS**

```html
<!-- 실제로는 portal로 body 직속에 렌더한다 (§4.7) -->
<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="t">
  <div class="modal">
    <h2 id="t">제목</h2>
    <p>내용…</p>
    <button class="close">닫기</button>
  </div>
</div>
```

```css
html {
  scrollbar-gutter: stable;      /* 열고 닫을 때 스크롤바 폭만큼 덜컥이는 것 방지 */
}

.overlay {
  position: fixed;
  inset: 0;                      /* = top/right/bottom/left: 0 → 화면 전체 */
  display: grid;
  place-items: center;           /* 모달을 화면 정중앙에 */
  background: rgb(0 0 0 / 0.6);  /* dim */
}

.modal {
  max-height: 90vh;
  overflow: auto;                /* 내용이 길면 모달 안에서만 스크롤 */
  overscroll-behavior: contain;  /* 끝까지 스크롤해도 뒤 페이지로 전파 안 됨 */
  border-radius: 0.75rem;
  background: #1a1a1a;
  padding: 1.5rem;
}
```

**(C) 배경 스크롤 잠금 — 손으로 얹는 핵심 부분(JS)**

```js
// isOpen이 바뀔 때만 실행. cleanup이 "모든 닫힘 경로 + 언마운트"에서 원복을 보장한다.
useEffect(() => {
  if (!isOpen) return;

  const prev = document.body.style.overflow;   // ← 잠그기 직전 값을 저장
  document.body.style.overflow = "hidden";      // ← 뷰포트로 승격되어 페이지 스크롤만 멈춤 (§4.3)

  return () => {
    document.body.style.overflow = prev;        // ← ''로 지우지 말고 저장한 값으로 복원 (원복 방식)
  };
}, [isOpen]);
```

- 중첩 오버레이까지 가면 `document.body.style.overflow`를 **boolean이 아니라 열린 개수(카운터)** 로 관리해야 한다(체크리스트).
- Tailwind로 옮길 때: `.overlay` → `fixed inset-0 grid place-items-center bg-black/60`, `.modal` → `max-h-[90vh] overflow-auto overscroll-contain`, `html`의 `scrollbar-gutter`는 `globals.css`에 직접.

### 4.6 스크롤 잠금만으로는 부족하다 — 접근성

배경 스크롤을 막아도 **키보드는 여전히 배경으로 들어간다.** 모달이라면 아래가 세트다.

- **`inert` 속성**: 요소와 그 자손 전체를 포커스·클릭·스크린리더 대상에서 제외. `aria-hidden` + `tabindex="-1"` 수동 조작을 대체.
  - 지원: Chrome/Edge 102+, Safari 15.5+, Firefox 112+ — 전역 약 **93%**. 지금 써도 되는 수준.
- **포커스 트랩**: Tab이 모달 안에서 순환해야 한다.
- **복귀 포커스**: 닫으면 **열기 전 그 버튼으로** 포커스가 돌아가야 한다.
- **Esc로 닫기**, `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- **`<dialog>` + `showModal()`**: 배경 `inert` 처리 + top layer + Esc 닫기를 **브라우저가 해준다.**
  `::backdrop` 의사요소로 dim도 CSS만으로 처리 가능.
  다만 **"배경 스크롤 잠금"까지 명세가 보장하진 않으므로** 브라우저별 확인 후 필요하면 잠금을 병행할 것.

### 4.7 오버레이 배치 함정 — `fixed` + transform + z-index

dim은 보통 `fixed inset-0`, 그 안에서 flex로 모달을 중앙 정렬한다. 여기서 §3.2가 바로 물린다.

- **조상에 `transform`/`filter`가 있으면 `fixed`가 뷰포트가 아니라 그 조상에 갇힌다.**
  **framer-motion으로 감싼 트리 안에 모달을 두면 실제로 밟는다** — 이 프로젝트에 직접 해당.
- 조상이 만든 stacking context 때문에 `z-index`를 아무리 올려도 다른 요소 밑에 깔릴 수 있다(→ §1.6).
- **정석 해법: 포털(`createPortal`)로 `body` 직속에 렌더**한다. 위 두 문제가 동시에 사라진다.
  (`<dialog>`의 top layer도 같은 문제를 해결한다 — 방식이 다를 뿐)

### 4.8 판단 — 직접 vs 라이브러리

| 상황 | 판단 |
|---|---|
| **모바일 메뉴 / 단순 오버레이** | **직접 구현.** effect 몇 줄이면 되고 라이브러리가 과하다 |
| **진짜 모달(폼·확인 다이얼로그)** | 스크롤 잠금보다 **포커스 트랩·inert·Esc·복귀 포커스**가 훨씬 번거롭다 → Radix / `<dialog>` 쪽 |
| **iOS 이슈가 실제로 재현됨** | 라이브러리(`react-remove-scroll` 등)로 갈아탈 신호 |

> 이 프로젝트(Header 모바일 메뉴) 기준으로는 **직접 구현이 맞는 규모**다.

### 4.9 더 볼 것

- CSS-Tricks — Prevent Page Scrolling When a Modal is Open: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
- MDN `overscroll-behavior`: https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior
- MDN `scrollbar-gutter`: https://developer.mozilla.org/docs/Web/CSS/scrollbar-gutter
- MDN `inert`: https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/inert
- MDN `<dialog>` / `::backdrop`: https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dialog
- WAI-ARIA APG — Dialog (Modal) 패턴: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- `react-remove-scroll`: https://github.com/theKashey/react-remove-scroll

---

## 5. 글자 색 와이프 — `background-clip: text`로 하이라이트 쓸기

**배경**: Approach 메인 카피 "나는 **융합형** 개발을 지향합니다"에서, 스크롤 진행에 맞춰 "융합형"에 액센트 색이 **왼→오로 쓸고 지나가는** 하이라이트를 넣기로 함(`SECTION_APPROACH_PLAN.md` §3.3). 확정: **방향 왼→오 / 색 강조는 메인 카피 "융합형"에만**(원 라벨은 opacity만). 처음엔 `color`를 스크롤로 보간했는데 **"글자가 확 변하는"** 문제가 나와, 그 원인과 대안을 정리한다.

### 5.1 왜 단순 `color` 보간이 "확 변"하나

두 가지가 겹친다.

1. **framer-motion의 색 보간은 실제 색 값(hex/rgb/hsl)만 해석한다.** `useTransform(p, [0,1], { color: ['#fff', 'var(--color-accent)'] })`처럼 endpoint에 **`var(--color-accent)`(CSS 변수 문자열)**를 주면, framer-motion이 그걸 **색으로 파싱하지 못해** 부드럽게 못 섞고 **툭 끊긴다.** (색 방식을 유지하려면 endpoint를 `var()`가 아니라 실제 색 값으로 줘야 한다.) — 색을 스크롤 값에 매다는 것 자체는 "값 구동"이며, 그 개념·주의는 `FRAMER_MOTION_GUIDE.md` §3.1(선언형 vs 값 구동) 참고.
2. 설령 보간되더라도, **단어 전체가 한꺼번에** 흰색→accent로 크로스페이드되는 건 "왼→오로 쓸고 지나가는" 하이라이트가 아니다. 전체 크로스페이드는 **끝에서 확 바뀐 것처럼** 보이기 쉽다.

→ 그래서 단순 `color`가 아니라 **`background`(그래디언트) 계열**로 가는 게 맞다.

### 5.2 원리 — 그래디언트를 글자 모양으로 오려 위치를 옮긴다

1. 글자에 **그래디언트 배경**을 깐다 — 왼쪽 accent, 오른쪽 기본색, **딱 떨어지는 하드 스톱** 하나.
2. 그 배경을 **글자 모양으로 오린다**: `background-clip: text` + 글자 자체는 투명(`color: transparent` 또는 `-webkit-text-fill-color: transparent`).
3. 스크롤 진행도에 맞춰 **스톱 위치(또는 `background-position`)를 이동**시키면 accent가 글자들을 **왼→오로 쓸고 지나간다.** 픽셀 단위로 흘러 부드럽고, 방향성이 있어 플랜 의도와 맞는다.

### 5.3 핵심 CSS

```css
/* 두 줄 다 넣는 게 관행 (접두사 + 표준) */
-webkit-background-clip: text;
background-clip: text;
color: transparent;                 /* 또는 -webkit-text-fill-color: transparent */

/* 왼쪽 accent, 오른쪽 기본색, 경계는 --wipe 위치의 하드 스톱 */
background-image: linear-gradient(
  to right,
  var(--color-accent) var(--wipe),
  var(--color-primary) var(--wipe)
);
```

- `--wipe`(0%→100%)가 곧 "어디까지 accent로 칠해졌나"다. `--wipe`가 커질수록 accent 경계가 오른쪽으로 이동 = 왼→오 쓸기.
- 색은 **CSS가 `var()`로 직접** 칠한다 → framer-motion이 색을 보간할 일이 없어 5.1-①의 파싱 문제를 **원천 회피**한다.

### 5.4 framer-motion으로 구동 (스크롤 → `--wipe`)

- 움직이는 건 **색이 아니라 위치(퍼센트)뿐**이다. `useTransform`으로 스크롤 진행도를 `--wipe`(예: `['0%','100%']`)에 매핑. (`useScroll`/`useTransform` 기본은 `FRAMER_MOTION_GUIDE.md` §3, 스크롤 거리 확보·sticky는 `SCROLL_MERGE_GUIDE.md`.)
- framer-motion은 MotionValue를 **CSS 변수로도** 넘길 수 있다: `style={{ ['--wipe']: wipeMV }}`. 그러면 매 프레임 CSS 변수만 갱신되고, 칠은 CSS가 한다.
- 이 프로젝트는 병합 진행이 **한 방향(latched, 되감김 없음)**이므로(`SECTION_APPROACH_PLAN.md` §3.2), 와이프도 그 latched 진행도에 물리면 올라갈 때 되돌아가지 않는다. (latched를 왜/어떻게 쓰는지의 배경·A/B 트레이드오프는 `STICKY_SESSION_NOTE.md`의 "A vs B(스크롤 되감김)" 절.)

> `background-position`을 옮기는 변형(그래디언트를 하드 스톱으로 만들고 `background-size: 200%` + `background-position` 이동)도 결과는 같다. 커스텀 속성(`--wipe`) 방식이 "얼마나 칠해졌나"를 값으로 직접 다뤄 더 읽기 쉽다.

### 5.5 브라우저 지원 (2026-07 확인)

- **`-webkit-background-clip: text`는 2015년경부터 전 브라우저에서 동작**하는 널리 쓰인 기법. 접두사 없는 `background-clip: text`도 **Chrome 120+ / Firefox 49+ / Safari 15.5+**에서 된다.
- **관행: `-webkit-`과 표준 두 줄을 함께** 넣는다.
- "Baseline 완전 확립(widely available)"으로는 아직 표시되지 않으나, 이는 Firefox의 세부 사항 때문일 뿐 **실사용상 사실상 보편적**이다. 이 프로젝트 타깃엔 안전.

**피할 것(너무 최신)**
- **순수 CSS 스크롤 구동 `animation-timeline: scroll()`**: 아직 지원이 좁다(Firefox/Safari 정식 미지원). 스크롤은 framer-motion이 몰고 `--wipe`만 움직이면 되므로 필요 없음.
- **`@property`**(타입 지정 커스텀 속성 애니메이션): 순수 CSS로 `--wipe`를 트랜지션/애니메이트할 때나 필요. framer-motion 구동이면 없어도 된다.

### 5.6 접근성 / reduced-motion

- 하이라이트는 **장식**이다. 색 대비만으로 의미를 전달하지 않도록, "융합형"의 의미는 텍스트 자체로 이미 완결돼 있어야 한다(색이 안 칠해져도 읽힘). (색만으로 의미 전달 금지 = WCAG 1.4.1 → `A11Y_CHECKLIST.md`.)
- `prefers-reduced-motion`이면 와이프를 끄고 **처음부터 accent로 칠해진 최종 상태**로 렌더(플랜 §3 "접근성/모션 최소화"의 "정지 최종형"과 동일 원칙 → `SECTION_APPROACH_PLAN.md` §3). reduced-motion 가드 패턴은 `FRAMER_MOTION_GUIDE.md` §5.3.
- `color: transparent`로 두는 만큼, 폴백(구형 브라우저에서 `background-clip: text` 미지원 시 글자가 안 보이는 사고)을 주의 — 미지원 감지 시 일반 색으로 보이도록 안전장치를 고려.

### 5.7 대안 — 전체 색이 "균일하게" 바뀌길 원하면 (공간 와이프 아님): `color-mix`

§5.1~5.6은 **공간(영역) 와이프**다 — 글자의 *위치*에 따라 색이 갈리고 그 경계가 왼→오 이동. 그런데 **단어 전체가 위치와 무관하게 흰색→accent로 "균일하게" 서서히** 바뀌길 원한다면, 이건 **다른 효과**이고 `background-clip`/그래디언트가 **필요 없다**. `color` 하나만 보간하면 된다.

**A. framer-motion이 `color`를 직접 보간 (hex)**
```
useTransform(scrollYProgress, [start, end], ['#ffffff', '#6366f1'])  // → style={{ color: 결과 }}
```
- 제일 단순, `color`는 정상 style 키라 **cast 불필요**. ❌ 색 하드코딩(토큰 규칙 위반), `var()`는 보간 불가라 실제 hex 필요.

**B. CSS `color-mix()` + 숫자 `--mix` 구동 (토큰 유지) — 권장**
```css
color: color-mix(in srgb,
  var(--color-primary),
  var(--color-accent) calc(var(--mix) * 100%)
);
```
- framer-motion은 **숫자 `--mix`(0→1)만** 구동(`useTransform(p, [start,end], [0,1])` → `style`의 `--mix`), 색 섞기는 CSS가.
- `--mix` **0 → primary(흰색)**, **1 → accent**, 중간 → 그 사이 색.
- ✅ 토큰 유지 + framer-motion이 **숫자만** 굴려 §5.1의 `var()` 색 보간 문제 원천 회피 + clip/gradient 불필요로 단순. (§5.4의 "MotionValue를 CSS 변수로" 패턴 그대로, `%`→숫자.)
- 커스텀 속성 `--mix`도 style 타입 **cast 필요**(§5.4 · `CODE_REVIEW_LOG.md` 2026-08-05).
- **지원**: `color-mix()` **Baseline Widely Available**(2023~, 전역 ~93%, 2색 혼합은 전 브라우저).

**선택 기준**: 경계가 쓸고 지나가는 **방향성** 연출이면 §5.2~(공간 와이프), 그냥 **전체 색이 서서히** 바뀌면 여기(B). 후자로 가면 §5.2~5.6의 `background-clip`·gradient·`transparent`·`--wipe`는 **제거 대상**.

### 5.8 더 볼 것

- MDN `background-clip`: https://developer.mozilla.org/docs/Web/CSS/background-clip
- Can I use — `background-clip: text`: https://caniuse.com/background-clip-text
- Web platform features explorer — background-clip: text: https://web-platform-dx.github.io/web-features-explorer/features/background-clip-text/
- MDN `-webkit-text-fill-color`: https://developer.mozilla.org/docs/Web/CSS/-webkit-text-fill-color
- MDN `@property`(개념만): https://developer.mozilla.org/docs/Web/CSS/@property
- MDN `color-mix()`(§5.7): https://developer.mozilla.org/docs/Web/CSS/color_value/color-mix
- Can I use — `color-mix()`(§5.7): https://caniuse.com/mdn-css_types_color_color-mix

**프로젝트 내부 교차 링크**

- **스펙(무엇을 언제)**: `SECTION_APPROACH_PLAN.md` §3(항목 3 "완료 시점" = 융합형 하이라이트, 항목 2 = 한 방향 latched 진행, "접근성/모션 최소화")
- **구동 개념**: `FRAMER_MOTION_GUIDE.md` §3(`useScroll`/`useTransform`) · §3.1(선언형 vs 값 구동 — 색 보간이 왜 값 구동인지) · §5.3(reduced-motion 가드)
- **스크롤 거리/sticky**: `SCROLL_MERGE_GUIDE.md`
- **latched(되감김 없음) 배경·A/B**: `STICKY_SESSION_NOTE.md` "A vs B(스크롤 되감김)" 절
- **접근성(색만으로 의미 전달 금지 등)**: `A11Y_CHECKLIST.md`
