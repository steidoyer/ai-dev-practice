# 프로젝트 플레이북 — 개발자 포트폴리오 랜딩

> 이 파일은 계획·의사결정·진행 상황을 남기는 기록이다. (코드의 원본은 git, 규칙은 CLAUDE.md.)
> 프롬프트는 "전부 복원용"이 아니라 **재사용·학습할 만한 표현만** 골라 §7에 모은다.

---

## 1. 목표

AI(Claude Code) + Figma MCP로 개발자 포트폴리오 1페이지 랜딩 사이트를 만든다.
인터랙션이 있는 포트폴리오. 다크 모던 / 미니멀.

## 2. 스택

Node.js v22+ · Next.js 16 (App Router) · Tailwind CSS v4 · framer-motion v12 · React 19 · TypeScript

## 3. 의사결정 기록

- **애플 클론 방식 폐기 → 기법 차용**: 애플 페이지를 그대로 베끼지 않고, 난이도 낮은 애플 페이지의 인터랙션 기법만 가져와 새 페이지 구성.
- **GSAP → framer-motion**: React 기반이라 framer-motion이 더 적합하다고 판단.
- **반응형 데스크탑 우선**: 모바일/태블릿은 별도 단계로 미룸.
- **Tailwind v4 토큰**: 시맨틱 토큰은 `@theme`에 넣어 유틸리티 자동 생성. `:root`는 순수 참조값이 필요할 때만.
- **@theme vs @theme inline**: 정적 값(색상·spacing 등)은 `@theme`, next/font 주입 변수처럼 외부에서 오는 값은 `@theme inline`에서 `var()` 참조. 이유는 변수 해석 스코프 — non-inline은 `:root`에서 값을 해석해서 다른 요소에 주입된 변수를 못 찾을 수 있고, inline은 유틸리티가 적용된 요소에서 해석됨. (상세: docs/DEV_QNA.md Q6)
- **Noto Sans KR**: `next/font/google`으로 로드 (`variable: --font-noto-sans-kr`, subsets: latin, weight: 400+700). `--font-korean`은 `@theme inline`에서 참조.
  - 주의: `subsets`에 `"korean"`은 넣지 않는다. next/font 타입이 `cyrillic | latin | latin-ext | vietnamese`만 허용해 `"korean"`은 타입 에러(빌드 실패). 한글 글리프는 폰트 자체에 포함되므로 subset 지정 없이도 렌더된다. (5단계 작업 중 `next build` 타입체크에서 처음 드러나 수정)
- **섹션 id 네이밍**: Header 앵커 링크 기준으로 통일. `#skills`(Skills 탭), `#projects`(Work 탭), `#hero`, `#contact`(Contact 탭). 컴포넌트 파일명도 일치시킴(Tech.tsx → Skills.tsx).
- **프로젝트 성격 재정의**: 실제 포트폴리오로 쓰려는 게 아니라 **AI 도구(Claude Code + Figma MCP) 활용 개발을 연습**하는 게 목적이고, 만드는 콘텐츠가 마침 포트폴리오 랜딩일 뿐. 저장소명 **`ai-dev-practice`**, README를 이 취지로 갱신.
- **다음 챕터 = 직접 코딩 + AI 멘토 모드**: 개발 실력 향상을 위해 이후엔 개발자가 **직접 손코딩**하고, AI는 코드를 작성/수정하지 않는 **리뷰어·멘토** 역할만 한다(설명·유도·문서화, 직접 수정지시 X). 상세 계획: **docs/NEXT_ROADMAP.md**.
- **저장소 전략**: repo 2개 대신 **1개 repo + 새 폴더에 `git clone`**으로 작업본 확보(원본 폴더는 baseline). 필요 시 현재 시점에 `ai-only` 태그. GitHub 업로드·커밋은 개발자가 직접 진행(작성 시점 기준 **아직 커밋/원격 없음** — 전부 uncommitted).

## 4. 로드맵 (진행 상황)

- [x] 0. 환경 세팅 — create-next-app (TS/Tailwind v4/App Router) + framer-motion 설치
- [x] 1. Figma 디자인 확정 (프롬프트 2개, 아래 6번)
- [x] 2. 디자인 토큰 추출 → globals.css `@theme` + Noto Sans KR 폰트 추가
- [x] 3. 정적 레이아웃 컴포넌트
  - [x] Header (`src/components/layout/Header.tsx`) — 앵커 네비
  - [x] Footer (`src/components/layout/Footer.tsx`) — 카피라이트 + 소셜 링크 자리
  - [x] Hero (`src/components/sections/Hero.tsx`) — id="hero", min-h-screen
  - [x] Projects (`src/components/sections/Projects.tsx`) — id="projects", 3열 카드
  - [x] Skills (`src/components/sections/Skills.tsx`) — id="skills", 3열 카테고리
  - [x] CTA (`src/components/sections/CTA.tsx`) — id="contact", 이메일/소셜/버튼 (mailto)
- [x] 4. 페이지 조립
  - [x] layout.tsx — Header / Footer 배치 완료
  - [x] page.tsx — Hero / Projects / Skills / CTA 배치 완료
  - [x] scroll-behavior: smooth + `section[id]` scroll-margin-top(--spacing-block, 헤더 높이 5rem) + prefers-reduced-motion 가드
- [x] 5. 인터랙션/애니메이션 (framer-motion으로 애플 기법 이식)
  - [x] 재사용 래퍼 `src/components/motion/FadeIn.tsx` — 스크롤 진입 시 아래→위 페이드인(whileInView, once, margin -80px), `useReducedMotion` 가드
  - [x] Projects / Skills / CTA 주요 블록에 FadeIn 적용 (섹션은 서버 컴포넌트 유지, 카드·컬럼은 `delay={i*0.1}` 순차)
  - [x] Hero 진입 stagger — `"use client"` + variants + staggerChildren(0.15)/delayChildren(0.1), `initial/animate`(로드 즉시), 이름→소개→화살표 순서
  - [x] Projects 카드 hover — 카드만 `src/components/sections/ProjectCard.tsx`로 분리(`"use client"`)해 섹션은 서버 컴포넌트 유지. 카드 전체를 `motion.a`로 감싸(접근성) `whileHover` y:-8/scale:1.02, variants "hover"를 이미지에 전파해 이미지 scale 1.05(부모 hover 하나로 동기화, `overflow-hidden`으로 클립), duration 0.3 easeOut, `useReducedMotion` 가드
  - [x] Hero 스크롤 화살표 반복 바운스 — 화살표 컨테이너를 `motion.a`(href="#projects", 부드러운 스크롤 onClick)로, 바운스는 내부 `motion.svg`에 `animate={{y:[0,8,0]}}`/repeat Infinity·duration 1.5·easeInOut. 등장 stagger(컨테이너)와 바운스(svg)를 요소 분리로 독립, `useReducedMotion` 가드
- [x] 6. 반응형 (모바일 우선으로 리팩터링)
  - **접근**: 모바일 우선 — 기본=모바일, `md`(768)/`lg`(1024)로 확장. 브레이크포인트 모바일/태블릿(md)/데스크탑(lg).
  - [x] 공통 컨테이너 `@utility container-page`(globals.css) — `mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8`. 기존 `px-layout`(고정 120px)을 전 섹션·Header·Footer에서 이걸로 교체해 폭/패딩 통일. (`@utility` 안 `@apply`에 반응형 변형 `md:`/`lg:` 사용 가능함을 build로 확인)
  - [x] Header 반응형 — `"use client"` + `useState` 토글. md+ 가로 네비(`hidden md:block`), md 미만 햄버거 버튼(`md:hidden`, FiMenu/FiX). 드롭다운은 `AnimatePresence`+`motion.nav` height/opacity 슬라이드(0.25s), 앵커/로고 클릭 시 `close()`로 자동 닫힘, `aria-expanded`/`aria-controls`, `useReducedMotion` 시 페이드만.
    - 네비 전환점을 `md`로 둔 이유: 링크 3개(Work/Skills/Contact)가 768px에서 여유 있게 들어가 태블릿에 햄버거는 과함. 엄격히 태블릿도 햄버거 원하면 `md:`→`lg:` 한 곳만 바꾸면 됨.
  - [x] Footer 반응형 구조 — 배경/보더는 전체폭 유지, 내부 래퍼 div에 `container-page` 적용.
  - [x] 섹션 내부 반응형
    - Hero: 이름 `text-5xl md:text-7xl lg:text-hero`, 서브타이틀 `text-xl md:text-subtitle`(whitespace-nowrap 제거), 소개문 `w-[37.5rem]`→`w-full max-w-[37.5rem]`, 상단 여백 `pt-32 md:pt-[15rem]`. min-h-screen 유지(상단 정렬+하단 화살표 의도 유지).
    - Projects: 카드 컨테이너 `flex`→`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, FadeIn 래퍼 `flex flex-1`→`flex`, ProjectCard에 `w-full`(그리드 셀 채움).
    - Skills: 카테고리 컨테이너 `flex gap-block`→`grid grid-cols-1 gap-group md:grid-cols-3 md:gap-block`(모바일 세로 스택). 아이콘/텍스트 크기는 이미 모바일 적정이라 유지.
    - CTA: 제목 `text-4xl md:text-display`, 이메일 칩 `px-6 py-4 md:px-12 md:py-5`+`text-base md:text-lg break-all`, 버튼 `py-4 md:py-5`, 소셜 링크 `min-h-11`(44px 터치 타깃)+`flex-wrap`. 액션은 원래 `flex-col`이라 세로 스택 유지.
    - 공통: 고정폭 `w-[37.5rem]`만 max-w로 완화, 나머지 px 하드코딩은 모바일 오버플로 없음 확인. hover/애니메이션은 그대로 — 카드 hover는 `<a>`라 터치 시 탭 내비게이션이 우선해 stuck hover 없음.
- [~] 7. 마무리 (접근성·SEO·성능·이미지 최적화)
  - [x] SEO 메타데이터 — `layout.tsx`에 Metadata API 적용(title/description/openGraph/twitter, `metadataBase`, `SITE` 상수+TODO), `lang="en"`→`"ko"`. 시맨틱 점검(main 1개/section/h1→h2→h3) 이상 없음. (개념: DEV_QNA Q12~Q14)
  - [x] 접근성(a11y) — 전역 `:focus-visible` 포커스 링(accent 토큰), Hero 스크롤 `scrollIntoView`가 `prefers-reduced-motion` 존중(smooth↔auto 분기), 색 대비 점검 후 `--color-muted` `#666`→`#808080`(AA 5:1). alt/aria-label/헤딩계층/햄버거 상태속성/컴포넌트 reduced-motion은 이미 충족. 기준 정리: **docs/A11Y_CHECKLIST.md**
  - [x] 이미지 최적화 — 실제 래스터 이미지는 아직 없음. `ProjectCard`에 `next/image` 패턴 셋업(`image` 있으면 `fill`+`sizes`, 없으면 SVG 플레이스홀더, CLS 방지용 `h-40` 고정, above-the-fold만 `priority`). `next.config.ts`에 `images.remotePatterns` 스캐폴드(주석 템플릿). `public/` 미사용 기본 SVG 5개 제거. CLAUDE.md에 이미지 컨벤션 추가.
  - [ ] OG 이미지 실물 — 보류(정적 PNG or `opengraph-image.tsx`. 개념: DEV_QNA Q13~Q14)
  - [~] 성능 — 이 프로젝트엔 대부분 미적용(정적·소규모). 제안 체크리스트를 **docs/PERFORMANCE_NOTES.md**에 저장(다음 단계용).
- [ ] 8. 배포 (Vercel)
- [~] 9. 저장소 정리 & 공개 — 저장소명 `ai-dev-practice` 확정, README를 AI 연습 취지로 재작성. **GitHub 업로드(커밋/원격/push)는 개발자가 직접 진행 예정**(현재 미완).
- [ ] 10. (다음 챕터) clone 후 직접 코딩 — 새 폴더 clone → 사전 정비(Tailwind 클래스명 등) → 새 섹션 2개 직접 제작 → 마무리 → OG 이미지 → 성능·배포. AI는 멘토 역할. **상세 로드맵: docs/NEXT_ROADMAP.md**

## 5. 진행 방식

두 방식을 같은 저장소에서 이어간다. **아래는 지금까지의 "AI 완전 코딩" 방식이다.**

- **AI 완전 코딩(지금까지)**: Claude 앱이 단계를 잡고 → 단계마다 완료 확인 → 다음 단계. 한 번에 하나씩, 중간 질문 허용. 실제 코드·문서는 Claude Code가 작성.
- **AI 서포트 + 직접 코딩(이후)**: 개발자가 직접 손코딩하고, AI는 코드를 작성하지 않는 **리뷰어·멘토**로만(설명·유도·리뷰). 상세 규칙·단계: **docs/NEXT_ROADMAP.md**.
- 두 방식의 경계는 git 태그 **`ai-only`**(AI 단독 개발의 마지막 시점)로 구분한다.

> 아래 §6·§7의 프롬프트 모음은 **모두 "AI 완전 코딩" 단계에서 사용한 것**이다. 이후(직접 코딩) 단계에선 프롬프트로 코드를 시키지 않으므로 이런 형태의 기록은 늘지 않는다.

## 6. Figma 요청 프롬프트 (대표 샘플)

디자인 생성 요청의 요지.

- **1차(전체 틀)**: "개발자 포트폴리오 1페이지 랜딩. 섹션 Hero→Projects(카드)→Skills→CTA. 다크 모던·미니멀."
- **2차(섹션별 구체화)**: 각 섹션 구성 요소를 `[Hero] 이름·한 줄 소개·스크롤 화살표` 식 **대괄호 라벨 + 항목**으로 지정.

→ 요령: 1차로 **전체 구조**를 잡고 2차로 **섹션별 요소를 라벨링**해 좁히면 의도가 정확히 반영된다.

## 7. Claude Code 프롬프트 모음 (대표 샘플 · 재사용/학습용)

> **다시 쓰거나 배울 만한 요청 표현** 모음
> (코드=git 원본, "왜"=§3, 결과=§4, 개념=DEV_QNA.)

**디자인 토큰 추출** — "Figma를 MCP로 분석해 토큰 추출 → `globals.css @theme`에 `--color-*`·`--font-*`·`--spacing-*`·`--radius-*`, 변수명은 시맨틱하게."
→ 결과물의 **저장 위치·네이밍 규칙을 못 박으면** 바로 쓸 형태로 나온다.

**섹션 컴포넌트 생성** (Header/Footer·Projects·Skills·CTA 공통 템플릿) — "이 섹션 만들어줘: 경로 지정 / TS + Tailwind v4 `@theme` 토큰만(색 하드코딩 금지) / 반복 데이터는 배열+map / 정적이면 `"use client"` 생략 / `<section>`에 앵커 `id`."
→ **공통 제약을 한 번 정하고 "나머지는 위와 동일"로 상속**하면 섹션마다 일관됨.

**인터랙션 추가** (예: 카드 hover) — "카드만 클라이언트 컴포넌트로 분리(섹션은 서버 유지) / `whileHover` y·scale / 기존 등장 애니메이션과 충돌 금지 / 토큰만."
→ **"어디까지 클라이언트로 쪼갤지 + 기존 것과 충돌 금지"**를 명시하는 게 핵심.

### (6단계 이후) 재사용할 만한 요청 패턴

> 이후 작업들의 요청을 표현 위주로 압축한 것(원문 아님). 배울 점 = 화살표(→) 뒤.

- **반응형 모바일 우선 리팩터링**: "데스크탑 기준으로 짠 걸 **모바일 우선으로 리팩터링**해줘. 기본=모바일, `md`(768)/`lg`(1024)로 확장, 브레이크포인트·컨테이너 규칙은 CLAUDE.md 기준." → **기준 문서를 근거로 대라**고 명시하면 결과가 일관됨.
- **SEO 메타데이터**: "Next.js 16 App Router **Metadata API**로 title/description/openGraph/twitter 정리. 실제 값은 `SITE` 상수+TODO, 도메인·이미지 경로는 placeholder." → **placeholder+TODO로 뼈대만** 만들게 하는 표현이 유용.
- **접근성 점검·보완**: "접근성 점검하고 보완해줘. **기존 디자인/토큰은 유지하고 접근성 속성 위주로만.** 대비 부족하면 토큰 조정은 제안만." → **범위를 좁히는 제약("X만, 기존 Y 유지")**이 과한 변경을 막음.
- **이미지 최적화**: "`<img>`→`next/image`로. `fill`+`sizes`로 CLS 방지, above-the-fold만 `priority`, 외부 도메인은 remotePatterns." → 실제 이미지가 없을 땐 **"패턴만 셋업"**으로 지시하면 나중에 자동 최적화되게 준비됨.

> 그 밖의 잔작업(Footer 오버플로 수정, 색 대비 조절, 저장소 전략·이름 교체 등)과 개념 질문은 여기 남기지 않는다 — 결과는 §4, 결정은 §3, 개념은 DEV_QNA로 충분.

## 8. 5단계 인터랙션 후보 (framer-motion, 애플 기법 차용)

- [x] 스크롤 시 섹션 페이드·업 등장 (whileInView) — FadeIn
- [x] Hero 텍스트 순차 등장 (stagger)
- [x] 프로젝트 카드 hover 확대 — ProjectCard
- [x] 스크롤 유도 화살표 반복 바운스 — Hero
- [ ] 가벼운 sticky / 패럴럭스 (미착수, 필요 시 6단계 이후 검토)
      → 컴포넌트별로 하나씩 붙인다. (이 단계 진입 시 세부 프롬프트 별도 작성)

**적용 방식 결정**: 공통 등장 애니메이션은 재사용 래퍼(`src/components/motion/FadeIn.tsx` 등, 얇은 클라이언트 컴포넌트)를 기본으로 쓰고, Hero stagger처럼 1회성 특수 효과는 해당 컴포넌트에 직접 넣는 혼합 방식. 래퍼로 감싸면 섹션은 서버 컴포넌트로 유지됨(RSC children 전달 원리). 접근성은 `useReducedMotion`을 래퍼 한 곳에서 처리. (상세 비교·근거: docs/DEV_QNA.md Q11)

## 9. 작업·기록 보존 체크리스트

> 세션이나 작업 폴더(새 폴더 clone 등)가 바뀌어도 작업 내용과 결정 기록이 흩어지거나 사라지지 않게 하는 습관. (대화에만 남기면 유실되기 쉽다.)

- [ ] CLAUDE.md를 프로젝트 루트에 두고 결정 바뀔 때마다 갱신 (`/init`로 뼈대 생성 가능)
- [ ] 단계 끝날 때마다 git commit — 코드·CLAUDE.md·이 파일 모두 히스토리로 보존
- [ ] 계획/결정은 이 파일에 기록 (대화에만 남기지 않기)
- [ ] (Claude 앱을 함께 쓰는 경우) 이 프로젝트 대화는 Claude 앱의 Projects 기능으로 묶기
- [ ] 대화 삭제 전 중요한 프롬프트는 복사 백업
