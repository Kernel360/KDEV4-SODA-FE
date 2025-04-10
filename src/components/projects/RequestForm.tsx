import React, { useState, useRef } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
  CircularProgress
} from '@mui/material'
import { Link as LinkIcon, X, Upload } from 'lucide-react'

interface RequestFormProps {
  onSubmit: (data: {
    title: string
    content: string
    links: Array<{
      urlAddress: string
      urlDescription: string
    }>
    files?: File[]
  }) => void
  onCancel: () => void
  initialData?: {
    title: string
    content: string
    links?: Array<{
      urlAddress: string
      urlDescription: string
    }>
  }
}

const MAX_LINKS = 10
const MAX_FILES = 10

const RequestForm: React.FC<RequestFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData
}) => {
  const [request, setRequest] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    links: initialData?.links || [],
    files: [] as File[]
  })
  const [newLink, setNewLink] = useState({ urlAddress: '', urlDescription: '' })
  const [isAddingLink, setIsAddingLink] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddLink = () => {
    if (!newLink.urlAddress || !newLink.urlDescription) return

    setRequest({
      ...request,
      links: [...request.links, newLink]
    })
    setNewLink({ urlAddress: '', urlDescription: '' })
    setIsAddingLink(false)
  }

  const handleRemoveLink = (index: number) => {
    setRequest({
      ...request,
      links: request.links.filter((_, i) => i !== index)
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const selectedFiles = Array.from(files)
    const remainingSlots = MAX_FILES - request.files.length
    const filesToAdd = selectedFiles.slice(0, remainingSlots)

    setRequest(prev => ({
      ...prev,
      files: [...prev.files, ...filesToAdd]
    }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setRequest(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    onSubmit(request)
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="제목"
        fullWidth
        value={request.title}
        onChange={e => setRequest({ ...request, title: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        label="내용"
        fullWidth
        multiline
        rows={4}
        value={request.content}
        onChange={e => setRequest({ ...request, content: e.target.value })}
        sx={{ mb: 2 }}
      />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          첨부파일 ({request.files.length}/10) 및 링크 ({request.links.length}/10)
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button
            variant="outlined"
            startIcon={<LinkIcon size={16} />}
            size="small"
            onClick={() => setIsAddingLink(true)}
            disabled={request.links.length >= MAX_LINKS}
          >
            링크 추가
          </Button>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload size={16} />}
            size="small"
            disabled={request.files.length >= MAX_FILES}
          >
            파일 업로드
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileSelect}
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </Button>
        </Stack>
        {isAddingLink && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="링크 제목"
              size="small"
              value={newLink.urlDescription}
              onChange={e => setNewLink({ ...newLink, urlDescription: e.target.value })}
            />
            <TextField
              label="URL"
              size="small"
              value={newLink.urlAddress}
              onChange={e => setNewLink({ ...newLink, urlAddress: e.target.value })}
            />
            <Button
              variant="contained"
              onClick={handleAddLink}
              disabled={!newLink.urlDescription || !newLink.urlAddress}
            >
              추가
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsAddingLink(false)}
            >
              취소
            </Button>
          </Box>
        )}
        <List>
          {request.files.map((file, index) => (
            <ListItem key={`file-${index}`} sx={{ py: 0.5 }}>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X size={16} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {request.links.map((link, index) => (
            <ListItem key={`link-${index}`} sx={{ py: 0.5 }}>
              <ListItemText
                primary={link.urlDescription}
                secondary={link.urlAddress}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleRemoveLink(index)}
                >
                  <X size={16} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button onClick={onCancel}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!request.title.trim() || !request.content.trim()}>
          저장
        </Button>
      </Box>
    </Box>
  )
}

export default RequestForm
