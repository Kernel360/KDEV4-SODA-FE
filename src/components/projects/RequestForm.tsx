import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material'

interface RequestFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; content: string }) => void
}

const RequestForm: React.FC<RequestFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      content
    })
    setTitle('')
    setContent('')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>요청사항 작성</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="제목"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="내용"
              value={content}
              onChange={e => setContent(e.target.value)}
              multiline
              rows={4}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!title || !content}>
            제출
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RequestForm
