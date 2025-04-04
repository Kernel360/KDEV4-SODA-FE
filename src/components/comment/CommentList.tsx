import React from 'react'
import { Box, Typography, Stack } from '@mui/material'
import CommentInput from './CommentInput'
import CommentItem from './CommentItem'
import type { Comment } from '../../types/comment'

interface CommentListProps {
  comments: Comment[]
  onAddComment: (content: string) => void
  onAddReply?: (content: string, parentId: number) => void
  onEditComment?: (commentId: number, content: string) => void
  onDeleteComment?: (commentId: number) => void
  currentUserId?: number
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onAddComment,
  onAddReply,
  onEditComment,
  onDeleteComment,
  currentUserId
}) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 2 }}>
        댓글
      </Typography>
      <Box sx={{ mb: 3 }}>
        <CommentInput onSubmit={onAddComment} />
      </Box>
      <Stack
        spacing={3}
        sx={{ mt: 3 }}>
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            onAddReply={onAddReply}
            currentUserId={currentUserId}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default CommentList
