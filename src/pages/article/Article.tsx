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
  ListItemText,
  Checkbox,
  FormControlLabel,
  TextField,
  LinearProgress,
  Alert,
  Snackbar
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
  const [voteInfo, setVoteInfo] = useState<any>(null)
  const [voteResult, setVoteResult] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [textAnswer, setTextAnswer] = useState('')
  const [showVoteResult, setShowVoteResult] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchVoteInfo = async () => {
      if (!articleId) return
      try {
        const data = await projectService.getVoteInfo(Number(articleId))
        console.log('투표 정보:', {
          isTextVote: data.items.length === 0,
          multipleSelection: data.multipleSelection,
          title: data.title,
          items: data.items,
          전체데이터: data
        })
        setVoteInfo(data)
      } catch (error) {
        console.error('Error fetching vote info:', error)
      }
    }

    fetchVoteInfo()
  }, [articleId])

  const handleDelete = async () => {
    if (!projectId || !articleId) return

    try {
      setLoading(true)
      await projectService.deleteArticle(Number(projectId), Number(articleId))
      setDeleteDialogOpen(false)
      setIsDeleted(true)
      navigate(`/user/projects/${projectId}?tab=articles`)
    } catch (error) {
      console.error('Error deleting article:', error)
      setError('게시글 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/user/projects/${projectId}?tab=articles`)
  }

  const handleVoteSubmit = async () => {
    if (!articleId) return
    try {
      console.log('투표 제출 시도:', {
        isTextVote: voteInfo?.items.length === 0,
        textAnswer,
        selectedItems,
        voteInfo
      })

      if (voteInfo?.items.length === 0) {
        // 텍스트 답변 투표
        await projectService.submitVote(Number(articleId), {
          textAnswer: textAnswer.trim()
        })
      } else {
        // 일반 투표
        await projectService.submitVote(Number(articleId), {
          selectedItemIds: selectedItems
        })
      }
      // 투표 후 결과 보기
      const result = await projectService.getVoteResult(Number(articleId))
      console.log('투표 결과:', result)
      setVoteResult(result)
      setShowVoteResult(true)
    } catch (error: any) {
      console.error('Error submitting vote:', error)
      // 에러 응답에서 코드 확인
      const errorCode = error.response?.data?.code
      if (errorCode === '1309') {
        setErrorMessage('투표할 권한이 없습니다')
      } else {
        setErrorMessage('중복 투표는 불가능합니다')
      }
    }
  }

  const handleShowVoteResult = async () => {
    if (!articleId) return
    try {
      const result = await projectService.getVoteResult(Number(articleId))
      setVoteResult(result)
      setShowVoteResult(true)
    } catch (error) {
      console.error('Error fetching vote result:', error)
    }
  }

  const handleItemSelect = (itemId: number) => {
    if (voteInfo?.multipleSelection) {
      setSelectedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    } else {
      setSelectedItems([itemId])
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
          <IconButton onClick={handleBack}>
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
            onClick={handleBack}
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
      <Snackbar
        open={errorMessage !== null}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3
        }}>
        <IconButton onClick={handleBack}>
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

          {voteInfo && (
            <Box sx={{ my: 3 }}>
              <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Stack spacing={2}>
                  <Typography variant="h6">{voteInfo.title}</Typography>

                  {voteInfo.deadLine && (
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      마감:{' '}
                      {dayjs(voteInfo.deadLine).format('YYYY.MM.DD HH:mm')}
                    </Typography>
                  )}

                  {showVoteResult ? (
                    // 투표 결과 표시
                    <Stack spacing={2}>
                      <Typography variant="subtitle2">
                        총 참여자: {voteResult?.totalParticipants || 0}명
                      </Typography>
                      {voteResult?.itemResults?.length > 0
                        ? // 일반 투표 결과
                          voteResult.itemResults.map((item: any) => (
                            <Box key={item.itemId}>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{ mb: 1 }}>
                                <Typography sx={{ flex: 1 }}>
                                  {item.itemText}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  {item.count}명 (
                                  {(item.percentage * 100).toFixed(1)}%)
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={item.percentage * 100}
                                sx={{ height: 8, borderRadius: 1 }}
                              />
                            </Box>
                          ))
                        : // 텍스트 답변 결과
                          voteResult?.textAnswers?.length > 0 && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ mb: 1 }}>
                                답변 목록:
                              </Typography>
                              <Stack spacing={1}>
                                {voteResult.textAnswers.map(
                                  (answer: string, index: number) => (
                                    <Typography
                                      key={index}
                                      variant="body2"
                                      sx={{
                                        p: 2,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1
                                      }}>
                                      {answer}
                                    </Typography>
                                  )
                                )}
                              </Stack>
                            </Box>
                          )}
                      {!voteInfo?.closed && (
                        <Button
                          variant="outlined"
                          onClick={() => setShowVoteResult(false)}>
                          투표하기
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    // 투표 입력 폼
                    <Stack spacing={2}>
                      {console.log('렌더링 시 투표 정보:', {
                        isTextVote: voteInfo?.items.length === 0,
                        voteInfo,
                        textAnswer
                      })}
                      {voteInfo?.items.length === 0 ? (
                        // 텍스트 답변 입력
                        <>
                          <Typography variant="subtitle1">
                            답변을 입력해주세요
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="답변 입력"
                            value={textAnswer}
                            onChange={e => {
                              console.log('텍스트 입력:', e.target.value)
                              setTextAnswer(e.target.value)
                            }}
                            disabled={voteInfo?.closed}
                            placeholder="답변을 입력하세요"
                          />
                        </>
                      ) : (
                        // 일반 투표 (체크박스)
                        voteInfo?.items.map((item: any) => (
                          <FormControlLabel
                            key={item.itemId}
                            control={
                              <Checkbox
                                checked={selectedItems.includes(item.itemId)}
                                onChange={() => handleItemSelect(item.itemId)}
                                disabled={voteInfo?.closed}
                              />
                            }
                            label={item.content}
                          />
                        ))
                      )}
                      <Stack
                        direction="row"
                        spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={handleShowVoteResult}>
                          투표 결과 보기
                        </Button>
                        {!voteInfo?.closed && (
                          <Button
                            variant="contained"
                            onClick={handleVoteSubmit}
                            disabled={
                              voteInfo?.items.length === 0
                                ? !textAnswer.trim()
                                : selectedItems.length === 0 ||
                                  (!voteInfo?.multipleSelection &&
                                    selectedItems.length > 1)
                            }>
                            투표하기
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}

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
          onClick={handleBack}
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
