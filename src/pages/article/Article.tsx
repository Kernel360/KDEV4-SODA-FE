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
import { toast } from 'react-hot-toast'

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
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemText, setNewItemText] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user.name)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setCurrentUser(null)
      }
    }
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      if (!projectId || !articleId) {
        setError('프로젝트 ID 또는 게시글 ID가 없습니다.')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const data = await projectService.getArticleDetail(
          Number(projectId),
          Number(articleId)
        )
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
        toast.error('게시글을 불러오는데 실패했습니다.')
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
        setVoteInfo(data)
      } catch (error) {
        console.error('Error fetching vote info:', error)
        toast.error('투표 정보를 불러오는데 실패했습니다.')
      }
    }

    fetchVoteInfo()
  }, [articleId])

  const handleDelete = async () => {
    if (!projectId || !articleId) {
      toast.error('프로젝트 ID 또는 게시글 ID가 없습니다.')
      return
    }

    try {
      setLoading(true)
      await projectService.deleteArticle(Number(projectId), Number(articleId))
      setDeleteDialogOpen(false)
      setIsDeleted(true)
      toast.success('게시글이 삭제되었습니다.')
      navigate(`/user/projects/${projectId}?tab=articles`)
    } catch (error) {
      console.error('Error deleting article:', error)
      setError('게시글 삭제에 실패했습니다.')
      toast.error('게시글 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/user/projects/${projectId}?tab=articles`)
  }

  const handleVoteSubmit = async () => {
    if (!articleId) {
      toast.error('게시글 ID가 없습니다.')
      return
    }
    try {
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
      setVoteResult(result)
      setShowVoteResult(true)
      toast.success('투표가 제출되었습니다.')
    } catch (error: any) {
      console.error('Error submitting vote:', error)
      const errorCode = error.response?.data?.code
      if (errorCode === '1309') {
        setErrorMessage('투표할 권한이 없습니다')
        toast.error('투표할 권한이 없습니다')
      } else {
        setErrorMessage('중복 투표는 불가능합니다')
        toast.error('중복 투표는 불가능합니다')
      }
    }
  }

  const handleShowVoteResult = async () => {
    if (!articleId) {
      toast.error('게시글 ID가 없습니다.')
      return
    }
    try {
      const result = await projectService.getVoteResult(Number(articleId))
      setVoteResult(result)
      setShowVoteResult(true)
    } catch (error) {
      console.error('Error fetching vote result:', error)
      toast.error('투표 결과를 불러오는데 실패했습니다.')
    }
  }

  const handleItemSelect = (itemId: number) => {
    if (!voteInfo) return
    if (voteInfo.multipleSelection) {
      setSelectedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    } else {
      setSelectedItems([itemId])
    }
  }

  const renderFileList = () => {
    if (!article?.fileList || article.fileList.length === 0) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1 }}>
          첨부파일
        </Typography>
        <List>
          {article.fileList.map((file, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <FileText size={20} />
              </ListItemIcon>
              <ListItemText
                primary={file.fileName}
                secondary={file.fileUrl}
              />
              <Button
                component="a"
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small">
                다운로드
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    )
  }

  const renderLinkList = () => {
    if (!article?.linkList || article.linkList.length === 0) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1 }}>
          관련 링크
        </Typography>
        <List>
          {article.linkList.map((link, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Link2 size={20} />
              </ListItemIcon>
              <ListItemText
                primary={link.urlDescription}
                secondary={link.urlAddress}
              />
              <Button
                component="a"
                href={link.urlAddress}
                target="_blank"
                rel="noopener noreferrer"
                size="small">
                열기
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    )
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

  if (article.deleted) {
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

  const isAuthor = currentUser === article.userName

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
              <Typography variant="body2">{article.userName}</Typography>
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
                        <>
                          {voteInfo?.items.map((item: any) => (
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
                          ))}
                          {!voteInfo?.closed && (
                            <>
                              {showAddItem ? (
                                <Box sx={{ mt: 2 }}>
                                  <Stack
                                    direction="row"
                                    spacing={2}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={newItemText}
                                      onChange={e =>
                                        setNewItemText(e.target.value)
                                      }
                                      placeholder="새로운 투표 항목 입력"
                                    />
                                    <Button
                                      variant="contained"
                                      onClick={async () => {
                                        if (!newItemText.trim()) return
                                        try {
                                          await projectService.addVoteItem(
                                            Number(articleId),
                                            newItemText.trim()
                                          )
                                          // 투표 정보 새로고침
                                          const data =
                                            await projectService.getVoteInfo(
                                              Number(articleId)
                                            )
                                          setVoteInfo(data)
                                          setNewItemText('')
                                          setShowAddItem(false)
                                        } catch (error: any) {
                                          console.error(
                                            'Error adding vote item:',
                                            error
                                          )
                                          const errorCode =
                                            error.response?.data?.code
                                          if (errorCode === '1309') {
                                            setErrorMessage('권한이 없습니다')
                                          } else if (errorCode === '1308') {
                                            setErrorMessage(
                                              '중복된 항목을 추가할 수 없습니다'
                                            )
                                          } else {
                                            setErrorMessage(
                                              '항목 추가에 실패했습니다'
                                            )
                                          }
                                        }
                                      }}>
                                      추가
                                    </Button>
                                  </Stack>
                                </Box>
                              ) : (
                                <Button
                                  variant="outlined"
                                  onClick={() => setShowAddItem(true)}
                                  sx={{ mt: 2 }}>
                                  항목 추가
                                </Button>
                              )}
                            </>
                          )}
                        </>
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

          {renderFileList()}

          {renderLinkList()}
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
