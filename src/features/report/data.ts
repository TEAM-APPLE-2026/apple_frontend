// 피해 등록 시연 데이터. "시연 화면이라 정리 결과는 예시 문장 기준으로 보여줘요." (Figma U-06)

export const EXAMPLE_TEXT =
  '10월 초에 △△ 통신사에서 고객정보가 유출됐다는 문자를 받았어요. 이름, 연락처, 주소가 유출됐다고 했어요. 10월 초부터 택배 사칭 스미싱 문자가 세 번 왔어요. 아직 금전 피해는 없어요.'

export type ReportField = {
  key: string
  label: string
  /** null = 원문에 없어 확인 필요 */
  value: string | null
  source?: string
  edited?: boolean
  /** 새 그룹 요약(U-11)에 넣을 칸 */
  summary?: boolean
}

export const EXAMPLE_FIELDS: ReportField[] = [
  { key: 'company', label: '상대 기업', value: '[예시] △△ 통신사', source: '△△ 통신사에서', summary: true },
  { key: 'type', label: '피해 유형', value: '개인정보 유출', source: '고객정보가 유출됐다는', summary: true },
  { key: 'when', label: '통지 시점', value: '2026년 10월 초', source: '10월 초에', summary: true },
  { key: 'leaked', label: '유출된 정보', value: '이름 · 연락처 · 주소', source: '이름, 연락처, 주소가 유출됐다고', summary: true },
  { key: 'secondary', label: '2차 피해', value: '택배 사칭 스미싱 문자 3회', source: '택배 사칭 스미싱 문자가 세 번', summary: true },
  { key: 'card', label: '카드 정보 유출', value: null },
]

export const EVIDENCE = ['유출 안내 문자 캡처', '스미싱 문자 캡처']

/** 시연 규칙: 너무 짧은 글은 정리 실패(U-05), "통신사"가 들어가면 같은 사건을 찾음(U-09) */
export const MIN_TEXT = 10
export const MATCH_KEYWORD = '통신사'
export const MATCH = { id: 'telecom', score: 89, title: '[예시] △△ 통신사 고객정보 유출', meta: '개인정보 유출 · 214명 참여 · 대응 연결 중' }
