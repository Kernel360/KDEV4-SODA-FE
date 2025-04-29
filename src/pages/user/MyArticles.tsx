import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { client } from '../../services/client'
import dayjs from 'dayjs'

interface Article {
  projectId: number
  articleId: number
  title: string
  projectName: string
  stageId: number
  stageName: string
  createdAt: string
}

interface PageResponse {
  content: Article[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

// 프로젝트별로 다른 색상을 할당하기 위한 색상 배열
const projectColors = [
  { bg: '#fee2e2', color: '#dc2626' }, // red
  { bg: '#fef3c7', color: '#d97706' }, // amber
  { bg: '#ecfccb', color: '#65a30d' }, // lime
  { bg: '#dcfce7', color: '#16a34a' }, // green
  { bg: '#cffafe', color: '#0891b2' }, // cyan
  { bg: '#dbeafe', color: '#2563eb' }, // blue
  { bg: '#f3e8ff', color: '#9333ea' }, // purple
  { bg: '#fae8ff', color: '#c026d3' }, // fuchsia
  { bg: '#ffe4e6', color: '#e11d48' }, // rose
  { bg: '#f1f5f9', color: '#475569' } // slate
]

const MyArticles: React.FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [projectColorMap, setProjectColorMap] = useState<
    Map<string, { bg: string; color: string }>
  >(new Map())

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await client.get<{ data: PageResponse }>(
          '/articles/my',
          {
            params: {
              page: page - 1,
              size: 10
            }
          }
        )
        const articles = response.data.data.content

        // 프로젝트별 색상 매핑
        const uniqueProjects = Array.from(
          new Set(articles.map(a => a.projectId))
        )
        const newProjectColorMap = new Map()
        uniqueProjects.forEach((projectId, index) => {
          newProjectColorMap.set(
            projectId.toString(),
            projectColors[index % projectColors.length]
          )
        })
        setProjectColorMap(newProjectColorMap)

        setArticles(articles)
        setTotalPages(response.data.data.totalPages)
      } catch (err) {
        console.error('게시글 목록 조회 실패:', err)
        setError('게시글 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [page])

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value)
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY.MM.DD')
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (articles.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3 }}>
          내가 작성한 질문 목록
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          작성한 질문이 없습니다.
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer
        component={Paper}
        elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                제목
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>
                프로젝트
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>
                단계
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                작성일
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map(article => (
              <TableRow
                key={article.articleId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline'
                      }
                    }}
                    onClick={() =>
                      navigate(
                        `/user/projects/${article.projectId}/articles/${article.articleId}`
                      )
                    }>
                    {article.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={article.projectName}
                    size="small"
                    onClick={() =>
                      navigate(`/user/projects/${article.projectId}`)
                    }
                    sx={{
                      backgroundColor:
                        projectColorMap.get(article.projectId.toString())?.bg ||
                        '#f3f4f6',
                      color:
                        projectColorMap.get(article.projectId.toString())
                          ?.color || '#4b5563',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor:
                          projectColorMap.get(article.projectId.toString())
                            ?.bg || '#f3f4f6'
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={article.stageName}
                    size="small"
                    sx={{
                      backgroundColor: '#e2e8f0',
                      color: '#475569'
                    }}
                  />
                </TableCell>
                <TableCell>{formatDate(article.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      </TableContainer>
    </Box>
  )
}

export default MyArticles
