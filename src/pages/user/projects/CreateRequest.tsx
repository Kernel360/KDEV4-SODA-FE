import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material'
import { Stage } from '../../../types/project'
import { client } from '../../../api/client'
import { useToast } from '../../../contexts/ToastContext'
import { ArrowLeft } from 'lucide-react'
import { requestService } from '../../../services/requestService'
import { projectService } from '../../../services/projectService'
import type { ProjectMember } from '../../../types/project'

interface LinkData {
  urlAddress: string;
  urlDescription: string;
}

interface RequestFormData {
  stageId: number;
  title: string;
  content: string;
  links: LinkData[];
  files: File[];
}

const CreateRequest: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stages, setStages] = useState<Stage[]>([])
  const [selectedTab, setSelectedTab] = useState(0)
  const [formData, setFormData] = useState<RequestFormData>({
    stageId: 0,
    title: '',
    content: '',
    links: [],
    files: []
  })
  const [tempLink, setTempLink] = useState<LinkData>({
    urlAddress: '',
    urlDescription: ''
  })
  const [approvers, setApprovers] = useState<ProjectMember[]>([])
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([])

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await client.get(`/projects/${projectId}/stages`)
        if (response.data.status === 'success') {
          setStages(response.data.data)
          if (response.data.data.length > 0) {
            setFormData(prev => ({ ...prev, stageId: response.data.data[0].id }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch stages:', error)
        showToast('단계 정보를 불러오는데 실패했습니다.', 'error')
      }
    }

    const fetchApprovers = async () => {
      try {
        const response = await projectService.getProjectMembers(Number(projectId), 'CLIENT_COMPANY')
        if (response && Array.isArray(response)) {
          setApprovers(response)
        } else {
          console.error('Invalid response format for approvers:', response)
          setApprovers([])
        }
      } catch (error) {
        console.error('승인권자 목록을 불러오는데 실패했습니다:', error)
        showToast('승인권자 목록을 불러오는데 실패했습니다', 'error')
        setApprovers([])
      }
    }

    if (projectId) {
      fetchStages()
      fetchApprovers()
    }
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const requestBody = {
        title: formData.title,
        content: formData.content,
        projectId: Number(projectId),
        stageId: formData.stageId,
        links: formData.links.map(link => ({
          urlAddress: link.urlAddress,
          urlDescription: link.urlDescription
        })),
        members: selectedApprovers.map(id => ({ id }))
      }

      const response = await requestService.createRequest(requestBody)
      
      if (formData.files.length > 0) {
        const formDataForFiles = new FormData()
        formData.files.forEach(file => {
          formDataForFiles.append('files', file)
        })
        await requestService.uploadRequestFiles(response.requestId, formDataForFiles)
      }

      showToast('승인요청이 생성되었습니다', 'success')
      navigate(`/user/projects/${projectId}`)
    } catch (error) {
      console.error('승인요청 생성에 실패했습니다:', error)
      showToast('승인요청 생성에 실패했습니다', 'error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData((prev: RequestFormData) => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData((prev: RequestFormData) => ({
      ...prev,
      files: prev.files.filter((_, i: number) => i !== index)
    }))
  }

  const handleAddLink = () => {
    if (tempLink.urlAddress) {
      setFormData((prev: RequestFormData) => ({
        ...prev,
        links: [...prev.links, tempLink]
      }))
      setTempLink({ urlAddress: '', urlDescription: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setFormData((prev: RequestFormData) => ({
      ...prev,
      links: prev.links.filter((_, i: number) => i !== index)
    }))
  }

  const handleApproverChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    setSelectedApprovers(typeof value === 'string' ? value.split(',').map(Number) : value)
  }

  return (
    <Box sx={{ maxWidth: '100%', p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          onClick={() => navigate(`/user/projects/${projectId}`)}
          sx={{ 
            color: 'text.secondary',
            p: 0,
            minWidth: 'auto',
            '&:hover': { background: 'none' }
          }}>
          <ArrowLeft size={20} />
          <Typography variant="body2" sx={{ ml: 1 }}>프로젝트 대시보드로 돌아가기</Typography>
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, newValue) => {
            setSelectedTab(newValue)
            setFormData(prev => ({ ...prev, stageId: stages[newValue].id }))
          }}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFB800'
            }
          }}>
          {stages.map((stage, index) => (
            <Tab 
              key={stage.id} 
              label={stage.name}
              sx={{
                minHeight: '48px',
                textTransform: 'none',
                fontSize: '1rem',
                color: selectedTab === index ? '#FFB800' : 'text.secondary',
                '&.Mui-selected': {
                  color: '#FFB800',
                  fontWeight: 600
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Paper 
        sx={{ 
          borderRadius: '4px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: 'none'
        }} 
        elevation={0}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          id="request-form"
          sx={{ p: 0 }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Typography variant="body2" color="#6B7280" sx={{ mb: 1 }}>제목</Typography>
            <TextField
              fullWidth
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              variant="outlined"
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    border: '1px solid #E5E7EB'
                  },
                  '&:hover fieldset': {
                    border: '1px solid #E5E7EB'
                  },
                  '&.Mui-focused fieldset': {
                    border: '1px solid #E5E7EB'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  p: 1.5
                }
              }}
            />
          </Box>

          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Typography variant="body2" color="#6B7280" sx={{ mb: 1 }}>내용</Typography>
            <TextField
              fullWidth
              placeholder="내용을 입력해주세요"
              multiline
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              variant="outlined"
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    border: '1px solid #E5E7EB'
                  },
                  '&:hover fieldset': {
                    border: '1px solid #E5E7EB'
                  },
                  '&.Mui-focused fieldset': {
                    border: '1px solid #E5E7EB'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Box sx={{ flex: 1, px: 3, py: 2, borderRight: '1px solid #E5E7EB' }}>
              <Typography variant="body2" color="#6B7280" sx={{ mb: 1 }}>첨부 링크</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="URL"
                  value={tempLink.urlAddress}
                  onChange={(e) => setTempLink(prev => ({ ...prev, urlAddress: e.target.value }))}
                  sx={{ 
                    flex: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      fontSize: '0.875rem',
                      '& fieldset': {
                        border: '1px solid #E5E7EB'
                      },
                      '&:hover fieldset': {
                        border: '1px solid #E5E7EB'
                      },
                      '&.Mui-focused fieldset': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      p: 1.5
                    }
                  }}
                />
                <TextField
                  size="small"
                  placeholder="설명"
                  value={tempLink.urlDescription}
                  onChange={(e) => setTempLink(prev => ({ ...prev, urlDescription: e.target.value }))}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      fontSize: '0.875rem',
                      '& fieldset': {
                        border: '1px solid #E5E7EB'
                      },
                      '&:hover fieldset': {
                        border: '1px solid #E5E7EB'
                      },
                      '&.Mui-focused fieldset': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      p: 1.5
                    }
                  }}
                />
                <Button
                  onClick={handleAddLink}
                  sx={{ 
                    minWidth: 'auto',
                    px: 2,
                    color: '#FFB800',
                    border: '1px solid #FFB800',
                    '&:hover': {
                      border: '1px solid #FFB800',
                      bgcolor: 'rgba(255, 184, 0, 0.04)'
                    }
                  }}>
                  +
                </Button>
              </Box>
              {formData.links.map((link, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    bgcolor: 'white'
                  }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {link.urlDescription || '네이버'}
                  </Typography>
                  <Typography variant="body2" color="#6B7280">
                    {link.urlAddress || 'naver.com'}
                  </Typography>
                  <IconButton 
                    onClick={() => handleRemoveLink(index)} 
                    size="small"
                    sx={{ 
                      ml: 1,
                      color: '#6B7280',
                      p: 0.5
                    }}>
                    ×
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box sx={{ flex: 1, px: 3, py: 2 }}>
              <Typography variant="body2" color="#6B7280" sx={{ mb: 1 }}>파일 첨부</Typography>
              <Button
                component="label"
                sx={{ 
                  color: '#FFB800',
                  border: '1px solid #FFB800',
                  '&:hover': {
                    border: '1px solid #FFB800',
                    bgcolor: 'rgba(255, 184, 0, 0.04)'
                  }
                }}>
                + 파일 선택
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {formData.files.map((file, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    bgcolor: 'white'
                  }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {file.name}
                  </Typography>
                  <IconButton 
                    onClick={() => handleRemoveFile(index)} 
                    size="small"
                    sx={{ 
                      color: '#6B7280',
                      p: 0.5
                    }}>
                    ×
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>승인권자 선택</InputLabel>
              <Select
                multiple
                value={selectedApprovers}
                onChange={handleApproverChange}
                input={<OutlinedInput label="승인권자 선택" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const approver = approvers.find(a => a.id === value)
                      return (
                        <Chip
                          key={value}
                          label={approver?.name || ''}
                          onDelete={() => {
                            setSelectedApprovers(selectedApprovers.filter(id => id !== value))
                          }}
                        />
                      )
                    })}
                  </Box>
                )}
              >
                {approvers.map((approver) => (
                  <MenuItem key={approver.id} value={approver.id}>
                    {approver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 1.5, mt: 3, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/user/projects/${projectId}`)}
          sx={{ 
            px: 3,
            py: 1,
            color: '#dc2626',
            border: '1px solid #dc2626',
            '&:hover': {
              border: '1px solid #dc2626',
              bgcolor: 'rgba(220, 38, 38, 0.04)'
            }
          }}>
          ← 승인요청 생성 취소하기
        </Button>
        <Button
          type="submit"
          form="request-form"
          sx={{ 
            px: 4,
            py: 1,
            bgcolor: '#FFB800',
            color: 'white',
            '&:hover': {
              bgcolor: '#FFB800',
              opacity: 0.9
            }
          }}>
          저장
        </Button>
      </Box>
    </Box>
  )
}

export default CreateRequest
