import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

const UserDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Typography variant="h4" sx={{ mb: 4 }}>
        대시보드
      </Typography>

      <Grid container spacing={3}>
        {/* 진행중인 프로젝트 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">진행중인 프로젝트</Typography>
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  onClick={() => navigate('/user/projects')}>
                  더보기
                </Button>
              </Box>

              <div className="space-y-4">
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">웹사이트 리뉴얼</Typography>
                      <Chip label="진행중" color="primary" />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        진행률: 60%
                      </Typography>
                      <LinearProgress variant="determinate" value={60} />
                    </Box>
                    <Typography variant="body2">
                      기존 웹사이트의 디자인을 현대적으로 개선하고, 반응형 디자인을 적용하는 프로젝트입니다.
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 요청사항 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">최근 요청사항</Typography>
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  onClick={() => navigate('/user/requests')}>
                  더보기
                </Button>
              </Box>

              <div className="space-y-4">
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">웹사이트 리뉴얼 요청</Typography>
                      <Chip label="진행중" color="primary" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      프로젝트: 웹사이트 리뉴얼
                    </Typography>
                    <Typography variant="body2">
                      기존 웹사이트의 디자인을 현대적으로 개선하고자 합니다.
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 질문 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">최근 질문</Typography>
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  onClick={() => navigate('/user/recent-posts')}>
                  더보기
                </Button>
              </Box>

              <div className="space-y-4">
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">디자인 수정 관련 문의</Typography>
                      <Chip label="답변 대기" color="warning" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      프로젝트: 웹사이트 리뉴얼 | 2024-03-20
                    </Typography>
                    <Typography variant="body2">
                      현재 진행중인 디자인 수정 작업에서 색상 팔레트 변경이 필요한데, 어떤 색상 조합을 추천해주시나요?
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default UserDashboard 