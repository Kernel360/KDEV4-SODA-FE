import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material'
import { Article, ArticleStatus, PriorityType } from '@/types/article'
import { Stage } from '@/types/stage'
import { projectService } from '@/services/projectService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { ChevronLeft, ChevronRight, Search, Plus, Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProjectArticleProps {
  projectId: number
}

const ITEMS_PER_PAGE = 10

const ProjectArticle: React.FC<ProjectArticleProps> = ({ projectId }) => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const data = await projectService.getProjectStages(projectId)
        setStages(data)
      } catch (err) {
        console.error('Error fetching stages:', err)
      }
    }

    fetchStages()
  }, [projectId])

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const data = await projectService.getProjectArticles(
          projectId,
          selectedStage
        )
        setArticles(data)
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [projectId, selectedStage])

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case PriorityType.HIGH:
        return { color: '#ef4444', backgroundColor: '#fef2f2' }
      case PriorityType.MEDIUM:
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      case PriorityType.LOW:
        return { color: '#3b82f6', backgroundColor: '#eff6ff' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getPriorityText = (priority: PriorityType) => {
    switch (priority) {
      case PriorityType.HIGH:
        return '높음'
      case PriorityType.MEDIUM:
        return '보통'
      case PriorityType.LOW:
        return '낮음'
      default:
        return priority
    }
  }

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.COMPLETED:
        return { color: '#22c55e', backgroundColor: '#f0fdf4' }
      case ArticleStatus.IN_PROGRESS:
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      case ArticleStatus.PENDING:
        return { color: '#6b7280', backgroundColor: '#f3f4f6' }
      case ArticleStatus.REJECTED:
        return { color: '#ef4444', backgroundColor: '#fef2f2' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getStatusText = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.PENDING:
        return '답변대기'
      case ArticleStatus.COMMENTED:
        return '답변완료'
      case ArticleStatus.IN_PROGRESS:
        return '진행중'
      case ArticleStatus.COMPLETED:
        return '완료'
      case ArticleStatus.REJECTED:
        return '거절'
      default:
        return status
    }
  }

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedArticles = articles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Typography variant="h6">게시판</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              )
            }}
            sx={{ width: '300px' }}
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

      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Button
          variant={selectedStage === null ? 'contained' : 'outlined'}
          onClick={() => setSelectedStage(null)}
          sx={{
            bgcolor: selectedStage === null ? 'primary.main' : 'transparent',
            color: selectedStage === null ? 'white' : 'primary.main',
            '&:hover': {
              bgcolor: selectedStage === null ? 'primary.dark' : 'transparent'
            }
          }}>
          전체
        </Button>
        {stages.map(stage => (
          <Button
            key={stage.id}
            variant={selectedStage === stage.id ? 'contained' : 'outlined'}
            onClick={() => setSelectedStage(stage.id)}
            sx={{
              bgcolor:
                selectedStage === stage.id ? 'primary.main' : 'transparent',
              color: selectedStage === stage.id ? 'white' : 'primary.main',
              '&:hover': {
                bgcolor:
                  selectedStage === stage.id ? 'primary.dark' : 'transparent'
              }
            }}>
            {stage.name}
          </Button>
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
            {paginatedArticles.length > 0 ? (
              paginatedArticles.map(article => (
                <TableRow
                  key={article.id}
                  hover
                  onClick={() =>
                    navigate(
                      `/user/projects/${projectId}/articles/${article.id}`
                    )
                  }
                  sx={{ cursor: 'pointer' }}>
                  <TableCell align="center">{article.id}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getPriorityText(article.priority)}
                      size="small"
                      sx={{
                        ...getPriorityColor(article.priority),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusText(article.status)}
                      size="small"
                      sx={{
                        ...getStatusColor(article.status),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {article.title}
                      {article.links && article.links.length > 0 && (
                        <Link2
                          size={16}
                          color="#6B7280"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{article.userName}</TableCell>
                  <TableCell align="center">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    {article.deadLine
                      ? new Date(article.deadLine).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 3 }}>
                  게시글이 존재하지 않습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mt: 2
          }}>
          <IconButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            size="small">
            <ChevronLeft size={20} />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'contained' : 'text'}
              onClick={() => handlePageChange(page)}
              size="small"
              sx={{
                minWidth: 32,
                height: 32,
                p: 0,
                backgroundColor:
                  currentPage === page ? 'primary.main' : 'transparent',
                color: currentPage === page ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor:
                    currentPage === page ? 'primary.dark' : 'action.hover'
                }
              }}>
              {page}
            </Button>
          ))}
          <IconButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            size="small">
            <ChevronRight size={20} />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default ProjectArticle
