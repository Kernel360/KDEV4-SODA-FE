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
import { useUserStore } from '../../stores/userStore'

const EditArticle: React.FC = () => {
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useUserStore()
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
    // 로그인 상태 확인
    if (!user) {
      showToast('로그인이 필요합니다.', 'error')
      navigate('/login')
      return
    }

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
              id: link.id,
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
  }, [projectId, articleId, user, navigate, showToast])

  const handleDeleteLink = async (linkId: number) => {
    if (!linkId || !articleId) return

    try {
      setLoading(true)
      // 1. 링크 삭제 API 호출
      await projectService.deleteArticleLink(Number(articleId), linkId)

      // 2. formData에서 해당 링크를 즉시 제거
      setFormData(prev => ({
        ...prev,
        links: prev.links.filter(link => link.id !== linkId)
      }))

      // 3. 게시글 정보를 다시 가져와서 상태 업데이트
      const updatedArticle = await projectService.getArticleDetail(
        Number(projectId),
        Number(articleId)
      )
      if (updatedArticle) {
        setArticle(updatedArticle)
      }

      showToast('링크가 삭제되었습니다.', 'success')
    } catch (error) {
      console.error('Error deleting link:', error)
      showToast('링크 삭제에 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!articleId || !projectId) {
        throw new Error('게시글 ID 또는 프로젝트 ID가 없습니다.')
      }

      if (!user) {
        showToast('로그인이 필요합니다.', 'error')
        navigate('/login')
        return
      }

      // 현재 formData의 상태로 게시글 수정
      const request = {
        projectId: Number(projectId),
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        stageId: Number(formData.stageId),
        deadLine: formData.deadLine?.toISOString() || '',
        memberId: user.id,
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || []
      }

      console.log('Updating article with request:', request)
      const updatedArticle = await projectService.updateArticle(
        Number(articleId),
        request
      )

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

      // 최종 상태 업데이트
      setArticle(updatedArticle)
      setFormData(prev => ({
        ...prev,
        links:
          updatedArticle.linkList?.map(link => ({
            id: link.id,
            title: link.urlDescription,
            url: link.urlAddress
          })) || []
      }))

      showToast('게시글이 성공적으로 수정되었습니다.', 'success')
      navigate(`/user/projects/${projectId}/articles/${articleId}`)
    } catch (error) {
      console.error('Error updating article:', error)
      if (error instanceof Error) {
        showToast(error.message, 'error')
      } else {
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
        onDeleteLink={handleDeleteLink}
      />
    </Box>
  )
}

export default EditArticle
