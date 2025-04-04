import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import ProjectHeader from '../../components/projects/ProjectHeader'
import ArticleForm from '../../components/articles/ArticleForm'
import type { Project } from '../../types/project'
import type { Article } from '../../types/article'
import type { ArticleFormData } from '../../components/articles/ArticleForm'

const EditArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const [project, setProject] = useState<Project | null>(null)
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (!projectId || !articleId) {
      navigate('/user/projects')
      return
    }

    // TODO: API 호출로 변경
    const dummyProject: Project = {
      id: Number(projectId),
      projectNumber: 'P2024001',
      name: '프로젝트 이름',
      description: '프로젝트 설명',
      status: '진행중',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clientCompany: '클라이언트 회사',
      devCompany: '개발 회사',
      systemManager: '시스템 관리자',
      clientManagers: [],
      clientParticipants: [],
      developmentManagers: [],
      developmentParticipants: [],
      managers: [],
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProject(dummyProject)

    // TODO: API 호출로 변경
    const dummyArticle: Article = {
      id: Number(articleId),
      title: '로그인 기능 구현 관련 논의',
      content:
        '로그인 기능 구현과 관련하여 다음과 같은 사항들을 논의해야 합니다:\n\n1. 소셜 로그인 지원 여부\n2. 보안 정책 수립\n3. 사용자 인증 방식\n4. 세션 관리 방법',
      stage: '개발',
      priority: '높음',
      files: [
        { id: 1, name: '로그인 플로우.pdf', url: '/files/1' },
        { id: 2, name: 'API 명세서.xlsx', url: '/files/2' }
      ],
      links: [
        { id: 1, title: 'Figma 디자인', url: 'https://figma.com/...' },
        { id: 2, title: 'API 문서', url: 'https://api-docs.com/...' }
      ],
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      author: {
        id: 1,
        name: '홍길동',
        email: 'hong@example.com'
      }
    }
    setArticle(dummyArticle)
  }, [projectId, articleId, navigate])

  const handleSubmit = (formData: ArticleFormData) => {
    // TODO: API 호출
    console.log('Form data:', formData)
    navigate(`/user/projects/${projectId}/articles/${articleId}`)
  }

  const handleCancel = () => {
    navigate(`/user/projects/${projectId}/articles/${articleId}`)
  }

  if (!project || !article) {
    return null // 또는 로딩 상태 표시
  }

  return (
    <Box>
      <ProjectHeader project={project} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <ArticleForm
          mode="edit"
          initialData={article}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Box>
    </Box>
  )
}

export default EditArticle
