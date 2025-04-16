import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon
} from '@mui/material'
import { Stage } from '../../../types/project'
import { client } from '../../../api/client'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { Link as LinkIcon, X, Plus, Delete as DeleteIcon } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'

interface LinkData {
  urlAddress: string;
  urlDescription: string;
}

const CreateRequest: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [links, setLinks] = useState<LinkData[]>([])
  const [newLink, setNewLink] = useState({ urlAddress: '', urlDescription: '' })

  useEffect(() => {
    const fetchStages = async () => {
      if (!projectId) {
        setError('프로젝트 ID가 없습니다.')
        setLoading(false)
        return
      }

      try {
        const response = await client.get(`/projects/${projectId}/stages`)
        console.log('Stages response:', response) // 디버깅용 로그
        if (response.data && Array.isArray(response.data)) {
          setStages(response.data)
        } else if (response.data && Array.isArray(response.data.data)) {
          setStages(response.data.data)
        } else {
          console.error('Unexpected response format:', response.data)
          setError('단계 정보를 불러오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('Failed to fetch stages:', error)
        setError('단계 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStages()
  }, [projectId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddLink = () => {
    if (newLink.urlAddress.trim() && newLink.urlDescription.trim()) {
      setLinks(prev => [...prev, { ...newLink }])
      setNewLink({ urlAddress: '', urlDescription: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStage || !title.trim() || !description.trim()) {
      showToast('필수 항목을 모두 입력해주세요.', 'error')
      return
    }

    try {
      const requestData = {
        title: title.trim(),
        content: description.trim(),
        projectId: Number(projectId),
        stageId: selectedStage,
        links: links.map(link => ({
          urlAddress: link.urlAddress,
          urlDescription: link.urlDescription
        }))
      }

      const createResponse = await client.post('/requests', requestData)

      if (createResponse.data.status === 'success') {
        const requestId = createResponse.data.data.requestId

        if (files.length > 0) {
          const formData = new FormData()
          files.forEach(file => {
            formData.append('file', file)
          })

          await client.post(
            `/requests/${requestId}/files`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          )
        }

        showToast('요청이 성공적으로 생성되었습니다.', 'success')
        navigate(`/user/projects/${projectId}/requests/${requestId}`)
      }
    } catch (error) {
      console.error('Failed to create request:', error)
      showToast('요청 생성 중 오류가 발생했습니다.', 'error')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>새 요청 생성</Typography>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>단계</InputLabel>
            <Select
              value={selectedStage || ''}
              label="단계"
              onChange={e => setSelectedStage(Number(e.target.value))}
              required>
              {stages.map(stage => (
                <MenuItem 
                  key={stage.id} 
                  value={stage.id}
                  sx={{
                    py: 1,
                    px: 2
                  }}>
                  <Box>
                    <Typography>{stage.name}</Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block' }}>
                      {stage.description || '설명 없음'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="내용"
            multiline
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />

          {/* 파일 첨부 섹션 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              파일 첨부
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<Plus size={20} />}
              sx={{ mb: 2 }}
            >
              파일 선택
            </Button>
            
            <List>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* 링크 첨부 섹션 */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>링크 첨부</Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="URL"
                  value={newLink.urlAddress}
                  onChange={e => setNewLink(prev => ({ ...prev, urlAddress: e.target.value }))}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  placeholder="설명"
                  value={newLink.urlDescription}
                  onChange={e => setNewLink(prev => ({ ...prev, urlDescription: e.target.value }))}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={handleAddLink}
                  disabled={!newLink.urlAddress || !newLink.urlDescription}
                  sx={{ color: '#FFB800' }}>
                  <Plus size={20} />
                </IconButton>
              </Box>
              <List>
                {links.map((link, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <LinkIcon size={16} />
                    </ListItemIcon>
                    <ListItemText
                      primary={link.urlDescription}
                      secondary={link.urlAddress}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveLink(index)} size="small">
                        <X size={16} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/user/projects/${projectId}`)}
              sx={{
                borderColor: '#FFB800',
                color: '#FFB800',
                '&:hover': {
                  borderColor: '#FFB800',
                  opacity: 0.8
                }
              }}>
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!selectedStage || !title || !description}
              sx={{
                bgcolor: '#FFB800',
                '&:hover': {
                  bgcolor: '#FFB800',
                  opacity: 0.8
                }
              }}>
              생성
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default CreateRequest
