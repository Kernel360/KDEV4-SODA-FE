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
        if (!projectId || !articleId) return

        const [articleResponse, stagesResponse] = await Promise.all([
          projectService.getArticleDetail(Number(projectId), Number(articleId)),
          projectService.getProjectStages(Number(projectId))
        ])

        console.log('Article Response:', articleResponse)
        console.log('Stages Response:', stagesResponse)

        if (articleResponse) {
          console.log('Article Response:', articleResponse)
          setArticle(articleResponse)

          // stages 데이터가 먼저 로드되었는지 확인
          const currentStages = stages.length > 0 ? stages : stagesResponse
          console.log('Current Stages:', currentStages)

          // article의 stageName과 일치하는 stage를 찾음
          const matchingStage = currentStages.find(
            stage => stage.name === articleResponse.stageName
          )
          console.log('Matching Stage:', matchingStage)

          const initialFormData = {
            title: articleResponse.title,
            content: articleResponse.content,
            stageId: matchingStage ? String(matchingStage.id) : '',
            priority: articleResponse.priority,
            deadLine: articleResponse.deadLine
              ? new Date(articleResponse.deadLine)
              : null,
            files:
              articleResponse.fileList
                ?.filter(file => !file.deleted)
                ?.map(file => ({
                  id: file.id,
                  url: file.url,
                  name: file.name,
                  type: ''
                })) || [],
            links:
              articleResponse.linkList
                ?.filter(link => !link.deleted)
                ?.map(link => ({
                  id: link.id,
                  title: link.urlDescription,
                  url: link.urlAddress
                })) || []
          }
          console.log('Initial Form Data:', initialFormData)
          setFormData(initialFormData)
        }

        if (stagesResponse) {
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
          console.log('Converted stages:', convertedStages)
          setStages(convertedStages)

          // stages가 로드된 후 article의 stageName을 기준으로 stageId를 다시 설정
          if (article) {
            const matchingStage = convertedStages.find(
              stage => stage.name === article.stageName
            )
            if (matchingStage) {
              setFormData(prev => ({
                ...prev,
                stageId: String(matchingStage.id)
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, articleId, user, navigate, showToast])

  const handleDeleteLink = (linkId: number) => {
    if (!linkId) {
      console.error('링크 삭제 실패: linkId가 없습니다.')
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
      console.error('파일 삭제 실패: fileId가 없습니다.')
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

      console.log('현재 사용자 정보:', user)
      console.log('수정할 게시글 데이터:', formData)

      // 1. 삭제된 파일 처리
      if (deletedFiles.length > 0) {
        console.log('삭제할 파일 ID 목록:', deletedFiles)
        await Promise.all(
          deletedFiles.map(fileId =>
            projectService.deleteArticleFile(Number(articleId), fileId)
          )
        )
      }

      // 2. 삭제된 링크 처리
      if (deletedLinks.length > 0) {
        console.log('삭제할 링크 ID 목록:', deletedLinks)
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

      console.log('게시글 수정 요청 데이터:', request)
      const updatedArticle = await projectService.updateArticle(
        Number(articleId),
        request
      )
      console.log('게시글 수정 응답:', updatedArticle)

      // 4. 새로 추가된 파일 업로드
      const newFiles = formData.files.filter(file => !file.id)
      if (newFiles.length > 0) {
        console.log('새로 추가된 파일 업로드 시작:', newFiles)
        try {
          const fileObjects = await Promise.all(
            newFiles.map(async file => {
              const response = await fetch(file.url)
              const blob = await response.blob()
              return new File([blob], file.name, { type: file.type })
            })
          )

          const uploadResponse = await projectService.uploadArticleFiles(
            Number(articleId),
            fileObjects
          )
          console.log('파일 업로드 응답:', uploadResponse)
        } catch (uploadError) {
          console.error('파일 업로드 에러:', uploadError)
          showToast('파일 업로드에 실패했습니다.', 'error')
        }
      }

      showToast('게시글이 성공적으로 수정되었습니다.', 'success')
      navigate(`/user/projects/${projectId}/articles/${articleId}`)
    } catch (error) {
      console.error('게시글 수정 중 에러 발생:', error)
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
        onDeleteFile={handleDeleteFile}
        projectId={Number(projectId)}
      />
    </Box>
  )
}

export default EditArticle
