// 시연용 로그인 규칙: 비밀번호에 "wrong"이 들어 있으면 로그인 실패 화면을 보여줌.
// 백엔드 연결 시 이 파일의 함수만 실제 API 호출로 바꾸면 됩니다.
export function demoLogin(password: string) {
  return !password.toLowerCase().includes('wrong')
}

// 사업자등록번호 10자리(하이픈 무시)만 확인됨으로 처리. 실제 국세청 조회는 하지 않음.
export function demoCheckBiz(value: string) {
  return value.replace(/\D/g, '').length === 10
}
