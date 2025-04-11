import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material'

interface EditStageModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  initialName: string
}

const EditStageModal: React.FC<EditStageModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialName
}) => {
  const [name, setName] = useState(initialName)

  const handleSubmit = () => {
    onSubmit(name)
    setName(initialName)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth>
      <DialogTitle>단계 이름 수정</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="단계 이름을 입력하세요"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || name === initialName}>
          수정
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditStageModal 