# Apple Frontend

Next.js(App Router), TypeScript, Tailwind CSS 기반 프론트엔드 프로젝트입니다.

## 시작하기

```bash
npm install
cp .env.example .env.local   # 처음 한 번. 값 채우기는 아래 "로컬 실행" 참고
npm run dev                  # http://localhost:3000
```

## 로컬 실행 (.env.local)

`.env.example`을 `.env.local`로 복사한 뒤 Supabase 프로젝트의 값을 채웁니다. `.env.local`은 git에 올라가지 않습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon(공개) 키
```

- 브라우저에 공개되는 **anon 키만** 넣습니다. `service_role` 키는 절대 넣지 않습니다.
- `NEXT_PUBLIC_BASE_PATH`는 로컬에서 **비워 둡니다**(배포 때만 `/apple_frontend`).
- 값을 바꾼 뒤에는 `npm run dev`를 다시 시작해야 반영됩니다.
- 연결 확인: 개발 서버에서 `/dev/check`를 엽니다(발표 전 삭제 예정인 개발용 페이지).

## 배포 (GitHub Pages)

`main`에 push하면 `.github/workflows/deploy.yml`이 정적 사이트(`out/`)를 빌드해 GitHub Pages에 배포합니다. 주소는 `https://<계정>.github.io/apple_frontend/`입니다.

- 레포 Settings › Pages › Source를 **GitHub Actions**로 설정합니다.
- 레포 Settings › Secrets and variables › Actions › **Variables** 탭에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록합니다(Secret 아님).
- 배포와 같은 조건으로 로컬에서 빌드해 보기: `NEXT_PUBLIC_BASE_PATH=/apple_frontend npm run build`
  - Windows Git Bash에서는 `/apple_frontend`가 Windows 경로로 바뀌어 빌드가 실패하므로 앞에 `MSYS_NO_PATHCONV=1`을 붙입니다.
  - PowerShell: `$env:NEXT_PUBLIC_BASE_PATH='/apple_frontend'; npm run build`

### 바뀐 주소 (정적 내보내기용, ID는 쿼리로 전달)

| 화면 | 이전 주소 | 새 주소 |
|---|---|---|
| 사건 자세히 보기 | `/cases/[id]` | `/cases/view?id=` |
| 그룹 대시보드 | `/groups/[id]` | `/groups/view?id=` (`&tab=` 선택) |
| 수임 제안서 읽기 (피해자) | `/groups/[id]/proposals/[firmId]` | `/groups/proposal?id=&firmId=` |
| 그룹 보기 (로펌) | `/firm/groups/[id]` | `/firm/groups/view?id=` |
| 수임 제안서 작성 (로펌) | `/firm/groups/[id]/proposal` | `/firm/groups/proposal?id=` |

링크는 주소 문자열을 직접 만들지 말고 `src/lib/routes.ts`의 `routes.*` 함수를 사용합니다. 예: `routes.caseView('telecom')`

## 주요 명령어

```bash
npm run lint
npm run typecheck
npm run build
```

## 디렉터리 구조

```text
src/
├── app/                 # 라우트, 레이아웃, 전역 스타일
├── components/
│   ├── common/          # 여러 기능에서 재사용하는 UI
│   └── layout/          # 헤더, 내비게이션 등 레이아웃 UI
├── features/            # 기능 단위 코드
├── hooks/               # 공용 커스텀 훅
├── lib/                 # 공용 유틸리티와 외부 연동 설정
└── types/               # 공용 타입
```

기능 코드는 `src/features/<feature-name>` 아래에 모으고, 특정 기능에서만 사용하는 컴포넌트·훅·타입도 해당 기능 폴더 안에 둡니다. 두 곳 이상에서 재사용할 때만 공용 디렉터리로 이동합니다.

## 협업 규칙

1. 작업 전 `main`을 최신 상태로 갱신합니다.
2. `feature/<feature-name>` 형식으로 브랜치를 생성합니다.
3. 기능 단위로 작게 커밋하고 Pull Request를 생성합니다.
4. PR 전 `npm run lint`, `npm run typecheck`, `npm run build`를 실행합니다.
5. 리뷰와 검증을 마친 뒤 `main`에 병합합니다.

## 개발 Supabase 연결

실제 화면은 `src/lib/backend/`(진입점 `@/lib/backend`)로 개발 DB에 연결됩니다. 연결된 화면, 남은 작업, `/dev/check`에서 하는 검사는 [실제 화면 연동 문서](docs/live-backend-integration.md)에 정리했습니다. `.env.example`을 참고하고 공개 키만 설정하세요.
