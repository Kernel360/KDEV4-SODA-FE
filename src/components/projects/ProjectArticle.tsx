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
  IconButton
} from '@mui/material'
import { Article, ArticleStatus, PriorityType } from '../../types/article'
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

const ArticleRow: React.FC<{
  article: Article
  projectId: number
  level?: number
  index?: number
  totalCount?: number
  articles: Article[]
  getPriorityColor: (priority: PriorityType) => {
    color: string
    backgroundColor: string
  }
  getPriorityText: (priority: PriorityType) => string
  getStatusColor: (status: ArticleStatus) => {
    color: string
    backgroundColor: string
  }
  getStatusText: (status: ArticleStatus) => string
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
  const navigate = useNavigate()
  const createdAt = new Date(article.createdAt)

  if (article.deleted && !article.parentArticleId) {
    return (
      <>
        <TableRow
          sx={{
            backgroundColor: level > 0 ? '#f8f9fa' : 'inherit',
            '& > td:first-of-type': {
              paddingLeft: level * 3 + 2 + 'rem'
            }
          }}>
          <TableCell
            colSpan={6}
            align="center">
            <Typography color="text.secondary">삭제된 게시물입니다</Typography>
          </TableCell>
        </TableRow>
        {article.children &&
          article.children.length > 0 &&
          article.children
            .filter((child: any) => !child.deleted)
            .map((child: any) => (
              <ArticleRow
                key={child.id}
                article={child}
                projectId={projectId}
                level={level + 1}
                index={index}
                totalCount={totalCount}
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

  return (
    <>
      <TableRow
        hover
        onClick={() =>
          navigate(`/user/projects/${projectId}/articles/${article.id}`)
        }
        sx={{
          cursor: 'pointer',
          backgroundColor: level > 0 ? '#f8f9fa' : 'inherit',
          '& > td:first-of-type': {
            paddingLeft: level * 3 + 2 + 'rem'
          }
        }}>
        <TableCell align="center">
          {level === 0 ? totalCount! - index! : ''}
        </TableCell>
        <TableCell align="center">
          <Chip
            label={getPriorityText(article.priority)}
            size="small"
            sx={getPriorityColor(article.priority)}
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={getStatusText(article.status)}
            size="small"
            sx={getStatusColor(article.status)}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {level > 0 && (
              <Box
                component="span"
                sx={{ color: 'text.secondary' }}>
                └
              </Box>
            )}
            {article.title}
            {article.linkList && article.linkList.length > 0 && (
              <Link2
                size={16}
                style={{ color: '#6b7280' }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell align="center">{article.userName}</TableCell>
        <TableCell align="center">
          {createdAt.toLocaleDateString('ko-KR')}
        </TableCell>
      </TableRow>
      {article.children &&
        article.children.length > 0 &&
        article.children
          .filter((child: any) => !child.deleted)
          .map((child: any) => (
            <ArticleRow
              key={child.id}
              article={child}
              projectId={projectId}
              level={level + 1}
              index={index}
              totalCount={totalCount}
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

  useEffect(() => {
    fetchArticles()
  }, [projectId, selectedStage, currentPage, searchType, searchTerm])

  const fetchArticles = async (page: number = 0) => {
    try {
      setLoading(true)
      const response = await projectService.getProjectArticles(
        projectId,
        selectedStage,
        searchType,
        searchTerm,
        page,
        ITEMS_PER_PAGE
      )
      setArticles(Array.isArray(response.data) ? response.data : [])
      setTotalPages(
        Math.ceil(
          (Array.isArray(response.data) ? response.data.length : 0) /
            ITEMS_PER_PAGE
        )
      )
      setLoading(false)
    } catch (error) {
      console.error('Error fetching articles:', error)
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

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          mb: 3
        }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            px: 1,
            py: 1,
            flexWrap: 'wrap'
          }}>
          <Paper
            onClick={() => handleStageChange(null)}
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
          </Paper>
          {propStages.map(stage => (
            <Paper
              key={stage.id}
              onClick={() => handleStageChange(stage.id)}
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
            </Paper>
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between'
          }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <FormControl
              size="small"
              sx={{
                width: '150px',
                flexShrink: 0
              }}>
              <Select
                value={searchType}
                onChange={e => setSearchType(e.target.value as SearchType)}>
                <MenuItem value={SearchType.TITLE_CONTENT}>제목+내용</MenuItem>
                <MenuItem value={SearchType.AUTHOR}>작성자</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() =>
              navigate(`/user/projects/${projectId}/articles/create`)
            }
            sx={{
              whiteSpace: 'nowrap',
              bgcolor: '#FFB800',
              '&:hover': {
                bgcolor: '#E5A600'
              }
            }}>
            글쓰기
          </Button>
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
                      ? '해당 단계의 게시글이 존재하지 않습니다.'
                      : '게시글이 존재하지 않습니다.'}
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
          gap: 0.5,
          '& .MuiButton-root': {
            minWidth: '32px',
            height: '32px',
            padding: 0,
            fontSize: '0.875rem'
          }
        }}>
        <Button
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 0}
          sx={{
            color: '#666',
            '&:hover': {
              bgcolor: '#f5f5f5'
            },
            '&.Mui-disabled': {}
          }}>
          {'<'}
        </Button>
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            onClick={() => setCurrentPage(index)}
            sx={{
              color: currentPage === index ? '#fff' : '#666',
              border: '1px solid',
              borderColor: currentPage === index ? '#FFB800' : '#E0E0E0',
              bgcolor: currentPage === index ? '#FFB800' : 'white',
              '&:hover': {
                bgcolor: currentPage === index ? '#E5A600' : '#f5f5f5',
                borderColor: currentPage === index ? '#E5A600' : '#E0E0E0'
              }
            }}>
            {index + 1}
          </Button>
        ))}
        <Button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= totalPages - 1}
          sx={{
            color: '#666',
            '&:hover': {
              bgcolor: '#f5f5f5',
              border: '1px solid #E0E0E0'
            },
            '&.Mui-disabled': {}
          }}>
          {'>'}
        </Button>
      </Box>
    </Box>
  )
}

export default ProjectArticle
