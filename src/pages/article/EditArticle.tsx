import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Article, PriorityType } from '../../types/article'
import { projectService } from '../../services/projectService'
import { Box, Typography } from '@mui/material'
import ArticleForm, {
  ArticleFormData
} from '../../components/articles/ArticleForm'
import { Stage, TaskStatus } from '../../types/stage'
import { useToast } from '../../contexts/ToastContext'

const EditArticle: React.FC = () => {
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [article, setArticle] = useState<Article | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    const fetchData = async () => {
      try {
        if (!projectId || !articleId) return

        // 먼저 게시글 상세 정보를 가져옵니다
        const articleResponse = await projectService.getArticleDetail(
          Number(projectId),
          Number(articleId)
        )

        if (!articleResponse) {
          throw new Error('게시글 정보를 가져올 수 없습니다.')
        }

        setArticle(articleResponse)

        // 그 다음 단계 정보를 가져옵니다
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

        // 게시글 정보로 폼 데이터를 설정합니다 (단계 정보를 가져온 후)
        setFormData({
          title: articleResponse.title,
          content: articleResponse.content,
          stageId: String(
            articleResponse.stageId || transformedStages[0]?.id || ''
          ),
          priority: articleResponse.priority,
          deadLine: articleResponse.deadLine
            ? new Date(articleResponse.deadLine)
            : null,
          files: [],
          links:
            articleResponse.linkList?.map(link => ({
              title: link.urlDescription,
              url: link.urlAddress
            })) || []
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!articleId || !projectId) {
        throw new Error('게시글 ID 또는 프로젝트 ID가 없습니다.')
      }

      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error('사용자 정보를 찾을 수 없습니다.')
      }

      const request = {
        projectId: Number(projectId),
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        stageId: Number(formData.stageId),
        deadLine: formData.deadLine?.toISOString() || '', // null 대신 빈 문자열 사용
        memberId: Number(userId),
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || []
      }

      console.log('Updating article with request:', request) // 요청 데이터 로깅
      await projectService.updateArticle(Number(articleId), request)

      // 파일이 있는 경우 파일 업로드
      if (formData.files && formData.files.length > 0) {
        try {
          await projectService.uploadArticleFiles(
            Number(articleId),
            formData.files
          )
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError)
          showToast('파일 업로드에 실패했습니다.', 'error')
        }
      }

      showToast('게시글이 성공적으로 수정되었습니다.', 'success')
      navigate(`/user/projects/${projectId}/articles/${articleId}`)
    } catch (error) {
      console.error('Error updating article:', error)
      if (error instanceof Error) {
        setError(error.message)
        showToast(error.message, 'error')
      } else {
        setError('게시글 수정에 실패했습니다.')
        showToast('게시글 수정에 실패했습니다.', 'error')
      }
    }
  }

  if (loading) {
    return <Typography>로딩 중...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  if (!article) {
    return <Typography>게시글을 찾을 수 없습니다.</Typography>
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom>
        게시글 수정
      </Typography>
      <ArticleForm
        mode="edit"
        formData={formData}
        stages={stages}
        isLoading={loading}
        validationErrors={{}}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/user/projects/${projectId}/articles/${articleId}`)
        }
      />
    </Box>
  )
}

export default EditArticle
