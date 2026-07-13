# ai-dev-practice

**AI 도구를 활용한 개발을 연습·공부하는 프로젝트.**
Claude Code + Claude 앱 + Figma MCP로 페이지를 만들며 AI 활용 워크플로를 익히고 AI를 서포터로 활용하여 개발 실력을 높이는 것이 목적.
만드는 페이지는 개발자 포트폴리오 랜딩 페이지로 그 자체로 포트폴리오로 쓰려는 것이 아닌
**AI 개발 연습 소재**. (스타일: 다크 모던 / 미니멀, 인터랙션 포함)

AI 활용과 개발 실력 향상을 같이 할 수 있도록 처음에는 **AI가 전부 코딩하는 방식**으로 진행하고 이후 **AI 서포트 + 사람이 직접 코딩하는 방식**으로 진행.
(개발 방식은 아래 [개발 프로세스](#개발-프로세스) 참고.)

## 개발 프로세스

- **AI 완전 코딩**: 코드·문서를 Claude Code(Claude 앱 포함) AI가 작성하고, 개발자가 검수·승인.
- **AI 서포트 + 직접 코딩**: 개발자가 직접 코딩하고, AI는 코드를 작성하지 않는 **리뷰어·멘토** 역할만 한다(설명·유도·리뷰). 상세 규칙: [`docs/NEXT_ROADMAP.md`](./docs/NEXT_ROADMAP.md)

> **`ai-only` 태그** — AI가 단독으로 개발한 마지막 시점을 git 태그 `ai-only`로 표시. 이 태그 이후의 커밋이 **사람이 직접 코딩한** 부분.
> AI 완전 코딩 확인: `git checkout ai-only`

## 스택

개발 시점 기준 실제 사용 버전 (정확한 잠금 버전은 `package.json` / `package-lock.json` 참고):

- Node.js v22.15.0
- Next.js 16.2.9 (App Router)
- React / React DOM 19.2.4
- Tailwind CSS 4.3.1
- framer-motion 12.42.0
- react-icons 5.7.0
- TypeScript 5.9.3

## 시작하기

개발 서버 실행:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

## 명령어

```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint    # 린트
```

## 구조

```
src/
├─ app/
│  ├─ layout.tsx      # Header/Footer 공통 배치, 폰트 로드, 메타데이터(SEO/OG)
│  ├─ page.tsx        # 섹션 조립 (Hero → Projects → Skills → CTA)
│  └─ globals.css     # 디자인 토큰 (@theme), container-page, 포커스/모션 규칙
└─ components/
   ├─ layout/         # Header, Footer
   ├─ motion/         # FadeIn (재사용 등장 애니메이션 래퍼)
   └─ sections/       # Hero, Projects, ProjectCard, Skills, CTA
```

## 문서

- [`CLAUDE.md`](./CLAUDE.md) — 규칙·컨벤션·영구 컨텍스트 (Claude Code가 세션마다 읽음)
- [`docs/PROJECT_PLAYBOOK.md`](./docs/PROJECT_PLAYBOOK.md) — 계획·의사결정·프롬프트 기록
- [`docs/DEV_QNA.md`](./docs/DEV_QNA.md) — 개발 중 개념 질문 & 답변 노트
- [`docs/A11Y_CHECKLIST.md`](./docs/A11Y_CHECKLIST.md) — 접근성 기준 체크리스트
- [`docs/PERFORMANCE_NOTES.md`](./docs/PERFORMANCE_NOTES.md) — 성능 최적화 제안(다음 단계용)
- [`docs/FRAMER_MOTION_GUIDE.md`](./docs/FRAMER_MOTION_GUIDE.md) — framer-motion 사용법·실무 패턴·주의점 (직접 코딩 참고용)
- [`docs/TYPESCRIPT_GUIDE.md`](./docs/TYPESCRIPT_GUIDE.md) — TypeScript 사용법·실무 패턴·주의점 (직접 코딩 참고용)
- [`docs/NEXTJS_GUIDE.md`](./docs/NEXTJS_GUIDE.md) — Next.js(App Router) 사용법·실무 패턴·주의점 (직접 코딩 참고용)
- [`docs/NEXT_ROADMAP.md`](./docs/NEXT_ROADMAP.md) — clone 이후 직접 코딩 로드맵 & AI 멘토 역할 규칙
