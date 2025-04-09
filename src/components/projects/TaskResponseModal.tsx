import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography
} from '@mui/material'
import { Plus, X } from 'lucide-react'
import type { CreateTaskResponseRequest } from '../../api/task'

interface TaskResponseModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTaskResponseRequest) => void
  initialData: CreateTaskResponseRequest
  mode: 'create' | 'edit'
}

const TaskResponseModal: React.FC<TaskResponseModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] =
    useState<CreateTaskResponseRequest>(initialData)
  const [newLink, setNewLink] = useState({ urlAddress: '', urlDescription: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleAddLink = () => {
    if (newLink.urlAddress) {
      setFormData({
        ...formData,
        links: [...(formData.links || []), newLink]
      })
      setNewLink({ urlAddress: '', urlDescription: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links?.filter((_, i) => i !== index)
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth>
      <DialogTitle>{mode === 'create' ? '답변 작성' : '답변 수정'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="내용"
            value={formData.content}
            onChange={e =>
              setFormData({ ...formData, content: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <Typography
            variant="subtitle1"
            sx={{ mb: 1 }}>
            링크 추가
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="URL"
              value={newLink.urlAddress}
              onChange={e =>
                setNewLink({ ...newLink, urlAddress: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="설명"
              value={newLink.urlDescription}
              onChange={e =>
                setNewLink({ ...newLink, urlDescription: e.target.value })
              }
            />
            <IconButton
              onClick={handleAddLink}
              color="primary">
              <Plus size={20} />
            </IconButton>
          </Box>

          {formData.links && formData.links.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {formData.links.map((link, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1
                  }}>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1 }}>
                    {link.urlDescription || link.urlAddress}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveLink(index)}>
                    <X size={16} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button
            type="submit"
            variant="contained">
            {mode === 'create' ? '작성' : '수정'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TaskResponseModal
