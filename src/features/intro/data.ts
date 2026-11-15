import type { BadgeTone } from '@/components/common/Badge'
import type { IconName } from '@/components/common/Icon'

// I-01 소개 페이지 콘텐츠. 사건 수치는 모두 [예시]입니다.

export type Col = { title: string; desc: string; sum: string }

export const ORGANIZE_COLS: Col[] = [
  { title: '근거를 함께 보여줘요', desc: '정리된 값마다 원문 어디에서 찾았는지 옆에 적어둬요.', sum: '값마다 원문 근거' },
  { title: '모르면 비워둬요', desc: '찾지 못한 값은 추측하지 않고 "확인 필요"로 남겨요.', sum: '추측 없이 빈칸으로' },
  { title: '직접 고칠 수 있어요', desc: '모든 칸은 내가 확인하고 고친 뒤에 저장돼요.', sum: '저장 전 직접 확인' },
]

export const GATHER_COLS: Col[] = [
  { title: '점수로 보는 비슷한 그룹', desc: '맞는 점 · 다른 점과 함께 점수로 비교해요. 70점 이상이면 같은 사건 가능성이 높아요.', sum: '70점 이상 · 같은 사건' },
  { title: '10명이면 대표자', desc: '개설자가 아니어도 돼요. 참여자 중 자원한 사람이 맡아요.', sum: '자원한 참여자 선정' },
  { title: '닉네임만 보여요', desc: '다른 참여자에게는 닉네임 · 피해 정도 · 시기만 공개돼요.', sum: '실명 · 연락처 비공개' },
]

export const SHEET = {
  quote: '"10월 초에 △△ 통신사에서 고객정보가 유출됐다는 문자를 받았어요. 이름, 연락처, 주소가 유출됐다고 했어요. 10월 초부터 택배 사칭 스미싱 문자가 세 번 왔어요. 아직 금전 피해는 없어요."',
  rows: [
    { key: '상대 기업', value: '[예시] △△ 통신사', source: '"△△ 통신사에서"' },
    { key: '피해 유형', value: '개인정보 유출', source: '"고객정보가 유출됐다는"' },
    { key: '통지 시점', value: '2026년 10월 초', source: '"10월 초에"' },
    { key: '유출된 정보', value: '이름 · 연락처 · 주소', source: '"이름, 연락처, 주소가"' },
    { key: '2차 피해', value: '스미싱 문자 3회', source: '"스미싱 문자가 세 번"' },
    { key: '카드 정보 유출', value: null, source: '원문에 없음' },
  ] as { key: string; value: string | null; source: string }[],
}

export const STEPS: { title: string; desc: string; icon: IconName; meta: string }[] = [
  { title: '피해 등록', desc: '무슨 일이 있었는지 글로 적어요.', icon: 'tl-clock', meta: '약 3분' },
  { title: 'AI 정리 확인', desc: '찾은 값과 근거를 보고, 빈칸은 직접 채워요.', icon: 'tl-edit', meta: '모든 칸 직접 수정' },
  { title: '그룹 참여', desc: '비슷한 그룹에 들어가거나 새로 열어요.', icon: 'tl-users', meta: '10명이 모이면 대표자' },
]

export type CaseCard = {
  id: string
  category: string
  badge: { label: string; tone: BadgeTone }
  title: string
  count: number
  goal?: number
  note: string
  status: string
}

export const CASES: CaseCard[] = [
  { id: 'telecom', category: '개인정보 유출', badge: { label: '대응 연결 중', tone: 'blue' }, title: '[예시] △△ 통신사 고객정보 유출', count: 214, goal: 300, note: '목표까지 86명 남음 · [예시 수치]', status: '대응 방법 투표 중 · 대표자 선정됨' },
  { id: 'shop', category: '개인정보 유출', badge: { label: '모집 중', tone: 'line' }, title: '[예시] ○○ 쇼핑몰 회원정보 유출', count: 87, goal: 100, note: '목표까지 13명 남음 · [예시 수치]', status: '대표자 선정됨 · 참여자 모집 중' },
  { id: 'card', category: '개인정보 유출', badge: { label: '모집 중', tone: 'line' }, title: '[예시] □□ 카드사 결제정보 유출', count: 46, goal: 50, note: '목표까지 4명 남음 · [예시 수치]', status: '대표자 선정됨 · 50명이 모이면 집단 신청 가능' },
  { id: 'location', category: '위치정보 침해', badge: { label: '모집 중', tone: 'line' }, title: '[예시] ◇◇ 앱 위치정보 무단 수집', count: 12, note: '목표 인원은 그룹에서 정하는 중 · [예시 수치]', status: '대표자 선정됨 · 목표 인원은 그룹에서 정하는 중' },
  { id: 'hospital', category: '의료정보 유출', badge: { label: '사건 진행 중', tone: 'white' }, title: '[예시] ☆☆ 병원 예약정보 유출', count: 523, note: '모집 마감 · [예시 수치]', status: '모집 마감 · 선정 로펌과 진행 중' },
]

export const FAQS = [
  { q: 'HANDE가 법률 자문을 해주나요?', a: '아니요. HANDE는 같은 피해자를 모으고, 대응 방법을 안내하고 연결하는 데까지만 도와요. 법률 판단은 선택한 로펌이나 기관에서 받아요.' },
  { q: '비용이 드나요?', a: 'HANDE 이용료는 없어요. 분쟁조정과 피해구제는 무료 절차이고, 사건 소개나 수임에 따른 수수료를 받지 않아요.' },
  { q: '로펌은 어떻게 정해지나요?', a: '공동소송으로 정해진 그룹에만 확인된 로펌이 수임 제안서를 보낼 수 있어요. 참여자는 제안서를 비교하고 1인 1표로 골라요. 누가 어디에 투표했는지는 공개되지 않아요.' },
  { q: '제 실명과 연락처는 누가 보나요?', a: '다른 참여자에게는 닉네임 · 피해 정도 · 시기만 보여요. 실명과 연락처는 공동소송에서 선정된 로펌에게만, 본인이 동의했을 때 전달돼요. 주민등록번호는 받지 않아요.' },
]

// 오른쪽 섹션 표시기 (01 / 05)
export const SECTIONS = [
  { id: 'organize', num: '01' },
  { id: 'gather', num: '02' },
  { id: 'decide', num: '03' },
  { id: 'cases', num: '05' },
] as const
