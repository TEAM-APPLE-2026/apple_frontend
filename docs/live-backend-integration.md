# 실제 화면 연동 1차

기준: 소민님 PR #7 `feature/backend-setup`의 `5191471`. 기존 공용 `backend`(`src/lib/backend/`), `ai`, `supabase`, `routes` 모듈을 사용한다. 개발용 확인 화면은 `/dev/check` 하나만 둔다(아래 참고). main 병합·GitHub Pages 배포는 이번 작업에서 하지 않는다.

## 연결한 화면

- 로그인: 실제 Auth 로그인, 프로필 역할 확인, 역할이 다른 로그인 거절, 새로고침 시 세션 복원, 로그아웃.
- `/signup`: 계정 생성/인증 메일 안내, 기존 로그인 계정의 프로필 등록. 사용자와 로펌 역할은 최초 등록 후 바꾸지 않는다.
- 피해 등록: 실제 hande-ai 분석 → 원문/근거/필드 저장 → 사용자 수정 → 확인 → finalizeReport → 실제 그룹 매칭 → 참여/새 그룹 생성.
- 증빙: pending 등록 → Storage 업로드(upsert=false) → 실제 Edge 확인, 상태·확인 재시도·삭제·객체 삭제 재시도.
- 사건 목록/내 그룹/상세: 실제 그룹과 UUID, 페이지네이션, RLS로 제한된 본인 그룹 참여 정보. 가입·참여 성공을 가짜 시연 상태로 만들지 않는다.
- 대표자/대응 방법 투표: 본인 알림의 poll_id로 집계 조회, 대표자 지원, 투표 제출/변경, 투표 개설. 권한·정족수·기간·중복 검사는 DB 함수가 판단한다.
- 로펌 정보: 로펌 승인 신청(등록증 업로드 포함), 승인/사업자 상태 조회, 국세청 조회. active와 approved를 동일시하지 않는다.

`src/lib/backend/client.mjs`는 backend `feature/vote-proposal-id`의 `2658ccf` 버전으로 동기화했다(출처는 `src/lib/backend/index.ts` 주석). 실제 구현을 여기서 수정한 것이 아니라 백엔드 데이터 모듈을 그대로 가져왔다. 따라서 증빙·NTS 기능은 backend PR #8 배포가 전제다. 개발 DB에는 이미 반영돼 있으며 운영은 별도 확인이 필요하다.

## 아직 남은 연결

연락처 동의(grantContactConsent), 선정 로펌의 담당 사건·참여자 명단(getSelectedContacts), 공지(createNotice/listNotices)는 후속 작업이다. 로펌 제안서·로펌 선택 투표는 아래 "로펌 제안서 → 로펌 선택 투표"에서 연결했다.

- 로펌은 그룹 참여자가 아니라서 투표 진행 중에는 로펌 투표 pollId를 받을 API가 없다(polls 조회 권한 없음, poll_started 알림은 참여자에게만). 그래서 `getMyProposalVoteSummary`는 선정된 뒤 `firm_selected` 알림의 pollId로만 호출하고, 투표 중 내 득표는 표시하지 않는다. 투표 중 득표를 보여 주려면 backend에 로펌용 pollId 조회(예: 그룹별 최신 firm poll)가 필요하다.
- 선정되지 않은 로펌은 그룹의 `selectedFirmName`이 채워진 것으로 "선정되지 않음"을 표시하고, 득표 수는 보여 주지 않는다.
- 시연용 그룹 대시보드(`GroupDashboard.tsx`, 대응 방법 투표·KPI 예시)와 사이드바 내 그룹 목록(`groups/data.ts`)은 이번 범위가 아니어서 그대로 두었다. GroupDashboard는 현재 어느 경로에도 연결돼 있지 않다.

이번 1차 연결은 기존 공용 컴포넌트·CSS를 사용하지만, 실제 항목을 표현하면서 목록/정리/상세 내부 구성이 바뀐 부분은 프론트 담당자 디자인 리뷰가 필요하다.

## 로펌 제안서 → 로펌 선택 투표 (시연 장면 4·5)

예시 데이터(`features/firm/data.ts`, 로펌 store의 제안서 상태, 그룹 store의 로펌 투표 상태)와 `[시연]`·`[데모]` 마감 버튼을 없애고 실제 호출로 바꿨다. 화면 구성(JSX·CSS)은 기존 시연 화면을 유지했다. 데이터는 `features/firm/live.ts`(로펌), `features/groups/firmVote.ts`(피해자)에서 읽는다.

| 화면 | 주소 | 사용하는 함수 |
| --- | --- | --- |
| 로펌 사건 탐색(GroupExplorer) | `/firm` | listGroups(공동소송 그룹만), listProposals(내 것), getGroupStats(승인된 로펌만 2차 피해·증거 보유율) |
| 로펌 그룹 보기 | `/firm/groups/view?id=` | getGroup, getGroupStats, listProposals |
| 제안서 작성·수정·철회(ProposalForm) | `/firm/groups/proposal?id=` | submitProposal, updateProposal(철회한 제안서 재제출 포함), withdrawProposal |
| 내 제안서(ProposalList) | `/firm/proposals` | listProposals, listNotifications(firm_selected), getMyProposalVoteSummary(선정 후) |
| 피해자 그룹 상세의 로펌 제안서(FirmsPanel) | `/groups/view?id=` | listProposals, listNotifications(poll_started·kind=firm), getVoteSummary, castFirmVote(선택지의 proposalId), 대표자: setProposalDeadline, openPoll(kind='firm') |
| 제안서 상세(ProposalView) | `/groups/proposal?id=&proposalId=` | 위와 같음 |

- 제안서 칸: 착수금은 1인당 원 단위 정수(0이면 "없음"), 성공보수 0~100(소수 둘째 자리), 담당 변호사 수 1명 이상. 서버 `validate_proposal` 기준과 같다.
- 투표는 서버 투표라 취소가 없다. 다른 로펌을 누르면 바뀐다.
- 투표 마감·집계는 서버 Cron(close_due_votes)이 한다. 화면은 마감 시간이 지나고 집계 전이면 "집계 중", 집계 후 `winnerOptionId`·`selectedFirmName`으로 선정 로펌을 표시한다. 동점·투표 없음·취소면 대표자가 다시 열 수 있다고 안내한다.
- DB 오류 코드는 `friendlyError(e, action)`(`src/lib/live-api.ts`)에서 상황별 쉬운 말로 바꾼다. 예: FIRM_NOT_APPROVED → 승인·사업자 확인 안내, PROPOSAL_CLOSED → 제안 접수 기간 아님(투표 열기에서는 "제안 마감일이 지나야"), POLL_CLOSED, POLL_NOT_OPEN, NOT_ELIGIBLE(투표: 투표가 열릴 때 참여 중이던 분만 / 투표 열기: 승인된 로펌 제안서 1건 이상 필요), CONFLICT(이미 낸 제안서·마감일 변경 불가·진행 중인 투표).

### 시연 순서 (hande_dev)

1. 준비: 피해자 그룹이 대표자 선정 → 대응 방법 투표에서 공동소송(`suit`)으로 정해져 `proposal_collection` 단계여야 한다. 로펌 계정은 승인(approved)·계속사업자(active) 상태여야 한다(개발 DB는 firm_auto_approve 설정 시 자동 승인).
2. 피해자(대표자) `/groups/view?id=` → 로펌 제안서 → 대표자 메뉴에서 제안 마감일 저장(setProposalDeadline). 제안서가 들어오기 전까지만 바꿀 수 있다.
3. 로펌 `/firm` → 그룹의 "제안서 작성" → 미리보기 → 제출(submitProposal). `/firm/proposals`에서 "제출됨" 확인. 마감 전에는 수정·철회 가능.
4. 제안 마감일이 지나면 대표자가 로펌 투표 시작·마감 시간을 넣고 "로펌 투표 열기"(openPoll kind='firm'). 로펌 화면은 "피해자 투표 중"으로 바뀐다.
5. 참여자가 제안서 카드나 상세에서 "이 로펌에 투표하기"(castFirmVote). 마감 전에는 다른 로펌으로 바꿀 수 있다.
6. 마감 시간이 지나면 서버 Cron이 집계한다(1분 간격). 새로고침하면 피해자 화면에 "선정된 로펌", 로펌 화면에 "선정됨 · n표" 또는 "선정되지 않음"이 표시된다.

시연 시간을 줄이려면 2~4단계의 마감 시간을 몇 분 뒤로 잡는다. 화면에서 마감을 앞당기는 버튼은 없다.

## 개발용 확인 화면 (/dev/check)

PR #8의 `/dev/backend` 화면과 `src/lib/backend.ts`·`src/lib/backend-client.mjs`(오래된 client.mjs 복사본)는 정리하면서 삭제했다. `/dev/backend`에서 하던 검사 가운데 실제 화면으로 확인할 수 없는 것만 `/dev/check`로 옮겼다.

- 공개 키 확인: `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 anon/publishable 키인지, URL과 같은 프로젝트의 키인지 표시한다. secret/service_role 키를 넣은 실수를 잡는다.
- 로펌 승인 상태 전이: 로펌 계정으로 로그인한 뒤 버튼을 누르면 getMyFirm → verifyBusiness → getMyFirm을 실행한다. 승인 상태가 그대로이거나 pending → approved(개발 DB `firm_auto_approve` 설정)일 때만 통과다. rejected가 바뀌거나 응답과 DB 값이 다르면 실패로 표시한다.
- 기존 항목: Supabase 연결(listGroups), 로그인 세션, analyze 결과.

로그인·프로필·로그아웃, 사례 저장·재조회, 증빙 업로드·확인 재시도·삭제·객체 삭제 재시도, 국세청 조회, 그룹 목록은 실제 화면에서 확인한다(로그인 화면, `/report`, `/firm/profile`, `/cases`).

`/dev/check`는 정적 빌드에 포함되므로 발표 전에 `src/app/dev`를 삭제한다. 로컬에서 Turbopack 파일 감시가 실패하면 `npm run dev -- --webpack`으로 실행한다(PR #8 작업 환경에서 확인된 문제).

## 로펌 테스트 계정 만들기 (hande_dev만)

1. 로컬에서 `.env.local`을 hande_dev URL과 공개 키로 설정하고 실행한다.
2. `/signup`에서 별도 이메일로 계정을 만들고 유형을 `로펌`으로 선택한다. 인증 메일이 필요하면 인증 후 로그인해서 같은 화면에서 프로필 등록을 완료한다.
3. `/firm/profile`에서 `테스트 로펌(가상)` 등 가상 명칭과 테스트용 등록증을 사용해 승인 신청한다. 실제 로펌·변호사로 오인될 정보를 쓰지 않는다.
4. pending 상태에서 제안서 제출/개인정보 열람이 거절되는지 확인한다. 계속사업자여도 운영자가 승인하지 않으면 pending을 유지해야 한다.
5. 임의의 10자리 사업자번호는 실제 국세청에서 unknown으로 나올 수 있다. 정상 active 조회 검증은 사용 허락받은 실제 사업자번호와 개발 Edge의 NTS_SERVICE_KEY 설정이 필요하다. 그 키를 프론트에 넣지 않는다.

실제 개인 명의 로펌 검증이나 운영자 승인, 테스트 계정 자동 승인은 이번 작업에서 실행하지 않았다. 운영 Cron도 변경하지 않았다.

## 검증

- TypeScript 검사 통과.
- ESLint 오류 0. 기존 이미지 경고와 백엔드 원본 모듈의 미사용 인자 경고 2개.
- 정적 내보내기 webpack 빌드 통과(쿼리 주소·Suspense 유지).
- 로컬 정적 서버 `/login/` HTTP 200.
- 브라우저 제어 연결 장애로 이번 새 제품 화면의 실제 Auth·저장·그룹 생성 E2E는 완료하지 못했다. 이전 별도 테스트 도구의 실제 Storage 검증 결과와 구분한다.

## 가입 오류 수정 (2026-11-25)

Auth 로그에서 email_address_invalid(400)와 over_email_send_rate_limit(429)를 확인했다. 원시 로그·이메일·비밀번호는 문서에 저장하지 않았다. 이전 공용 어댑터가 이 코드를 INTERNAL_ERROR로 묶었으므로, 이메일 주소·인증 요청 제한·비밀번호 조건·기존 계정·가입 비활성화 오류를 안전한 고정 문구로 구분했다. 해당 어댑터 테스트를 추가했다.

가입 화면은 새 계정의 이메일/비밀번호를 필수로 받고, 로그인한 계정은 프로필 등록만 진행하도록 구분했다. 닉네임 최대 길이를 DB의 40자에 맞췄다. 로펌 역할 선택은 가입/이메일 인증 후 프로필 등록으로 이어진다. 인증 메일 발송 뒤 반복 가입 버튼 대신 로그인 안내를 표시한다.

메일 발송 제한 자체는 화면 수정으로 해제하지 않았다. 이메일 인증 설정·전송 제한·운영 권한을 변경하지 않았다.
