import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm, {
  ArticleFormData
} from '../../components/articles/ArticleForm'
import { useToast } from '../../contexts/ToastContext'
import { PriorityType } from '../../types/article'
import { projectService } from '../../services/projectService'
import ErrorMessage from '../../components/common/ErrorMessage'
import { Stage, TaskStatus } from '../../types/stage'

const CreateArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { showToast } = useToast()

  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    content?: string
    stageId?: string
  }>({})

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    stageId: '',
    priority: PriorityType.MEDIUM,
    deadLine: null,
    files: [],
    links: []
  })

  useEffect(() => {
    const fetchStages = async () => {
      try {
        if (!projectId) return
        const response = await projectService.getProjectStages(
          parseInt(projectId)
        )

        // response 자체가 stages 배열입니다
        if (!Array.isArray(response)) {
          throw new Error('Invalid response format')
        }

        const mappedStages = response.map((stage: any) => ({
          ...stage,
          order: stage.stageOrder,
          tasks: (stage.tasks || []).map((task: any) => ({
            id: task.taskId,
            title: task.title,
            description: task.content,
            status: '진행 중' as TaskStatus,
            order: task.taskOrder,
            stageId: stage.id
          }))
        }))

        setStages(mappedStages)
        if (mappedStages.length > 0) {
          setFormData(prev => ({
            ...prev,
            stageId: String(mappedStages[0].id)
          }))
        }
      } catch (err) {
        console.error('Error fetching stages:', err)
        setError('단계 목록을 불러오는데 실패했습니다.')
      }
    }

    fetchStages()
  }, [projectId])

  const validateForm = () => {
    const errors: typeof validationErrors = {}
    if (!formData.title.trim()) {
      errors.title = '제목을 입력해주세요.'
    }
    if (!formData.content.trim()) {
      errors.content = '내용을 입력해주세요.'
    }
    if (!formData.stageId) {
      errors.stageId = '단계를 선택해주세요.'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !projectId) return

    try {
      setLoading(true)
      const request = {
        projectId: Number(projectId),
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        stageId: Number(formData.stageId),
        deadLine: formData.deadLine?.toISOString() || '',
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || []
      }

      // 1. 먼저 게시글을 생성합니다
      const articleResponse = await projectService.createArticle(
        Number(projectId),
        request
      )
      console.log('Create article response data:', articleResponse)

      if (!articleResponse?.data?.id) {
        console.log('Response structure:', {
          response: articleResponse,
          data: articleResponse?.data,
          id: articleResponse?.data?.id
        })
        throw new Error('게시글 생성 후 ID를 받아올 수 없습니다.')
      }

      const newArticleId = articleResponse.data.id

      // 새로 추가된 파일이 있는 경우 파일 업로드
      const newFiles = formData.files.filter(file => !file.id)
      if (newFiles.length > 0) {
        console.log('새로 추가된 파일 업로드 시작:', newFiles)
        try {
          // URL.createObjectURL로 생성된 URL에서 실제 File 객체를 가져옴
          const fileObjects = await Promise.all(
            newFiles.map(async file => {
              const response = await fetch(file.url)
              const blob = await response.blob()
              return new File([blob], file.name, { type: file.type })
            })
          )

          const uploadResponse = await projectService.uploadArticleFiles(
            Number(newArticleId),
            fileObjects
          )
          console.log('파일 업로드 응답:', uploadResponse)
        } catch (uploadError) {
          console.error('파일 업로드 에러:', uploadError)
          showToast('파일 업로드에 실패했습니다.', 'error')
        }
      }

      showToast('게시글이 성공적으로 작성되었습니다.', 'success')
      navigate(`/user/projects/${projectId}/articles/${newArticleId}`) // 새로 생성된 게시글로 이동
    } catch (error) {
      console.error('Error creating article:', error)
      if (error instanceof Error) {
        setError(error.message)
        showToast(error.message, 'error')
      } else {
        setError('게시글 작성에 실패했습니다.')
        showToast('게시글 작성에 실패했습니다.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/user/projects/${projectId}`)
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <Box sx={{ p: 3 }}>
      <ArticleForm
        mode="create"
        formData={formData}
        stages={stages}
        isLoading={loading}
        validationErrors={validationErrors}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={handleCancel}
        projectId={Number(projectId)}
      />
    </Box>
  )
}

export default CreateArticle
