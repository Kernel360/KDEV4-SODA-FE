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
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

interface VoteForm {
  title: string
  voteItems: string[]
  allowMultipleSelection: boolean
  allowTextAnswer: boolean
  deadLine: dayjs.Dayjs | null
}

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
    fileList: [],
    linkList: []
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

  const handleSubmit = async (e: React.FormEvent, voteData?: VoteForm) => {
    e.preventDefault()
    setLoading(true)
    setValidationErrors({})

    try {
      // 게시글 생성
      const articleResponse = await projectService.createArticle(
        Number(projectId),
        {
          projectId: Number(projectId),
          title: formData.title,
          content: formData.content,
          stageId: Number(formData.stageId),
          priority: formData.priority,
          deadLine: formData.deadLine?.toISOString(),
          linkList: formData.linkList.map(link => ({
            urlAddress: link.urlAddress,
            urlDescription: link.urlDescription
          }))
        }
      )

      // 파일 업로드
      const newFiles = formData.fileList.filter(file => !file.id)
      if (newFiles.length > 0) {
        try {
          const fileObjects = await Promise.all(
            newFiles.map(async file => {
              const response = await fetch(file.url)
              const blob = await response.blob()
              return new File([blob], file.name, { type: file.type || '' })
            })
          )
          await projectService.uploadArticleFiles(
            articleResponse.data.id,
            fileObjects
          )
        } catch (error) {
          console.error('파일 업로드 중 오류 발생:', error)
          toast.error('파일 업로드에 실패했습니다.')
        }
      }

      // 투표 생성
      if (voteData && voteData.title) {
        try {
          const voteItems = voteData.allowTextAnswer
            ? []
            : voteData.voteItems.filter(item => item.trim() !== '')

          if (!voteData.title.trim()) {
            throw new Error('투표 제목을 입력해주세요.')
          }
          if (!voteData.allowTextAnswer && voteItems.length === 0) {
            throw new Error('투표 항목을 입력해주세요.')
          }

          await projectService.createVote(articleResponse.data.id, {
            title: voteData.title,
            voteItems: voteItems,
            allowMultipleSelection: voteData.allowMultipleSelection,
            allowTextAnswer: voteData.allowTextAnswer,
            deadLine: voteData.deadLine?.toISOString()
          })
        } catch (error) {
          console.error('투표 생성 중 오류 발생:', error)
          toast.error(error.message || '투표 생성에 실패했습니다.')
        }
      }

      toast.success('게시글이 생성되었습니다.')
      navigate(`/user/projects/${projectId}?tab=articles`)
    } catch (error: any) {
      console.error('게시글 생성 중 오류 발생:', error)
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors)
      } else {
        toast.error('게시글 생성에 실패했습니다.')
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
        articleId={undefined}
      />
    </Box>
  )
}

export default CreateArticle
