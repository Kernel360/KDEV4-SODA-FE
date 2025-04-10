import React, { useState } from 'react'
import { Box, Typography, IconButton, Tooltip, Paper, Collapse, Divider, Button } from '@mui/material'
import { Edit, Trash2, ChevronDown, ChevronUp, Check, X, Clock, User, Link as LinkIcon, FileText } from 'lucide-react'
import type { TaskRequest } from '../../types/request'

interface RequestListProps {
  requests: TaskRequest[]
  onRequestClick: (request: TaskRequest) => void
  onEdit: (request: TaskRequest) => void
  onDelete: (request: TaskRequest) => void
  onApprove: (request: TaskRequest) => void
  onReject: (request: TaskRequest) => void
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  onRequestClick,
  onEdit,
  onDelete,
  onApprove,
  onReject
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인됨'
      case 'REJECTED':
        return '반려됨'
      default:
        return '대기중'
    }
  }

  const handleRequestClick = (request: TaskRequest) => {
    setExpandedId(expandedId === request.requestId ? null : request.requestId)
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">등록된 요청이 없습니다.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {requests.map((request) => (
        <Paper
          key={request.requestId}
          elevation={1}
          sx={{
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => handleRequestClick(request)}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1">{request.title}</Typography>
                <Typography
                  variant="caption"
                  color={getStatusColor(request.status)}
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: `${getStatusColor(request.status)}.light`,
                    color: `${getStatusColor(request.status)}.dark`
                  }}>
                  {getStatusText(request.status)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {request.content}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <User size={14} />
                  <Typography variant="caption" color="text.secondary">
                    {request.requester?.name || '알 수 없음'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={14} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(request.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              {expandedId === request.requestId ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Box>
          </Box>
          <Collapse in={expandedId === request.requestId}>
            <Divider />
            <Box sx={{ px: 2, py: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {request.content}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3 }}>
                {request.links && request.links.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LinkIcon size={16} />
                      <Typography variant="subtitle2">첨부 링크</Typography>
                    </Box>
                    {request.links.map((link, index) => (
                      <Box key={index} sx={{ mb: 1, pl: 3 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>{link.urlDescription}</Typography>
                        <Typography
                          variant="caption"
                          color="primary"
                          component="a"
                          href={link.urlAddress}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}>
                          {link.urlAddress}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {request.files && request.files.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FileText size={16} />
                      <Typography variant="subtitle2">첨부 파일</Typography>
                    </Box>
                    {request.files.map((file, index) => (
                      <Box key={index} sx={{ mb: 1, pl: 3 }}>
                        <Typography
                          variant="body2"
                          color="primary"
                          component="a"
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}>
                          {file.fileName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {request.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<X size={16} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onReject(request)
                      }}>
                      반려
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Check size={16} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onApprove(request)
                      }}>
                      승인
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Edit size={16} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(request)
                  }}>
                  수정
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 size={16} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(request)
                  }}>
                  삭제
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  )
}

export default RequestList 