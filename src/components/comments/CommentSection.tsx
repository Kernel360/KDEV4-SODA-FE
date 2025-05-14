import React, { useState, useEffect, useCallback, memo } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Send, Trash2, MessageCircle, Edit } from 'lucide-react'
import type { Comment } from '../../types/comment'
import { commentService } from '../../services/commentService'
import dayjs from 'dayjs'
import { projectService } from '../../services/projectService'
import { toast } from 'react-hot-toast'

interface CommentInputProps {
  isReply?: boolean
  loading: boolean
  onSubmit: (content: string) => Promise<void>
}

// 댓글 입력 폼 컴포넌트
const CommentInput: React.FC<CommentInputProps> = memo(
  ({ isReply = false, loading, onSubmit }) => {
    const theme = useTheme()
    const [content, setContent] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!content.trim()) return
      await onSubmit(content)
      setContent('')
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: isReply ? 0 : 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1
        }}>
        <form onSubmit={handleSubmit}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start">
            <TextField
              multiline
              rows={2}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  height: '80px',
                  alignItems: 'flex-start'
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important'
                }
              }}
              size="small"
              placeholder={isReply ? '답글을 입력하세요' : '댓글을 입력하세요'}
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !content.trim()}
              sx={{
                minWidth: '100px',
                height: '80px',
                borderRadius: '8px',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  transition: 'transform 0.2s'
                },
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}>
              {isReply ? '답글 작성' : '작성'}
              <Send size={16} />
            </Button>
          </Stack>
        </form>
      </Paper>
    )
  }
)

CommentInput.displayName = 'CommentInput'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}>
      <DialogTitle>댓글 삭제</DialogTitle>
      <DialogContent>
        <Typography>댓글을 삭제하시겠습니까?</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit">
          취소
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained">
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: number) => void
  onDelete: (commentId: number) => void
  onUpdate: (commentId: number, content: string) => Promise<void>
  replyToId: number | null
  loading: boolean
  onSubmitReply: (content: string) => Promise<void>
  currentUser: string | null
}

// 댓글 아이템 컴포넌트
const CommentItem: React.FC<CommentItemProps> = memo(
  ({
    comment,
    onReply,
    onDelete,
    onUpdate,
    replyToId,
    loading,
    onSubmitReply,
    currentUser
  }) => {
    const theme = useTheme()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    const handleDeleteClick = () => {
      setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
      setIsDeleteModalOpen(false)
      await onDelete(comment.id)
    }

    const handleEditClick = () => {
      if (isEditing) {
        setIsEditing(false)
        setEditContent(comment.content)
      } else {
        setIsEditing(true)
        setEditContent(comment.content)
      }
    }

    const handleEditCancel = () => {
      setIsEditing(false)
      setEditContent(comment.content)
    }

    const handleEditSubmit = async () => {
      if (!editContent.trim() || editContent === comment.content) {
        setIsEditing(false)
        return
      }
      await onUpdate(comment.id, editContent.trim())
      setIsEditing(false)
    }

    const formatDate = (date: string) => {
      if (!date) return ''
      return dayjs(date).add(9, 'hour').format('YYYY.MM.DD HH:mm')
    }

    // 삭제된 댓글 표시
    if (comment.deleted) {
      return (
        <Stack
          spacing={1}
          sx={{ ml: comment.parentCommentId ? 5 : 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              py: 1
            }}>
            삭제된 댓글입니다.
          </Typography>
          {/* 대댓글이 있는 경우 표시 */}
          {comment.childComments && comment.childComments.length > 0 && (
            <Stack
              spacing={2}
              sx={{ mt: 1 }}>
              {comment.childComments.map((reply: any, replyIndex: any) => (
                <Box key={`reply-${reply.id}-${replyIndex}`}>
                  <CommentItem
                    comment={reply}
                    onReply={onReply}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    replyToId={replyToId}
                    loading={loading}
                    onSubmitReply={onSubmitReply}
                    currentUser={currentUser}
                  />
                  {replyIndex < (comment.childComments?.length || 0) - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      )
    }

    return (
      <Stack
        spacing={1}
        sx={{ ml: comment.parentCommentId ? 5 : 0 }}>
        {/* 작성자 정보 및 버튼 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Stack
            direction="row"
            spacing={1}
            alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary
              }}>
              {comment.member.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '13px',
                mt: '2px'
              }}>
              {formatDate(comment.createdAt)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}>
            {currentUser === comment.member.name && (
              <>
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  sx={{
                    padding: '4px',
                    color: isEditing
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}>
                  <Edit size={16} />
                </IconButton>
                {!isEditing && (
                  <IconButton
                    size="small"
                    onClick={handleDeleteClick}
                    sx={{
                      padding: '4px',
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.error.main
                      }
                    }}>
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </>
            )}
          </Stack>
        </Stack>

        {/* 댓글 내용 */}
        {isEditing ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start">
            <TextField
              multiline
              rows={2}
              fullWidth
              size="small"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff'
                }
              }}
            />
            <Stack
              direction="row"
              spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={handleEditSubmit}
                disabled={
                  !editContent.trim() || editContent === comment.content
                }>
                수정
              </Button>
              <Button
                size="small"
                onClick={handleEditCancel}>
                취소
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              color: theme.palette.text.primary,
              lineHeight: 1.5,
              mt: 0.5,
              mb: 0.5
            }}>
            {comment.content}
          </Typography>
        )}

        {/* 답글 작성 버튼 */}
        {!comment.parentCommentId && !isEditing && (
          <Button
            size="small"
            startIcon={
              <MessageCircle
                size={16}
                color={theme.palette.secondary.main}
              />
            }
            onClick={() => onReply(comment.id)}
            sx={{
              mt: 0.5,
              p: 0,
              minWidth: 'auto',
              color: theme.palette.secondary.main,
              fontWeight: 500,
              fontSize: '15px',
              textAlign: 'left',
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: 'transparent',
                color: theme.palette.secondary.dark
              },
              textTransform: 'none'
            }}>
            답글 작성
          </Button>
        )}

        {/* 답글 입력 폼 */}
        {replyToId === comment.id && !isEditing && (
          <Box sx={{ mt: 2, ml: 5 }}>
            <CommentInput
              isReply={true}
              loading={loading}
              onSubmit={onSubmitReply}
            />
          </Box>
        )}

        {/* 대댓글 목록 */}
        {comment.childComments && comment.childComments.length > 0 && (
          <Stack spacing={2}>
            {comment.childComments.map((reply: any, replyIndex: any) => (
              <Box key={`reply-${reply.id}-${replyIndex}`}>
                <CommentItem
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  replyToId={replyToId}
                  loading={loading}
                  onSubmitReply={onSubmitReply}
                  currentUser={currentUser}
                />
                {replyIndex < (comment.childComments?.length || 0) - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </Stack>
        )}

        {/* 삭제 확인 모달 */}
        <DeleteConfirmModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </Stack>
    )
  }
)

CommentItem.displayName = 'CommentItem'

interface CommentSectionProps {
  projectId: number
  articleId: number
  isAdmin?: boolean
}

const CommentSection: React.FC<CommentSectionProps> = ({
  projectId,
  articleId,
  isAdmin = false
}) => {
  const theme = useTheme()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser(user.name)
    }
  }, [])

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(articleId)
      console.log('Fetched comments:', data)

      // 부모 댓글 필터링 및 정렬
      const sortedComments = (data || [])
        .filter((comment: any) => {
          // 부모 댓글이 아닌 경우 제외
          if (comment.parentCommentId) return false

          // 삭제된 댓글이면서 대댓글이 없는 경우 제외
          if (
            comment.deleted &&
            (!comment.childComments || comment.childComments.length === 0)
          ) {
            return false
          }

          return true
        })
        .map((comment: any) => {
          // 대댓글 중 삭제되지 않은 것만 유지
          if (comment.childComments) {
            return {
              ...comment,
              childComments: comment.childComments.filter(
                (reply: any) => !reply.deleted
              )
            }
          }
          return comment
        })
        .sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        })

      setComments(sortedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    }
  }

  useEffect(() => {
    fetchComments()
  }, [articleId])

  // 댓글 작성
  const handleSubmitComment = async (content: string) => {
    if (!content.trim()) return

    try {
      setLoading(true)
      const createCommentData = {
        projectId,
        articleId,
        content: content.trim(),
        parentCommentId: replyToId || undefined
      }
      await commentService.createComment(createCommentData)
      setReplyToId(null)
      await fetchComments()
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setLoading(false)
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId)
      toast.success('댓글이 삭제되었습니다.')
      fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('댓글 삭제에 실패했습니다.')
    }
  }

  // 댓글 수정
  const handleUpdate = async (commentId: number, content: string) => {
    try {
      setLoading(true)
      await commentService.updateComment(commentId, content)
      await fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setLoading(false)
    }
  }

  // 대댓글 모드 설정
  const handleReplyClick = useCallback((commentId: number) => {
    setReplyToId(prevId => (prevId === commentId ? null : commentId))
  }, [])

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 2 }}>
        댓글
      </Typography>

      {/* 메인 댓글 입력 폼 */}
      {!replyToId && (
        <CommentInput
          loading={loading}
          onSubmit={handleSubmitComment}
        />
      )}

      {/* 댓글 목록 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: '#fff'
        }}>
        {comments && comments.length > 0 ? (
          <Stack spacing={3}>
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReplyClick}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdate}
                replyToId={replyToId}
                loading={loading}
                onSubmitReply={handleSubmitComment}
                currentUser={currentUser}
              />
            ))}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center">
            댓글이 없습니다.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default CommentSection
