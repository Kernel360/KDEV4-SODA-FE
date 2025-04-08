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
  IconButton
} from '@mui/material'
import { Send, Pencil, Trash2, MessageCircle } from 'lucide-react'
import type { Comment } from '@/types/comment'
import { commentService } from '@/services/commentService'
import dayjs from 'dayjs'

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

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: number) => void
  onDelete: (commentId: number) => void
  replyToId: number | null
  loading: boolean
  onSubmitReply: (content: string) => Promise<void>
}

// 댓글 아이템 컴포넌트
const CommentItem: React.FC<CommentItemProps> = memo(
  ({ comment, onReply, onDelete, replyToId, loading, onSubmitReply }) => {
    const theme = useTheme()

    const formatDate = (date: string) => {
      if (!date) return ''
      return dayjs(date).format('YYYY.MM.DD HH:mm')
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
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
              {comment.member.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}>
              {formatDate(comment.createdAt)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => console.log('Edit comment:', comment.id)}
              sx={{
                padding: '4px',
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main
                }
              }}>
              <Pencil size={14} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(comment.id)}
              sx={{
                padding: '4px',
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.error.main
                }
              }}>
              <Trash2 size={14} />
            </IconButton>
          </Stack>
        </Stack>

        {/* 댓글 내용 */}
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            color: theme.palette.text.primary,
            lineHeight: 1.5
          }}>
          {comment.content}
        </Typography>

        {/* 답글 작성 버튼 */}
        {!comment.parentCommentId && (
          <Button
            size="small"
            startIcon={<MessageCircle size={14} />}
            onClick={() => onReply(comment.id)}
            sx={{
              mt: 1,
              p: 0,
              minWidth: 'auto',
              color:
                replyToId === comment.id
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'transparent',
                color: theme.palette.primary.main
              },
              textTransform: 'none',
              justifyContent: 'flex-start'
            }}>
            답글 작성
          </Button>
        )}

        {/* 답글 입력 폼 */}
        {replyToId === comment.id && (
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
            {comment.childComments.map((reply, replyIndex) => (
              <Box key={`reply-${reply.id}-${replyIndex}`}>
                <CommentItem
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  replyToId={replyToId}
                  loading={loading}
                  onSubmitReply={onSubmitReply}
                />
                {replyIndex < comment.childComments.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    )
  }
)

CommentItem.displayName = 'CommentItem'

interface CommentSectionProps {
  projectId: number
  articleId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({
  projectId,
  articleId
}) => {
  const theme = useTheme()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [replyToId, setReplyToId] = useState<number | null>(null)

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(articleId)
      console.log('Fetched comments:', data)

      // 부모 댓글만 최신순으로 정렬
      const sortedComments = (data || [])
        .filter(comment => !comment.parentCommentId)
        .sort((a, b) => {
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
  const handleDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return

    try {
      await commentService.deleteComment(commentId)
      await fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
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
          borderRadius: 1
        }}>
        {comments && comments.length > 0 ? (
          <Stack spacing={3}>
            {comments.map((comment, index) => (
              <Box key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={handleReplyClick}
                  onDelete={handleDelete}
                  replyToId={replyToId}
                  loading={loading}
                  onSubmitReply={handleSubmitComment}
                />
                {index < comments.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
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
