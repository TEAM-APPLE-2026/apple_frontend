// GitHub Pages 배포 때는 사이트가 /apple_frontend 아래에 있다(로컬은 빈 문자열).
// next/link · router는 basePath를 자동으로 붙이지만, <img src> · <a href> 같은 일반 경로는 직접 붙여야 한다.
// next.config.ts와 같은 NEXT_PUBLIC_BASE_PATH 값을 쓴다(빌드 때 코드에 박힘).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** public/ 파일이나 일반 <a href>용 경로 앞에 basePath를 붙인다. 예: withBasePath('/icons/x.svg') */
export const withBasePath = (path: string) => `${BASE_PATH}${path}`
