import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Link,
  Button,
  Divider,
  IconButton
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import dayjs from 'dayjs'
import { client } from '../../api/client'
import { useToast } from '../../contexts/ToastContext'

interface RequestDetail {
  requestId: number
  stageId: number
  memberId: number
  memberName: string
  title: string
  content: string
  links: Array<{
    id: number
    urlAddress: string
    urlDescription: string
  }>
  files: Array<{
    id: number
    name: string
    url: string
  }>
  status: string
  createdAt: string
  updatedAt: string
}

interface RejectFormData {
  reason: string
  attachments?: File[]
  links?: string[]
}

interface RequestDetailModalProps {
  open: boolean
  onClose: () => void
  requestId: number | null
}

interface Response {
  responseId: number
  requestId: number
  memberId: number
  memberName: string
  comment: string
  links: Array<{
    id: number
    urlAddress: string
    urlDescription: string
  }>
  files: any[]
  status: string
  createdAt: string
  updatedAt: string
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  open,
  onClose,
  requestId
}) => {
  const { showToast } = useToast()
  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectForm] = useState<RejectFormData>({
    reason: ''
  })

  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!requestId) return
      
      try {
        const [detailResponse, responsesResponse] = await Promise.all([
          client.get(`/requests/${requestId}`),
          client.get(`/requests/${requestId}/responses`)
        ])

        if (detailResponse.data.status === 'success') {
          setRequestDetail(detailResponse.data.data)
        }

        if (responsesResponse.data.status === 'success') {
          setResponses(responsesResponse.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch request details:', error)
      }
    }

    if (open && requestId) {
      fetchRequestDetail()
    }
  }, [open, requestId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          color: '#16a34a',
          backgroundColor: '#dcfce7'
        }
      case 'REJECTED':
        return {
          color: '#dc2626',
          backgroundColor: '#fee2e2'
        }
      case 'PENDING':
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        }
      default:
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인'
      case 'REJECTED':
        return '거절'
      case 'PENDING':
        return '대기'
      default:
        return status
    }
  }

  const handleApprove = async () => {
    try {
      await client.post(`/requests/${requestDetail?.requestId}/approve`)
      showToast('요청이 승인되었습니다.', 'success')
      onClose()
    } catch (error) {
      console.error('Failed to approve request:', error)
      showToast('요청 승인 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleReject = async () => {
    if (!isRejecting) {
      setIsRejecting(true)
      return
    }

    try {
      await client.post(`/requests/${requestDetail?.requestId}/reject`, rejectForm)
      showToast('요청이 반려되었습니다.', 'success')
      setIsRejecting(false)
      onClose()
    } catch (error) {
      console.error('Failed to reject request:', error)
      showToast('요청 반려 중 오류가 발생했습니다.', 'error')
    }
  }

  if (!requestDetail) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #E0E0E0',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {requestDetail.title}
          </Typography>
          <Chip
            label={getStatusText(requestDetail.status)}
            sx={{
              ...getStatusColor(requestDetail.status),
              fontWeight: 600
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              작성자: {requestDetail.memberName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              작성일: {dayjs(requestDetail.createdAt).format('YYYY-MM-DD HH:mm')}
            </Typography>
          </Box>
          <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {requestDetail.content}
          </Typography>
          {requestDetail.links.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                첨부 링크
              </Typography>
              {requestDetail.links.map((link) => (
                <Link
                  key={link.id}
                  href={link.urlAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  {link.urlDescription || link.urlAddress}
                </Link>
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          응답 내역
        </Typography>
        
        {responses.length === 0 ? (
          <Typography color="text.secondary">
            아직 응답이 없습니다.
          </Typography>
        ) : (
          responses.map((response, index) => (
            <Box
              key={response.responseId}
              sx={{
                mb: index !== responses.length - 1 ? 3 : 0,
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {response.memberName}
                  </Typography>
                  <Chip
                    label={getStatusText(response.status)}
                    size="small"
                    sx={{
                      ...getStatusColor(response.status),
                      fontWeight: 600
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(response.createdAt).format('YYYY-MM-DD HH:mm')}
                </Typography>
              </Box>
              <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {response.comment}
              </Typography>
              {response.links.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    첨부 링크
                  </Typography>
                  {response.links.map((link) => (
                    <Link
                      key={link.id}
                      href={link.urlAddress}
                      target="_blank"
                      rel="noopener noreferrer"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      {link.urlDescription || link.urlAddress}
                    </Link>
                  ))}
                </Box>
              )}
            </Box>
          ))
        )}

        {requestDetail.status === '승인대기중' && (
          <>
            <Button
              onClick={handleReject}
              color="error"
              variant={isRejecting ? 'contained' : 'outlined'}
              disabled={isRejecting && !rejectForm.reason}
              sx={{ mt: 2 }}
            >
              {isRejecting ? '반려하기' : '반려'}
            </Button>
            {!isRejecting && (
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={{ mt: 2 }}
              >
                승인
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RequestDetailModal
