import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const Projects: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={() => navigate('/user')}>
          뒤로가기
        </Button>
      </Box>

      <Typography variant="h4" sx={{ mb: 4 }}>
        진행중인 프로젝트
      </Typography>

      <div className="grid gap-4">
        {/* 예시 프로젝트 카드 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">웹사이트 리뉴얼</Typography>
              <Chip label="진행중" color="primary" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              시작일: 2024-03-01 | 예상 종료일: 2024-04-30
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                진행률: 60%
              </Typography>
              <LinearProgress variant="determinate" value={60} />
            </Box>
            <Typography variant="body1">
              기존 웹사이트의 디자인을 현대적으로 개선하고, 반응형 디자인을 적용하는 프로젝트입니다.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">모바일 앱 개발</Typography>
              <Chip label="진행중" color="primary" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              시작일: 2024-02-15 | 예상 종료일: 2024-05-15
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                진행률: 40%
              </Typography>
              <LinearProgress variant="determinate" value={40} />
            </Box>
            <Typography variant="body1">
              사용자 친화적인 모바일 앱을 개발하여 기존 서비스를 모바일 환경에서도 이용할 수 있도록 하는 프로젝트입니다.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Projects
