import React, { useState } from 'react'
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  TextField
} from '@mui/material'
import { Pencil, Trash2, MessageSquarePlus } from 'lucide-react'
import dayjs from 'dayjs'
import type { Comment } from '../../types/comment'

interface CommentItemProps {
  comment: Comment // 새로운 Comment 타입 사용
  onEdit?: (id: number, content: string) => void
  onDelete?: (id: number) => void
  onAddReply?: (content: string, parentId: number) => void
  currentUserId?: number // 현재 로그인한 사용자 ID
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
  // deleted 상태가 아닐 때만 content를 초기값으로 사용
  const [editContent, setEditContent] = useState(
    comment.deleted ? '' : comment.content
  )
  const [replyContent, setReplyContent] = useState('')

  const handleEdit = () => {
    if (editContent.trim() && onEdit && !comment.deleted) {
      onEdit(comment.id, editContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // deleted 상태가 아닐 때만 content로 복원
    setEditContent(comment.deleted ? '' : comment.content)
  }

  const handleAddReply = () => {
    if (replyContent.trim() && onAddReply && !comment.deleted) {
      onAddReply(replyContent, comment.id)
      setReplyContent('')
      setIsReplying(false)
    }
  }

  // const handleCancelReply = () => {
  //   setIsReplying(false);
  //   setReplyContent('');
  // };

  // 작성자 본인인지 확인 (member 객체가 존재하고 ID가 일치하는지)
  const isAuthor = comment.member?.id === currentUserId

  // 삭제된 댓글 처리
  if (comment.deleted) {
    return (
      <Box sx={{ mb: 2, pl: comment.parentCommentId ? 2 : 0 }}>
        <Stack spacing={1}>
          {/* 삭제된 댓글임을 명확히 표시 */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic' }}>
            삭제된 댓글입니다.
          </Typography>
          {/* 삭제된 댓글의 자식 댓글은 계속 표시 */}
          {comment.childComments && comment.childComments.length > 0 && (
            <Box sx={{ pl: 3, mt: 1, borderLeft: '2px solid #eee' }}>
              {comment.childComments.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddReply={onAddReply} // 대댓글에 답글 허용 여부
                  currentUserId={currentUserId}
                />
              ))}
            </Box>
          )}
        </Stack>
      </Box>
    )
  }

  // 정상 댓글 렌더링
  return (
    <Box
      sx={{
        mb: 2,
        borderLeft: comment.parentCommentId ? '2px solid #eee' : 'none',
        pl: comment.parentCommentId ? 2 : 0
      }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}>
            {/* member 객체 사용 및 null 체크 */}
            <Typography variant="subtitle2">
              {comment.member?.name || '알 수 없는 사용자'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary">
              {dayjs(comment.createdAt).isValid()
                ? dayjs(comment.createdAt).format('YYYY.MM.DD HH:mm')
                : '유효하지 않은 날짜'}
            </Typography>
          </Stack>
          {/* 작성자 본인이고 핸들러가 제공된 경우 버튼 표시 */}
          {isAuthor && onEdit && onDelete && (
            <Stack
              direction="row"
              spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => setIsEditing(!isEditing)}
                aria-label="Edit comment"
                disabled={isEditing}>
                <Pencil size={14} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete && onDelete(comment.id)}
                aria-label="Delete comment"
                color="error"
                disabled={isEditing}>
                <Trash2 size={14} />
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
              size="small"
            />
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancelEdit}>
                {' '}
                취소{' '}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleEdit}
                disabled={
                  !editContent.trim() || editContent === comment.content
                }>
                {' '}
                저장{' '}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
            {comment.content}
          </Typography>
        )}

        {/* 최상위 댓글이고, 답글 추가 핸들러가 있을 때만 답글 버튼 표시 (parentCommentId 사용) */}
        {!comment.parentCommentId && onAddReply && !isEditing && (
          <Button
            startIcon={<MessageSquarePlus size={14} />}
            onClick={() => setIsReplying(!isReplying)}
            size="small"
            sx={{ alignSelf: 'flex-start', mt: 0.5, color: 'text.secondary' }}
            variant="text">
            {isReplying ? '답글 취소' : '답글 작성'}
          </Button>
        )}

        {/* 답글 작성 UI */}
        {isReplying && (
          <Stack
            spacing={1}
            sx={{ mt: 1 }}>
            <TextField
              multiline
              rows={3}
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              fullWidth
              placeholder="답글을 입력하세요..."
              size="small"
            />
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end">
              <Button
                size="small"
                variant="contained"
                onClick={handleAddReply}
                disabled={!replyContent.trim()}>
                {' '}
                답글 등록{' '}
              </Button>
            </Stack>
          </Stack>
        )}

        {/* 대댓글 목록 렌더링 (childComments 사용) */}
        {comment.childComments && comment.childComments.length > 0 && (
          <Box sx={{ pl: 3, mt: 1, borderLeft: '2px solid #eee' }}>
            {' '}
            {/* 대댓글 영역 추가 들여쓰기 및 구분선 */}
            {/* TypeScript가 이제 reply 타입을 Comment로 추론 */}
            {comment.childComments.map((reply: any) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddReply={onAddReply} // 대댓글에 또 답글을 달 수 있게 할지 여부
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
