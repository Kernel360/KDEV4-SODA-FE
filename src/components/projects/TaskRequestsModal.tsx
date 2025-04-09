import React, { useState, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Paper,
  Stack,
  Alert,
  Snackbar,
  Link
} from '@mui/material'
import { Plus, X, Link as LinkIcon, FileText, Trash2, Edit2 } from 'lucide-react'
import { getTaskRequests, createTaskRequest, deleteTaskRequest, updateTaskRequest, uploadRequestFiles, deleteRequestLink, deleteRequestFile, approveTaskRequest, rejectTaskRequest, uploadResponseFiles, getTaskResponses, getRequestResponses, updateTaskResponse, deleteResponseLink, deleteResponseFile } from '../../api/task'
import type { TaskRequest, TaskRequestsResponse, ProjectStageTask } from '../../types/api'

interface RequestAttachment {
  id: number
  type: 'file' | 'link'
  title: string
  url?: string
  fileName?: string
  inputId?: string
}

interface RequestAction {
  type: '승인' | '반려'
  actorName: string
  reason?: string
  attachments?: RequestAttachment[]
  createdAt: string
}

interface TaskRequestsModalProps {
  open: boolean
  onClose: () => void
  task: ProjectStageTask | null
  projectId: number
  stageId: number
}

const MAX_ATTACHMENTS = 10
const MAX_FILES = 10
const MAX_LINKS = 10

const TaskRequestsModal: React.FC<TaskRequestsModalProps> = ({
  open,
  onClose,
  task,
  projectId,
  stageId
}) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    content: '',
    attachments: [] as RequestAttachment[]
  })
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionAttachments, setRejectionAttachments] = useState<
    RequestAttachment[]
  >([])
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  )
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingRequest, setEditingRequest] = useState<TaskRequest | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    links: [] as { urlAddress: string; urlDescription: string }[]
  })
  const [editingNewLink, setEditingNewLink] = useState({ urlAddress: '', urlDescription: '' })
  const [isAddingEditLink, setIsAddingEditLink] = useState(false)
  const [newlyAddedLinks, setNewlyAddedLinks] = useState<{ urlAddress: string; urlDescription: string }[]>([])
  const [selectedRequest, setSelectedRequest] = useState<TaskRequest | null>(null)
  const [approvalComment, setApprovalComment] = useState('')
  const [approvalFiles, setApprovalFiles] = useState<File[]>([])
  const [approvalLinks, setApprovalLinks] = useState<{ urlAddress: string; urlDescription: string }[]>([])
  const [isAddingApprovalLink, setIsAddingApprovalLink] = useState(false)
  const [newApprovalLink, setNewApprovalLink] = useState({ urlAddress: '', urlDescription: '' })
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [requestResponse, setRequestResponse] = useState<any>(null)
  const [responses, setResponses] = useState<any>(null)
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [editingResponse, setEditingResponse] = useState<any>(null)
  const [editResponseForm, setEditResponseForm] = useState({
    comment: '',
    links: [] as { urlAddress: string; urlDescription: string }[],
    files: [] as File[]
  })
  const [isAddingEditResponseLink, setIsAddingEditResponseLink] = useState(false)
  const [newEditResponseLink, setNewEditResponseLink] = useState({ urlAddress: '', urlDescription: '' })

  useEffect(() => {
    if (task) {
      console.log('Current task:', task); // task 객체 로깅
      console.log('Task status:', task.status); // task 상태 로깅
      setRequests([])
      fetchRequests()
    }
  }, [task])

  useEffect(() => {
    if (selectedRequest) {
      fetchResponses()
    }
  }, [selectedRequest])

  const fetchRequests = async () => {
    if (!task) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskRequests(task.taskId)
      console.log('Fetched requests response:', response) // 응답 로깅
      if (response.status === 'success') {
        const requestData = response.data ? (response.data as unknown as TaskRequest[]) : []
        console.log('Setting requests to:', requestData) // 설정할 데이터 로깅
        setRequests(requestData)
      } else {
        console.error('Failed to fetch requests:', response.message) // 에러 로깅
        setError(response.message || '요청 목록을 불러오는데 실패했습니다.')
        setRequests([])
      }
    } catch (error) {
      console.error('Error fetching requests:', error) // 에러 로깅
      setError('요청 목록을 불러오는 중 오류가 발생했습니다.')
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchResponses = async () => {
    try {
      if (selectedRequest) {
        const response = await getRequestResponses(selectedRequest.requestId)
        setResponses(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error)
    }
  }

  const handleCreateRequest = async () => {
    if (!task) return

    try {
      // 파일 수집
      const fileAttachments = newRequest.attachments.filter(a => a.type === 'file')
      const allFiles: File[] = []
      
      for (const attachment of fileAttachments) {
        const input = document.getElementById(attachment.inputId as string) as HTMLInputElement
        if (input?.files?.[0]) {
          allFiles.push(input.files[0])
        }
      }

      const requestData = {
      title: newRequest.title,
      content: newRequest.content,
        projectId: projectId,
        stageId: stageId,
        taskId: task.taskId,
        links: newRequest.attachments
          .filter(a => a.type === 'link' && a.url)
          .map(link => ({
            urlAddress: link.url || '',
            urlDescription: link.title
          }))
      }

      console.log('Creating request with data:', requestData)
      console.log('Files to upload:', allFiles.length)

      // 1. 먼저 요청 정보 생성
      const response = await createTaskRequest(requestData)
      
      // 2. 파일이 있는 경우 requestId를 이용해 파일 업로드
      if (allFiles.length > 0 && response.status === 'success' && response.data && response.data.requestId) {
        try {
          const uploadResponse = await uploadRequestFiles(response.data.requestId, allFiles)
          if (uploadResponse.status !== 'success') {
            console.error('파일 업로드 중 오류가 발생했습니다:', uploadResponse.message)
          }
        } catch (fileError) {
          console.error('파일 업로드 중 오류가 발생했습니다:', fileError)
        }
      }
      
      setApiResponse(response)
      setShowResponseModal(true)
      if (response.status === 'success') {
        await fetchRequests() // 목록 새로고침
    setIsCreatingRequest(false)
    setNewRequest({ title: '', content: '', attachments: [] })
      } else {
        setError(response.message || '요청 생성에 실패했습니다.')
      }
    } catch (error) {
      setError('요청 생성 중 오류가 발생했습니다.')
      setApiResponse({
        status: 'error',
        message: '요청 생성 중 오류가 발생했습니다.'
      })
      setShowResponseModal(true)
    }
  }

  const handleApproveClick = (requestId: number) => {
    setSelectedRequestId(requestId)
    setApprovalDialogOpen(true)
  }

  const handleApproveRequest = async () => {
    if (!task || !selectedRequestId) return

    try {
      // 1. 먼저 코멘트와 링크만 포함하여 승인 요청
      const response = await approveTaskRequest(selectedRequestId, {
        comment: approvalComment,
        links: approvalLinks
      })

      if (response.status === 'success') {
        // 2. 파일이 있는 경우 responseId를 이용해 파일 업로드
        if (approvalFiles.length > 0 && response.data && response.data.responseId) {
          try {
            const uploadResponse = await uploadResponseFiles(response.data.responseId, approvalFiles)
            if (uploadResponse.status !== 'success') {
              console.error('파일 업로드 중 오류가 발생했습니다:', uploadResponse.message)
            }
          } catch (fileError) {
            console.error('파일 업로드 중 오류가 발생했습니다:', fileError)
          }
        }

        setSnackbarMessage('요청이 승인되었습니다')
        setSnackbarOpen(true)
        await fetchRequests() // 목록 새로고침
        setApprovalDialogOpen(false)
        setApprovalComment('')
        setApprovalFiles([])
        setApprovalLinks([])
        setSelectedRequestId(null)
        handleCloseDetail()
      } else {
        setSnackbarMessage(response.message || '요청 승인 중 오류가 발생했습니다')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      console.error('Approve request error:', error)
      setSnackbarMessage(error.message || '요청 승인 중 오류가 발생했습니다')
      setSnackbarOpen(true)
    }
  }

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId)
    setIsRejecting(true)
  }

  const handleRejectRequest = async () => {
    if (!task || !rejectionReason || !selectedRequestId) return

    try {
      // 파일 수집
      const fileAttachments = rejectionAttachments.filter(a => a.type === 'file')
      const allFiles: File[] = []
      
      for (const attachment of fileAttachments) {
        const input = document.getElementById(attachment.inputId as string) as HTMLInputElement
        if (input?.files?.[0]) {
          allFiles.push(input.files[0])
        }
      }
      
      // 1. 먼저 코멘트와 링크만 포함하여 반려 요청
      const response = await rejectTaskRequest(selectedRequestId, {
        comment: rejectionReason,
        projectId: projectId,
        links: rejectionAttachments
          .filter(a => a.type === 'link' && a.url)
          .map(link => ({
            urlAddress: link.url || '',
            urlDescription: link.title
          }))
      })

      if (response.status === 'success') {
        // 2. 파일이 있는 경우 responseId를 이용해 파일 업로드
        if (allFiles.length > 0 && response.data && response.data.responseId) {
          try {
            const uploadResponse = await uploadResponseFiles(response.data.responseId, allFiles)
            if (uploadResponse.status !== 'success') {
              console.error('파일 업로드 중 오류가 발생했습니다:', uploadResponse.message)
            }
          } catch (fileError) {
            console.error('파일 업로드 중 오류가 발생했습니다:', fileError)
          }
        }

        setSnackbarMessage('요청이 반려되었습니다')
        setSnackbarOpen(true)
        await fetchRequests() // 목록 새로고침
    setIsRejecting(false)
    setRejectionReason('')
    setRejectionAttachments([])
    setSelectedRequestId(null)
      } else {
        setSnackbarMessage(response.message || '요청 반려 중 오류가 발생했습니다')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      console.error('Reject request error:', error)
      setSnackbarMessage(error.message || '요청 반려 중 오류가 발생했습니다')
      setSnackbarOpen(true)
    }
  }

  const getFileCount = (attachments: RequestAttachment[]) => {
    return attachments.filter(a => a.type === 'file').length
  }

  const getLinkCount = (attachments: RequestAttachment[]) => {
    return attachments.filter(a => a.type === 'link').length
  }

  const handleAddAttachment = (type: 'file' | 'link') => {
    if (type === 'link' && (!newLink.title || !newLink.url)) return

    const attachment: RequestAttachment = {
      id: Date.now(),
      type,
      title: type === 'link' ? newLink.title : '첨부파일',
      url: type === 'link' ? newLink.url : '',
      fileName: type === 'file' ? '파일명' : undefined
    }

    if (isRejecting) {
      if (type === 'file' && getFileCount(rejectionAttachments) >= MAX_FILES)
        return
      if (type === 'link' && getLinkCount(rejectionAttachments) >= MAX_LINKS)
        return
      setRejectionAttachments([...rejectionAttachments, attachment])
    } else {
      if (type === 'file' && getFileCount(newRequest.attachments) >= MAX_FILES)
        return
      if (type === 'link' && getLinkCount(newRequest.attachments) >= MAX_LINKS)
        return
      setNewRequest({
        ...newRequest,
        attachments: [...newRequest.attachments, attachment]
      })
    }

    if (type === 'link') {
      setNewLink({ title: '', url: '' })
      setIsAddingLink(false)
    }
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isRejection: boolean
  ) => {
    const files = event.target.files
    if (!files) return

    const currentAttachments = isRejection
      ? rejectionAttachments
      : newRequest.attachments
    const currentFileCount = getFileCount(currentAttachments)
    const remainingSlots = MAX_FILES - currentFileCount

    if (remainingSlots <= 0) return

    // 파일 input 요소를 참조하기 위한 ID 생성
    const inputId = `file-input-${Date.now()}`
    event.target.id = inputId

    // 기존 파일 목록을 복사
    const newFiles = Array.from(files)
    console.log('Selected files:', newFiles.length)

        if (isRejection) {
      setRejectionAttachments(prev => [
        ...prev,
        ...newFiles.map(file => ({
          id: Date.now() + Math.random(),
          type: 'file' as const,
          title: file.name,
          fileName: file.name,
          inputId
        }))
      ])
        } else {
      setNewRequest(prev => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          ...newFiles.map(file => ({
            id: Date.now() + Math.random(),
            type: 'file' as const,
            title: file.name,
            fileName: file.name,
            inputId
          }))
        ]
      }))
    }
  }

  const handleRemoveAttachment = (id: number, isRejection: boolean) => {
    if (isRejection) {
      setRejectionAttachments(rejectionAttachments.filter(a => a.id !== id))
    } else {
      setNewRequest({
        ...newRequest,
        attachments: newRequest.attachments.filter(a => a.id !== id)
      })
    }
  }

  const canCreateRequest = () => {
    if (!task) return false
    
    console.log('Checking canCreateRequest:');
    console.log('Task:', task);
    console.log('Task status:', task.status);
    console.log('Requests:', requests);
    
    // 승인된 상태가 아니면 무조건 요청 생성 가능
    return task.status !== 'APPROVED'
  }

  // 모달 닫을 때 상태 초기화
  const handleClose = () => {
    setIsCreatingRequest(false)
    setNewRequest({ title: '', content: '', attachments: [] })
    setNewLink({ title: '', url: '' })
    setIsAddingLink(false)
    setIsRejecting(false)
    setRejectionReason('')
    setRejectionAttachments([])
    setSelectedRequestId(null)
    setRequests([])
    setError(null)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#22c55e', backgroundColor: '#f0fdf4', label: '승인' }
      case 'REJECTED':
        return { color: '#ef4444', backgroundColor: '#fef2f2', label: '반려' }
      case 'PENDING':
        return { color: '#f59e0b', backgroundColor: '#fffbeb', label: '승인 대기' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100', label: '알 수 없음' }
    }
  }

  const handleDeleteRequest = async (requestId: number) => {
    try {
      const response = await deleteTaskRequest(requestId)
      console.log('Delete response:', response);
      if (response.status === 'success') {
        setSnackbarMessage('요청이 삭제되었습니다')
        setSnackbarOpen(true)
        await fetchRequests() // 목록 새로고침
      } else {
        setSnackbarMessage(response.message || '요청 삭제 중 오류가 발생했습니다')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      console.error('Delete request error:', error);
      setSnackbarMessage(error.message || '요청 삭제 중 오류가 발생했습니다')
      setSnackbarOpen(true)
    }
  }

  const handleEditClick = (request: TaskRequest) => {
    setEditingRequest(request)
    setEditForm({
      title: request.title,
      content: request.content,
      links: []
    })
    setNewlyAddedLinks([])
    setIsEditing(true)
    setIsCreatingRequest(false)
    setIsRejecting(false)
  }

  const handleAddEditLink = () => {
    if (!editingNewLink.urlAddress || !editingNewLink.urlDescription) return

    setNewlyAddedLinks([...newlyAddedLinks, {
      urlAddress: editingNewLink.urlAddress,
      urlDescription: editingNewLink.urlDescription
    }])
    setEditingNewLink({ urlAddress: '', urlDescription: '' })
    setIsAddingEditLink(false)
  }

  const handleRemoveNewLink = (index: number) => {
    setNewlyAddedLinks(newlyAddedLinks.filter((_, i) => i !== index))
  }

  const handleEditFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !editingRequest) return

    // 파일 input 요소를 참조하기 위한 ID 생성
    const inputId = `file-input-${Date.now()}`
    event.target.id = inputId

    // 기존 파일 목록을 복사
    const newFiles = Array.from(files)
    console.log('Selected files for edit:', newFiles.length)

    // 수정 화면의 파일 목록 업데이트
    setEditingRequest(prev => {
      if (!prev) return prev
      return {
        ...prev,
        newFiles: [
          ...(prev.newFiles || []),
          ...newFiles.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            inputId
          }))
        ]
      }
    })
  }

  const handleUpdateRequest = async () => {
    if (!editingRequest) return

    try {
      // 파일 수집
      const allFiles: File[] = []
      
      if (editingRequest.newFiles) {
        for (const fileInfo of editingRequest.newFiles) {
          const input = document.getElementById(fileInfo.inputId) as HTMLInputElement
          if (input?.files?.[0]) {
            allFiles.push(input.files[0])
          }
        }
      }

      console.log('Updating request with files:', allFiles.length)

      // 1. 먼저 요청 정보 업데이트
      const response = await updateTaskRequest(editingRequest.requestId, {
        title: editForm.title,
        content: editForm.content,
        links: newlyAddedLinks
      })

      if (response.status === 'success') {
        // 2. 파일 업로드 처리
        if (allFiles.length > 0) {
          const uploadResponse = await uploadRequestFiles(editingRequest.requestId, allFiles)
          
          if (uploadResponse.status === 'success') {
            setSnackbarMessage('요청과 파일이 성공적으로 수정되었습니다')
          } else {
            setSnackbarMessage('요청은 수정되었으나 파일 업로드 중 오류가 발생했습니다')
          }
        } else {
          setSnackbarMessage('요청이 수정되었습니다')
        }
        
        setSnackbarOpen(true)
        await fetchRequests() // 목록 새로고침
        setIsEditing(false)
        setEditingRequest(null)
        setNewlyAddedLinks([])
      } else {
        setSnackbarMessage(response.message || '요청 수정 중 오류가 발생했습니다')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      console.error('Update request error:', error)
      setSnackbarMessage(error.message || '요청 수정 중 오류가 발생했습니다')
      setSnackbarOpen(true)
    }
  }

  const handleRequestClick = async (request: TaskRequest) => {
    console.log('Request clicked:', request);
    console.log('Request status:', request.status);
    console.log('Request files:', request.files);
    console.log('Request links:', request.links);
    
    setSelectedRequest(request);
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      try {
        console.log('Fetching responses for request:', request.requestId);
        const response = await getRequestResponses(request.requestId);
        console.log('Full response from getRequestResponses:', response);
        console.log('Response status:', response.status);
        console.log('Response data type:', typeof response.data);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 'success' && response.data && response.data.length > 0) {
          console.log('Setting responses:', response.data);
          setResponses(response.data);
          
          const latestResponse = response.data[0];
          console.log('Latest response full object:', latestResponse);
          console.log('Latest response type:', typeof latestResponse);
          console.log('Latest response keys:', Object.keys(latestResponse));
          console.log('Latest response links:', latestResponse.links);
          console.log('Latest response files:', latestResponse.files);
          
          setRequestResponse(latestResponse);

          // 상태 업데이트 후 즉시 확인
          console.log('Updated requestResponse state:', latestResponse);
        } else {
          console.log('No responses found or empty response data');
          console.log('Response data length:', response.data?.length);
          console.log('Response data content:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch response:', error);
        setSnackbarMessage('응답 정보를 불러오는데 실패했습니다');
        setSnackbarOpen(true);
      }
    } else {
      console.log('Request is not APPROVED or REJECTED, clearing responses');
      setResponses(null);
      setRequestResponse(null);
    }
  };

  // requestResponse가 변경될 때마다 로그
  useEffect(() => {
    console.log('requestResponse changed:', requestResponse);
    if (requestResponse) {
      console.log('Response type:', typeof requestResponse);
      console.log('Response keys:', Object.keys(requestResponse));
      console.log('Response links:', requestResponse.links);
      console.log('Response files:', requestResponse.files);
      console.log('Full response object:', JSON.stringify(requestResponse, null, 2));
    }
  }, [requestResponse]);

  // responses가 변경될 때마다 로그
  useEffect(() => {
    console.log('Current responses:', responses);
  }, [responses]);

  const handleCloseDetail = () => {
    setSelectedRequest(null)
    setRequestResponse(null)
  }

  const handleDeleteLink = async (requestId: number, linkId: number) => {
    try {
      const response = await deleteRequestLink(requestId, linkId)
      if (response.status === 'success') {
        setSnackbarMessage('링크가 삭제되었습니다')
        setSnackbarOpen(true)
        
        // 수정 화면의 링크 목록 업데이트
        if (editingRequest) {
          setEditingRequest({
            ...editingRequest,
            links: editingRequest.links.filter(link => link.id !== linkId)
          })
        }
        
        // 요청 목록 새로고침
        await fetchRequests()
      } else {
        setSnackbarMessage(response.message || '링크 삭제 중 오류가 발생했습니다')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      console.error('Delete link error:', error)
      setSnackbarMessage(error.message || '링크 삭제 중 오류가 발생했습니다')
      setSnackbarOpen(true)
    }
  }

  const handleDeleteFile = async (requestId: number, fileId: number) => {
    try {
      const response = await deleteRequestFile(requestId, fileId)
      if (response.status === 'success') {
        setSnackbarMessage('파일이 삭제되었습니다')
        setSnackbarOpen(true)
        
        // 수정 화면의 파일 목록 업데이트
        if (editingRequest) {
          setEditingRequest({
            ...editingRequest,
            files: editingRequest.files.filter(file => file.id !== fileId)
          })
        }
        
        // 요청 목록 새로고침
        await fetchRequests()
      } else {
        setSnackbarMessage(response.message || '파일 삭제 중 오류가 발생했습니다')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      console.error('Delete file error:', error)
      setSnackbarMessage(error.message || '파일 삭제 중 오류가 발생했습니다')
      setSnackbarOpen(true)
    }
  }

  const handleAddApprovalLink = () => {
    if (!newApprovalLink.urlAddress || !newApprovalLink.urlDescription) return
    
    setApprovalLinks([...approvalLinks, newApprovalLink])
    setNewApprovalLink({ urlAddress: '', urlDescription: '' })
    setIsAddingApprovalLink(false)
  }

  const handleRemoveApprovalLink = (index: number) => {
    setApprovalLinks(approvalLinks.filter((_, i) => i !== index))
  }

  const handleEditResponseClick = (response: any) => {
    setEditingResponse(response);
    setEditResponseForm({
      comment: response.comment,
      links: [], // 기존 링크는 표시용으로만 사용하고 실제 전송에는 포함하지 않음
      files: []
    });
    setIsEditingResponse(true);
  };

  const handleEditResponse = async () => {
    if (!editingResponse) return;

    try {
      // 1. 먼저 응답 정보 업데이트
      const response = await updateTaskResponse(editingResponse.responseId, {
        comment: editResponseForm.comment,
        projectId: projectId,
        links: editResponseForm.links
      });

      if (response.status === 'success') {
        // 2. 파일이 있는 경우 파일 업로드
        if (editResponseForm.files.length > 0) {
          try {
            const uploadResponse = await uploadResponseFiles(editingResponse.responseId, editResponseForm.files);
            if (uploadResponse.status !== 'success') {
              console.error('파일 업로드 중 오류가 발생했습니다:', uploadResponse.message);
            }
          } catch (fileError) {
            console.error('파일 업로드 중 오류가 발생했습니다:', fileError);
          }
        }

        // 3. 응답 데이터 새로고침
        const updatedResponses = await getRequestResponses(selectedRequest.requestId);
        if (updatedResponses.status === 'success') {
          setResponses(updatedResponses.data);
          const updatedResponse = updatedResponses.data.find((r: any) => r.responseId === editingResponse.responseId);
          if (updatedResponse) {
            setRequestResponse(updatedResponse);
          }
        }

        setSnackbarMessage('응답이 수정되었습니다');
        setSnackbarOpen(true);
        setIsEditingResponse(false);
        setEditingResponse(null);
        setEditResponseForm({
          comment: '',
          links: [],
          files: []
        });
      } else {
        setSnackbarMessage(response.message || '응답 수정 중 오류가 발생했습니다');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('Update response error:', error);
      setSnackbarMessage(error.message || '응답 수정 중 오류가 발생했습니다');
      setSnackbarOpen(true);
    }
  };

  const handleAddEditResponseLink = () => {
    console.log('Adding new link:', newEditResponseLink);
    if (!newEditResponseLink.urlAddress || !newEditResponseLink.urlDescription) return;
    
    const updatedLinks = [...editResponseForm.links, newEditResponseLink];
    console.log('Updated links:', updatedLinks);
    
    setEditResponseForm(prev => ({
      ...prev,
      links: updatedLinks
    }));
    setNewEditResponseLink({ urlAddress: '', urlDescription: '' });
    setIsAddingEditResponseLink(false);
  };

  const handleEditResponseFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('Selected files:', files);
    
    if (!files) return;
    
    const newFiles = Array.from(files);
    console.log('Converting files to array:', newFiles);
    
    setEditResponseForm(prev => {
      const updatedFiles = [...prev.files, ...newFiles];
      console.log('Updated files:', updatedFiles);
      return {
        ...prev,
        files: updatedFiles
      };
    });
  };

  const handleRemoveEditResponseLink = (index: number) => {
    setEditResponseForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteResponseLink = async (responseId: number, linkId: number) => {
    try {
      const response = await deleteResponseLink(responseId, linkId);
      if (response.status === 'success') {
        setSnackbarMessage('링크가 삭제되었습니다');
        setSnackbarOpen(true);
        
        // 현재 응답의 링크 목록 업데이트
        setRequestResponse(prev => ({
          ...prev,
          links: prev.links.filter(link => link.id !== linkId)
        }));
        
        // 전체 응답 목록도 업데이트
        setResponses(prev => 
          prev.map(resp => 
            resp.responseId === responseId 
              ? { ...resp, links: resp.links.filter(link => link.id !== linkId) }
              : resp
          )
        );
        
        if (editingResponse?.responseId === responseId) {
          setEditingResponse(prev => ({
            ...prev,
            links: prev.links.filter(link => link.id !== linkId)
          }));
        }
      } else {
        setSnackbarMessage(response.message || '링크 삭제 중 오류가 발생했습니다');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('Delete response link error:', error);
      setSnackbarMessage(error.message || '링크 삭제 중 오류가 발생했습니다');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteResponseFile = async (responseId: number, fileId: number) => {
    try {
      const response = await deleteResponseFile(responseId, fileId);
      if (response.status === 'success') {
        setSnackbarMessage('파일이 삭제되었습니다');
        setSnackbarOpen(true);
        
        // 현재 응답의 파일 목록 업데이트
        setRequestResponse(prev => ({
          ...prev,
          files: prev.files.filter(file => file.id !== fileId)
        }));
        
        // 전체 응답 목록도 업데이트
        setResponses(prev => 
          prev.map(resp => 
            resp.responseId === responseId 
              ? { ...resp, files: resp.files.filter(file => file.id !== fileId) }
              : resp
          )
        );
        
        if (editingResponse?.responseId === responseId) {
          setEditingResponse(prev => ({
            ...prev,
            files: prev.files.filter(file => file.id !== fileId)
          }));
        }
      } else {
        setSnackbarMessage(response.message || '파일 삭제 중 오류가 발생했습니다');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('Delete response file error:', error);
      setSnackbarMessage(error.message || '파일 삭제 중 오류가 발생했습니다');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <Typography variant="h6">{task?.title}</Typography>
            <IconButton onClick={handleClose} size="small">
              <X size={16} />
            </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>로딩 중...</Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ color: 'error.main', p: 2 }}>
              <Typography>{error}</Typography>
            </Box>
          )}

          {!isLoading && !error && !isCreatingRequest && requests.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>등록된 요청이 없습니다.</Typography>
            </Box>
          )}

        {isCreatingRequest ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="제목"
              fullWidth
              value={newRequest.title}
              onChange={e =>
                setNewRequest({ ...newRequest, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={4}
              value={newRequest.content}
              onChange={e =>
                setNewRequest({ ...newRequest, content: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}>
                첨부파일 ({getFileCount(newRequest.attachments)}/10) 및 링크 (
                {getLinkCount(newRequest.attachments)}/10)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileText size={16} />}
                  size="small"
                  disabled={getFileCount(newRequest.attachments) >= MAX_FILES}>
                  파일 첨부
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={e => handleFileUpload(e, false)}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon size={16} />}
                  size="small"
                  onClick={() => setIsAddingLink(true)}
                  disabled={getLinkCount(newRequest.attachments) >= MAX_LINKS}>
                  링크 추가
                </Button>
              </Stack>
              {isAddingLink && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="링크 제목"
                    size="small"
                    value={newLink.title}
                    onChange={e =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                  />
                  <TextField
                    label="URL"
                    size="small"
                    value={newLink.url}
                    onChange={e =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddAttachment('link')}
                    disabled={!newLink.title || !newLink.url}>
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsAddingLink(false)}>
                    취소
                  </Button>
                </Box>
              )}
              <List>
                {newRequest.attachments.map(attachment => (
                  <ListItem
                    key={attachment.id}
                    sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={attachment.title}
                      secondary={
                        attachment.type === 'link'
                          ? attachment.url
                          : attachment.fileName
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          handleRemoveAttachment(attachment.id, false)
                        }>
                        <X size={16} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsCreatingRequest(false)}>취소</Button>
              <Button
                variant="contained"
                onClick={handleCreateRequest}
                disabled={!newRequest.title || !newRequest.content}>
                생성
              </Button>
            </Box>
          </Box>
          ) : isEditing ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="제목"
                fullWidth
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="내용"
                fullWidth
                multiline
                rows={4}
                value={editForm.content}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  기존 링크 및 파일
                </Typography>
                {editingRequest?.links && editingRequest.links.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      링크 목록
                    </Typography>
                    <List>
                      {editingRequest.links.map((link, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Link
                                href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color="primary"
                              >
                                {link.urlDescription}
                              </Link>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => {
                                if (editingRequest) {
                                  handleDeleteLink(editingRequest.requestId, link.id)
                                }
                              }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {editingRequest?.files && editingRequest.files.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      파일 목록
                    </Typography>
                    <List>
                      {editingRequest.files.map((file, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Link
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color="primary"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FileText size={14} />
                                {file.name || (file.url ? decodeURIComponent(file.url.split('/').pop() || '') : '알 수 없는 파일')}
                              </Link>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => {
                                if (editingRequest) {
                                  handleDeleteFile(editingRequest.requestId, file.id)
                                }
                              }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  새로운 첨부
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileText size={16} />}
                    size="small">
                    파일 추가
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleEditFileUpload}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LinkIcon size={16} />}
                    size="small"
                    onClick={() => setIsAddingEditLink(true)}
                    disabled={newlyAddedLinks.length >= MAX_LINKS}>
                    링크 추가
                  </Button>
                </Stack>
                {editingRequest?.newFiles && editingRequest.newFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      추가될 새 파일
                    </Typography>
                    <List>
                      {editingRequest.newFiles.map((file, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FileText size={14} />
                                {file.name}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => {
                                setEditingRequest(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    newFiles: prev.newFiles?.filter((_, i) => i !== index)
                                  };
                                });
                              }}>
                              <X size={16} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {isAddingEditLink && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      label="링크 제목"
                      size="small"
                      value={editingNewLink.urlDescription}
                      onChange={e =>
                        setEditingNewLink({ ...editingNewLink, urlDescription: e.target.value })
                      }
                    />
                    <TextField
                      label="URL"
                      size="small"
                      value={editingNewLink.urlAddress}
                      onChange={e =>
                        setEditingNewLink({ ...editingNewLink, urlAddress: e.target.value })
                      }
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddEditLink}
                      disabled={!editingNewLink.urlAddress || !editingNewLink.urlDescription}>
                      추가
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setIsAddingEditLink(false)}>
                      취소
                    </Button>
                  </Box>
                )}
                {newlyAddedLinks.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      추가된 새 링크
                    </Typography>
                    <List>
                      {newlyAddedLinks.map((link, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={link.urlDescription}
                            secondary={link.urlAddress}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveNewLink(index)}>
                              <X size={16} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => {
                  setIsEditing(false)
                  setEditingRequest(null)
                  setNewlyAddedLinks([])
                }}>
                  취소
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdateRequest}
                  disabled={!editForm.title || !editForm.content}>
                  수정
                </Button>
              </Box>
            </Box>
          ) : !isRejecting ? (
            <List>
              {requests.map(request => (
                <Paper
                  key={request.requestId}
                  elevation={0}
                  sx={{ 
                    mb: 2, 
                    p: 2.5,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 1
                    }
                  }}
                  onClick={() => handleRequestClick(request)}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5
                    }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1rem',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: 'text.primary'
                        }}>
                        {request.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <Chip
                          label={getStatusColor(request.status).label}
                          size="small"
                          sx={{
                            color: getStatusColor(request.status).color,
                            backgroundColor: getStatusColor(request.status).backgroundColor,
                            borderRadius: '16px',
                            height: '24px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        />
                        {request.status === 'PENDING' && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(request);
                            }}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.light'
                              }
                            }}>
                            <Edit2 size={14} />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest(request.requestId);
                          }}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.light'
                            }
                          }}>
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5
                      }}>
                      {request.content}
                    </Typography>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 3,
                        alignItems: 'center',
                        pt: 0.5
                      }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}>
                          작성자: {request.memberName}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}>
                        {new Date(request.createdAt).toLocaleString('ko-KR', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </Typography>
                      {(request.links?.length > 0 || request.files?.length > 0) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {request.links?.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LinkIcon size={12} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.75rem'
                                }}>
                                {request.links.length}
                              </Typography>
                            </Box>
                          )}
                          {request.files?.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FileText size={12} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.75rem'
                                }}>
                                {request.files.length}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          ) : (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="반려 사유"
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}>
                첨부파일 ({getFileCount(rejectionAttachments)}/10) 및 링크 (
                {getLinkCount(rejectionAttachments)}/10)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileText size={16} />}
                  size="small"
                  disabled={getFileCount(rejectionAttachments) >= MAX_FILES}>
                  파일 첨부
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={e => handleFileUpload(e, true)}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon size={16} />}
                  size="small"
                  onClick={() => setIsAddingLink(true)}
                  disabled={getLinkCount(rejectionAttachments) >= MAX_LINKS}>
                  링크 추가
                </Button>
              </Stack>
              {isAddingLink && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="링크 제목"
                    size="small"
                    value={newLink.title}
                    onChange={e =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                  />
                  <TextField
                    label="URL"
                    size="small"
                    value={newLink.url}
                    onChange={e =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddAttachment('link')}
                    disabled={!newLink.title || !newLink.url}>
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsAddingLink(false)}>
                    취소
                  </Button>
                </Box>
              )}
              <List>
                {rejectionAttachments.map(attachment => (
                  <ListItem
                    key={attachment.id}
                    sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={attachment.title}
                      secondary={
                        attachment.type === 'link'
                          ? attachment.url
                          : attachment.fileName
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          handleRemoveAttachment(attachment.id, true)
                        }>
                        <X size={16} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsRejecting(false)}>취소</Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRejectRequest}
                disabled={!rejectionReason}>
                반려
              </Button>
            </Box>
          </Box>
          )}

          {selectedRequest && (
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                응답 목록
              </Typography>

              {responses && responses.length > 0 ? (
                <Stack spacing={2}>
                  {responses.map((response: any) => (
                    <Paper
                      key={response.responseId}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {response.memberName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(response.createdAt).toLocaleString()}
                        </Typography>
                      </Box>

                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {response.comment}
                      </Typography>

                      {(response.links?.length > 0 || response.files?.length > 0) && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {response.links?.length > 0 && (
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>링크</Typography>
                              <List dense>
                                {response.links.map((link: any) => (
                                  <ListItem key={link.id} dense>
                                    <ListItemText
                                      primary={
                                        <Link
                                          href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          underline="hover"
                                          color="primary"
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                        >
                                          <LinkIcon size={14} />
                                          {link.urlDescription || link.urlAddress}
                                        </Link>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {response.files?.length > 0 && (
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>첨부파일</Typography>
                              <List dense>
                                {response.files.map((file: any) => (
                                  <ListItem key={file.id} dense>
                                    <ListItemText
                                      primary={
                                        <Link
                                          href={file.url}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          underline="hover"
                                          color="primary"
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                          onClick={(e) => {
                                            if (!file.url) {
                                              e.preventDefault();
                                              console.error('File URL is missing');
                                            }
                                          }}
                                        >
                                          <FileText size={14} />
                                          {file.name || '알 수 없는 파일'}
                                        </Link>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  아직 응답이 없습니다.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                setIsCreatingRequest(true);
                setIsRejecting(false);
                setError(null);
              }}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                '&:hover': {
                  bgcolor: '#F57C00'
                }
              }}
              disabled={!canCreateRequest()}>
              요청 추가
            </Button>
            <Button onClick={handleClose}>닫기</Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* API 응답 모달 */}
      <Dialog
        open={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">요청 결과</Typography>
            <IconButton onClick={() => setShowResponseModal(false)} size="small">
              <X size={16} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {apiResponse && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={apiResponse.status === 'success' ? 'success' : 'error'}>
                {apiResponse.message}
              </Alert>
              {apiResponse.status === 'success' && apiResponse.data && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>요청 상세 정보:</Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1" gutterBottom>제목: {apiResponse.data.title}</Typography>
                    <Typography variant="body1" gutterBottom>내용: {apiResponse.data.content}</Typography>
                    <Typography variant="body1" gutterBottom>상태: {apiResponse.data.status}</Typography>
                    {apiResponse.data.links && apiResponse.data.links.length > 0 && (
                      <>
                        <Typography variant="body1" gutterBottom>링크:</Typography>
                        <List dense>
                          {apiResponse.data.links.map((link: any, index: number) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={link.urlDescription}
                                secondary={link.urlAddress}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResponseModal(false)}>확인</Button>
        </DialogActions>
      </Dialog>

      {/* 요청 상세 조회 모달 */}
      <Dialog
        open={!!selectedRequest}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">요청 상세 정보</Typography>
            <IconButton onClick={handleCloseDetail} size="small">
              <X size={16} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6">{selectedRequest.title}</Typography>
                  <Chip
                    label={getStatusColor(selectedRequest.status).label}
                    sx={{
                      color: getStatusColor(selectedRequest.status).color,
                      bgcolor: getStatusColor(selectedRequest.status).backgroundColor,
                    }}
                    size="small"
                  />
                </Box>
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {selectedRequest.content}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {selectedRequest.links && selectedRequest.links.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>링크</Typography>
                    <List dense sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {selectedRequest.links.map((link, index) => (
                        <ListItem key={index} dense>
                          <ListItemText
                            primary={
                              <Link
                                href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color="primary"
                              >
                                {link.urlDescription}
                              </Link>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {selectedRequest.files && selectedRequest.files.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>첨부파일</Typography>
                    <List dense sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {selectedRequest.files.map((file, index) => {
                        console.log('Rendering file:', file);
                        return (
                          <ListItem key={file.id} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Link
                                  href={file.url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                  color="primary"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FileText size={14} />
                                  {file.name || '알 수 없는 파일'}
                                </Link>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  작성자: {selectedRequest.memberName}
                    </Typography>
                <Typography variant="body2" color="text.secondary">
                  작성일: {new Date(selectedRequest.createdAt).toLocaleString('ko-KR')}
                        </Typography>
              </Box>

              {requestResponse && (selectedRequest.status === 'APPROVED' || selectedRequest.status === 'REJECTED') && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                      {selectedRequest.status === 'APPROVED' ? '승인 정보' : '반려 정보'}
                    </Typography>
                    <Button
                      startIcon={<Edit2 size={14} />}
                      size="small"
                      onClick={() => handleEditResponseClick(requestResponse)}
                    >
                      수정
                    </Button>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {requestResponse.comment}
                  </Typography>

                  {requestResponse.links?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        링크 목록
                      </Typography>
                      <List>
                        {requestResponse.links.map((link: any) => (
                          <ListItem key={link.id} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Link
                                  href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                  color="primary"
                                >
                                  {link.urlDescription || link.urlAddress}
                                </Link>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteResponseLink(requestResponse.responseId, link.id)}
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {requestResponse.files?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        파일 목록
                      </Typography>
                      <List>
                        {requestResponse.files.map((file: any) => (
                          <ListItem key={file.id} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Link
                                  href={file.url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                  color="primary"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FileText size={14} />
                                  {file.name || '알 수 없는 파일'}
                                </Link>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteResponseFile(requestResponse.responseId, file.id)}
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    처리일: {new Date(requestResponse.createdAt).toLocaleString('ko-KR')}
                  </Typography>
                </Box>
              )}

              {selectedRequest.status === 'PENDING' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      handleRejectClick(selectedRequest.requestId);
                      handleCloseDetail();
                    }}>
                    반려
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleApproveClick(selectedRequest.requestId);
                      handleCloseDetail();
                    }}>
                    승인
                  </Button>
                    </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApproveRequest}>
            승인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 응답 수정 모달 */}
      <Dialog
        open={isEditingResponse}
        onClose={() => setIsEditingResponse(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">응답 수정</Typography>
            <IconButton onClick={() => setIsEditingResponse(false)} size="small">
              <X size={16} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
                        <Box sx={{ mt: 2 }}>
            <TextField
              label="코멘트"
              fullWidth
              multiline
              rows={4}
              value={editResponseForm.comment}
              onChange={(e) => setEditResponseForm(prev => ({ ...prev, comment: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                기존 첨부파일 및 링크
                          </Typography>

              {editingResponse?.links?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    링크 목록
                  </Typography>
                  <List>
                    {editingResponse.links.map((link: any) => (
                      <ListItem key={link.id} sx={{ py: 0.5 }}>
                                <ListItemText
                          primary={
                            <Link
                              href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                              underline="hover"
                              color="primary"
                            >
                              {link.urlDescription || link.urlAddress}
                            </Link>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteResponseLink(editingResponse.responseId, link.id)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

              {editingResponse?.files?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    파일 목록
                  </Typography>
                  <List>
                    {editingResponse.files.map((file: any) => {
                      console.log('Rendering file:', file);
                      return (
                        <ListItem key={file.id} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Link
                                href={file.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color="primary"
                    sx={{
                      display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FileText size={14} />
                                {file.name || '알 수 없는 파일'}
                              </Link>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => {
                                console.log('Delete button clicked for file:', file);
                                handleDeleteResponseFile(editingResponse.responseId, file.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                새로운 첨부
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button
                      variant="outlined"
                  component="label"
                  startIcon={<FileText size={16} />}
                  size="small"
                >
                  파일 첨부
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleEditResponseFileUpload}
                  />
                    </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon size={16} />}
                  size="small"
                  onClick={() => setIsAddingEditResponseLink(true)}
                >
                  링크 추가
                </Button>
              </Stack>

              {isAddingEditResponseLink && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="링크 제목"
                    size="small"
                    value={newEditResponseLink.urlDescription}
                    onChange={(e) =>
                      setNewEditResponseLink(prev => ({
                        ...prev,
                        urlDescription: e.target.value
                      }))
                    }
                  />
                  <TextField
                    label="URL"
                    size="small"
                    value={newEditResponseLink.urlAddress}
                    onChange={(e) =>
                      setNewEditResponseLink(prev => ({
                        ...prev,
                        urlAddress: e.target.value
                      }))
                    }
                  />
                    <Button
                      variant="contained"
                    onClick={handleAddEditResponseLink}
                    disabled={!newEditResponseLink.urlAddress || !newEditResponseLink.urlDescription}
                  >
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsAddingEditResponseLink(false);
                      setNewEditResponseLink({ urlAddress: '', urlDescription: '' });
                    }}
                  >
                    취소
                    </Button>
                  </Box>
                )}

              {/* 새로 추가된 링크 목록 표시 */}
              {editResponseForm.links.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    새로 추가된 링크
                  </Typography>
                  <List>
                    {editResponseForm.links.map((link, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={link.urlDescription}
                          secondary={link.urlAddress}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleRemoveEditResponseLink(index)}
                          >
                            <X size={16} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
            ))}
          </List>
                </Box>
              )}

              {/* 새로 추가된 파일 목록 표시 */}
              {editResponseForm.files.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    새로 추가된 파일
                  </Typography>
                  <List>
                    {editResponseForm.files.map((file, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={14} />
                              {file.name}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => {
                              setEditResponseForm(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X size={16} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Box>
      </DialogContent>
      <DialogActions>
          <Button onClick={() => setIsEditingResponse(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleEditResponse}
            disabled={!editResponseForm.comment}
          >
            수정
          </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default TaskRequestsModal
