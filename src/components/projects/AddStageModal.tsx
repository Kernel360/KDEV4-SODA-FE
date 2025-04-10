import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button} from '@mui/material'

interface AddStageModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (title: string) => void
}

const AddStageModal: React.FC<AddStageModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title)
      setTitle('')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>단계 추가</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="단계명"
          type="text"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim()}>
          추가
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddStageModal
