import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import AddIcon from '@mui/icons-material/Add'

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/user/projects/requests/create')}>
          새 요청
        </Button>
      </Box>

      <Typography variant="h4" sx={{ mb: 4 }}>
        요청사항 목록
      </Typography>

      <div className="grid gap-4">
        {/* 예시 요청사항 카드 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">웹사이트 리뉴얼 요청</Typography>
              <Chip label="진행중" color="primary" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              프로젝트: 웹사이트 리뉴얼
            </Typography>
            <Typography variant="body1">
              기존 웹사이트의 디자인을 현대적으로 개선하고자 합니다. 메인 페이지와 서브 페이지의 레이아웃을 변경하고, 반응형 디자인을 적용하고 싶습니다.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">로고 디자인 수정</Typography>
              <Chip label="완료" color="success" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              프로젝트: 브랜드 아이덴티티
            </Typography>
            <Typography variant="body1">
              기존 로고의 색상을 조금 더 밝게 수정하고, 심볼의 크기를 약간 키우고 싶습니다.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequestList
