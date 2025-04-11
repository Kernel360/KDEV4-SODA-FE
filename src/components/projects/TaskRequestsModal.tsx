import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material'
import { Plus, X, ArrowLeft } from 'lucide-react'
import RequestList from './RequestList'
import RequestForm from './RequestForm'
import RequestDetail from './RequestDetail'
import {
  getTaskRequests,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  approveTaskRequest,
  rejectTaskRequest,
  uploadRequestFile
} from '../../api/request'
import type {
  TaskRequest,
  CreateRequestData,
  UpdateRequestData
} from '../../types/request'

interface TaskRequestsModalProps {
  open: boolean
  onClose: () => void
  task: {
    taskId: number
    title: string
    status: string
  } | null
  projectId: number
  stageId: number
}

const TaskRequestsModal: React.FC<TaskRequestsModalProps> = ({
  open,
  onClose,
  task,
  projectId,
  stageId
}) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [editingRequest, setEditingRequest] = useState<TaskRequest | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<TaskRequest | null>(
    null
  )
  // const [isRejecting, setIsRejecting] = useState(false)
  // const [rejectForm, setRejectForm] = useState({
  //   comment: '',
  //   links: [] as { urlAddress: string; urlDescription: string }[]
  // })
  // const [newLink, setNewLink] = useState({ urlAddress: '', urlDescription: '' })

  useEffect(() => {
    if (!open) {
      setSelectedRequest(null)
      setIsCreatingRequest(false)
      setEditingRequest(null)
    }
  }, [open])

  useEffect(() => {
    if (task) {
      fetchRequests()
    }
  }, [task])

  const fetchRequests = async () => {
    if (!task) return
    setIsLoading(true)
    try {
      const response = await getTaskRequests(task.taskId)
      console.log('Fetched requests:', response)
      setRequests(response.data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestClick = (request: TaskRequest) => {
    setSelectedRequest(request)
    setIsCreatingRequest(false)
    setEditingRequest(null)
  }

  const handleBackToList = () => {
    setSelectedRequest(null)
  }

  const handleCreateRequest = async (formData: {
    title: string
    content: string
    links: Array<{ urlAddress: string; urlDescription: string }>
    files?: File[]
  }) => {
    if (!task) return

    try {
      if (!editingRequest) {
        const createData: CreateRequestData = {
          title: formData.title,
          content: formData.content,
          projectId,
          stageId,
          taskId: task.taskId,
          links: formData.links
        }
        const response = await createTaskRequest(createData)

        // Upload files if any
        if (formData.files?.length) {
          for (const file of formData.files) {
            await uploadRequestFile(response.data.requestId, file)
          }
        }
      } else {
        const updateData: UpdateRequestData = {
          id: editingRequest.requestId,
          title: formData.title,
          content: formData.content,
          links: formData.links
        }
        await updateTaskRequest(editingRequest.requestId, updateData)

        // Upload files if any
        if (formData.files?.length) {
          for (const file of formData.files) {
            await uploadRequestFile(editingRequest.requestId, file)
          }
        }
      }
      await fetchRequests()
      setIsCreatingRequest(false)
      setEditingRequest(null)
    } catch (error) {
      console.error('Error creating/updating request:', error)
    }
  }

  const handleDeleteRequest = async (request: TaskRequest) => {
    try {
      await deleteTaskRequest(request.requestId)
      await fetchRequests()
      if (selectedRequest?.requestId === request.requestId) {
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }

  const handleApproveRequest = async (request: TaskRequest) => {
    try {
      await approveTaskRequest(request.requestId, { comment: '', links: [] })
      await fetchRequests()
      if (selectedRequest?.requestId === request.requestId) {
        const updatedRequest = (
          await getTaskRequests(task?.taskId || 0)
        ).data?.find((r: TaskRequest) => r.requestId === request.requestId)
        setSelectedRequest(updatedRequest || null)
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRejectRequest = async (
    request: TaskRequest,
    comment: string,
    links: Array<{ urlAddress: string; urlDescription: string }>
  ) => {
    try {
      await rejectTaskRequest(request.requestId, {
        comment,
        links
      })
      await fetchRequests()
      if (selectedRequest?.requestId === request.requestId) {
        const updatedRequest = (
          await getTaskRequests(task?.taskId || 0)
        ).data?.find((r: TaskRequest) => r.requestId === request.requestId)
        setSelectedRequest(updatedRequest || null)
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  // const handleAddLink = () => {
  //   if (newLink.urlAddress.trim() && newLink.urlDescription.trim()) {
  //     setRejectForm(prev => ({
  //       ...prev,
  //       links: [...prev.links, newLink]
  //     }))
  //     setNewLink({ urlAddress: '', urlDescription: '' })
  //   }
  // }

  // const handleRemoveLink = (index: number) => {
  //   setRejectForm(prev => ({
  //     ...prev,
  //     links: prev.links.filter((_, i) => i !== index)
  //   }))
  // }

  const canCreateRequest = () => {
    return task?.status === '대기'
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedRequest && (
              <IconButton
                onClick={handleBackToList}
                size="small">
                <ArrowLeft size={16} />
              </IconButton>
            )}
            <Typography variant="h6">
              {selectedRequest ? selectedRequest.title : task?.title}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small">
            <X size={16} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>로딩 중...</Typography>
          </Box>
        ) : isCreatingRequest ? (
          <RequestForm
            onCancel={() => setIsCreatingRequest(false)}
            onSubmit={handleCreateRequest}
          />
        ) : editingRequest ? (
          <RequestForm
            onCancel={() => setEditingRequest(null)}
            onSubmit={handleCreateRequest}
            initialData={{
              title: editingRequest.title,
              content: editingRequest.content,
              links: editingRequest.links || []
            }}
          />
        ) : selectedRequest ? (
          <RequestDetail
            request={selectedRequest}
            onBack={handleBackToList}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        ) : (
          <RequestList
            requests={requests}
            onRequestClick={handleRequestClick}
            onEdit={setEditingRequest}
            onDelete={handleDeleteRequest}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        )}
      </DialogContent>
      <DialogActions>
        {!isCreatingRequest && !editingRequest && !selectedRequest && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setIsCreatingRequest(true)}
            disabled={!canCreateRequest()}>
            요청 추가
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default TaskRequestsModal
