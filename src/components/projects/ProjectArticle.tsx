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
  Chip,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Pagination
} from '@mui/material'
import {
  Article,
  PriorityType,
  ArticleLink,
  ArticleLinkDTO
} from '../../types/article'
import { Stage } from '../../types/project'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { Search, Link2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

interface ProjectArticleProps {
  projectId: number
  stages: Stage[]
}

enum SearchType {
  TITLE_CONTENT = 'TITLE_CONTENT',
  AUTHOR = 'AUTHOR'
}

const ITEMS_PER_PAGE = 5

interface PaginatedResponse<T> {
  data: {
    content: T[]
    page: {
      totalPages: number
      totalElements: number
      size: number
      number: number
    }
  }
}

const ArticleRow: React.FC<{
  article: Article
  projectId: number
  level?: number
  index: number
  totalCount: number
  articles: Article[]
  getPriorityColor: (priority: string) => {
    color: string
    backgroundColor: string
  }
  getPriorityText: (priority: string) => string
  getStatusColor: (status: 'PENDING' | 'COMMENTED') => {
    color: string
    backgroundColor: string
  }
  getStatusText: (status: 'PENDING' | 'COMMENTED') => string
}> = ({
  article,
  projectId,
  level = 0,
  index,
  totalCount,
  articles,
  getPriorityColor,
  getPriorityText,
  getStatusColor,
  getStatusText
}) => {
  const hasChildren = article.children && article.children.length > 0
  const isLastItem = index === totalCount - 1
  const navigate = useNavigate()

  const handleArticleClick = () => {
    navigate(`/projects/${projectId}/articles/${article.id}`)
  }

  return (
    <>
      <TableRow
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          backgroundColor: level > 0 ? '#f8fafc' : 'inherit',
          cursor: 'pointer'
        }}
        onClick={handleArticleClick}>
        <TableCell
          component="th"
          scope="row"
          sx={{
            pl: 2 + level * 3,
            py: 1,
            minWidth: '300px'
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasChildren && (
              <Box
                sx={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <Typography
                  variant="body2"
                  color="text.secondary">
                  +
                </Typography>
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
              {article.title}
            </Typography>
          </Box>
        </TableCell>
        <TableCell
          align="center"
          sx={{ py: 1 }}>
          <Chip
            label={getPriorityText(article.priority)}
            size="small"
            sx={getPriorityColor(article.priority)}
          />
        </TableCell>
        <TableCell
          align="center"
          sx={{ py: 1 }}>
          <Chip
            label={getStatusText(article.status)}
            size="small"
            sx={getStatusColor(article.status)}
          />
        </TableCell>
        <TableCell
          align="center"
          sx={{ py: 1 }}>
          {article.userName}
        </TableCell>
        <TableCell
          align="center"
          sx={{ py: 1 }}>
          {article.stageName}
        </TableCell>
        <TableCell
          align="center"
          sx={{ py: 1 }}>
          {article.deadLine
            ? new Date(article.deadLine).toLocaleDateString()
            : '-'}
        </TableCell>
        <TableCell
          align="center"
          sx={{ py: 1 }}>
          {new Date(article.createdAt).toLocaleDateString()}
        </TableCell>
      </TableRow>
      {hasChildren &&
        article.children.map((child, childIndex) => (
          <ArticleRow
            key={child.id}
            article={child}
            projectId={projectId}
            level={level + 1}
            index={childIndex}
            totalCount={article.children?.length || 0}
            articles={articles}
            getPriorityColor={getPriorityColor}
            getPriorityText={getPriorityText}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        ))}
    </>
  )
}

const ProjectArticle: React.FC<ProjectArticleProps> = ({
  projectId,
  stages: propStages
}) => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchType, setSearchType] = useState<SearchType>(
    SearchType.TITLE_CONTENT
  )
  const [searchKeyword, setSearchKeyword] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalArticles, setTotalArticles] = useState(0)
  const [stageArticles, setStageArticles] = useState<{ [key: number]: number }>(
    {}
  )

  const fetchArticleCounts = async () => {
    try {
      const totalResponse = await projectService.getProjectArticles(
        projectId,
        null,
        searchType,
        '',
        0,
        100
      )
      if (totalResponse.status === 'success') {
        setTotalArticles(totalResponse.data.page.totalElements)

        const stageCounts: { [key: number]: number } = {}
        await Promise.all(
          propStages.map(async stage => {
            const response = await projectService.getProjectArticles(
              projectId,
              stage.id,
              searchType,
              '',
              0,
              100
            )
            if (response.status === 'success') {
              stageCounts[stage.id] = response.data.page.totalElements
            }
          })
        )
        setStageArticles(stageCounts)
      }
    } catch (error) {
      console.error('Error fetching article counts:', error)
    }
  }

  useEffect(() => {
    fetchArticleCounts()
  }, [projectId])

  useEffect(() => {
    fetchArticles()
  }, [projectId, selectedStage, currentPage, searchType, searchTerm])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjectArticles(
        projectId,
        selectedStage,
        searchType,
        searchTerm,
        currentPage,
        ITEMS_PER_PAGE
      )

      if (response.status === 'success') {
        setArticles(response.data.content)
        setTotalPages(
          Math.ceil(response.data.page.totalElements / ITEMS_PER_PAGE)
        )
        setLoading(false)
      } else {
        throw new Error(
          response.message || '게시글 목록을 불러오는데 실패했습니다.'
        )
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      toast.error('게시글 목록을 불러오는데 실패했습니다.')
      setLoading(false)
      setError('게시글 목록을 불러오는데 실패했습니다.')
      setArticles([])
    }
  }

  const handleStageChange = (stageId: number | null) => {
    setSelectedStage(stageId)
    setCurrentPage(0)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const handleSearch = () => {
    setSearchTerm(searchKeyword)
    setCurrentPage(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case PriorityType.HIGH:
        return { color: '#dc2626', backgroundColor: '#fee2e2' }
      case PriorityType.MEDIUM:
        return { color: '#f59e0b', backgroundColor: '#fef3c7' }
      case PriorityType.LOW:
        return { color: '#22c55e', backgroundColor: '#dcfce7' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getPriorityText = (priority: string) => {
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

  const getStatusColor = (status: 'PENDING' | 'COMMENTED') => {
    switch (status) {
      case 'PENDING':
        return { color: '#6b7280', backgroundColor: '#f3f4f6' }
      case 'COMMENTED':
        return { color: '#3b82f6', backgroundColor: '#eff6ff' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getStatusText = (status: 'PENDING' | 'COMMENTED') => {
    switch (status) {
      case 'PENDING':
        return '답변대기'
      case 'COMMENTED':
        return '답변완료'
      default:
        return status
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          mt: 2,
          width: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '3px'
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }
        }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            minWidth: 'min-content',
            px: 1,
            py: 1
          }}>
          <Paper
            onClick={() => setSelectedStage(null)}
            sx={{
              p: 2,
              width: 150,
              cursor: 'pointer',
              bgcolor: 'white',
              color: '#666',
              border: '1px solid',
              borderColor: selectedStage === null ? '#FFB800' : '#E0E0E0',
              boxShadow: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#FFB800'
              }
            }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                mb: 1,
                color: selectedStage === null ? '#FFB800' : '#666'
              }}>
              전체
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666'
              }}>
              {totalArticles}건
            </Typography>
          </Paper>
          {propStages.map(stage => (
            <Paper
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              sx={{
                p: 2,
                width: 150,
                cursor: 'pointer',
                bgcolor: 'white',
                color: '#666',
                border: '1px solid',
                borderColor: selectedStage === stage.id ? '#FFB800' : '#E0E0E0',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#FFB800'
                }
              }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mb: 1,
                  color: selectedStage === stage.id ? '#FFB800' : '#666'
                }}>
                {stage.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666'
                }}>
                {stageArticles[stage.id] || 0}건
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          border: '1px solid #E0E0E0'
        }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">번호</TableCell>
              <TableCell align="center">우선순위</TableCell>
              <TableCell align="center">상태</TableCell>
              <TableCell>제목</TableCell>
              <TableCell align="center">작성자</TableCell>
              <TableCell align="center">작성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  projectId={projectId}
                  index={index}
                  totalCount={articles.length}
                  articles={articles}
                  getPriorityColor={getPriorityColor}
                  getPriorityText={getPriorityText}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {selectedStage !== null
                      ? '해당 단계의 질문이 없습니다.'
                      : '작성된 질문이 없습니다.'}
                  </Typography>
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
          mt: 3,
          mb: 3,
          gap: 0.5
        }}>
        <Pagination
          count={totalPages}
          page={currentPage + 1}
          onChange={handlePageChange}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#666',
              '&.Mui-selected': {
                bgcolor: '#FFB800',
                color: 'white',
                '&:hover': {
                  bgcolor: '#E5A600'
                }
              }
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default ProjectArticle
