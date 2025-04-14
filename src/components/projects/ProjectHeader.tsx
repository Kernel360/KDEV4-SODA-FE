import React, { useState } from 'react'
import {
  Box,
  Typography,
  Modal,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material'
import type { Project, ProjectStatus } from '../../types/project'

interface ProjectHeaderProps {
  project: Project
  onStatusChange: (status: ProjectStatus) => Promise<void>
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onStatusChange
}) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(
    (project.status as ProjectStatus) || '진행중'
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true)
      await onStatusChange(selectedStatus)
      setStatusModalOpen(false)
    } catch (error) {
      console.error('Status update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const statusColors = {
    계약: '#FFB800',
    진행중: '#FFD700',
    납품완료: '#FFA500',
    하자보수: '#FF6B00',
    '일시 중단': '#FF4500'
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h3">{project.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={project.status || '진행중'}
            onClick={() => setStatusModalOpen(true)}
            sx={{
              bgcolor:
                statusColors[project.status as keyof typeof statusColors] ||
                statusColors['진행중'],
              color: 'white',
              '&:hover': {
                bgcolor:
                  statusColors[project.status as keyof typeof statusColors] ||
                  statusColors['진행중'],
                opacity: 0.9
              }
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1 }}>
            클릭하면 프로젝트 상태를 바꿀 수 있습니다
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1
        }}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}>
            고객사
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {project.clientCompanyName}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}>
            개발사
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {project.devCompanyName}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}>
            기간
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {new Date(project.startDate).toLocaleDateString()} ~{' '}
            {new Date(project.endDate).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        aria-labelledby="status-modal-title"
        aria-describedby="status-modal-description">
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
          <Typography
            id="status-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}>
            프로젝트 상태 변경
          </Typography>
          <FormControl
            fullWidth
            sx={{ mb: 3 }}>
            <InputLabel id="status-select-label">상태</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="상태"
              onChange={e =>
                setSelectedStatus(e.target.value as ProjectStatus)
              }>
              <MenuItem value="계약">계약</MenuItem>
              <MenuItem value="진행중">진행중</MenuItem>
              <MenuItem value="납품완료">납품완료</MenuItem>
              <MenuItem value="하자보수">하자보수</MenuItem>
              <MenuItem value="일시 중단">일시 중단</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setStatusModalOpen(false)}>취소</Button>
            <Button
              variant="contained"
              onClick={handleStatusChange}
              disabled={isUpdating}>
              {isUpdating ? '변경 중...' : '변경'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default ProjectHeader
