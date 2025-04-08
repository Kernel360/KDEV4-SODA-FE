import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import ProjectDetail from '../../../components/projects/ProjectDetail'
import ProjectStages from '../../../components/projects/ProjectStages'
import ProjectBoard from '../../../components/projects/ProjectBoard'
import ProjectHeader from '../../../components/projects/ProjectHeader'
import type { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // TODO: API 호출로 대체
        const dummyProject: Project = {
          id: 1,
          name: '프로젝트 A',
          description: '프로젝트 A에 대한 설명입니다.',
          projectNumber: 'PRJ-2024-001',
          status: '진행중',
          startDate: '2024-03-01',
          endDate: '2024-12-31',
          clientCompany: '고객사 A',
          clientManagers: [
            { name: '김담당', position: '과장', email: 'manager@client.com' }
          ],
          clientParticipants: [
            {
              name: '이참여',
              position: '대리',
              email: 'participant@client.com'
            }
          ],
          developmentCompany: '개발사 A',
          developmentManagers: [
            { name: '박담당', position: '과장', email: 'manager@dev.com' }
          ],
          developmentParticipants: [
            { name: '최참여', position: '대리', email: 'participant@dev.com' }
          ],
          systemManager: '김태형'
        }
        setProject(dummyProject)
      } catch (err) {
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
        showToast('프로젝트 정보를 불러오는데 실패했습니다.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, showToast])

  const handleEdit = () => {
    navigate(`/admin/projects/${id}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        // TODO: API 호출로 대체
        showToast('프로젝트가 삭제되었습니다.', 'success')
        navigate('/admin/projects')
      } catch (err) {
        showToast('프로젝트 삭제에 실패했습니다.', 'error')
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>

  return (
    <Box>
      <ProjectHeader project={project} />
      <Box sx={{ px: 3 }}>
        <ProjectDetail
          project={project}
          isEditable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ProjectStages projectId={project.id} />
        <ProjectBoard projectId={project.id} />
      </Box>
    </Box>
  )
}

export default ProjectPage 