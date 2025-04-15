import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
import { Upload, Link as LinkIcon, X, Plus } from 'lucide-react'

interface FileWithPreview extends File {
  preview?: string;
}

const CreateRequest: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [links, setLinks] = useState<{ url: string; description: string }[]>([])
  const [newLink, setNewLink] = useState({ url: '', description: '' })

  useEffect(() => {
    const fetchStages = async () => {
      if (!projectId) {
        setError('프로젝트 ID가 없습니다.')
        setLoading(false)
        return
      }

      try {
        const response = await client.get(`/projects/${projectId}/stages`)
        const stagesData = Array.isArray(response.data) ? response.data : []
        setStages(stagesData)
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
      const newFiles = Array.from(event.target.files).map(file => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(file);
        return fileWithPreview;
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleAddLink = () => {
    if (newLink.url.trim() && newLink.description.trim()) {
      setLinks(prev => [...prev, { ...newLink }]);
      setNewLink({ url: '', description: '' });
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStage || !title.trim() || !description.trim()) return

    const formData = new FormData();
    formData.append('stageId', selectedStage.toString());
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('links', JSON.stringify(links));

    try {
      await client.post(`/projects/${projectId}/requests`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/user/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to create request:', error);
      setError('요청 생성에 실패했습니다.');
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>새로운 요청 생성</Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>단계</InputLabel>
              <Select
                value={selectedStage || ''}
                label="단계"
                onChange={e => setSelectedStage(Number(e.target.value))}
                required>
                {stages.map(stage => (
                  <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>
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
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>파일 첨부</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Upload size={20} />}
                  sx={{ borderColor: '#FFB800', color: '#FFB800' }}>
                  파일 선택
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </Button>
              </Box>
              <List>
                {files.map((file, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText primary={file.name} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)} size="small">
                        <X size={16} />
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
                    value={newLink.url}
                    onChange={e => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    size="small"
                    placeholder="설명"
                    value={newLink.description}
                    onChange={e => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={handleAddLink}
                    disabled={!newLink.url || !newLink.description}
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
                        primary={link.description}
                        secondary={link.url}
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
        </form>
      </Paper>
    </Box>
  )
}

export default CreateRequest
