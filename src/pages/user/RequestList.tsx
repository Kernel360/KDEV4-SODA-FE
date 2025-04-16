import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const RequestList: React.FC = () => {
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
        요청사항 목록
      </Typography>

      <div className="space-y-4">
        {/* 예시 요청 카드 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h6">웹사이트 리뉴얼 요청</Typography>
                  <Typography variant="body2" color="text.secondary">
                    프로젝트: 웹사이트 리뉴얼 | 2024-03-20
                  </Typography>
                </Box>
              </Box>
              <Chip label="진행중" color="primary" />
            </Box>
            <Typography variant="body1">
              기존 웹사이트의 디자인을 현대적으로 개선하고자 합니다. 주요 변경사항은 다음과 같습니다:
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h6">앱 기능 추가 요청</Typography>
                  <Typography variant="body2" color="text.secondary">
                    프로젝트: 모바일 앱 개발 | 2024-03-19
                  </Typography>
                </Box>
              </Box>
              <Chip label="검토중" color="warning" />
            </Box>
            <Typography variant="body1">
              사용자 피드백을 바탕으로 새로운 기능을 추가하고 싶습니다. 자세한 내용은 첨부된 문서를 참고해주세요.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequestList
