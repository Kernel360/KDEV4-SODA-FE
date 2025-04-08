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
import type { Task } from '../../types/stage'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      status: '신청 대기 중'
    })
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>태스크 추가</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="설명"
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title}>
          추가
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddTaskModal
