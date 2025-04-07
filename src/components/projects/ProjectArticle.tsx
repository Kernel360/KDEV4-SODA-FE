import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  IconButton
} from '@mui/material'
import { Article, ArticleStatus, PriorityType } from '@/types/article'
import { Stage } from '@/types/stage'
import { projectService } from '@/services/projectService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectArticleProps {
  projectId: number
}

const ITEMS_PER_PAGE = 10

const ProjectArticle: React.FC<ProjectArticleProps> = ({ projectId }) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.PENDING:
        return 'default'
      case ArticleStatus.IN_PROGRESS:
        return 'primary'
      case ArticleStatus.COMPLETED:
        return 'success'
      case ArticleStatus.REJECTED:
        return 'error'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case PriorityType.HIGH:
        return 'error'
      case PriorityType.MEDIUM:
        return 'warning'
      case PriorityType.LOW:
        return 'success'
      default:
        return 'default'
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

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
        <IconButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          size="small">
          <ChevronLeft size={20} />
        </IconButton>

        {startPage > 1 && (
          <>
            <Button
              variant="text"
              onClick={() => handlePageChange(1)}>
              1
            </Button>
            {startPage > 2 && (
              <Typography sx={{ lineHeight: '40px' }}>...</Typography>
            )}
          </>
        )}

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'contained' : 'text'}
            onClick={() => handlePageChange(page)}
            sx={{
              minWidth: '40px',
              height: '40px',
              p: 0
            }}>
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <Typography sx={{ lineHeight: '40px' }}>...</Typography>
            )}
            <Button
              variant="text"
              onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <IconButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="small">
          <ChevronRight size={20} />
        </IconButton>
      </Box>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <Box sx={{ mt: 3 }}>
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

      {paginatedArticles.length > 0 ? (
        <>
          {paginatedArticles.map(article => (
            <Card
              key={article.id}
              sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                  <Typography variant="h6">{article.title}</Typography>
                  <Stack
                    direction="row"
                    spacing={1}>
                    <Chip
                      label={article.status}
                      color={getStatusColor(article.status)}
                      size="small"
                    />
                    <Chip
                      label={article.priority}
                      color={getPriorityColor(article.priority)}
                      size="small"
                    />
                  </Stack>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom>
                  작성자: {article.userName} | 마감일:{' '}
                  {new Date(article.deadLine).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary">
                  작성일: {new Date(article.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {renderPagination()}
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
          <Typography
            variant="body1"
            color="text.secondary">
            게시글이 존재하지 않습니다.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ProjectArticle
