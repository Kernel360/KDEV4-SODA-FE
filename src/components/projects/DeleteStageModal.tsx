import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material'

interface DeleteStageModalProps {
  open: boolean
  onClose: () => void
  onDelete: () => void
  stageName: string
}

const DeleteStageModal: React.FC<DeleteStageModalProps> = ({
  open,
  onClose,
  onDelete,
  stageName
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth>
      <DialogTitle>단계 삭제</DialogTitle>
      <DialogContent>
        <Typography>
          "{stageName}" 단계를 삭제하시겠습니까?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={onDelete}
          variant="contained"
          color="error">
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteStageModal 