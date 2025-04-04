import React from 'react'
import { Avatar, AvatarGroup, LinearProgress } from '@mui/material'

interface ProjectCardProps {
  title: string
  status: '진행중' | '지연' | '완료'
  company: string
  progress: number
  dueDate: string
  assignees: Array<{
    id: number
    name: string
    avatar: string
  }>
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  status,
  company,
  progress,
  dueDate,
  assignees
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행중':
        return 'bg-green-100 text-green-800'
      case '지연':
        return 'bg-yellow-100 text-yellow-800'
      case '완료':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
            status
          )}`}>
          {status}
        </span>
      </div>
      <p className="mb-2 text-sm text-gray-600">{company}</p>
      <div className="mb-4">
        <div className="mb-1 flex justify-between">
          <span className="text-sm text-gray-600">진행률</span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#E5E7EB',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#3B82F6'
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <AvatarGroup
          max={3}
          sx={{
            '& .MuiAvatar-root': {
              width: 28,
              height: 28,
              fontSize: '0.875rem'
            }
          }}>
          {assignees.map(assignee => (
            <Avatar
              key={assignee.id}
              alt={assignee.name}
              src={assignee.avatar}
            />
          ))}
        </AvatarGroup>
        <span className="text-sm text-gray-500">마감일: {dueDate}</span>
      </div>
    </div>
  )
}

export default ProjectCard
