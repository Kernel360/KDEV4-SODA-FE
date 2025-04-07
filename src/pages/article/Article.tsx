import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  Link as MuiLink,
  Stack
} from '@mui/material'
import type { Article as ArticleType } from '@/types/article'
import { ArticleStatus, PriorityType } from '@/types/article'
import { projectService } from '@/services/projectService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import {
  ArrowLeft,
  Link2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  MessageSquarePlus
} from 'lucide-react'
import dayjs from 'dayjs'

const Article: React.FC = () => {
  const navigate = useNavigate()
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const [article, setArticle] = useState<ArticleType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: 실제 로그인한 사용자 정보로 대체
  const currentUserId = 'Admin User'

  useEffect(() => {
    const fetchArticle = async () => {
      if (!projectId || !articleId) return
      try {
        setLoading(true)
        setError(null)
        const data = await projectService.getArticleDetail(
          Number(projectId),
          Number(articleId)
        )
        console.log('Received article data:', data)
        if (!data) {
          throw new Error('No article data received')
        }
        setArticle(data)
      } catch (err) {
        console.error('Error fetching article:', err)
        setError(
          err instanceof Error
            ? err.message
            : '게시글을 불러오는데 실패했습니다.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [projectId, articleId])

  const handleDelete = () => {
    // TODO: 삭제 API 연동
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      console.log('Delete article:', articleId)
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

  const isAuthor = article.memberName === currentUserId

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3
        }}>
        <IconButton
          onClick={() => navigate(`/user/projects/${projectId}/articles`)}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography
          variant="h5"
          sx={{ flex: 1 }}>
          {article.title}
        </Typography>
        <Chip
          label={article.stageName}
          color="primary"
          size="small"
          sx={{ height: 24 }}
        />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}>
              <Typography variant="body2">{article.memberName}</Typography>
              {isAuthor && (
                <Stack
                  direction="row"
                  spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(
                        `/user/projects/${projectId}/articles/${articleId}/edit`
                      )
                    }>
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleDelete}>
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              )}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary">
              {dayjs(article.createdAt).format('YYYY.MM.DD HH:mm')}
            </Typography>
          </Stack>

          <Divider />

          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              minHeight: '200px'
            }}>
            {article.content}
          </Typography>

          <Divider />

          <Stack
            direction="row"
            spacing={4}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}>
                첨부파일
              </Typography>
              {article.fileList && article.fileList.length > 0 ? (
                <Stack spacing={1}>
                  {article.fileList.map(file => (
                    <Stack
                      key={file.id}
                      direction="row"
                      alignItems="center"
                      spacing={1}>
                      <FileText size={16} />
                      <MuiLink
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer">
                        {file.name}
                      </MuiLink>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary">
                  없음
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}>
                첨부링크
              </Typography>
              {article.linkList && article.linkList.length > 0 ? (
                <Stack spacing={1}>
                  {article.linkList.map(link => (
                    <Stack
                      key={link.id}
                      direction="row"
                      alignItems="center"
                      spacing={1}>
                      <Link2 size={16} />
                      <MuiLink
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer">
                        {link.title || link.url}
                      </MuiLink>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary">
                  없음
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button
          startIcon={<MessageSquarePlus size={20} />}
          onClick={() =>
            navigate(`/user/projects/${projectId}/articles/${articleId}/reply`)
          }
          variant="outlined"
          fullWidth>
          답글 작성
        </Button>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/user/projects/${projectId}/articles`)}
          startIcon={<ArrowLeft size={16} />}>
          목록
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                `/user/projects/${projectId}/articles/${Number(articleId) - 1}`
              )
            }
            startIcon={<ChevronLeft size={16} />}>
            이전
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                `/user/projects/${projectId}/articles/${Number(articleId) + 1}`
              )
            }
            endIcon={<ChevronRight size={16} />}>
            다음
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2 }}>
          댓글
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center">
            댓글이 없습니다.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default Article
