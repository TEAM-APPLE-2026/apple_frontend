# Apple Frontend

Next.js(App Router), TypeScript, Tailwind CSS 기반 프론트엔드 프로젝트입니다.

## 시작하기

```bash
npm install
npm run dev
```

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
