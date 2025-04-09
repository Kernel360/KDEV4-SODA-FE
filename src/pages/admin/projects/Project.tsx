import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'
import { ArrowLeft, Edit, LayoutDashboard } from 'lucide-react'
import { projectService } from '../../../services/projectService'
import { formatDate } from '../../../utils/dateUtils'
import type { Project } from '../../../types/project'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { useToast } from '../../../contexts/ToastContext'

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const data = await projectService.getProjectById(parseInt(id))
        setProject(data)
      } catch (err) {
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!project) {
    return <ErrorMessage message="프로젝트가 존재하지 않습니다." />
  }

  const handleDelete = async () => {
    try {
      await projectService.deleteProject(project.id)
      showToast('프로젝트가 성공적으로 삭제되었습니다.', 'success')
      setOpenDeleteDialog(false)
      navigate('/admin/projects')
    } catch (error) {
      console.error('프로젝트 삭제 중 오류:', error)
      showToast('프로젝트 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/admin/projects')}
            sx={{ color: 'text.primary' }}>
            목록으로
          </Button>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<LayoutDashboard size={20} />}
            onClick={() => navigate(`/user/projects/${id}`)}
            sx={{
              backgroundColor: '#FBBF24',
              '&:hover': {
                backgroundColor: '#FCD34D'
              },
              color: '#ffffff'
            }}>
            대시보드 바로가기
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit size={20} />}
            onClick={() => navigate(`/admin/projects/${id}/edit`)}
            sx={{
              borderColor: '#F59E0B',
              '&:hover': {
                backgroundColor: '#FCD34D'
              }
            }}>
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{
              borderColor: '#ef5350',
              color: '#ef5350',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'transparent'
              }
            }}
            onClick={() => setOpenDeleteDialog(true)}>
            삭제
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="body1"
          sx={{ mb: 4 }}>
          {project.description}
        </Typography>

        <Grid
          container
          spacing={3}>
          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                고객사
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {project.clientCompanyName}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                계획 시작일
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {formatDate(project.startDate)}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                고객사 담당자
              </Typography>
              <List
                dense
                disablePadding>
                {project.clientCompanyManagers.map((manager, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={manager} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                개발사
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {project.devCompanyName}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                계획 종료일
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3 }}>
                {formatDate(project.endDate)}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                개발사 담당자
              </Typography>
              <List
                dense
                disablePadding>
                {project.devCompanyManagers.map((manager, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={manager} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                고객사 일반 참여자
              </Typography>
              <List
                dense
                disablePadding>
                {project.clientCompanyMembers.map((member, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={member} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                개발사 일반 참여자
              </Typography>
              <List
                dense
                disablePadding>
                {project.devCompanyMembers.map((member, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0 }}>
                    <ListItemText primary={member} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 프로젝트를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="primary">
            취소
          </Button>
          <Button
            onClick={handleDelete}
            color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Project
