import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { Project } from '@/types/project'
import ProjectHeader from '@/components/projects/ProjectHeader'
import ProjectStages from '@/components/projects/ProjectStages'
import ProjectBoard from '@/components/projects/ProjectBoard'

interface ProjectWithProgress extends Project {
  progress: number
}

const UserProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectWithProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // TODO: API 호출로 대체
        const dummyProject: ProjectWithProgress = {
          id: 1,
          projectNumber: 'P001',
          name: '소다 프로젝트',
          description: '소다 프로젝트 설명입니다.',
          status: '진행중',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          clientCompany: '클라이언트 회사',
          devCompany: '개발 회사',
          systemManager: '홍길동',
          progress: 65,
          clientManagers: [],
          clientParticipants: [],
          developmentManagers: [],
          developmentParticipants: [],
          managers: [],
          participants: []
        }
        setProject(dummyProject)
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  if (loading || !project) {
    return <div>Loading...</div>
  }

  return (
    <Box sx={{ p: 3 }}>
      <ProjectHeader project={project} />
      <ProjectStages projectId={project.id} />
      <ProjectBoard projectId={project.id} />
    </Box>
  )
}

export default UserProject
