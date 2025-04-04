import React from 'react'
import { Box, Typography, Card, CardContent, Divider } from '@mui/material'
import { Building2, Users } from 'lucide-react'

interface ProjectInfoProps {
  project: {
    name: string
    description: string
    client: {
      name: string
      manager: string
      participants: string[]
    }
    developer: {
      name: string
      manager: string
      participants: string[]
    }
  }
  isEditMode?: boolean
  onFieldChange?: (field: string, value: string) => void
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({
  project,
  isEditMode = false,
  onFieldChange
}) => {
  const renderField = (label: string, value: string, fieldName?: string) => {
    if (isEditMode && fieldName) {
      return (
        <input
          type="text"
          value={value}
          onChange={e => onFieldChange?.(fieldName, e.target.value)}
          className="w-full rounded border p-2"
        />
      )
    }
    return <Typography variant="body1">{value}</Typography>
  }

  const renderParticipants = (participants: string[]) => {
    return (
      <Box sx={{ mt: 1 }}>
        {participants.map((participant, index) => (
          <Typography
            key={index}
            variant="body2"
            color="text.secondary">
            • {participant}
          </Typography>
        ))}
      </Box>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom>
            {isEditMode ? `${project.name} 수정` : project.name}
          </Typography>
          <Divider />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            gutterBottom>
            프로젝트 설명
          </Typography>
          {renderField('프로젝트 설명', project.description, 'description')}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Building2 size={20} />
            고객사 정보
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              variant="body1"
              gutterBottom>
              {project.client.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary">
              담당자: {project.client.manager}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}>
              참여자:
            </Typography>
            {renderParticipants(project.client.participants)}
          </Box>
        </Box>

        <Box>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Users size={20} />
            개발사 정보
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              variant="body1"
              gutterBottom>
              {project.developer.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary">
              담당자: {project.developer.manager}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}>
              참여자:
            </Typography>
            {renderParticipants(project.developer.participants)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProjectInfo
