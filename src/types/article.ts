export interface Article {
  id: number
  title: string
  content: string
  stage: '요구사항' | '설계' | '개발' | '테스트' | '배포'
  priority: '낮음' | '보통' | '높음'
  files: {
    id: number
    name: string
    url: string
  }[]
  links: {
    id: number
    title: string
    url: string
  }[]
  createdAt: string
  updatedAt: string
  author: {
    id: number
    name: string
    email: string
  }
}
