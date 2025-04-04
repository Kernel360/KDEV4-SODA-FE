import React, { useState } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm, {
  ArticleFormData
} from '../../components/articles/ArticleForm'

const CreateArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    stage: '요구사항',
    priority: '보통',
    files: [],
    links: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 호출
    console.log('Submit:', formData)
  }

  const handleCancel = () => {
    navigate(`/user/projects/${projectId}`)
  }

  return (
    <Box sx={{ p: 3 }}>
      <ArticleForm
        mode="create"
        formData={formData}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={handleCancel}
      />
    </Box>
  )
}

export default CreateArticle
