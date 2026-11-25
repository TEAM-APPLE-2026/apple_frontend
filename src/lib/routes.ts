// ID가 들어가는 화면 주소. GitHub Pages(정적 내보내기)라서 /경로/[id] 대신 ?id= 쿼리를 쓴다.
// 화면으로 가는 링크는 직접 문자열을 만들지 말고 이 함수들을 사용할 것.
const q = (params: Record<string, string | undefined>) =>
  new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1])).toString()

export const routes = {
  caseView: (id: string) => `/cases/view?${q({ id })}`,
  groupView: (id: string, tab?: string) => `/groups/view?${q({ id, tab })}`,
  groupProposal: (id: string, firmId: string) => `/groups/proposal?${q({ id, firmId })}`,
  firmGroupView: (id: string) => `/firm/groups/view?${q({ id })}`,
  firmGroupProposal: (id: string) => `/firm/groups/proposal?${q({ id })}`,
}
