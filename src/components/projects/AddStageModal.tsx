import React, { useState } from 'react'
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

interface AddStageModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

const AddStageModal: React.FC<AddStageModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
      setName('')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-stage-modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
          <Typography
            id="add-stage-modal-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 'bold' }}>
            새로운 단계 추가
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: '#666' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="단계 이름"
            value={name}
            onChange={e => setName(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: '#666',
                borderColor: '#E0E0E0',
                '&:hover': {
                  borderColor: '#FFB800',
                  color: '#FFB800'
                }
              }}>
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!name.trim()}
              sx={{
                bgcolor: '#FFB800',
                '&:hover': {
                  bgcolor: '#FFB800',
                  opacity: 0.9
                }
              }}>
              추가
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}

export default AddStageModal
