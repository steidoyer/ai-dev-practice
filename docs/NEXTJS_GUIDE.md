# Next.js (App Router) 가이드

> 직접 코딩하며 옆에 두고 참고하는 문서. **개념·사용법·실무 패턴·주의점**을 정리한다. Next를 많이 안 써본 사람이 보고 스스로 익히는 걸 목표로 한다.
> 이 프로젝트 버전: **Next.js 16.2.9 (App Router, Turbopack)** / React 19 / TypeScript.
> 공식 문서: https://nextjs.org/docs — App Router 기준으로 볼 것(Pages Router 문서와 섞이지 않게 주의).

관련 문서:
- 서버/클라이언트 경계와 애니메이션: `FRAMER_MOTION_GUIDE.md` §5.1
- 메타데이터/OG 이미지 상세 개념: `DEV_QNA.md` Q12~Q14
- RSC(서버 컴포넌트) children 전달 원리: `DEV_QNA.md` Q11
- 성능·이미지 최적화: `PERFORMANCE_NOTES.md`

---

## 0. 이 프로젝트에서의 구조 (실물)

```
src/
├─ app/
│  ├─ layout.tsx    # 루트 레이아웃: <html>/<body>, 폰트, 메타데이터, Header/Footer
│  ├─ page.tsx      # "/" 페이지: 섹션 조립
│  └─ globals.css   # 전역 스타일 + @theme 토큰
├─ components/      # layout / sections / motion
└─ lib/             # 공용 데이터·유틸 자리 (현재 데이터는 각 섹션 컴포넌트에 인라인)
```
- **App Router**: `app/` 폴더 구조가 곧 URL. `layout.tsx`/`page.tsx`가 특수 파일.
- 이 사이트는 **완전 정적**(빌드 시 프리렌더, `○ Static`). 서버에서 매 요청 렌더하지 않는다.

---

## 1. 역할 — 왜 Next.js인가

**React 위에 얹는 프레임워크.** React는 UI 라이브러리일 뿐(라우팅·빌드·렌더링·최적화는 직접 구성해야 함). Next이 그걸 다 잡아준다:
- **파일 기반 라우팅** — 폴더/파일이 곧 경로. 라우터 설정 코드 없음.
- **렌더링 전략** — 서버 렌더(SSR)/정적 생성(SSG)/증분(ISR)/스트리밍을 페이지 단위로.
- **서버 컴포넌트(RSC)** — 기본이 서버에서 렌더 → JS 번들이 줄고 데이터 접근이 쉬움.
- **내장 최적화** — `next/image`(이미지), `next/font`(폰트), 코드 분할, 프리페치.

### CRA/Vite 순수 React 대비
- 순수 React(Vite): 가볍고 자유롭지만 라우팅·SSR·메타데이터·이미지 최적화를 **직접** 붙여야 함.
- Next: 그 기능들이 **관례로 내장**. SEO·성능·서버 로직이 필요하면 Next이 유리. (이 프로젝트가 Next을 쓰는 이유 = 메타데이터/이미지/구조 관례.)

---

## 2. App Router 핵심 개념

### 2.1 파일 기반 라우팅 + 특수 파일
`app/` 안의 폴더가 URL 경로가 되고, 정해진 파일명이 역할을 가진다.

| 파일 | 역할 |
|---|---|
| `page.tsx` | 그 경로의 **페이지 UI**(이게 있어야 라우트가 접근 가능). |
| `layout.tsx` | 하위 경로 **공통 껍데기**(리렌더 안 됨, 상태 유지). 루트 layout은 `<html>/<body>` 필수. |
| `loading.tsx` | 로딩 중 폴백(Suspense 자동 연결). |
| `error.tsx` | 에러 바운더리(클라이언트 컴포넌트여야 함). |
| `not-found.tsx` | 404 UI. |
| `route.ts` | **API 엔드포인트**(GET/POST 등). page와 같은 폴더엔 공존 불가. |
| `template.tsx` | layout과 비슷하나 이동 시마다 새로 마운트. |

예) `app/blog/[slug]/page.tsx` → `/blog/어쩌고`. `[slug]`는 **동적 세그먼트**, `(marketing)`처럼 괄호는 **URL에 안 드러나는 그룹 폴더**.

### 2.2 ⚠️ 서버 컴포넌트 vs 클라이언트 컴포넌트 (가장 중요)
App Router에서 **모든 컴포넌트는 기본이 서버 컴포넌트(RSC)**다. 파일 맨 위에 `'use client'`를 적은 것만 클라이언트 컴포넌트가 된다.

| | 서버 컴포넌트(기본) | 클라이언트 컴포넌트(`'use client'`) |
|---|---|---|
| 실행 위치 | 서버(빌드/요청 시) | 서버에서 1차 렌더 + 브라우저에서 hydrate |
| JS 번들 | **안 실림** | 실림 |
| 쓸 수 있는 것 | async/await, DB/파일/서버 secret | `useState`/`useEffect`, 이벤트, 브라우저 API |
| 못 쓰는 것 | 훅·이벤트·브라우저 API | 서버 전용 리소스, secret |

핵심 규칙:
- **필요할 때만** `'use client'`. 상호작용(상태/이벤트/motion)이 있는 말단 컴포넌트만 클라이언트로.
- `'use client'`는 **경계**다 — 그 아래로 import되는 컴포넌트도 클라이언트가 된다.
- 서버 컴포넌트는 클라이언트 컴포넌트에 **children으로 전달**될 수 있다. → 섹션은 서버로 두고 애니메이션 래퍼(클라이언트)로 감싸는 이 프로젝트 방식(`FRAMER_MOTION_GUIDE.md` §5.1, `DEV_QNA.md` Q11).

### 2.3 데이터 패칭
서버 컴포넌트는 그냥 `async` 함수로 만들어 `await` 하면 된다.
```tsx
export default async function Page() {
  const res = await fetch('https://api.example.com/posts')  // 서버에서 실행
  const posts = await res.json()
  return <List posts={posts} />
}
```
- **캐싱(중요, 버전 주의)**: Next 15부터 `fetch`는 **기본이 캐시 안 됨**(매번 요청). 캐시하려면 `fetch(url, { cache: 'force-cache' })` 또는 `{ next: { revalidate: 60 } }`(ISR). (Next 14의 "기본 캐시"와 반대라 헷갈리기 쉬움.)
- 클라이언트에서 데이터가 필요하면 여전히 `useEffect`/SWR/React Query 등을 쓴다.

### 2.4 메타데이터 (SEO/OG)
`layout.tsx`/`page.tsx`에서 `metadata` 객체나 `generateMetadata` 함수를 export하면 Next이 `<head>`에 주입한다. **서버 컴포넌트에서만 동작**(`'use client'` 파일에선 불가). → 상세: `DEV_QNA.md` Q12~Q14, 실물: `layout.tsx`.

---

## 3. 렌더링 전략 (언제 뭐가 정해지나)

| 방식 | 언제 렌더 | 쓸 때 |
|---|---|---|
| **정적(SSG)** | 빌드 시 1번 → 정적 HTML | 콘텐츠가 고정(이 프로젝트). 가장 빠르고 싸다. |
| **동적(SSR)** | 매 요청 | 요청마다 달라지는 것(쿠키·사용자별). |
| **ISR** | 빌드 후 주기적 재생성 | 가끔 바뀌는 콘텐츠. `revalidate`. |
| **스트리밍** | 조각 단위로 점진 전송 | 느린 부분만 `<Suspense>`로 나중에. |

- **정적 ↔ 동적은 "자동 판정"**된다: `cookies()`/`headers()`/캐시 안 하는 `fetch`/동적 `params` 등 **동적 API를 쓰면** 그 라우트가 동적으로 바뀐다. 안 쓰면 정적.
- 빌드 로그의 `○ (Static)` / `ƒ (Dynamic)` 표기로 확인(이 프로젝트는 전부 `○`).

---

## 4. 실무에서 자주 쓰는 API

```tsx
import Link from 'next/link'       // 클라이언트 사이드 이동 + 뷰포트 프리페치
<Link href="/about">About</Link>

import Image from 'next/image'     // 자동 최적화(WebP/AVIF·lazy·CLS 방지)
<Image src="/a.png" width={400} height={300} alt="" />
// 또는 부모 크기에 채우기: <Image src={..} fill sizes="(min-width:1024px) 400px, 92vw" />

import { Geist } from 'next/font/google'  // 셀프호스팅 폰트(외부요청 제거·CLS↓)

// 클라이언트 내비 훅 (모두 'use client' 안에서)
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
```

- **Route Handler**(`app/api/x/route.ts`): `export async function GET() { return Response.json({...}) }` — 백엔드 엔드포인트.
- **환경변수**: 서버 전용은 `process.env.SECRET`, **브라우저 노출이 필요하면 `NEXT_PUBLIC_` 접두사**. (접두사 없는 값은 클라이언트 번들에 안 들어감 — §5.5)
- **파일 기반 메타데이터**: `app/`에 `favicon.ico`/`icon.png`/`opengraph-image.tsx`/`robots.txt`/`sitemap.ts`를 두면 자동 연결(→ `DEV_QNA.md` Q14).

---

## 5. 주의점 / 흔한 함정

### 5.1 `'use client'`를 최상단에 남발하지 마라
페이지 루트에 붙이면 그 아래 전부 클라이언트 번들. **상호작용 있는 말단 컴포넌트만** 클라이언트로 쪼개고, 나머진 서버로 유지(번들↓, 데이터 접근↑).

### 5.2 서버 컴포넌트에서 훅·브라우저 API 금지
`useState`/`useEffect`/`window`/`document`/이벤트 핸들러(`onClick`)는 클라이언트 전용. 서버 컴포넌트에 쓰면 빌드 에러. 반대로 `async/await` 데이터 패칭은 서버 컴포넌트에서.

### 5.3 캐싱 기본값(버전마다 다름)
Next 15+에서 `fetch`·GET Route Handler는 **기본 캐시 안 함**. 예전 자료(Next 14)를 보고 "왜 캐시가 되지/안 되지" 헷갈리기 쉽다. 명시적으로 `cache`/`revalidate`로 제어.

### 5.4 동적 API는 async (Next 15+)
`params`·`searchParams`·`cookies()`·`headers()`가 **Promise**로 바뀌었다 — `await` 해야 한다.
```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

### 5.5 환경변수 노출 사고
`NEXT_PUBLIC_`를 붙이면 **그 값은 클라이언트 번들에 그대로 박힌다.** API 키·secret엔 절대 이 접두사를 붙이지 말 것.

### 5.6 hydration mismatch
서버가 그린 HTML과 클라이언트 첫 렌더가 다르면 경고+깜빡임. 원인: `Date.now()`/`Math.random()`/`localStorage`를 렌더 중에 사용, **`matchMedia`/`useReducedMotion` 등 서버엔 없는 "클라 전용 값"으로 render 출력을 분기**, 브라우저 확장 간섭 등.
- **클라 전용 값 해결**: 서버는 그 값을 못 받으니(요청에 안 실림) **서버는 기본값으로 렌더 → 마운트 후 클라에서 실제값으로 보정**해야 한다. `useEffect`로 세팅(마운트 게이트)해도 되지만, **`useSyncExternalStore`(+ `getServerSnapshot`)** 가 정석(재구독·테어링까지 처리). 예: reduced-motion을 `useReducedMotionSafe` 훅으로(→ `FRAMER_MOTION_GUIDE.md` §5.3).
- **범위**: 내 환경/로컬 한정이 아니라 **범용 React SSR 이슈**(Remix·Astro 등도). **dev는 콘솔 경고**, **prod는 경고 없이도 해당 서브트리를 클라에서 재생성**(깜빡임·SSR 이점 손실)하므로 실제 버그다. (HMR로 인한 stale 번들 불일치는 별개 → §7.1)

### 5.7 next/image
`fill`을 쓰면 부모에 `position: relative`+크기가 있어야 하고 `sizes`를 정확히 줘야 함(안 그러면 과대 로드/CLS). above-the-fold만 `priority`. 외부 도메인은 `next.config`의 `images.remotePatterns` 등록(→ 실물: `next.config.ts`).

### 5.8 Link vs a
내부 이동은 `<Link>`(프리페치+클라이언트 전환). 외부 링크·앵커(`#id`)나 mailto는 일반 `<a>`로 충분.

---

## 6. 프로젝트 구조 관례 (이 저장소 기준)

- 라우트/레이아웃: `src/app/` (`layout.tsx` 공통, `page.tsx` 섹션 조립).
- 컴포넌트: `src/components/`의 `layout/`(Header·Footer) · `sections/`(Hero·Projects…) · `motion/`(애니메이션 래퍼).
- 데이터: 현재는 각 섹션 컴포넌트에 인라인(`Projects.tsx`·`Skills.tsx`), 공용으로 뺄 땐 `src/lib/`로. 절대 import는 `@/` 별칭(`@/components/...`, tsconfig `paths`).
- 디자인 토큰은 `globals.css`의 `@theme` — 색상 하드코딩 금지(→ `CLAUDE.md`).

---

## 7. 개발 / 디버깅

```bash
npm run dev     # 개발 서버(Turbopack, HMR)
npm run build   # 프로덕션 빌드 + 타입체크 + 라우트 표(○/ƒ) 출력
npm run lint    # ESLint
```
- 빌드 출력의 **라우트 표**로 각 경로가 정적(`○`)인지 동적(`ƒ`)인지 확인.
- 개발 중 에러는 브라우저 **에러 오버레이**에 스택과 함께 뜬다. 서버 컴포넌트 에러는 터미널 로그도 같이 볼 것.
- "use client가 필요하다" / "훅은 서버 컴포넌트에서 못 쓴다" 류 에러 → §2.2/§5.2를 먼저 확인.

### 7.1 HMR이 꼬일 때 — stale 번들 (증상이 코드와 안 맞으면 의심)

**HMR(Hot Module Replacement)**: 개발 서버(Turbopack)가 파일을 저장할 때마다 **바뀐 모듈만 교체**해 새로고침 없이 화면을 갱신하는 기능. 빠르지만, 모듈이 **상태·구독**을 들고 있으면 교체가 **부분적으로만** 반영돼 **화면에서 도는 코드가 소스와 어긋나는** 상태(= *stale 번들*)가 될 수 있다.

**판별 — "코드상 불가능한 동작"이 보이면 의심**
- 코드는 latched(단조 증가)인데 스크롤 올릴 때 애니메이션이 **되감긴다**(= 옛 `scrollYProgress` 직결 버전이 아직 돎).
- 로그로 읽은 값과 화면에 칠해진 값이 **다르다**(구독이 옛 객체에 남음).
- **일부는 옛 동작, 일부는 깨진 동작**이 섞여 있다.

**잘 나는 조건**: **framer-motion `MotionValue`/구독(`useMotionValueEvent` 등)** 을 **빠르게 반복 편집**할 때. MotionValue는 렌더 밖에서 구독으로 연결돼 있어 모듈 교체 시 옛 구독이 남기 쉽다. (이 저장소 Approach 인터랙션 작업 중 반복 발생.)

**대응 사다리 (위에서부터)**
1. **브라우저 강력 새로고침**(Ctrl+F5): 클라이언트만 리셋. 가장 가벼움.
2. **개발 서버 완전 재시작**: 터미널 `Ctrl+C`로 끄고 `npm run dev` 재실행 → 강력 새로고침. HMR 모듈 그래프를 새로 만든다. **브라우저 새로고침만으론 안 지워지는 서버측 stale은 이걸로 풀린다.**
3. **`.next` 삭제 후 재시작**: `.next`(빌드 캐시)까지 지우고 `npm run dev`. 2로도 안 되면 여기까지. `.next`는 캐시라 지워도 안전(다음 실행 때 재생성).
4. 그래도면 stale이 아니라 **진짜 코드 버그** → 다시 코드를 본다.

> 요령: "코드는 맞는데 화면이 이상하다"면 원인 규명 전에 **2~3번부터** 해보는 게 시간을 아낀다. 단, 매번 리셋으로 덮지 말고 **"이게 지금 코드로 가능한 동작인가?"** 를 먼저 자문할 것 — 진짜 버그를 stale로 오해하면 안 되니까. (관련: latch 원리 `FRAMER_MOTION_GUIDE.md` §3.2)

---

## 8. 더 볼 것

- App Router 공식 문서: https://nextjs.org/docs/app
- 서버/클라이언트 컴포넌트: https://nextjs.org/docs/app/building-your-application/rendering
- 메타데이터: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- 이 프로젝트 실물: §0 구조 + `layout.tsx`/`page.tsx`
