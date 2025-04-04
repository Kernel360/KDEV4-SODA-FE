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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(title)
    setTitle('')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>단계 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="단계명"
              value={title}
              onChange={e => setTitle(e.target.value)}
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
            disabled={!title}>
            추가
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddStageModal
