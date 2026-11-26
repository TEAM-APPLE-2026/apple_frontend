import { backend } from '@/lib/backend'

export type ApiResult<T> = { data: T; error?: never } | { error: { code: string; message: string }; data?: never }
export type Profile = { profile: { id: string; role: 'user' | 'firm'; nickname: string }; firm: Firm | null }
export type Firm = { id: string; firmName: string; repName: string | null; openDate: string | null; approvalStatus: string; bizStatus: string; bizValid: string; rejectReason: string | null }
export type BusinessCheck = { firmId: string; bizStatus: string; bizValid: string; approvalStatus: string }
export type Group = { id: string; name: string; company: string; harmType: 'privacy_leak'; description: string; conditions: string; status: string; subStatus: string; memberCount: number; periodStart: string | null; periodEnd: string | null; requiredEvidence: string[]; method: 'med' | 'consumer' | 'collective' | 'suit' | null; proposalDeadline: string | null; selectedFirmName: string | null }
export type Page<T> = { items: T[]; nextCursor: string | null }
export type Receipt = { reportId: string; status: string }
// Boundary types follow backend integration-contract.md. Keep the supplied client.mjs unchanged.
export class BackendError extends Error { constructor(public code:string,message:string){super(message)} }
export async function call<T>(method: string, input?: unknown): Promise<T> {
  const client = backend as unknown as Record<string, (input?: unknown) => Promise<ApiResult<T>>>
  const result = await client[method](input)
  if (result.error) throw new BackendError(result.error.code,result.error.message)
  return result.data
}

// 제안서·투표 (backend integration-contract.md 2장)
export type ProposalInput = { retainerFee: number; successFeePct: number; period: string; strategy: string; lawyerCount: number; leadLawyer: string }
export type Proposal = ProposalInput & { id: string; groupId: string; firmId: string; firmName: string; status: 'draft' | 'submitted' | 'withdrawn'; submittedAt: string | null; updatedAt: string }
export type PollState = 'scheduled' | 'open' | 'closed' | 'tied' | 'no_votes' | 'cancelled'
export type VoteOption = { optionId: string; label: string; voteCount: number; proposalId: string | null; methodCode: string | null; candidateUserId: string | null }
export type VoteSummary = { pollId: string; kind: 'representative' | 'method' | 'firm'; state: PollState; opensAt: string; closesAt: string; serverTime: string; totalVotes: number; options: VoteOption[]; myOptionId: string | null; winnerOptionId: string | null; isFinalized: boolean }
export type MyProposalVote = { pollId: string; state: PollState; isFinalized: boolean; closesAt: string; myProposalId: string; myVoteCount: number }
export type Membership = { groupId: string; isRep: boolean; joinedAt: string; leftAt: string | null }
export type GroupStats = { groupId: string; memberCount: number; secondaryYesCount: number; secondaryKnownCount: number; secondaryRatio: number | null; evidenceHolderCount: number; evidenceRatio: number | null }
export type Notification = { id: string; type: string; groupId: string | null; payload: { poll_id?: string; kind?: string }; createdAt: string }

/** 화면에서 하는 일. 같은 오류 코드라도 상황에 따라 안내 문구가 다르다. */
export type Action = 'proposal' | 'withdraw' | 'vote' | 'deadline' | 'openPoll' | 'load'

// DB 오류 코드를 쉬운 말로 바꾼다. 코드가 없거나 모르는 코드면 백엔드 기본 문구를 쓴다.
const FRIENDLY: Record<string, string | Partial<Record<Action | 'default', string>>> = {
  AUTH_REQUIRED: '로그인이 필요해요. 다시 로그인해 주세요.',
  FIRM_NOT_APPROVED: '운영자 승인과 사업자 확인(계속사업자)이 끝난 로펌만 할 수 있어요. 로펌 정보에서 상태를 확인해 주세요.',
  PROPOSAL_CLOSED: {
    default: '지금은 제안서를 받는 기간이 아니에요. 제안 마감이 지났거나 아직 마감일이 정해지지 않았어요.',
    openPoll: '제안 마감일이 지나야 로펌 투표를 열 수 있어요.',
  },
  POLL_CLOSED: '투표가 마감됐어요. 새로고침해서 결과를 확인해 주세요.',
  POLL_NOT_OPEN: '아직 투표 시작 전이에요. 시작 시간 이후에 다시 시도해 주세요.',
  NOT_ELIGIBLE: {
    default: '참여 조건을 충족하지 않아요.',
    vote: '투표가 열릴 때 그룹에 참여 중이던 분만 투표할 수 있어요.',
    openPoll: '승인된 로펌이 낸 제안서가 1건 이상 있어야 로펌 투표를 열 수 있어요.',
  },
  FORBIDDEN: { default: '접근 권한이 없어요.', deadline: '그룹 대표자만 할 수 있어요.', openPoll: '그룹 대표자만 할 수 있어요.' },
  CONFLICT: {
    default: '상태가 바뀌었어요. 새로고침한 뒤 다시 시도해 주세요.',
    proposal: '이미 이 그룹에 낸 제안서가 있어요. 내 제안서에서 수정해 주세요.',
    deadline: '이미 제안서가 들어왔거나 공동소송 그룹이 아니라서 마감일을 바꿀 수 없어요.',
    openPoll: '이미 진행 중인 투표가 있거나, 지난 로펌 투표가 끝나 다시 열 수 없어요.',
  },
  INVALID_INPUT: {
    default: '입력값을 확인해 주세요.',
    deadline: '마감일은 지금 이후 90일 안으로 골라 주세요.',
    openPoll: '마감은 시작보다 늦고 지금 이후여야 해요. 기간은 30일까지예요.',
    proposal: '입력값을 확인해 주세요. 착수금은 원 단위 정수, 성공보수는 0~100, 변호사 수는 1명 이상이에요.',
  },
  NOT_FOUND: { default: '찾을 수 없어요. 목록에서 다시 들어와 주세요.', vote: '선택한 제안서가 이번 투표에 없어요. 새로고침해 주세요.' },
  NETWORK_ERROR: '연결이 불안정해요. 인터넷 연결을 확인하고 다시 시도해 주세요.',
}
export function friendlyError(e: unknown, action: Action = 'load'): string {
  if (e instanceof BackendError) {
    const entry = FRIENDLY[e.code]
    if (typeof entry === 'string') return entry
    if (entry) return entry[action] ?? entry.default ?? e.message
    return e.message
  }
  return e instanceof Error ? e.message : '처리하지 못했어요. 다시 시도해 주세요.'
}

/** 목록 API를 끝까지 읽는다(시연 규모 기준, 최대 pages쪽). */
export async function listAll<T>(method: string, input: Record<string, unknown> = {}, pages = 10): Promise<T[]> {
  const items: T[] = []
  let cursor: string | null = null
  for (let i = 0; i < pages; i++) {
    const page: Page<T> = await call<Page<T>>(method, { ...input, cursor, limit: 100 })
    items.push(...page.items)
    cursor = page.nextCursor
    if (!cursor) break
  }
  return items
}

export const formatDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '미정'
export const formatDate = (iso: string | null) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
export const formatWon = (n: number) => (n === 0 ? '없음' : `1인 ${n.toLocaleString('ko-KR')}원`)
