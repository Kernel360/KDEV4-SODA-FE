import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, IconButton, Stack } from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import ProjectHeader from '../../components/projects/ProjectHeader'
import ArticleForm, {
  ArticleFormData
} from '../../components/article/ArticleForm'
import type { Project } from '../../types/project'

const CreateArticle: React.FC = () => {
  const navigate = useNavigate()
  const { id: projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    stage: '',
    priority: undefined,
    files: [],
    links: [],
    dueDate: undefined
  })

  useEffect(() => {
    // TODO: API 호출로 프로젝트 정보 가져오기
    // 임시로 더미 데이터 사용
    setProject({
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
      participants: []
    })
  }, [projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 호출
    console.log('Form submitted:', formData)
    navigate(`/user/projects/${projectId}`)
  }

  const handleCancel = () => {
    navigate(`/user/projects/${projectId}`)
  }

  const handleBack = () => {
    navigate(`/user/projects/${projectId}`)
  }

  if (!project) {
    return null // 또는 로딩 상태 표시
  }

  return (
    <Box>
      <ProjectHeader project={project} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 3 }}>
          <IconButton
            onClick={handleBack}
            size="small">
            <ArrowLeft />
          </IconButton>
          <Typography variant="h6">새 게시글 작성</Typography>
        </Stack>
        <Paper>
          <ArticleForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Paper>
      </Box>
    </Box>
  )
}

export default CreateArticle
