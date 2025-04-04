import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Divider,
  Link,
  Button,
  Paper
} from '@mui/material'
import {
  Link2,
  FileText,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
  List,
  MessageSquarePlus
} from 'lucide-react'
import dayjs from 'dayjs'
import ProjectHeader from '../../components/projects/ProjectHeader'
import CommentList from '../../components/comment/CommentList'
import type { Project } from '../../types/project'
import type { Article as ArticleType } from '../../types/article'
import type { Comment } from '../../types/comment'

const Article: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const projectId = params.projectId
  const articleId = params.articleId
  const [project, setProject] = useState<Project | null>(null)
  const [article, setArticle] = useState<ArticleType | null>(null)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      content: '소셜 로그인도 고려해야 할 것 같습니다.',
      author: { id: 2, name: '김철수', email: 'kim@example.com' },
      createdAt: '2024-03-15T10:30:00Z',
      replies: [
        {
          id: 3,
          content:
            '네, 구글과 카카오 로그인을 우선적으로 구현하면 좋을 것 같습니다.',
          author: { id: 1, name: '홍길동', email: 'hong@example.com' },
          createdAt: '2024-03-15T10:35:00Z',
          parentId: 1
        }
      ]
    },
    {
      id: 2,
      content: '보안 관련 이슈도 함께 검토가 필요해 보입니다.',
      author: { id: 3, name: '이영희', email: 'lee@example.com' },
      createdAt: '2024-03-15T11:00:00Z'
    }
  ])

  useEffect(() => {
    if (!projectId || !articleId) {
      console.error('Project ID or Article ID is missing')
      return
    }

    // TODO: API 호출로 변경
    const dummyProject: Project = {
      id: Number(projectId),
      projectNumber: 'P2024001',
      name: '프로젝트 이름',
      description: '프로젝트 설명',
      status: '진행중',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clientCompany: '클라이언트 회사',
      devCompany: '개발 회사',
      systemManager: '시스템 관리자',
      clientManagers: [],
      clientParticipants: [],
      developmentManagers: [],
      developmentParticipants: [],
      managers: [],
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProject(dummyProject)

    const dummyArticle: ArticleType = {
      id: Number(articleId),
      title: '로그인 기능 구현 관련 논의',
      content:
        '로그인 기능 구현과 관련하여 다음과 같은 사항들을 논의해야 합니다:\n\n1. 소셜 로그인 지원 여부\n2. 보안 정책 수립\n3. 사용자 인증 방식\n4. 세션 관리 방법',
      stage: '개발',
      priority: '높음',
      files: [
        { id: 1, name: '로그인 플로우.pdf', url: '/files/1' },
        { id: 2, name: 'API 명세서.xlsx', url: '/files/2' }
      ],
      links: [
        { id: 1, title: 'Figma 디자인', url: 'https://figma.com/...' },
        { id: 2, title: 'API 문서', url: 'https://api-docs.com/...' }
      ],
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      author: {
        id: 1,
        name: '홍길동',
        email: 'hong@example.com'
      }
    }
    setArticle(dummyArticle)

    // TODO: API 호출로 댓글 정보 가져오기
    setComments([
      {
        id: 1,
        content: '소셜 로그인도 고려해야 할 것 같습니다.',
        author: { id: 2, name: '김철수', email: 'kim@example.com' },
        createdAt: '2024-03-15T10:30:00Z',
        replies: [
          {
            id: 3,
            content:
              '네, 구글과 카카오 로그인을 우선적으로 구현하면 좋을 것 같습니다.',
            author: { id: 1, name: '홍길동', email: 'hong@example.com' },
            createdAt: '2024-03-15T10:35:00Z',
            parentId: 1
          }
        ]
      },
      {
        id: 2,
        content: '보안 관련 이슈도 함께 검토가 필요해 보입니다.',
        author: { id: 3, name: '이영희', email: 'lee@example.com' },
        createdAt: '2024-03-15T11:00:00Z'
      }
    ])
  }, [projectId, articleId])

  const handleBack = () => {
    if (!projectId) return
    navigate(`/user/projects/${projectId}`)
  }

  const handleAddComment = (content: string) => {
    // TODO: API 호출
    const newComment: Comment = {
      id: Math.max(...comments.map(c => c.id)) + 1,
      content,
      author: { id: 1, name: '홍길동', email: 'hong@example.com' },
      createdAt: new Date().toISOString()
    }
    setComments([...comments, newComment])
  }

  const handleAddReply = (content: string, parentId: number) => {
    // TODO: API 호출
    const newReply: Comment = {
      id:
        Math.max(
          ...comments.flatMap(c => [c.id, ...(c.replies?.map(r => r.id) || [])])
        ) + 1,
      content,
      author: { id: 1, name: '홍길동', email: 'hong@example.com' },
      createdAt: new Date().toISOString(),
      parentId
    }

    setComments(
      comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          }
        }
        return comment
      })
    )
  }

  const handleEditComment = (commentId: number, content: string) => {
    // TODO: API 호출
    setComments(
      comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content }
        }
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return { ...reply, content }
            }
            return reply
          })
          return { ...comment, replies: updatedReplies }
        }
        return comment
      })
    )
  }

  const handleDeleteComment = (commentId: number) => {
    // TODO: API 호출
    setComments(
      comments.filter(comment => {
        if (comment.id === commentId) {
          return false
        }
        if (comment.replies) {
          comment.replies = comment.replies.filter(
            reply => reply.id !== commentId
          )
        }
        return true
      })
    )
  }

  const handleEdit = () => {
    if (!projectId || !articleId) return
    navigate(`/user/projects/${projectId}/articles/${articleId}/edit`)
  }

  const handleDelete = () => {
    // TODO: 삭제 확인 모달 표시 후 API 호출
    console.log('Delete article:', articleId)
  }

  // const handleList = () => {
  //   navigate(`/user/projects/${projectId}`)
  // }

  const handlePrevious = () => {
    if (!projectId || !articleId) return
    navigate(`/user/projects/${projectId}/articles/${Number(articleId) - 1}`)
  }

  const handleNext = () => {
    if (!projectId || !articleId) return
    navigate(`/user/projects/${projectId}/articles/${Number(articleId) + 1}`)
  }

  const handleCreateReply = () => {
    if (!projectId || !articleId) {
      console.error('Project ID or Article ID is missing')
      return
    }
    navigate(`/user/projects/${projectId}/articles/${articleId}/reply`)
  }

  if (!project || !article) {
    return null // 또는 로딩 상태 표시
  }

  return (
    <Box>
      <ProjectHeader project={project} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}>
                <Typography variant="h5">{article.title}</Typography>
                <Chip
                  label={article.stage}
                  color="primary"
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
                {article.author.id === 1 && (
                  <Stack
                    direction="row"
                    spacing={1}>
                    <IconButton
                      size="small"
                      onClick={handleEdit}>
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleDelete}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                )}
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography
                  variant="body2"
                  color="text.secondary">
                  {article.author.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary">
                  {dayjs(article.createdAt).format('YYYY.MM.DD HH:mm')}
                </Typography>
              </Stack>

              <Divider />

              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-line' }}>
                {article.content}
              </Typography>

              {(article.files.length > 0 || article.links.length > 0) && (
                <>
                  <Divider />
                  <Stack
                    direction="row"
                    spacing={4}>
                    {article.files.length > 0 && (
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary">
                          첨부파일
                        </Typography>
                        <Stack spacing={1}>
                          {article.files.map(file => (
                            <Stack
                              key={file.id}
                              direction="row"
                              alignItems="center"
                              spacing={1}>
                              <FileText size={16} />
                              <Link
                                href={file.url}
                                underline="hover">
                                {file.name}
                              </Link>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {article.links.length > 0 && (
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary">
                          첨부링크
                        </Typography>
                        <Stack spacing={1}>
                          {article.links.map(link => (
                            <Stack
                              key={link.id}
                              direction="row"
                              alignItems="center"
                              spacing={1}>
                              <Link2 size={16} />
                              <Link
                                href={link.url}
                                underline="hover"
                                target="_blank">
                                {link.title}
                              </Link>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>

          <Button
            startIcon={<MessageSquarePlus size={20} />}
            onClick={handleCreateReply}
            variant="outlined"
            fullWidth>
            답글 작성
          </Button>

          <Stack
            direction="row"
            justifyContent="space-between">
            <Button
              startIcon={<List size={20} />}
              onClick={handleBack}
              variant="outlined">
              목록
            </Button>
            <Stack
              direction="row"
              spacing={2}>
              <Button
                startIcon={<ArrowLeft size={20} />}
                onClick={handlePrevious}
                variant="outlined">
                이전
              </Button>
              <Button
                endIcon={<ArrowRight size={20} />}
                onClick={handleNext}
                variant="outlined">
                다음
              </Button>
            </Stack>
          </Stack>

          <Paper
            sx={{
              p: 3,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider'
            }}>
            <Typography
              variant="h6"
              sx={{ mb: 2 }}>
              댓글
            </Typography>
            <CommentList
              comments={comments}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              currentUserId={1}
            />
          </Paper>
        </Stack>
      </Box>
    </Box>
  )
}

export default Article as React.FC
