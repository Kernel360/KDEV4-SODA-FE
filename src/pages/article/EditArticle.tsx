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
import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

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
  const [deletedFiles, setDeletedFiles] = useState<number[]>([])
  const [deletedLinks, setDeletedLinks] = useState<number[]>([])

  useEffect(() => {
    if (!user) {
      showToast('로그인이 필요합니다.', 'error')
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        if (!projectId || !articleId) {
          setError('프로젝트 ID 또는 게시글 ID가 없습니다.')
          setLoading(false)
          return
        }

        const [articleResponse, stagesResponse] = await Promise.all([
          projectService.getArticleDetail(Number(projectId), Number(articleId)),
          projectService.getProjectStages(Number(projectId))
        ])

        if (!articleResponse || !stagesResponse) {
          throw new Error('데이터를 불러오는데 실패했습니다.')
        }

        setArticle(articleResponse)
        const convertedStages = stagesResponse.map(stage => ({
          ...stage,
          tasks: (stage.tasks || []).map(task => ({
            id: task.taskId,
            title: task.title,
            description: task.content,
            status: 'PENDING' as TaskStatus,
            order: task.taskOrder
          }))
        }))
        setStages(convertedStages)

        const matchingStage = convertedStages.find(
          stage => stage.name === articleResponse.stageName
        )

        const initialFormData: ArticleFormData = {
          title: articleResponse.title,
          content: articleResponse.content,
          stageId: matchingStage ? String(matchingStage.id) : '',
          priority: articleResponse.priority as PriorityType,
          deadLine: articleResponse.deadLine
            ? dayjs(articleResponse.deadLine)
            : null,
          files: [],
          links: []
        }

        setFormData(initialFormData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('데이터를 불러오는데 실패했습니다.')
        toast.error('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, articleId, user, navigate, showToast])

  const handleDeleteLink = (linkId: number) => {
    if (!linkId) {
      toast.error('링크 ID가 없습니다.')
      return
    }
    setDeletedLinks(prev => [...prev, linkId])
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== linkId)
    }))
  }

  const handleDeleteFile = (fileId: number) => {
    if (!fileId) {
      toast.error('파일 ID가 없습니다.')
      return
    }
    setDeletedFiles(prev => [...prev, fileId])
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }))
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

      // 1. 삭제된 파일 처리
      if (deletedFiles.length > 0) {
        await Promise.all(
          deletedFiles.map(fileId =>
            projectService.deleteArticleFile(Number(articleId), fileId)
          )
        )
      }

      // 2. 삭제된 링크 처리
      if (deletedLinks.length > 0) {
        await Promise.all(
          deletedLinks.map(linkId =>
            projectService.deleteArticleLink(Number(articleId), linkId)
          )
        )
      }

      // 3. 게시글 수정
      const request = {
        projectId: Number(projectId),
        title: formData.title,
        content: formData.content,
        deadLine: formData.deadLine?.toISOString() || '',
        memberId: user.memberId,
        stageId: Number(formData.stageId),
        priority: formData.priority,
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || []
      }

      await projectService.updateArticle(Number(articleId), request)

      // 4. 새로 추가된 파일 업로드
      const newFiles = formData.files.filter(file => !file.id)
      if (newFiles.length > 0) {
        try {
          const fileObjects = await Promise.all(
            newFiles.map(async file => {
              const response = await fetch(file.url)
              const blob = await response.blob()
              return new File([blob], file.name, { type: file.type })
            })
          )

          await projectService.uploadArticleFiles(
            Number(articleId),
            fileObjects
          )
        } catch (uploadError) {
          console.error('파일 업로드 에러:', uploadError)
          toast.error('파일 업로드에 실패했습니다.')
        }
      }

      toast.success('게시글이 성공적으로 수정되었습니다.')
      navigate(`/user/projects/${projectId}/articles/${articleId}`)
    } catch (error) {
      console.error('게시글 수정 중 에러 발생:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('게시글 수정에 실패했습니다.')
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!article) {
    return <ErrorMessage message="게시글을 찾을 수 없습니다." />
  }

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 3 }}>
        게시글 수정
      </Typography>
      <ArticleForm
        mode="edit"
        formData={formData}
        onChange={setFormData}
        stages={stages}
        projectId={Number(projectId)}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/user/projects/${projectId}/articles/${articleId}`)
        }
        onDeleteLink={handleDeleteLink}
        onDeleteFile={handleDeleteFile}
      />
    </Box>
  )
}

export default EditArticle
