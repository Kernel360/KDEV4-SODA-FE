import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { client } from '../../../api/client'
import { useToast } from '../../../contexts/ToastContext'
import { projectService } from '../../../services/projectService'
import type { ProjectMember } from '../../../types/project'

interface LinkData {
  urlAddress: string
  urlDescription: string
}

interface RequestFormData {
  title: string
  content: string
  links: LinkData[]
  files: File[]
}

const ReapplyRequest: React.FC = () => {
  const { projectId, requestId } = useParams<{
    projectId: string
    requestId: string
  }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<RequestFormData>({
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
    const fetchApprovers = async () => {
      try {
        const response = await projectService.getProjectMembers(
          Number(projectId),
          { companyRole: 'CLIENT_COMPANY' }
        )
        if (response && response.content) {
          setApprovers(
            response.content.map((member: any) => ({
              id: member.memberId,
              name: member.memberName,
              email: member.email,
              companyRole: member.role.includes('CLI')
                ? 'CLIENT_COMPANY'
                : 'DEV_COMPANY',
              companyName: member.companyName,
              role: member.role,
              memberStatus: member.memberStatus || 'AVAILABLE',
            }))
          )
        }
      } catch (error) {
        console.error('승인권자 목록을 불러오는데 실패했습니다:', error)
        showToast('승인권자 목록을 불러오는데 실패했습니다', 'error')
      }
    }

    if (projectId) {
      fetchApprovers()
    }
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 1. 재승인 요청 생성
      const requestBody = {
        title: formData.title,
        content: formData.content,
        links: formData.links.map(link => ({
          urlAddress: link.urlAddress,
          urlDescription: link.urlDescription
        })),
        members: selectedApprovers.map(id => ({ id }))
      }

      const response = await client.post(
        `/requests/${requestId}/re-requests`,
        requestBody
      )

      if (response.data.status === 'success') {
        const newRequestId = response.data.data.requestId

        // 2. 파일 업로드 (파일이 있는 경우)
        if (formData.files.length > 0) {
          const formDataForFiles = new FormData()
          formData.files.forEach(file => {
            formDataForFiles.append('file', file)
          })
          await client.post(
            `/requests/${newRequestId}/files`,
            formDataForFiles,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          )
        }

        showToast('재승인 요청이 생성되었습니다', 'success')
        navigate(`/user/projects/${projectId}`)
      }
    } catch (error) {
      console.error('재승인 요청 생성에 실패했습니다:', error)
      showToast('재승인 요청 생성에 실패했습니다', 'error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleAddLink = () => {
    if (tempLink.urlAddress) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, tempLink]
      }))
      setTempLink({ urlAddress: '', urlDescription: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  const handleApproverChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    setSelectedApprovers(
      typeof value === 'string' ? value.split(',').map(Number) : value
    )
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '업무가능';
      case 'BUSY': return '바쁨';
      case 'AWAY': return '자리비움';
      case 'ON_VACATION': return '휴가중';
      default: return status;
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
        <Button
          onClick={() =>
            navigate(`/user/projects/${projectId}/requests/${requestId}`)
          }
          sx={{
            color: 'text.secondary',
            p: 0,
            minWidth: 'auto',
            '&:hover': { background: 'none' }
          }}>
          <ArrowLeft size={20} />
          <Typography
            variant="body2"
            sx={{ ml: 1 }}>
            승인요청 상세보기로 돌아가기
          </Typography>
        </Button>
      </Box>

      <Paper
        sx={{
          borderRadius: '4px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: 'none'
        }}
        elevation={0}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          id="reapply-form"
          sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Typography
              variant="body2"
              color="#6B7280"
              sx={{ mb: 1 }}>
              제목
            </Typography>
            <TextField
              fullWidth
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    border: '1px solid #E5E7EB'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Typography
              variant="body2"
              color="#6B7280"
              sx={{ mb: 1 }}>
              내용
            </Typography>
            <TextField
              fullWidth
              placeholder="내용을 입력해주세요"
              multiline
              rows={6}
              value={formData.content}
              onChange={e =>
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    border: '1px solid #E5E7EB'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{ flex: 1, px: 3, py: 2, borderRight: '1px solid #E5E7EB' }}>
              <Typography
                variant="body2"
                color="#6B7280"
                sx={{ mb: 1 }}>
                첨부 링크
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="URL"
                  value={tempLink.urlAddress}
                  onChange={e =>
                    setTempLink(prev => ({
                      ...prev,
                      urlAddress: e.target.value
                    }))
                  }
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  placeholder="설명"
                  value={tempLink.urlDescription}
                  onChange={e =>
                    setTempLink(prev => ({
                      ...prev,
                      urlDescription: e.target.value
                    }))
                  }
                  sx={{ flex: 1 }}
                />
                <Button
                  onClick={handleAddLink}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    color: '#FFB800',
                    border: '1px solid #FFB800'
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
                  <Typography
                    variant="body2"
                    sx={{ flex: 1 }}>
                    {link.urlDescription}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#6B7280">
                    {link.urlAddress}
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
              <Typography
                variant="body2"
                color="#6B7280"
                sx={{ mb: 1 }}>
                파일 첨부
              </Typography>
              <Button
                component="label"
                sx={{
                  color: '#FFB800',
                  border: '1px solid #FFB800'
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
                  <Typography
                    variant="body2"
                    sx={{ flex: 1 }}>
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

          <Box sx={{ px: 3, py: 2 }}>
            <FormControl fullWidth>
              <InputLabel>승인권자 선택</InputLabel>
              <Select
                multiple
                value={selectedApprovers}
                onChange={handleApproverChange}
                input={<OutlinedInput label="승인권자 선택" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => {
                      const approver = approvers.find(a => a.id === value)
                      return (
                        <Chip
                          key={value}
                          label={
                            approver
                              ? `${approver.name} (${approver.companyName}) - ${getStatusLabel(approver.memberStatus)}`
                              : ''
                          }
                          onDelete={() => {
                            setSelectedApprovers(
                              selectedApprovers.filter(id => id !== value)
                            )
                          }}
                        />
                      )
                    })}
                  </Box>
                )}
              >
                {approvers.map(approver => (
                  <MenuItem
                    key={approver.id}
                    value={approver.id}
                  >
                    {`${approver.name} (${approver.companyName}) - ${getStatusLabel(approver.memberStatus)}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{ display: 'flex', gap: 1.5, mt: 3, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/user/projects/${projectId}/requests/${requestId}`)
          }
          sx={{
            px: 3,
            py: 1,
            color: '#dc2626',
            border: '1px solid #dc2626'
          }}>
          ← 재승인 요청 취소하기
        </Button>
        <Button
          type="submit"
          form="reapply-form"
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

export default ReapplyRequest
