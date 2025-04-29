import React, { useState, useEffect, useMemo } from 'react'
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
  Pagination,
  InputLabel,
  SelectChangeEvent,
  Popover
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
  articleNumber: number
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
  articleNumber,
  getPriorityColor,
  getPriorityText,
  getStatusColor,
  getStatusText
}) => {
  const navigate = useNavigate()
  const isReply = !!article.parentId

  return (
    <>
      <TableRow
        sx={{
          cursor: 'pointer',
          bgcolor: isReply ? '#FAFAFA' : 'white',
          '&:hover': {
            bgcolor: '#F8F9FA'
          },
          '& td': {
            py: 2,
            color: '#333'
          }
        }}
        onClick={() =>
          navigate(`/user/projects/${projectId}/articles/${article.id}`)
        }>
        <TableCell
          align="center"
          sx={{ width: '80px' }}>
          {!isReply && articleNumber}
        </TableCell>
        <TableCell
          align="center"
          sx={{ width: '120px' }}>
          <Chip
            label={getPriorityText(article.priority)}
            size="small"
            sx={{
              ...getPriorityColor(article.priority),
              height: '24px',
              borderRadius: '4px'
            }}
          />
        </TableCell>
        <TableCell
          align="center"
          sx={{ width: '100px' }}>
          <Chip
            label={getStatusText(article.status)}
            size="small"
            sx={{
              ...getStatusColor(article.status),
              height: '24px',
              borderRadius: '4px'
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isReply && (
              <Box
                sx={{
                  width: 24,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 1
                }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #E0E0E0',
                    borderRadius: '2px',
                    color: '#666',
                    fontSize: '12px'
                  }}>
                  └
                </Box>
              </Box>
            )}
            <Typography>
              {isReply ? `RE: ${article.title}` : article.title}
            </Typography>
          </Box>
        </TableCell>
        <TableCell
          align="center"
          sx={{ width: '120px' }}>
          {article.userName}
        </TableCell>
        <TableCell
          align="center"
          sx={{ width: '120px' }}>
          {new Date(article.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </TableCell>
      </TableRow>
      {article.children?.map(child => (
        <ArticleRow
          key={child.id}
          article={child}
          projectId={projectId}
          articleNumber={0}
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
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityType, setPriorityType] = useState<string>('')
  const [anchorElPriority, setAnchorElPriority] = useState<null | HTMLElement>(
    null
  )
  const [anchorElStatus, setAnchorElStatus] = useState<null | HTMLElement>(null)

  const memoStages = useMemo(() => propStages, [propStages])

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
          memoStages.map(async stage => {
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
  }, [
    projectId,
    selectedStage,
    currentPage,
    searchType,
    searchTerm,
    statusFilter,
    priorityType
  ])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjectArticles(
        projectId,
        selectedStage,
        searchType,
        searchTerm,
        currentPage,
        ITEMS_PER_PAGE,
        statusFilter,
        priorityType
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
        return '중간'
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

  const renderArticles = (articles: Article[]) => {
    // 최상위 글만 필터링 (다른 글의 답글이 아닌 글만 선택)
    const mainArticles = articles.filter(
      article =>
        !articles.some(a => a.children?.some(child => child.id === article.id))
    )

    let articleNumber = mainArticles.length

    return mainArticles.map(article => (
      <React.Fragment key={article.id}>
        {/* 부모글 */}
        <TableRow
          sx={{
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#F8F9FA'
            },
            '& td': {
              py: 2,
              color: '#333'
            }
          }}
          onClick={() =>
            navigate(`/user/projects/${projectId}/articles/${article.id}`)
          }>
          <TableCell
            align="center"
            sx={{ width: '80px' }}>
            {articleNumber--}
          </TableCell>
          <TableCell
            align="center"
            sx={{ width: '120px' }}>
            <Chip
              label={getPriorityText(article.priority)}
              size="small"
              sx={{
                ...getPriorityColor(article.priority),
                height: '24px',
                borderRadius: '4px'
              }}
            />
          </TableCell>
          <TableCell
            align="center"
            sx={{ width: '100px' }}>
            <Chip
              label={getStatusText(article.status)}
              size="small"
              sx={{
                ...getStatusColor(article.status),
                height: '24px',
                borderRadius: '4px'
              }}
            />
          </TableCell>
          <TableCell>
            <Typography>{article.title}</Typography>
          </TableCell>
          <TableCell
            align="center"
            sx={{ width: '120px' }}>
            {article.userName}
          </TableCell>
          <TableCell
            align="center"
            sx={{ width: '120px' }}>
            {new Date(article.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </TableCell>
        </TableRow>

        {/* 답글 표시 */}
        {article.children?.map(reply => (
          <TableRow
            key={reply.id}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#F8F9FA'
              },
              '& td': {
                py: 2,
                color: '#333'
              }
            }}
            onClick={() =>
              navigate(`/user/projects/${projectId}/articles/${reply.id}`)
            }>
            <TableCell
              align="center"
              sx={{ width: '80px' }}
            />
            <TableCell
              align="center"
              sx={{ width: '120px' }}>
              <Chip
                label={getPriorityText(reply.priority)}
                size="small"
                sx={{
                  ...getPriorityColor(reply.priority),
                  height: '24px',
                  borderRadius: '4px'
                }}
              />
            </TableCell>
            <TableCell
              align="center"
              sx={{ width: '100px' }}>
              <Chip
                label={getStatusText(reply.status)}
                size="small"
                sx={{
                  ...getStatusColor(reply.status),
                  height: '24px',
                  borderRadius: '4px'
                }}
              />
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  sx={{
                    color: '#666',
                    mr: 1,
                    fontSize: '14px'
                  }}>
                  ㄴ
                </Typography>
                <Typography>{reply.title}</Typography>
              </Box>
            </TableCell>
            <TableCell
              align="center"
              sx={{ width: '120px' }}>
              {reply.userName}
            </TableCell>
            <TableCell
              align="center"
              sx={{ width: '120px' }}>
              {new Date(reply.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </TableCell>
          </TableRow>
        ))}
      </React.Fragment>
    ))
  }

  const handlePriorityClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorElPriority && anchorElPriority === event.currentTarget) {
      setAnchorElPriority(null)
    } else {
      setAnchorElPriority(event.currentTarget)
    }
  }

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorElStatus && anchorElStatus === event.currentTarget) {
      setAnchorElStatus(null)
    } else {
      setAnchorElStatus(event.currentTarget)
    }
  }

  const handlePriorityClose = () => {
    setAnchorElPriority(null)
  }

  const handleStatusClose = () => {
    setAnchorElStatus(null)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
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
            <Typography
              variant="body2"
              sx={{
                color: '#666'
              }}>
              {totalArticles}건
            </Typography>
          </Paper>
          {memoStages.map(stage => (
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

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2
        }}>
        <FormControl
          size="small"
          sx={{
            width: '200px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: 'white',
              height: '40px',
              '& fieldset': {
                borderColor: '#E0E0E0'
              },
              '&:hover fieldset': {
                borderColor: '#E0E0E0'
              }
            }
          }}>
          <Select
            value={searchType}
            onChange={e => setSearchType(e.target.value as SearchType)}
            displayEmpty
            sx={{
              color: '#666',
              '& .MuiSelect-select': {
                py: 1
              }
            }}>
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
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: 'white',
              height: '40px',
              '& fieldset': {
                borderColor: '#E0E0E0'
              },
              '&:hover fieldset': {
                borderColor: '#E0E0E0'
              },
              '& input': {
                py: 0
              }
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSearch}
                  edge="end"
                  sx={{
                    color: '#666',
                    p: '4px'
                  }}>
                  <Search size={20} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() =>
            navigate(`/user/projects/${projectId}/articles/create`)
          }
          sx={{
            bgcolor: '#FFB800',
            borderRadius: '8px',
            px: 3,
            height: '40px',
            '&:hover': {
              bgcolor: '#E5A600'
            }
          }}>
          글쓰기
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          borderRadius: '8px',
          border: '1px solid #E0E0E0',
          overflow: 'hidden'
        }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: '#F8F9FA',
                '& th': {
                  color: '#666',
                  fontWeight: 600,
                  py: 2
                }
              }}>
              <TableCell
                align="center"
                sx={{ width: '80px' }}>
                번호
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '120px', cursor: 'pointer' }}
                onClick={handlePriorityClick}>
                {priorityType
                  ? priorityType === 'HIGH'
                    ? '높음'
                    : priorityType === 'MEDIUM'
                      ? '중간'
                      : '낮음'
                  : '우선순위'}{' '}
                ▼
                <Popover
                  open={Boolean(anchorElPriority)}
                  anchorEl={anchorElPriority}
                  onClose={handlePriorityClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                  }}>
                  <MenuItem
                    onClick={() => {
                      setPriorityType('')
                      setCurrentPage(0)
                      handlePriorityClose()
                    }}>
                    전체
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setPriorityType('HIGH')
                      setCurrentPage(0)
                      handlePriorityClose()
                    }}>
                    높음
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setPriorityType('MEDIUM')
                      setCurrentPage(0)
                      handlePriorityClose()
                    }}>
                    중간
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setPriorityType('LOW')
                      setCurrentPage(0)
                      handlePriorityClose()
                    }}>
                    낮음
                  </MenuItem>
                </Popover>
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '100px', cursor: 'pointer' }}
                onClick={handleStatusClick}>
                {statusFilter
                  ? statusFilter === 'PENDING'
                    ? '답변대기'
                    : '답변완료'
                  : '상태'}{' '}
                ▼
                <Popover
                  open={Boolean(anchorElStatus)}
                  anchorEl={anchorElStatus}
                  onClose={handleStatusClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                  }}>
                  <MenuItem
                    onClick={() => {
                      setStatusFilter('')
                      setCurrentPage(0)
                      handleStatusClose()
                    }}>
                    전체
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setStatusFilter('PENDING')
                      setCurrentPage(0)
                      handleStatusClose()
                    }}>
                    답변대기
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setStatusFilter('COMMENTED')
                      setCurrentPage(0)
                      handleStatusClose()
                    }}>
                    답변완료
                  </MenuItem>
                </Popover>
              </TableCell>
              <TableCell>제목</TableCell>
              <TableCell
                align="center"
                sx={{ width: '120px' }}>
                작성자
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '120px' }}>
                작성일
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length > 0 ? (
              renderArticles(articles)
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    py: 8,
                    color: '#666'
                  }}>
                  {selectedStage !== null
                    ? '해당 단계의 질문이 없습니다.'
                    : '작성된 질문이 없습니다.'}
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
            mt: 3
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
      )}
    </Box>
  )
}

export default ProjectArticle
