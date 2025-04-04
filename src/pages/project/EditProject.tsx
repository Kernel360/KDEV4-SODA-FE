import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, ButtonGroup } from '@mui/material'
import { Save, X } from 'lucide-react'
import ProjectInfo from '../../components/project/ProjectInfo'
import { useToast } from '../../contexts/ToastContext'

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

const EditProject: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [project, setProject] = useState(dummyProject)

  const handleFieldChange = (field: string, value: string) => {
    setProject(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      // TODO: API 호출로 프로젝트 수정
      showToast('프로젝트가 성공적으로 수정되었습니다.', 'success')
      navigate(`/admin/projects/${id}`)
    } catch (error) {
      showToast('프로젝트 수정 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <ButtonGroup>
          <Button
            variant="outlined"
            startIcon={<X size={20} />}
            onClick={() => navigate(`/admin/projects/${id}`)}>
            취소
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={20} />}
            onClick={handleSave}>
            저장
          </Button>
        </ButtonGroup>
      </Box>
      <ProjectInfo
        project={project}
        isEditMode
        onFieldChange={handleFieldChange}
      />
    </Box>
  )
}

export default EditProject
