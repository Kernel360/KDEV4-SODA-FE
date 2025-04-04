import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack
} from '@mui/material'
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Paperclip
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Post {
  id: number
  title: string
  content: string
  author: string
  stage: string
  priority?: '높음' | '중간' | '낮음'
  status: '답변완료' | '답변대기'
  createdAt: string
  dueDate?: string
  hasAttachments?: boolean
  hasLinks?: boolean
  commentCount: number
  parentId?: number
}

interface ProjectBoardProps {
  projectId: number
}

const dummyPosts: Post[] = [
  {
    id: 15,
    title: '최종 배포 계획 검토',
    content: '배포 일정과 절차를 검토합니다.',
    author: '이지원',
    stage: '개발',
    priority: '높음',
    status: '답변대기',
    createdAt: '2024-03-15T10:00:00',
    dueDate: '2024-03-20',
    hasAttachments: true,
    hasLinks: true,
    commentCount: 4
  },
  {
    id: 14,
    title: '보안 취약점 분석 보고 답변',
    content: '보안 검토 결과입니다.',
    author: '김보안',
    stage: '검수',
    priority: '높음',
    status: '답변완료',
    createdAt: '2024-03-14T15:30:00',
    dueDate: '2024-03-19',
    hasAttachments: true,
    commentCount: 2,
    parentId: 10
  },
  {
    id: 13,
    title: '사용자 피드백 반영',
    content: '베타 테스트 피드백을 반영합니다.',
    author: '박민지',
    stage: '개발',
    status: '답변대기',
    createdAt: '2024-03-13T11:20:00',
    dueDate: '2024-03-18',
    commentCount: 0
  },
  {
    id: 12,
    title: '성능 최적화 작업',
    content: '페이지 로딩 속도 개선',
    author: '김성능',
    stage: '개발',
    priority: '중간',
    status: '답변대기',
    createdAt: '2024-03-12T14:00:00',
    hasLinks: true,
    commentCount: 1
  },
  {
    id: 11,
    title: '디자인 시스템 업데이트',
    content: '컴포넌트 디자인 가이드라인',
    author: '이디자인',
    stage: '디자인',
    status: '답변완료',
    createdAt: '2024-03-11T09:15:00',
    hasAttachments: true,
    hasLinks: true,
    commentCount: 3
  },
  {
    id: 10,
    title: '데이터베이스 스키마 변경',
    content: '사용자 테이블 구조 수정',
    author: '박데이터',
    stage: '개발',
    priority: '높음',
    status: '답변대기',
    createdAt: '2024-03-10T16:45:00',
    dueDate: '2024-03-15',
    hasAttachments: true,
    commentCount: 6
  },
  {
    id: 9,
    title: '로그인 페이지 디자인',
    content: '소셜 로그인 UI 디자인',
    author: '김철수',
    stage: '디자인',
    status: '답변완료',
    createdAt: '2024-03-09T13:30:00',
    hasLinks: true,
    commentCount: 2
  },
  {
    id: 8,
    title: 'API 문서 작성 검토의견',
    content: 'REST API 엔드포인트 문서화',
    author: '이문서',
    stage: '개발',
    status: '답변대기',
    createdAt: '2024-03-08T11:00:00',
    hasLinks: true,
    commentCount: 0,
    parentId: 12
  },
  {
    id: 7,
    title: '테스트 케이스 작성',
    content: '단위 테스트 시나리오',
    author: '박테스트',
    stage: '개발',
    priority: '중간',
    status: '답변완료',
    createdAt: '2024-03-07T14:20:00',
    hasAttachments: true,
    commentCount: 4
  },
  {
    id: 6,
    title: '메인 페이지 레이아웃',
    content: '반응형 레이아웃 구현',
    author: '김퍼블',
    stage: '퍼블리싱',
    status: '답변완료',
    createdAt: '2024-03-06T10:10:00',
    hasAttachments: true,
    hasLinks: true,
    commentCount: 5
  },
  {
    id: 5,
    title: '결제 시스템 연동',
    content: 'PG사 연동 작업',
    author: '이결제',
    stage: '개발',
    priority: '높음',
    status: '답변대기',
    createdAt: '2024-03-05T15:40:00',
    dueDate: '2024-03-20',
    hasLinks: true,
    commentCount: 3
  },
  {
    id: 4,
    title: '이메일 템플릿 디자인',
    content: '알림 메일 디자인',
    author: '박디자인',
    stage: '디자인',
    status: '답변완료',
    createdAt: '2024-03-04T09:30:00',
    hasAttachments: true,
    commentCount: 2
  },
  {
    id: 3,
    title: '회원가입 플로우 검토',
    content: '가입 프로세스 개선',
    author: '김매니저',
    stage: '기획',
    priority: '중간',
    status: '답변완료',
    createdAt: '2024-03-03T13:50:00',
    hasLinks: true,
    commentCount: 7
  },
  {
    id: 2,
    title: '푸시 알림 기능 구현',
    content: 'FCM 연동 작업',
    author: '이개발',
    stage: '개발',
    priority: '낮음',
    status: '답변대기',
    createdAt: '2024-03-02T11:25:00',
    commentCount: 1
  },
  {
    id: 1,
    title: '요구사항 정의서 작성',
    content: '초기 요구사항 정의',
    author: '박기획',
    stage: '기획',
    status: '답변완료',
    createdAt: '2024-03-01T10:00:00',
    hasAttachments: true,
    commentCount: 8
  }
]

const defaultStages = ['전체', '기획', '디자인', '퍼블리싱', '개발', '검수']

const ProjectBoard: React.FC<ProjectBoardProps> = ({ projectId }) => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [selectedStage, setSelectedStage] = useState('전체')
  const [searchTerm, setSearchTerm] = useState('')

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
  }

  const sortPosts = (posts: Post[]) => {
    // 부모 글과 답글을 분리
    const parentPosts = posts.filter(post => !post.parentId)
    const replyPosts = posts.filter(post => post.parentId)

    // 결과 배열 생성
    const sortedPosts: Post[] = []

    // 부모 글을 먼저 날짜순으로 정렬
    parentPosts
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .forEach(parent => {
        sortedPosts.push(parent)
        // 해당 부모 글의 답글들을 찾아서 날짜순으로 정렬하여 추가
        const replies = replyPosts
          .filter(reply => reply.parentId === parent.id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        sortedPosts.push(...replies)
      })

    return sortedPosts
  }

  const filteredPosts = sortPosts(
    dummyPosts.filter(
      post =>
        (selectedStage === '전체' || post.stage === selectedStage) &&
        (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  const paginatedPosts = filteredPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const totalPages = Math.ceil(filteredPosts.length / rowsPerPage)

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case '높음':
        return { color: '#ef4444', backgroundColor: '#fef2f2' }
      case '중간':
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      case '낮음':
        return { color: '#3b82f6', backgroundColor: '#eff6ff' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '답변완료':
        return { color: '#22c55e', backgroundColor: '#f0fdf4' }
      case '답변대기':
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Typography variant="h5">게시판</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="게시글 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={20} />,
              sx: {
                '& input::placeholder': {
                  fontSize: '0.875rem'
                }
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() =>
              navigate(`/user/projects/${projectId}/articles/create`)
            }>
            글쓰기
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        {defaultStages.map(stage => (
          <Chip
            key={stage}
            label={stage}
            onClick={() => {
              setSelectedStage(stage)
              setPage(0)
            }}
            color={selectedStage === stage ? 'primary' : 'default'}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                width={80}>
                번호
              </TableCell>
              <TableCell
                align="center"
                width={100}>
                우선순위
              </TableCell>
              <TableCell
                align="center"
                width={100}>
                상태
              </TableCell>
              <TableCell>제목</TableCell>
              <TableCell
                align="center"
                width={120}>
                작성자
              </TableCell>
              <TableCell
                align="center"
                width={120}>
                작성일
              </TableCell>
              <TableCell
                align="center"
                width={120}>
                마감일
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.map(post => (
              <TableRow
                key={post.id}
                hover
                sx={{
                  cursor: 'pointer',
                  ...(post.parentId && {
                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)'
                    }
                  })
                }}
                onClick={() =>
                  navigate(`/user/projects/${projectId}/articles/${post.id}`)
                }>
                <TableCell align="center">
                  {!post.parentId && post.id}
                </TableCell>
                <TableCell align="center">
                  {post.priority && (
                    <Chip
                      label={post.priority}
                      size="small"
                      sx={{
                        color: getPriorityColor(post.priority).color,
                        backgroundColor: getPriorityColor(post.priority)
                          .backgroundColor,
                        borderRadius: '16px',
                        border: 'none'
                      }}
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={post.status}
                    size="small"
                    sx={{
                      color: getStatusColor(post.status).color,
                      backgroundColor: getStatusColor(post.status)
                        .backgroundColor,
                      borderRadius: '16px',
                      border: 'none'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {post.parentId && (
                      <Chip
                        label="답글"
                        size="small"
                        sx={{
                          height: '20px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          fontSize: '0.75rem',
                          mr: 1
                        }}
                      />
                    )}
                    {post.title}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ ml: 1 }}>
                      {(post.hasAttachments || post.hasLinks) && (
                        <Paperclip
                          size={16}
                          color="#6b7280"
                        />
                      )}
                      {post.commentCount > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary">
                          [{post.commentCount}]
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </TableCell>
                <TableCell align="center">{post.author}</TableCell>
                <TableCell align="center">
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {post.dueDate && new Date(post.dueDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {paginatedPosts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 3 }}>
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          mt: 2
        }}>
        <IconButton
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 0}
          size="small">
          <ChevronLeft size={20} />
        </IconButton>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={page === i ? 'contained' : 'text'}
            onClick={() => handleChangePage(i)}
            size="small"
            sx={{
              minWidth: 32,
              height: 32,
              p: 0,
              backgroundColor: page === i ? 'black' : 'transparent',
              color: page === i ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: page === i ? 'black' : 'action.hover'
              }
            }}>
            {i + 1}
          </Button>
        ))}
        <IconButton
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= totalPages - 1}
          size="small">
          <ChevronRight size={20} />
        </IconButton>
      </Box>
    </Box>
  )
}

export default ProjectBoard
