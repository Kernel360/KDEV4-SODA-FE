import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import type { Project } from '../../types/project'
import type { Request } from '../../types/request'
import ProjectCard from '../../components/projects/ProjectCard'
import ScheduleList from '../../components/schedule/ScheduleList'
import RequestList from '../../components/request/RequestList'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

interface ProjectWithProgress extends Project {
  progress: number
}

interface Schedule {
  time: string
  title: string
  projectName: string
}

interface RequestWithProject extends Request {
  projectName: string
}

const UserMain: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [requests, setRequests] = useState<RequestWithProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userProjects = await projectService.getUserProjects()

        // 프로젝트 데이터에 progress 추가 (임시로 0으로 설정)
        const projectsWithProgress = userProjects.map(project => ({
          ...project,
          progress: 0
        }))

        setProjects(projectsWithProgress)

        // TODO: 실제 요청사항 API 연동
        const dummyRequests: RequestWithProject[] = [
          {
            id: 1,
            title: '디자인 수정 요청',
            description: '메인 페이지의 디자인 수정이 필요합니다.',
            status: '승인대기중',
            createdAt: '2024-02-20T10:00:00',
            updatedAt: '2024-02-20T10:00:00',
            type: '수정',
            projectName: userProjects[0]?.title || '프로젝트 1'
          },
          {
            id: 2,
            title: '기능 추가 요청',
            description:
              '사용자 프로필 페이지에 새로운 기능 추가가 필요합니다.',
            status: '승인됨',
            createdAt: '2024-02-19T15:00:00',
            updatedAt: '2024-02-19T16:30:00',
            type: '추가',
            projectName: userProjects[1]?.title || '프로젝트 2'
          }
        ]

        setRequests(dummyRequests)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleProjectClick = (projectId: number) => {
    navigate(`/user/projects/${projectId}`)
  }

  const handleRequestClick = (requestId: number) => {
    // TODO: 요청사항 상세 페이지로 이동
    console.log('Request clicked:', requestId)
  }

  // 일정 데이터 (임시)
  const schedules: Schedule[] = [
    {
      time: '10:00',
      title: '프로젝트 미팅',
      projectName: projects[0]?.title || '프로젝트 1'
    },
    {
      time: '14:00',
      title: '클라이언트 미팅',
      projectName: projects[1]?.title || '프로젝트 2'
    }
  ]

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 상단: 프로젝트와 일정 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        {/* 왼쪽: 프로젝트 리스트 */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            gutterBottom>
            참여 중인 프로젝트
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </Box>
        </Box>

        {/* 오른쪽: 일정 관리 */}
        <ScheduleList schedules={schedules} />
      </Box>

      {/* 하단: 요청사항 */}
      <RequestList
        requests={requests}
        onRequestClick={handleRequestClick}
      />
    </Box>
  )
}

export default UserMain
