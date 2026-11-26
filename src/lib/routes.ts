// ID가 들어가는 화면 주소. GitHub Pages(정적 내보내기)라서 /경로/[id] 대신 ?id= 쿼리를 쓴다.
// 화면으로 가는 링크는 직접 문자열을 만들지 말고 이 함수들을 사용할 것.
const q = (params: Record<string, string | undefined>) =>
  new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1])).toString()

/** DB id(UUID) 형식인지. 주소의 ?id= 값을 API에 넘기기 전에 확인한다. */
export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

export const routes = {
  caseView: (id: string) => `/cases/view?${q({ id })}`,
  groupView: (id: string, tab?: string) => `/groups/view?${q({ id, tab })}`,
  groupProposal: (id: string, proposalId: string) => `/groups/proposal?${q({ id, proposalId })}`,
  firmGroupView: (id: string) => `/firm/groups/view?${q({ id })}`,
  firmGroupProposal: (id: string) => `/firm/groups/proposal?${q({ id })}`,
}
