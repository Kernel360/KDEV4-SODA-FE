import React, { useState } from 'react'
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  TextField
} from '@mui/material'
import { Pencil, Trash2, MessageSquarePlus, X } from 'lucide-react'
import dayjs from 'dayjs'
import type { Comment } from '../../types/comment'

interface CommentItemProps {
  comment: Comment
  onEdit?: (id: number, content: string) => void
  onDelete?: (id: number) => void
  onAddReply?: (content: string, parentId: number) => void
  currentUserId?: number
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onEdit,
  onDelete,
  onAddReply,
  currentUserId
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [replyContent, setReplyContent] = useState('')

  const handleEdit = () => {
    if (onEdit) {
      onEdit(comment.id, editContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(comment.content)
  }

  const handleAddReply = () => {
    if (replyContent.trim() && onAddReply) {
      onAddReply(replyContent, comment.id)
      setReplyContent('')
      setIsReplying(false)
    }
  }

  const handleCancelReply = () => {
    setIsReplying(false)
    setReplyContent('')
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{comment.author.name}</Typography>
            <Typography
              variant="caption"
              color="text.secondary">
              {dayjs(comment.createdAt).format('YYYY.MM.DD HH:mm')}
            </Typography>
          </Stack>
          {comment.author.id === currentUserId && onEdit && onDelete && (
            <Stack
              direction="row"
              spacing={1}>
              <IconButton
                size="small"
                onClick={() => setIsEditing(!isEditing)}>
                <Pencil size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(comment.id)}>
                <Trash2 size={16} />
              </IconButton>
            </Stack>
          )}
        </Stack>

        {isEditing ? (
          <Stack spacing={1}>
            <TextField
              multiline
              rows={3}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              fullWidth
            />
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                startIcon={<X size={16} />}>
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleEdit}>
                저장
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-line' }}>
            {comment.content}
          </Typography>
        )}

        {!comment.parentId && onAddReply && (
          <Button
            startIcon={<MessageSquarePlus size={16} />}
            onClick={() => setIsReplying(!isReplying)}
            size="small"
            sx={{ alignSelf: 'flex-start' }}>
            답글 작성
          </Button>
        )}

        {isReplying && (
          <Stack spacing={1}>
            <TextField
              multiline
              rows={3}
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              fullWidth
            />
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleCancelReply}
                startIcon={<X size={16} />}>
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleAddReply}>
                답글 등록
              </Button>
            </Stack>
          </Stack>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <Box sx={{ pl: 3 }}>
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddReply={onAddReply}
                currentUserId={currentUserId}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default CommentItem
