import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Article, PriorityType } from '../../types/article'
import { projectService } from '../../services/projectService'
import { Box, Typography } from '@mui/material'
import ArticleForm, {
  ArticleFormData
} from '../../components/articles/ArticleForm'
import { Stage } from '../../types/stage'

const EditArticle: React.FC = () => {
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    stageId: stages[0]?.id || 0,
    priority: PriorityType.MEDIUM,
    deadLine: null,
    files: [],
    links: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleResponse, stagesResponse] = await Promise.all([
          projectService.getArticleDetail(Number(projectId), Number(articleId)),
          projectService.getProjectStages(Number(projectId))
        ])
        setArticle(articleResponse)
        setStages(stagesResponse as unknown as Stage[])
        setFormData({
          title: articleResponse.title,
          content: articleResponse.content,
          stageId: articleResponse.stageId || stages[0]?.id || 0,
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
        setError('데이터를 불러오는데 실패했습니다.')
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, articleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!articleId) {
        throw new Error('게시글 ID가 없습니다.')
      }
      await projectService.updateArticle(Number(articleId), {
        projectId: Number(projectId),
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        deadLine: formData.deadLine?.toISOString() || '',
        memberId: Number(articleId),
        stageId: formData.stageId,
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || []
      })
      navigate(`/user/projects/${projectId}/articles/${articleId}`)
    } catch (error) {
      setError('게시글 수정에 실패했습니다.')
      console.error('Error updating article:', error)
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
