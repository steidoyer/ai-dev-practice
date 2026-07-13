# TypeScript 가이드

> 직접 코딩하며 옆에 두고 참고하는 문서. **개념·사용법·실무 패턴·주의점**을 정리한다. TS를 많이 안 써본 사람이 보고 스스로 익히는 걸 목표로 한다.
> 이 프로젝트 버전: **TypeScript 5.9.3** / `tsconfig.json`에 **`strict: true`**, 경로 별칭 **`@/*` → `./src/*`**.
> 공식 문서: https://www.typescriptlang.org/docs/ — 핸드북(Handbook)이 가장 정확. 브라우저 실습: https://www.typescriptlang.org/play

관련 문서:
- React 애니메이션에서의 타입: `FRAMER_MOTION_GUIDE.md`
- Next.js(서버/클라이언트 컴포넌트, 메타데이터 타입): `NEXTJS_GUIDE.md`

---

## 0. 이 프로젝트에서 이미 쓰인 곳 (실물 예시)

| 파일 | 볼 것 |
|---|---|
| `src/components/sections/Projects.tsx` | 데이터 배열 + 타입 정의(`type Project`, `Project[]`), map 렌더 |
| `src/components/sections/ProjectCard.tsx` | **컴포넌트 props 타입**(옵셔널 prop, 기본값) |
| `src/app/layout.tsx` | 외부 타입 import(`Metadata`), `as const` 객체 |
| `src/components/layout/Header.tsx` | `useState` 제네릭, 이벤트 핸들러 타입 |

> TS는 "따로 배우는 언어"가 아니라 **JS에 타입 주석을 더한 것**이다. 위 파일들은 전부 평범한 React 코드 + 타입 몇 줄이다.

---

## 1. 역할 — 왜 TypeScript인가

**JavaScript의 상위집합(superset).** JS 문법 그대로 쓰되, **값에 "타입"을 붙여** 컴파일(빌드) 시점에 오류를 잡는다. 브라우저는 TS를 모르므로, 빌드하면 타입은 **전부 지워지고 순수 JS**가 나온다(런타임 비용 0).

주는 것:
- **에디터 자동완성 + 인라인 오류** — 오타·잘못된 속성 접근을 타이핑하는 순간 빨간 줄로.
- **리팩터링 안전망** — 이름 바꾸기/시그니처 변경 시 영향받는 곳을 컴파일러가 다 짚어줌.
- **문서화 효과** — 함수/데이터 모양이 타입에 드러나 "이 값이 뭐였지?"가 줄어든다.

### 핵심 사고 전환
- 타입은 **컴파일 타임에만** 존재한다. **런타임 검증이 아니다.** (외부 API 응답 같은 건 별도 런타임 검증 필요 — §5.5)
- "타입을 먼저 완벽히"가 아니라, **값의 모양이 굳으면 타입이 따라오게** 쓰는 게 실무 흐름.

> 판단 기준: 타입 때문에 코드가 꼬이면 잠깐 `unknown`/좁히기로 우회하되, `any` 남발은 타입의 이점을 통째로 버리는 것(§5.1).

---

## 2. 기본 타입

```ts
// 원시 타입
let title: string = 'Hero'
let count: number = 3
let open: boolean = false

// 배열 / 튜플
let tags: string[] = ['ts', 'next']
let point: [number, number] = [0, 8]   // 길이·순서 고정

// 객체
let user: { name: string; age?: number } = { name: 'A' }  // age?: 옵셔널

// 유니온(A 또는 B) / 리터럴(정확한 값만)
let status: 'idle' | 'loading' | 'done' = 'idle'
let id: string | number = 1

// 함수
const add = (a: number, b: number): number => a + b
const log = (msg: string): void => console.log(msg)

// any / unknown / never
let x: any        // 타입 검사 끔(위험 — 지양)
let y: unknown    // "뭔지 모름" — 쓰기 전에 좁혀야 함(안전한 any)
// never: 절대 값이 없음(다 걸러진 분기 등)
```

### `type` vs `interface`
```ts
type Project = { title: string; tags: string[] }        // 유니온·복합에 유연
interface Project2 { title: string; tags: string[] }    // 선언 병합·확장에 유리
```
- 실무 기준: **객체 모양은 아무거나 일관되게**. 유니온/조건부/유틸리티 조합이 필요하면 `type`, 라이브러리 공개 타입처럼 확장(`extends`)이 필요하면 `interface`. 이 프로젝트는 `type`을 주로 씀.

### 조합
```ts
type A = { a: number }
type B = { b: string }
type Both = A & B          // 교차(둘 다 가짐)
type Either = A | B        // 유니온(둘 중 하나)
```

---

## 3. 실무에서 자주 쓰는 것 (React/Next 맥락)

### 3.1 컴포넌트 props 타입
```tsx
type ProjectCardProps = {
  title: string
  description: string
  image?: string          // 옵셔널
  priority?: boolean
}

function ProjectCard({ title, image, priority = false }: ProjectCardProps) { … }
```
- children이 필요하면: `children: React.ReactNode`.
- props가 많아지면 `type XxxProps`로 빼서 이름 붙인다.

### 3.2 이벤트 핸들러 타입
```tsx
const onClick = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)
```
> 요령: 인라인으로 `onClick={(e) => …}` 쓰면 e 타입은 **자동 추론**된다. 핸들러를 밖으로 뺄 때만 명시.

### 3.3 훅 제네릭
```tsx
const [open, setOpen] = useState(false)          // boolean 자동 추론
const [user, setUser] = useState<User | null>(null)  // 초기 null이면 제네릭 명시
const ref = useRef<HTMLDivElement>(null)
```

### 3.4 데이터 배열 → 타입 파생
```ts
// 방법 A: 타입 먼저 정의(수정·확장 쉬움)
type Project = { title: string; tags: string[]; image?: string }
export const projects: Project[] = [ … ]

// 방법 B: 값에서 타입 뽑기(as const + typeof)
export const projects = [
  { title: 'ShopFlow', tags: ['Next'] },
] as const
type Project = (typeof projects)[number]   // 배열 요소 타입
```
- `as const`: 값을 **리터럴·읽기전용**으로 고정('ShopFlow'가 `string`이 아니라 정확히 `'ShopFlow'`). 상수 데이터에 유용.

### 3.5 유틸리티 타입 (자주 씀)
```ts
Partial<T>    // 전부 옵셔널
Required<T>   // 전부 필수
Pick<T, 'a'>  // 일부 키만
Omit<T, 'a'>  // 일부 키 제외
Record<K, V>  // 키-값 맵 타입: Record<string, number>
Readonly<T>   // 읽기전용
ReturnType<typeof fn>   // 함수 반환 타입
```

### 3.6 제네릭 기초
"타입을 매개변수로" 받는 함수/타입. 입력 타입을 그대로 이어서 반환할 때.
```ts
function first<T>(arr: T[]): T | undefined { return arr[0] }
first([1, 2, 3])       // number
first(['a', 'b'])      // string
```

### 3.7 타입 좁히기(narrowing)
유니온을 안전하게 다루는 법. **조건문이 곧 타입 좁히기**다.
```ts
function fmt(v: string | number) {
  if (typeof v === 'number') return v.toFixed(2)  // 여기선 v: number
  return v.toUpperCase()                          // 여기선 v: string
}
if ('image' in project) { … }        // in 연산자
value?.prop                          // 옵셔널 체이닝
const n = value ?? 0                 // nullish 병합(null/undefined일 때만 기본값)
```

### 3.8 `import type`
타입만 가져올 땐 `import type`을 쓰면 번들에서 확실히 제거된다.
```ts
import type { Metadata } from 'next'
import type { IconType } from 'react-icons'
```

---

## 4. 실무 예시

### 4.1 variant를 유니온 리터럴로
```ts
type ButtonVariant = 'primary' | 'ghost'
// enum 대신 유니온 리터럴 권장(§5.4)
```

### 4.2 옵셔널 prop + 기본값 (ProjectCard 패턴)
```tsx
type Props = { title: string; priority?: boolean }
function Card({ title, priority = false }: Props) { … }
```

### 4.3 외부 데이터 타입 (fetch)
```ts
type ApiUser = { id: number; name: string }
async function getUser(): Promise<ApiUser> {
  const res = await fetch('/api/user')
  return res.json() as Promise<ApiUser>  // ⚠️ 단언일 뿐 — 실제 검증은 §5.5
}
```

### 4.4 Record로 매핑 테이블
```ts
const colorByStatus: Record<'idle' | 'done', string> = {
  idle: 'text-muted',
  done: 'text-accent',
}
```

---

## 5. 주의점 / 흔한 함정

### 5.1 `any`는 전염된다 → `unknown`을 써라
`any`가 한 곳에 들어가면 그 값이 닿는 모든 곳에서 타입 검사가 꺼진다. "모르는 값"은 `unknown`으로 받고 **좁혀서** 쓴다.

### 5.2 타입 단언(`as`) · non-null(`!`) 남용 주의
```ts
const el = document.querySelector('.x') as HTMLDivElement  // 컴파일러 무시
el!.focus()   // "null 아님"을 단언 — 틀리면 런타임 크래시
```
- `as`/`!`는 **"내가 컴파일러보다 잘 안다"는 선언**이다. 틀리면 런타임 오류로 돌아온다. 좁히기로 해결되면 그쪽을 우선.

### 5.3 구조적 타이핑(덕 타이핑)
TS는 이름이 아니라 **모양(구조)**으로 호환을 판단한다. 필드가 다 맞으면 다른 타입이어도 통과한다 — 놀랄 수 있지만 정상 동작.

### 5.4 `enum`보다 유니온 리터럴
`enum`은 런타임 코드를 생성하고(번들 증가) 트리 셰이킹이 까다롭다. 대개 `'a' | 'b'` 유니온 + `as const` 객체로 충분하다.

### 5.5 타입은 런타임 검증이 아니다
`res.json() as User`는 **실제로 검사하지 않는다.** API가 딴 걸 주면 타입은 통과하고 런타임에 터진다. 진짜 검증이 필요하면 **zod** 같은 런타임 스키마 라이브러리를 별도로.

### 5.6 `strict` null 검사
`strict: true`(이 프로젝트)면 `string | null`에서 null 가능성을 무시할 수 없다 — 그래서 `?.`/`??`/좁히기가 필요. **이게 버그를 가장 많이 막아준다.**

### 5.7 타입 공간 vs 값 공간
`type`/`interface`는 **타입 공간**에만 존재해 런타임에 못 쓴다. 반대로 값(변수·함수)을 타입 자리에 쓰려면 `typeof value`. 둘은 별개 네임스페이스.

---

## 6. tsconfig 핵심 옵션 (이 프로젝트 기준)

| 옵션 | 의미 |
|---|---|
| `strict: true` | 엄격 검사 묶음(null 검사·암묵적 any 금지 등). **버그 예방의 핵심.** |
| `moduleResolution: 'bundler'` | 번들러(Next/Turbopack) 방식의 모듈 해석. |
| `paths: { '@/*': ['./src/*'] }` | `@/components/…` 절대 import 별칭. |
| `noEmit: true` | JS 출력은 Next이 담당, tsc는 **검사만**. |
| `isolatedModules: true` | 파일 단위 트랜스파일 전제(타입 재-export 시 `import type` 필요). |
| `jsx: 'react-jsx'` | JSX 자동 변환(React import 불필요). |

> 타입만 검사해보고 싶을 때: `npx tsc --noEmit`. (빌드는 `npm run build`가 타입체크까지 함.)

---

## 7. 에러 읽는 법 / 디버깅

1. **에러는 위에서부터** 읽는다. 근본 원인이 맨 위, 아래는 그 여파일 때가 많다.
2. **에디터에서 값에 hover** → 추론된 실제 타입 확인. "왜 이 타입이지?"의 답이 여기 있다.
3. "`X`에 `Y`를 할당할 수 없음" → **모양이 어디서 어긋나는지**를 두 타입 비교로 찾는다.
4. 임시로 넘겨야 하면 `// @ts-expect-error`(다음 줄 오류를 의도적으로 무시, 오류가 사라지면 이 주석도 에러나서 청소됨). `@ts-ignore`보다 이걸.
5. 유니온이 안 좁혀지면 `typeof`/`in`/커스텀 타입가드 순서로.

---

## 8. 더 볼 것

- 공식 핸드북: https://www.typescriptlang.org/docs/handbook/intro.html
- 유틸리티 타입 목록: https://www.typescriptlang.org/docs/handbook/utility-types.html
- React+TS 치트시트: https://react-typescript-cheatsheet.netlify.app/
- 이 프로젝트 실물: §0 표의 파일들
