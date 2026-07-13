# 성능 최적화 제안 노트 (다음 프로젝트용)

> **상태: 대부분 이 프로젝트엔 미적용.** 다음 프로젝트에서 검토할 체크리스트로 저장해 둔다.
> 이 포트폴리오는 정적 1페이지라 상당수가 이미 자연히 충족되거나(정적 생성, JIT CSS) 규모가 작아 효과가 미미하다.
> 원칙: **측정 먼저, 최적화는 그다음.** 추측으로 복잡도를 올리지 말고 Lighthouse/Web Vitals 수치로 병목을 확인한 뒤 손댄다.

## 핵심 지표 (무엇을 볼 것인가)

Core Web Vitals 중심으로 본다:
- **LCP (Largest Contentful Paint)** — 가장 큰 콘텐츠가 그려지는 시간. 보통 Hero 이미지/제목. 목표 < 2.5s.
- **CLS (Cumulative Layout Shift)** — 로드 중 레이아웃이 튀는 정도. 목표 < 0.1.
- **INP (Interaction to Next Paint)** — 상호작용 반응성. 목표 < 200ms.
- 보조: TTFB, FCP, TBT, 번들 크기.

측정 도구: Chrome Lighthouse, PageSpeed Insights, `next build`의 번들 리포트, Vercel Analytics(배포 시).

---

## 1. 이미지 (이 프로젝트는 패턴만 셋업됨)

- `next/image`(`<Image>`) 사용 → 자동 WebP/AVIF 변환, 반응형 `srcset`, lazy 로딩.
- **CLS 방지**: `width/height` 또는 `fill` + 부모 고정 크기, 그리고 정확한 `sizes`.
- **LCP 이미지에만 `priority`** (첫 화면). 나머지는 lazy 기본 유지.
- 외부 이미지는 `next.config`의 `images.remotePatterns`로 호스트 허용.
- **현재 프로젝트**: `ProjectCard`가 이미 이 패턴으로 셋업됨(→ `docs/`가 아닌 코드 `src/components/sections/ProjectCard.tsx`). 실제 스크린샷을 넣으면 자동 최적화. (a11y 측면은 `A11Y_CHECKLIST.md` 1번.)

## 2. 폰트

- `next/font`로 셀프 호스팅 → 외부 요청 제거, FOUT/FOIT 완화, CLS 감소. (이 프로젝트 이미 사용: Geist/Geist Mono/Noto Sans KR.)
- 추가 검토: `display: 'swap'`(기본), 필요한 `subsets`만, 실제로 쓰는 `weight`만 로드(용량 절감). CJK 폰트(Noto Sans KR)는 무거우므로 **사용 weight 최소화**가 특히 중요.
- 첫 화면에 쓰는 폰트는 `preload`(next/font 기본 동작) 확인.

## 3. JavaScript 번들 / 코드 스플리팅

- **"use client" 최소화**: 서버 컴포넌트를 기본으로, 상호작용 부분만 클라이언트로 분리(이 프로젝트는 `FadeIn`·`ProjectCard`·`Header`·`Hero`만 클라이언트). 서버 컴포넌트는 JS 번들에 안 실린다.
- **동적 import**: 첫 화면에 필요 없는 무거운 클라이언트 컴포넌트는 `next/dynamic`으로 지연 로드.
  ```tsx
  const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false })
  ```
- **framer-motion 비용**: 애니메이션이 많아지면 번들이 커진다. 정말 필요한 곳만 motion을 쓰고, 단순 전환은 CSS transition으로.
- **번들 분석**: `@next/bundle-analyzer`로 무엇이 큰지 시각화한 뒤 판단.

## 4. 렌더링 전략

- 가능한 정적 생성(SSG)/ISR을 우선. 이 프로젝트는 이미 완전 정적(`○ (Static)` 프리렌더).
- 데이터가 필요한 페이지는 서버 컴포넌트에서 fetch + 적절한 `revalidate` 캐싱.
- 스트리밍 SSR + `<Suspense>`로 느린 부분만 나중에 채우기(대형 앱에서 체감 큼).

## 5. 서드파티 스크립트

- 분석/위젯 등은 `next/script`의 `strategy`로 로드 시점 제어(`afterInteractive`/`lazyOnload`). 메인 스레드 블로킹 최소화.
- 정말 필요한 스크립트만. 각 스크립트가 TBT/INP를 갉아먹는다.

## 6. CSS

- Tailwind v4는 JIT로 **사용한 클래스만** 생성 → 기본적으로 작다(이 프로젝트 이점). 별도 purge 설정 불필요.
- 임계 CSS 인라인·미사용 제거는 Next이 대체로 처리. 커스텀 글로벌 CSS는 최소로.

## 7. 애니메이션 성능

- `transform`/`opacity`만 애니메이트 → 합성(compositing) 단계에서 처리돼 layout/paint를 안 유발(부드럽다). `width`/`top`/`margin` 애니메이션은 피한다.
- 이 프로젝트의 framer-motion 등장(`opacity`+`y`)·hover(`scale`)는 이미 합성 친화적. (배경 원리는 `DEV_QNA.md` Q2의 합성 레이어 절.)
- 과한 `will-change`는 오히려 메모리 낭비 — 필요할 때만.

## 8. 네트워크 / 캐싱 / 전송

- 정적 자산은 CDN 캐시(Vercel 배포 시 자동). 긴 `Cache-Control` + 콘텐츠 해시 파일명.
- 압축(gzip/brotli)은 플랫폼 기본. 확인만.
- 프리페치: `next/link`는 뷰포트에 들어온 링크를 기본 프리페치(1페이지 앵커 네비라 영향 적음).

## 9. 접근성과 겹치는 부분

- CLS는 성능이자 UX/접근성 이슈. 이미지·폰트·광고 슬롯에 크기 예약.
- reduced-motion 존중은 성능(애니메이션 비용)과 접근성 양쪽에 이득. (→ `A11Y_CHECKLIST.md` 7번.)

---

## 다음 프로젝트 착수 순서(제안)

1. `next build` + Lighthouse로 **현재 수치 기준선** 잡기.
2. LCP/CLS/INP 중 목표 미달 지표부터.
3. 이미지·폰트·서버컴포넌트 비율처럼 **효과 크고 비용 낮은** 것부터.
4. 번들 분석으로 큰 클라이언트 컴포넌트 식별 → 동적 import/서버화.
5. 변경 후 재측정으로 회귀 확인. (최적화가 늘 이득은 아니다 — 수치로 검증.)
