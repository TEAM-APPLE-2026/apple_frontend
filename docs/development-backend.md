# 개발 Supabase 연결 (1차)

## 실행

1. `.env.example`을 `.env.local`로 복사하고 hande_dev의 **공개** anon/publishable 키를 설정한다. 테스트 비밀번호와 service_role 키는 프론트 환경변수에 넣지 않는다.
2. `npm ci` 후 `npm run dev -- --webpack`으로 실행한다. 이 작업 환경에서는 Turbopack의 FSEvent 감시가 실패하여 webpack으로 검증했다.
3. `/dev/backend`에 접속한다. 운영 빌드에서는 404이고, 개발 화면도 지정한 hande_dev URL 외에는 연결하지 않는다.

## 구현 범위

- 실제 Auth 로그인, 프로필·역할 조회, 로그아웃. 세션은 메모리에만 보관한다.
- 피해자: 직접 입력한 기업·피해 내용 저장과 재조회. 미확정 값은 needsCheck=true로 저장하며, 예시 AI 결과를 실제 분석 결과로 저장하지 않는다.
- 증빙: 등록 RPC → 실제 파일 업로드(upsert=false) → Edge 확인. pending/ready/failed 표시, 확인 재시도·삭제·객체 삭제 재시도.
- 로펌: DB에 등록된 번호로 국세청 조회, 조회 전후 approvalStatus가 같은지 확인.
- 실제 그룹 목록 조회. 기존 시연 데이터와 섞지 않는다.
- `src/lib/backend-client.mjs`는 backend PR #8 데이터 모듈을 복사했다. TypeScript 입력 주석과 사용하지 않는 인자 제거 외 동작 변경은 없다. backend API가 바뀌면 함께 갱신한다.

## 연결 상태와 남은 작업

이 화면은 실제 개발 연결을 검증하는 화면이다. 기존 `/login`, `/report`, 그룹·투표 등 제품 화면은 여전히 시연 모듈을 사용한다. 해당 화면을 모두 연결한 것으로 간주하지 않는다.

다음에는 AI 모듈이 반환하는 ReportField를 피해 등록 화면에 연결한 뒤 saveReport/getReport/finalizeReport를 붙이고, 실제 그룹 ID 기반 조회·참여·투표로 교체한다. 시연 그룹 ID(`telecom` 등)는 DB UUID가 아니므로 그대로 전달하지 않는다.

## 검증 (2026-11-25)

- TypeScript 검사 통과.
- ESLint 오류 0, 기존 Icon 이미지 경고 1개.
- `next build --webpack` 통과.
- backend: 정책 수정 포함 로컬 28개 통과, hande_dev 롤백 SQL 통과.
- 별도 브라우저 통합 검사: 실제 Auth·프로필, PNG/JPG/PDF 업로드→ready, 가짜 파일·크기 초과 거절, 타인 접근 거절, 덮어쓰기 거절, 삭제 재시도 통과.
- 로펌 계정·신청 데이터가 설정되지 않아 실제 국세청 조회와 로펌 JWT로 하는 원본 접근 검사는 미완료다. 이를 통과로 기록하지 않는다.
- 운영 Cron 등록과 사전 확인은 이번 범위에서 제외했다.
