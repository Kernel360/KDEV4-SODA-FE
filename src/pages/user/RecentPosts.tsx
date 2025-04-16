import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const RecentPosts: React.FC = () => {
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
        최근 질문
      </Typography>

      <div className="space-y-4">
        {/* 예시 질문 카드 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>U</Avatar>
                <Box>
                  <Typography variant="h6">디자인 수정 관련 문의</Typography>
                  <Typography variant="body2" color="text.secondary">
                    프로젝트: 웹사이트 리뉴얼 | 2024-03-20
                  </Typography>
                </Box>
              </Box>
              <Chip label="답변 대기" color="warning" />
            </Box>
            <Typography variant="body1">
              현재 진행중인 디자인 수정 작업에서 색상 팔레트 변경이 필요한데, 어떤 색상 조합을 추천해주시나요?
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>U</Avatar>
                <Box>
                  <Typography variant="h6">기능 구현 관련 질문</Typography>
                  <Typography variant="body2" color="text.secondary">
                    프로젝트: 모바일 앱 개발 | 2024-03-19
                  </Typography>
                </Box>
              </Box>
              <Chip label="답변 완료" color="success" />
            </Box>
            <Typography variant="body1">
              사용자 인증 기능 구현 시 보안 관련 추가 조치가 필요한지 확인 부탁드립니다.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RecentPosts
