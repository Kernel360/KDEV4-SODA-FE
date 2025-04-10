import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material'
import type { Stage } from '../../types/project'

interface AddStageModalProps {
  open: boolean
  onClose: () => void
  onAddStage: (title: string) => Promise<void>
  projectId: number
  stages: Stage[]
  selectedPosition: number | null
}

const AddStageModal = ({ open, onClose, onAddStage }: AddStageModalProps) => {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onAddStage(title.trim())
      setTitle('')
    } catch (error) {
      console.error('Failed to add stage:', error)
      alert('스테이지 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('')
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>새 스테이지 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              label="스테이지 제목"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              inputProps={{
                maxLength: 50
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddStageModal
