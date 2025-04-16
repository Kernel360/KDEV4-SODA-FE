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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import type { Article as ArticleType } from '../../types/article'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import CommentSection from '../../components/comments/CommentSection'
import {
  ArrowLeft,
  Link2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  MessageSquarePlus,
  AlertTriangle
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser(user.name)
    }
  }, [])

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
        console.log('Article fileList:', data.fileList)
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

  const handleDelete = async () => {
    if (!projectId || !articleId) return

    try {
      setLoading(true)
      await projectService.deleteArticle(Number(projectId), Number(articleId))
      setDeleteDialogOpen(false)
      setIsDeleted(true)
      navigate(`/user/projects/${projectId}`)
    } catch (error) {
      console.error('Error deleting article:', error)
      setError('게시글 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
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

  if (article.deleted && !article.parentArticleId) {
    return (
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
          <IconButton onClick={() => navigate(`/user/projects/${projectId}`)}>
            <ArrowLeft size={24} />
          </IconButton>
          <Typography
            variant="h5"
            color="error">
            삭제된 게시글입니다
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            이 게시글은 삭제되었지만 답글이 있어 표시됩니다.
          </Typography>
        </Paper>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/user/projects/${projectId}`)}
            startIcon={<ArrowLeft size={16} />}>
            목록
          </Button>
        </Box>
      </Box>
    )
  }

  const isAuthor = currentUser === article.memberName

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3
        }}>
        <IconButton onClick={() => navigate(`/user/projects/${projectId}`)}>
          <ArrowLeft size={24} />
        </IconButton>

        <Chip
          label={article.stageName}
          color="primary"
          size="small"
          sx={{ height: 24 }}
        />
        <Typography
          variant="h5"
          sx={{ flex: 1 }}>
          {article.title}
        </Typography>
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
                    onClick={() => setDeleteDialogOpen(true)}>
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
                  {article.fileList
                    .filter(file => !file.deleted)
                    .map((file: any) => (
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
              {article.linkList && article.linkList.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {article.linkList
                      .filter(link => !link.deleted)
                      .map((link, index) => {
                        const url =
                          link.urlAddress.startsWith('http://') ||
                          link.urlAddress.startsWith('https://')
                            ? link.urlAddress
                            : `https://${link.urlAddress}`

                        return (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Link2 size={20} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <MuiLink
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer">
                                  {link.urlDescription || link.urlAddress}
                                </MuiLink>
                              }
                            />
                          </ListItem>
                        )
                      })}
                  </List>
                </Box>
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
          onClick={() => navigate(`/user/projects/${projectId}`)}
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

      {!isDeleted && (
        <Box sx={{ mt: 3 }}>
          <CommentSection
            projectId={Number(projectId)}
            articleId={Number(articleId)}
          />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}>
            <AlertTriangle
              size={20}
              color="#f44336"
            />
            <Typography>게시글 삭제</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>게시글을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Article
