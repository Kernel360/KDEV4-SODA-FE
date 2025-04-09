import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import type { Project } from '../../types/project'
import type { Request } from '../../types/request'
import ProjectCard from '../../components/projects/ProjectCard'
import ScheduleList from '../../components/schedule/ScheduleList'
import RequestList from '../../components/request/RequestList'

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

  useEffect(() => {
    // TODO: API 호출로 대체
    const fetchData = async () => {
      // 더미 프로젝트 데이터
      const dummyProjects: ProjectWithProgress[] = [
        {
          id: 1,
          title: '웹사이트 리뉴얼 프로젝트',
          description: '기업 웹사이트 리뉴얼',
          startDate: '2024-01-01',
          endDate: '2024-03-15',
          status: '진행중',
          clientCompanyName: '클라이언트 A',
          devCompanyName: '개발사 A',
          clientCompanyManagers: [],
          clientCompanyMembers: [],
          devCompanyManagers: [],
          devCompanyMembers: [],
          progress: 75
        },
        {
          id: 2,
          title: '모바일 앱 개발',
          description: '모바일 앱 개발 프로젝트',
          startDate: '2024-02-01',
          endDate: '2024-03-30',
          status: '진행중',
          clientCompanyName: '클라이언트 B',
          devCompanyName: '개발사 B',
          clientCompanyManagers: [],
          clientCompanyMembers: [],
          devCompanyManagers: [],
          devCompanyMembers: [],
          progress: 45
        },
        {
          id: 3,
          title: 'ERP 시스템 구축',
          description: 'ERP 시스템 구축 프로젝트',
          startDate: '2024-03-01',
          endDate: '2024-04-15',
          status: '진행중',
          clientCompanyName: '클라이언트 C',
          devCompanyName: '개발사 C',
          clientCompanyManagers: [],
          clientCompanyMembers: [],
          devCompanyManagers: [],
          devCompanyMembers: [],
          progress: 60
        }
      ]

      // 더미 요청사항 데이터
      const dummyRequests: RequestWithProject[] = [
        {
          id: 1,
          title: '디자인 수정 요청',
          description: '메인 페이지의 디자인 수정이 필요합니다.',
          status: '승인대기중',
          createdAt: '2024-02-20T10:00:00',
          updatedAt: '2024-02-20T10:00:00',
          type: '수정',
          projectName: '웹사이트 리뉴얼 프로젝트'
        },
        {
          id: 2,
          title: '기능 추가 요청',
          description: '사용자 프로필 페이지에 새로운 기능 추가가 필요합니다.',
          status: '승인됨',
          createdAt: '2024-02-19T15:00:00',
          updatedAt: '2024-02-19T16:30:00',
          type: '추가',
          projectName: '모바일 앱 개발'
        },
        {
          id: 3,
          title: '일정 변경 요청',
          description: '프로젝트 일정 조정이 필요합니다.',
          status: '반려됨',
          createdAt: '2024-02-18T09:00:00',
          updatedAt: '2024-02-18T10:00:00',
          type: '일정',
          projectName: 'ERP 시스템 구축'
        }
      ]

      setProjects(dummyProjects)
      setRequests(dummyRequests)
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

  // 일정 데이터
  const schedules: Schedule[] = [
    {
      time: '10:00',
      title: '프로젝트 미팅',
      projectName: '웹사이트 리뉴얼 프로젝트'
    },
    {
      time: '14:00',
      title: '클라이언트 미팅',
      projectName: '모바일 앱 개발'
    },
    {
      time: '16:30',
      title: '팀 리뷰',
      projectName: 'ERP 시스템 구축'
    }
  ]

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
