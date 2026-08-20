# Git 워크플로우 가이드 (GIT_WORKFLOW)

> 손코딩 단계에서 반복하는 git 작업(브랜치·커밋·rebase 합치기)을 한 곳에 모은다.
> **저장소 baseline/clone 전략**과 **`ai-only` 태그**는 여기가 아니라 `NEXT_ROADMAP.md`·`README.md`·`CLAUDE.md` 참고(중복하지 않음). 이 문서는 **일상 커밋 흐름**만 다룬다.

---

## 1. 브랜치

- **기본 브랜치(`main`)에서 바로 작업하지 않는다.** 작업 단위로 브랜치를 따서 진행하고, 정리된 뒤 `main`에 합친다. `main`은 항상 동작하는 상태로 유지.
- 명령:
  ```bash
  git switch -c feat/approach-interaction   # 새 브랜치 만들고 이동
  # ...작업/커밋...
  git switch main
  git merge feat/approach-interaction       # 합치기(또는 정리 후 병합)
  ```
- 브랜치 이름은 목적이 드러나게: `feat/…`(기능), `fix/…`(버그), `docs/…`(문서), `refactor/…`.

---

## 2. 커밋 습관

- **의미/단계 단위로 자주 커밋한다.** WIP(작업 중)여도 일단 커밋으로 남겨두고, 나중에 §3~§4로 정리하면 된다. (→ `PROJECT_PLAYBOOK.md` "단계마다 commit" 습관)
- **커밋 메시지 컨벤션 — Conventional Commits** `type: 요약`:
  - `feat:` 기능, `fix:` 버그, `docs:` 문서, `refactor:` 리팩터링, `style:` 포맷/스타일, `chore:` 잡일, `test:` 테스트.
  - 요약은 명령형·현재형 한 줄(예: `feat: Approach 스크롤 병합 latched 진행 적용`). 이 저장소 기존 커밋도 `feat: …` 형식.
- 되도록 **한 커밋 = 한 논리적 변경**. 잡다한 WIP는 §4로 합쳐 정리.

### 2.1 무엇을 포함하나 — `CLAUDE.md`·문서도 함께

- `CLAUDE.md`는 로컬/비밀 파일이 아니라 **저장소에 체크인해 두는 프로젝트 컨텍스트**(세션 시작 시 자동으로 읽히는 규칙·컨벤션·문서 인덱스)다 → **코드와 함께 커밋한다.** (프로젝트 규칙: `PROJECT_PLAYBOOK.md` 177행 *"단계 끝날 때마다 코드·CLAUDE.md 모두 히스토리로 보존"*.)
- 커밋 안 하고 두면 파일 내용과 실제 상태가 어긋나 **다음 세션이 낡은 `CLAUDE.md`를 읽고 헷갈린다.**
- 민감정보 없음(브랜드·이메일은 플레이스홀더)이라 **뺄 이유 없음.**
- **묶는 방식**: 코드와 관련 있으면 같이, **문서/인덱스만 바뀐 경우**(예: 문서 추가 + `CLAUDE.md` 인덱스 갱신)는 **별도 `docs:` 커밋**으로 빼면 코드 커밋이 깨끗하다.

### 2.2 여러 변경이 쌓였을 때 — 한 커밋으로 묶어도 되나

- **된다.** "한 커밋 = 한 논리 변경"은 이상론이고, **여태 쌓인 걸 정리하는 첫 커밋**은 한 덩어리로 묶는 게 흔하고 합리적이다(억지로 쪼개는 게 오히려 비효율).
- 대신 **메시지를 스코프가 드러나게** — 코드+문서가 섞였으면 요약 한 줄 + 본문 불릿으로 무엇이 들었는지 남긴다:
  ```
  feat: Approach 스크롤 병합 + reduced-motion SSR 대응 (진행)

  - Approach: latched 진행, color-mix 색 보간, 모바일 stagger, reduced-motion 가드
  - useReducedMotionSafe 훅 추가
  - 문서: FRAMER_MOTION §3.2/3.3, NEXTJS §7.1, CODE_REVIEW_LOG, GIT_WORKFLOW 등
  ```
- **진행 중이면** 메시지에 `(진행)`/체크포인트임을 표시. 급하지 않으면 잔여 정리 후 커밋하면 더 깔끔(남은 항목은 `CODE_REVIEW_LOG.md`에 기록돼 유실 없음).
- 이런 큰 lump을 앞으로 피하려면 §4 autosquash 습관을 쓴다.

---

## 3. 커밋 합치기 — interactive rebase (squash)

여러 WIP 커밋을 하나로 합칠 때. **로컬/미공유 커밋에만** 쓴다(§5 주의).

```bash
git rebase -i <base>     # 예: git rebase -i HEAD~3  또는  git rebase -i main
```

열리는 todo 목록의 규칙:
- **위 = 오래된 커밋, 아래 = 최신 커밋.**
- `squash`/`fixup`은 **바로 윗줄 커밋으로 접혀 들어간다.**
- 그래서 합쳐진 커밋의 **기준(정체성)은 그룹 맨 위에 `pick`으로 남긴 커밋**이다.

```
pick   a1b2c3  feat: 기능        ← 기준. 이 커밋으로 나머지가 합쳐짐
squash d4e5f6  wip
fixup  7a8b9c  wip2
```

**액션별 메시지 처리(중요):**
| 액션 | 하는 일 | 커밋 메시지 |
|---|---|---|
| `pick` (p) | 커밋 그대로 유지 | 그대로 |
| `squash` (s) | 윗줄로 합침 | **합쳐지는 커밋들 메시지가 에디터에 전부 딸려옴** → 직접 편집/취사선택 |
| `fixup` (f) | 윗줄로 합침 | **맨 위 pick 메시지만 남고** 나머지는 **버려짐** |
| `reword` (r) | 유지하되 메시지만 수정 | 새로 입력 |
| `drop` (d) | 커밋 삭제 | — |

→ **"어느 커밋 메시지를 기준으로?"**: 그룹 **맨 위 `pick` 커밋**. `squash`면 나머지 메시지도 에디터에 다 나와 합치고, `fixup`이면 그 pick 메시지만 남는다. **지저분한 wip 메시지를 없애고 싶으면 `fixup`.**

---

## 4. WIP 자동 합치기 — autosquash (권장)

"중간중간 커밋 → 나중에 하나로" 흐름에 딱 맞는 자동화:

```bash
git commit -m "feat: Approach reduced-motion SSR 가드"   # 1) 제대로 된 기준 커밋
# ...수정...
git commit --fixup=<기준커밋해시>                          # 2) 수정분은 fixup 커밋으로
# ...또 수정...
git commit --fixup=<기준커밋해시>
git rebase -i --autosquash <base>                        # 3) fixup들이 기준 아래 자동 배치 → 저장만
```

`--fixup=`으로 만든 커밋은 `--autosquash` 시 **자동으로 기준 커밋 아래에 `fixup`으로 정렬**되므로, todo에서 순서를 손으로 맞출 필요가 없다. 메시지도 기준 커밋 것만 남아 깔끔.

---

## 5. 주의 (history 재작성)

- **이미 push했거나 남과 공유한 커밋은 rebase로 바꾸지 않는다.** 히스토리가 갈라져 협업자와 충돌하고, `--force` push가 필요해진다. → **로컬·미공유 커밋에만** rebase 사용.
- rebase 중 **충돌**나면: 파일 해결 후 `git add` → `git rebase --continue`. 되돌리려면 `git rebase --abort`.
- 이 저장소는 지금 손코딩 단계라 주로 **로컬에서 정리 후 push** 흐름 → rebase squash는 push 전에.

---

## 참고

- 저장소 baseline/clone 전략·`ai-only` 태그: `NEXT_ROADMAP.md`, `README.md`, `CLAUDE.md`.
- 커밋 습관·진행 로그: `PROJECT_PLAYBOOK.md`.
- interactive rebase는 에디터를 여는 대화형 작업 → **개발자 터미널에서 직접** 수행(자동화 도구로는 안 됨).
