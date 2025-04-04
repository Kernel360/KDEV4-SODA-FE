import React from 'react'
import { Box, Typography, Paper, Divider, Button, Chip } from '@mui/material'
import { Project } from '../../types/project'
import { Pencil, Trash2 } from 'lucide-react'

interface ProjectDetailProps {
  project: Project
  isEditable?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  isEditable,
  onEdit,
  onDelete
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={3}
        sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography
            variant="h5"
            component="h1">
            {project.name}
          </Typography>
          {isEditable && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Pencil size={18} />}
                variant="contained"
                size="small"
                onClick={onEdit}>
                수정
              </Button>
              <Button
                startIcon={<Trash2 size={18} />}
                variant="outlined"
                color="error"
                size="small"
                onClick={onDelete}>
                삭제
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                고객사
              </Typography>
              <Typography variant="body1">{project.clientCompany}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                개발사
              </Typography>
              <Typography variant="body1">
                {project.developmentCompany}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                계약번호
              </Typography>
              <Typography variant="body1">{project.projectNumber}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                프로젝트 유형
              </Typography>
              <Typography variant="body1">고객</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                계획 시작일
              </Typography>
              <Typography variant="body1">{project.startDate}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                계획 종료일
              </Typography>
              <Typography variant="body1">{project.endDate}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                시스템 담당자
              </Typography>
              <Typography variant="body1">{project.systemManager}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                프로젝트 설명
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap' }}>
                {project.description}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2 }}>
            고객사
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}>
              승인권자
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.clientManagers.map((manager, index) => (
                <Chip
                  key={index}
                  label={manager.name}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}>
              일반참여멤버
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.clientParticipants.map((participant, index) => (
                <Chip
                  key={index}
                  label={participant.name}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2 }}>
            개발사
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}>
              승인권자
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.developmentManagers.map((manager, index) => (
                <Chip
                  key={index}
                  label={manager.name}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}>
              일반참여멤버
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.developmentParticipants.map((participant, index) => (
                <Chip
                  key={index}
                  label={participant.name}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default ProjectDetail
