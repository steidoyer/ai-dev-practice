# ai-dev-practice — Project Memory

Claude Code가 세션 시작 시 자동으로 읽는 파일. 규칙과 영구 컨텍스트만 담는다.
(진행 로그·의사결정·프롬프트는 `docs/PROJECT_PLAYBOOK.md`, clone 이후 직접 코딩 계획·AI 멘토 규칙은 `docs/NEXT_ROADMAP.md`,
기술 사용법 가이드는 `docs/FRAMER_MOTION_GUIDE.md`·`docs/TYPESCRIPT_GUIDE.md`·`docs/NEXTJS_GUIDE.md`, 개념 Q&A는 `docs/DEV_QNA.md`, 접근성은 `docs/A11Y_CHECKLIST.md` 참고.)

## 개발 프로세스
두 가지 개발 방식을 **같은 저장소에서** 이어간다. AI 제안이라도 반드시 개발자 확인 후 반영(자동 승인 없음).
- **AI 완전 코딩(지금까지)**: 코드·문서를 Claude Code(Claude 앱 포함) AI가 작성하고, 개발자가 검수·승인.
  CLAUDE.md·PROJECT_PLAYBOOK.md 등 문서도 동일.
- **AI 서포트 + 직접 코딩(이후)**: 개발 실력 향상을 위해 개발자가 **직접 손코딩**하고,
  AI는 **코드를 작성/수정하지 않는 리뷰어·멘토** 역할만 한다 — 개념 설명·문서화·질문 유도만 하고
  정답 코드나 직접 수정 지시는 하지 않는다. **개발자가 직접 코딩하는 단계(주로 새 폴더 clone 이후)에 들어가면
  이 규칙을 따를 것.** (상세: `docs/NEXT_ROADMAP.md`)
- **`ai-only` 태그**: AI가 단독 개발한 마지막 시점을 git 태그 `ai-only`로 표시. 이후 커밋이 사람이 직접 코딩한 부분.

## 개요
- **목적: AI 도구(Claude Code + Figma MCP + Claude 앱) 활용 개발을 연습·공부하는 프로젝트.** 저장소명 `ai-dev-practice`.
- 만드는 페이지는 "개발자 포트폴리오 1페이지 랜딩"이지만, 실제 포트폴리오 용도가 아니라 **AI 개발 연습의 소재**다.
- 섹션 순서: Hero → Projects → Skills → CTA(연락처). 스타일: 다크 모던 / 미니멀, 인터랙션 포함.
- 브랜드명 `DEV STUDIO`, 도메인/이메일 `example.dev`는 **플레이스홀더**(실명·실주소 아님).
- 계획/대화는 Claude 앱, 코드 작성은 Claude Code, 디자인은 Figma(MCP 연결).

## 스택
개발 시점 기준 실제 사용 버전 (정확한 잠금 버전은 `package.json` / `package-lock.json` 참고):
- Node.js v22.15.0
- Next.js 16.2.9 (App Router)
- React / React DOM 19.2.4
- Tailwind CSS 4.3.1
- framer-motion 12.42.0
- react-icons 5.7.0
- TypeScript 5.9.3

## 핵심 결정 (변경 시 여기 갱신)
- 애플 페이지를 그대로 클론하지 않는다. 난이도 낮은 애플 페이지의 인터랙션 "기법"만 차용해 새 페이지를 구성한다.
- React 기반이므로 애니메이션은 GSAP 대신 framer-motion을 쓴다.
- 반응형은 **모바일 우선**으로 정리한다. 기본 스타일 = 모바일, `md:`/`lg:`로 데스크탑 확장.
  브레이크포인트: 모바일(기본) / 태블릿 `md`(768px) / 데스크탑 `lg`(1024px+).
  (초기엔 데스크탑 기준이었고, 이후 모바일 우선으로 리팩터링 완료.)

## 규칙 / 컨벤션
- 컴포넌트 경로:
  - 레이아웃: `src/components/layout/` (Header, Footer)
  - 섹션: `src/components/sections/` (Hero, Projects, Skills, CTA)
- 색상·폰트·spacing·radius 등 디자인 토큰은 `src/app/globals.css`의 `@theme` 블록에 정의하고,
  컴포넌트에서는 토큰만 사용한다. **색상값 하드코딩 금지.**
- `"use client"`는 인터랙션이 필요한 컴포넌트에만 붙인다. 정적 컴포넌트에는 생략.
- 아이콘은 `react-icons`를 쓴다. 브랜드 로고는 Simple Icons `react-icons/si`(없으면 `react-icons/fa`),
  일반 UI 아이콘(mail, arrow 등)은 Feather `react-icons/fi`. 아이콘명은 실제 존재 여부를 먼저 검증한다.
  아이콘 색은 하드코딩하지 말고 부모에 `text-*` 토큰을 주고 `currentColor`로 상속받게 한다.
- 래스터 이미지(png/jpg 등)는 `<img>` 대신 **`next/image`의 `<Image>`**를 쓴다. `width/height` 또는
  `fill` + `sizes`로 CLS를 방지하고, 첫 화면(above the fold) 이미지에만 `priority`(나머지는 lazy 기본).
  외부 도메인 이미지는 `next.config.ts`의 `images.remotePatterns`에 호스트를 등록한다.
  (아이콘·간단한 그래픽은 지금처럼 인라인 SVG 유지 — 최적화 대상 아님.)
- 각 섹션 `<section>`에 앵커 id 부여: `#hero`, `#projects`, `#skills`, `#contact`.
  (Header 네비 앵커와 id 이름을 항상 일치시킬 것)
- 반복 데이터(프로젝트 카드, 기술 스택 등)는 배열로 분리해 map 렌더링.
- 좌우 패딩·중앙 정렬은 공통 컨테이너 유틸리티 `container-page`(globals.css `@utility`)로 통일한다.
  (`mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8`) 섹션엔 직접, 배경/보더가 전체폭인 Header·Footer는
  내부 래퍼 div에 적용. 개별 `px-*` 하드코딩 금지 — 폭/패딩 바꿀 땐 이 유틸 한 곳만 수정.

## 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 린트: `npm run lint`
