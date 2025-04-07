import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProjectDetail from '../../../components/projects/ProjectDetail'
import type { Project } from '../../../types/project'
import { useToast } from '../../../contexts/ToastContext'
import { mockProjects } from '../../../api/mockData'

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
        // 임시 데이터에서 프로젝트 찾기
        const foundProject = mockProjects.find(p => p.id === Number(id))
        if (foundProject) {
          setProject(foundProject)
        } else {
          setError('프로젝트를 찾을 수 없습니다.')
        }
      } catch (err) {
        setError('프로젝트 정보를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

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

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!project) {
    return <div>프로젝트를 찾을 수 없습니다.</div>
  }

  return (
    <ProjectDetail
      project={project}
      isEditable={true}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}

export default ProjectPage
