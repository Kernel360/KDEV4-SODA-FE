import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm, {
  ArticleFormData,
  ParentArticle
} from '../../components/articles/ArticleForm'
import type { Article } from '../../types/article'

const ReplyArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    stage: '요구사항',
    priority: '보통',
    files: [],
    links: []
  })

  const [parentArticle, setParentArticle] = useState<
    ParentArticle | undefined
  >()

  useEffect(() => {
    if (!projectId || !articleId) {
      navigate('/user/projects')
      return
    }

    // TODO: API 호출하여 원본 게시글 데이터 가져오기
    // 임시 데이터
    const fetchData = async () => {
      // 임시 데이터
      const mockArticle: Article = {
        id: Number(articleId),
        title: '로그인 기능 구현 관련 논의',
        content:
          '로그인 기능 구현과 관련하여 다음과 같은 사항들을 논의해야 합니다.',
        stage: '개발',
        priority: '높음',
        files: [],
        links: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 1,
          name: '홍길동',
          email: 'hong@example.com'
        }
      }

      const parentData: ParentArticle = {
        id: mockArticle.id,
        title: mockArticle.title,
        content: mockArticle.content,
        author: {
          name: mockArticle.author.name
        },
        createdAt: mockArticle.createdAt
      }

      setParentArticle(parentData)
      setFormData(prev => ({
        ...prev,
        title: `Re: ${mockArticle.title}`,
        stage: mockArticle.stage,
        priority: mockArticle.priority
      }))
    }

    fetchData()
  }, [projectId, articleId, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 호출
    console.log('Submit:', formData)
    navigate(`/user/projects/${projectId}/articles/${articleId}`)
  }

  const handleCancel = () => {
    navigate(`/user/projects/${projectId}/articles/${articleId}`)
  }

  return (
    <Box sx={{ p: 3 }}>
      <ArticleForm
        mode="reply"
        formData={formData}
        parentArticle={parentArticle}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={handleCancel}
      />
    </Box>
  )
}

export default ReplyArticle
