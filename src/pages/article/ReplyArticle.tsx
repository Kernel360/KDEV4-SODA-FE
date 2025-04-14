import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm from '../../components/articles/ArticleForm'
import { PriorityType } from '../../types/article'
import { Stage, TaskStatus } from '../../types/stage'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useToast } from '../../contexts/ToastContext'
import type { ArticleFormData } from '../../components/articles/ArticleForm'

interface ValidationErrors {
  title?: string
  content?: string
  priority?: string
  deadLine?: string
  stageId?: string
}

const ReplyArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const { showToast } = useToast()

  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    priority: PriorityType.MEDIUM,
    deadLine: null,
    stageId: '',
    links: [],
    files: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectId || !articleId) return

        // 먼저 원본 게시글 정보를 가져옵니다
        const articleResponse = await projectService.getArticleDetail(
          Number(projectId),
          Number(articleId)
        )

        if (!articleResponse) {
          throw new Error('원본 게시글 정보를 가져올 수 없습니다.')
        }

        // 단계 정보를 가져옵니다
        const stagesResponse = await projectService.getProjectStages(
          Number(projectId)
        )

        if (!stagesResponse || !Array.isArray(stagesResponse)) {
          throw new Error('단계 정보를 가져올 수 없습니다.')
        }

        // Transform API response to Stage type
        const transformedStages = stagesResponse.map(stage => ({
          id: stage.id,
          name: stage.name,
          stageOrder: stage.stageOrder,
          order: stage.stageOrder,
          tasks: (stage.tasks || []).map(task => ({
            id: task.taskId,
            title: task.title,
            description: task.content,
            status: '진행 중' as TaskStatus,
            order: task.taskOrder,
            stageId: stage.id
          }))
        }))

        setStages(transformedStages)

        // 폼 데이터를 설정합니다
        setFormData({
          title: `RE: ${articleResponse.title}`,
          content: '', // 답글은 빈 내용으로 시작
          stageId: String(
            articleResponse.stageId || transformedStages[0]?.id || ''
          ),
          priority: articleResponse.priority, // 원본 게시글의 우선순위를 상속
          deadLine: null,
          files: [],
          links: []
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, articleId])

  const validateForm = () => {
    const errors: ValidationErrors = {}
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
    if (!validateForm() || !projectId || !articleId) return

    try {
      setLoading(true)
      const request = {
        projectId: Number(projectId),
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        stageId: Number(formData.stageId),
        deadLine: formData.deadLine?.toISOString() || '',
        parentArticleId: Number(articleId), // 답글 작성 시 원본 게시글 ID만 추가
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || []
      }

      // 답글 생성
      const response = await projectService.createArticle(
        Number(projectId),
        request
      )

      // 파일이 있는 경우 파일 업로드
      if (formData.files && formData.files.length > 0 && response.data?.id) {
        try {
          await projectService.uploadArticleFiles(
            response.data.id,
            formData.files
          )
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError)
          showToast('파일 업로드에 실패했습니다.', 'error')
        }
      }

      showToast('답글이 성공적으로 작성되었습니다.', 'success')
      navigate(`/user/projects/${projectId}`)
    } catch (error) {
      console.error('Error creating reply:', error)
      if (error instanceof Error) {
        setError(error.message)
        showToast(error.message, 'error')
      } else {
        setError('답글 작성에 실패했습니다.')
        showToast('답글 작성에 실패했습니다.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <ArticleForm
      mode="create"
      formData={formData}
      stages={stages}
      isLoading={loading}
      validationErrors={validationErrors}
      onChange={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/user/projects/${projectId}`)}
    />
  )
}

export default ReplyArticle
