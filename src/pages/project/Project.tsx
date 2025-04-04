import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, ButtonGroup } from '@mui/material'
import { Edit, Trash2 } from 'lucide-react'
import ProjectInfo from '@/components/project/ProjectInfo'
import { useToast } from '@/contexts/ToastContext'

// 임시 데이터
const dummyProject = {
  name: 'SODA 프로젝트',
  description: 'SODA 프로젝트는 기업의 프로젝트 관리를 위한 통합 솔루션입니다.',
  client: {
    name: 'ABC 기업',
    manager: '김담당',
    participants: ['이참여자', '박참여자', '최참여자']
  },
  developer: {
    name: 'XYZ 개발사',
    manager: '정담당',
    participants: ['강개발자', '조개발자', '윤개발자']
  }
}

const Project: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleDelete = async () => {
    try {
      // TODO: API 호출로 프로젝트 삭제
      showToast('프로젝트가 성공적으로 삭제되었습니다.', 'success')
      navigate('/admin/projects')
    } catch (error) {
      showToast('프로젝트 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <ButtonGroup>
          <Button
            variant="outlined"
            startIcon={<Edit size={20} />}
            onClick={() => navigate(`/admin/projects/${id}/edit`)}>
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={20} />}
            onClick={handleDelete}>
            삭제
          </Button>
        </ButtonGroup>
      </Box>
      <ProjectInfo project={dummyProject} />
    </Box>
  )
}

export default Project
