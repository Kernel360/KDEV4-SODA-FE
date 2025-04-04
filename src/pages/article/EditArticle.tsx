import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm, {
  ArticleFormData
} from '../../components/articles/ArticleForm'

const EditArticle: React.FC = () => {
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

  useEffect(() => {
    // TODO: API 호출하여 게시글 데이터 가져오기
    // 임시 데이터
    const fetchData = async () => {
      const mockData = {
        title: '수정할 게시글 제목',
        content: '수정할 게시글 내용',
        stage: '개발',
        priority: '높음',
        files: [],
        links: [{ title: '관련 문서', url: 'https://example.com/doc' }]
      }
      setFormData(mockData)
    }
    fetchData()
  }, [articleId])

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
        mode="edit"
        formData={formData}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={handleCancel}
      />
    </Box>
  )
}

export default EditArticle
