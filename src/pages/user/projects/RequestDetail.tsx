import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Link,
  Paper,
  IconButton,
  Container,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { ArrowBack, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { client } from '../../../api/client';
import { useToast } from '../../../contexts/ToastContext';
import { useUserStore } from '../../../stores/userStore';

interface RequestDetail {
  requestId: number;
  stageId: number;
  memberId: number;
  memberName: string;
  title: string;
  content: string;
  links: Array<{
    id: number;
    urlAddress: string;
    urlDescription: string;
  }>;
  files: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientCompanyId: number;
}

interface Response {
  responseId: number;
  requestId: number;
  memberId: number;
  memberName: string;
  comment: string;
  links: Array<{
    id: number;
    urlAddress: string;
    urlDescription: string;
  }>;
  files: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const RequestDetail = () => {
  const { projectId, requestId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUserStore();
  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResponseBoxOpen, setIsResponseBoxOpen] = useState(false);
  const [responseType, setResponseType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [editForm, setEditForm] = useState({
    title: '',
    content: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editLinks, setEditLinks] = useState<{ urlAddress: string; urlDescription: string; isNew: boolean; id?: number }[]>([]);
  const [newEditLink, setNewEditLink] = useState({ urlAddress: '', urlDescription: '' });
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [responseForm, setResponseForm] = useState({
    comment: '',
    files: [] as File[],
    links: [] as { urlAddress: string; urlDescription: string }[]
  });
  const [newResponseLink, setNewResponseLink] = useState({ urlAddress: '', urlDescription: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const responseFileInputRef = React.useRef<HTMLInputElement>(null);
  const [editingResponseId, setEditingResponseId] = useState<number | null>(null);
  const [editResponseForm, setEditResponseForm] = useState({
    comment: '',
    files: [] as File[],
    links: [] as { urlAddress: string; urlDescription: string }[]
  });
  const [newEditResponseLink, setNewEditResponseLink] = useState({ urlAddress: '', urlDescription: '' });
  const editResponseFileInputRef = React.useRef<HTMLInputElement>(null);

  // 권한 체크 함수
  const canApproveOrReject = () => {
    if (!user || !requestDetail) return false;
    return user.role === 'ADMIN' || 
           (user.company?.id === requestDetail.clientCompanyId);
  };

  useEffect(() => {
    console.log('Current user:', user);
    console.log('User memberId:', user?.memberId);
    console.log('User memberId type:', typeof user?.memberId);
    const fetchRequestDetail = async () => {
      if (!requestId) return;
      
      try {
        const [detailResponse, responsesResponse] = await Promise.all([
          client.get(`/requests/${requestId}`),
          client.get(`/requests/${requestId}/responses`)
        ]);

        if (detailResponse.data.status === 'success') {
          setRequestDetail(detailResponse.data.data);
        }

        if (responsesResponse.data.status === 'success') {
          setResponses(responsesResponse.data.data);
        }

        if (requestDetail) {
          setEditLinks(requestDetail.links.map(l => ({
            urlAddress: l.urlAddress,
            urlDescription: l.urlDescription,
            isNew: false,
            id: l.id
          })));
        }
      } catch (error) {
        console.error('Failed to fetch request details:', error);
      }
    };

    fetchRequestDetail();
  }, [requestId, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          color: '#16a34a',
          backgroundColor: '#dcfce7'
        };
      case 'REJECTED':
        return {
          color: '#dc2626',
          backgroundColor: '#fee2e2'
        };
      case 'PENDING':
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        };
      default:
        return {
          color: '#4b5563',
          backgroundColor: '#f3f4f6'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인';
      case 'REJECTED':
        return '거절';
      case 'PENDING':
        return '대기';
      default:
        return status;
    }
  };

  const handleEditClick = () => {
    setEditForm({
      title: requestDetail?.title || '',
      content: requestDetail?.content || ''
    });
    setEditLinks(requestDetail?.links.map(link => ({
      urlAddress: link.urlAddress,
      urlDescription: link.urlDescription,
      isNew: false,
      id: link.id
    })) || []);
    setEditFiles([]);
    setEditMode(true);
  };

  const handleEditLinkAdd = () => {
    if (!newEditLink.urlAddress.trim() || !newEditLink.urlDescription.trim()) return;
    setEditLinks(prev => [...prev, { ...newEditLink, isNew: true }]);
    setNewEditLink({ urlAddress: '', urlDescription: '' });
  };

  const handleEditLinkRemove = async (idx: number) => {
    const linkToRemove = editLinks[idx];
    
    if (!linkToRemove.isNew && linkToRemove.id) {
      try {
        const response = await client.delete(`/requests/${requestId}/links/${linkToRemove.id}`);
        if (response.data.status === 'success') {
          showToast('링크가 성공적으로 삭제되었습니다.', 'success');
        }
      } catch (error) {
        console.error('Failed to delete link:', error);
        showToast('링크 삭제 중 오류가 발생했습니다.', 'error');
        return;
      }
    }
    
    setEditLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleEditFileRemove = (idx: number) => {
    setEditFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditSubmit = async () => {
    try {
      // 1. 본문/링크 수정 - 새로 추가된 링크만 전송
      const response = await client.put(`/requests/${requestId}`, {
        title: editForm.title,
        content: editForm.content,
        links: editLinks.filter(link => link.isNew).map(({ urlAddress, urlDescription }) => ({
          urlAddress,
          urlDescription
        }))
      });

      // 2. 파일 업로드
      if (editFiles.length > 0) {
        const formData = new FormData();
        editFiles.forEach(file => formData.append('file', file));
        await client.post(`/requests/${requestId}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.status === 'success') {
        showToast('요청이 성공적으로 수정되었습니다.', 'success');
        setEditMode(false);
        // 새로고침하여 최신 데이터 반영
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update request:', error);
      showToast('요청 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await client.delete(`/requests/${requestId}`);

      if (response.data.status === 'success') {
        showToast('요청이 성공적으로 삭제되었습니다.', 'success');
        navigate(`/user/projects/${projectId}`);
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
      showToast('요청 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      const response = await client.delete(`/requests/${requestId}/files/${fileId}`);
      if (response.data.status === 'success') {
        showToast('파일이 성공적으로 삭제되었습니다.', 'success');
        // UI에서 파일 제거
        if (requestDetail) {
          setRequestDetail({
            ...requestDetail,
            files: requestDetail.files.filter(file => file.id !== fileId)
          });
        }
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      showToast('파일 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleResponseSubmit = async () => {
    try {
      if (!requestId || !projectId) return;

      // 1. 승인/거절 API 호출
      const endpoint = responseType === 'APPROVE' 
        ? `/requests/${requestId}/approval`
        : `/requests/${requestId}/rejection`;

      const response = await client.post(endpoint, {
        comment: responseForm.comment,
        projectId: Number(projectId),
        links: responseForm.links
      });

      if (response.data.status === 'success') {
        const responseId = response.data.data.responseId;

        // 2. 파일이 있다면 파일 업로드
        if (responseForm.files.length > 0) {
          const formData = new FormData();
          responseForm.files.forEach(file => {
            formData.append('file', file);
          });

          await client.post(
            `/responses/${responseId}/files`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        }

        showToast(`${responseType === 'APPROVE' ? '승인' : '거절'}이 완료되었습니다.`, 'success');
        setIsResponseBoxOpen(false);
        setResponseForm({
          comment: '',
          files: [],
          links: []
        });
        // 페이지 새로고침하여 최신 데이터 반영
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
      showToast(`${responseType === 'APPROVE' ? '승인' : '거절'} 처리 중 오류가 발생했습니다.`, 'error');
    }
  };

  const handleEditResponseClick = (response: Response) => {
    setEditingResponseId(response.responseId);
    setEditResponseForm({
      comment: response.comment,
      files: [],
      links: response.links.map(link => ({
        urlAddress: link.urlAddress,
        urlDescription: link.urlDescription,
        isNew: false,
        id: link.id
      }))
    });
  };

  const handleEditResponseSubmit = async () => {
    try {
      if (!requestId || !editingResponseId || !projectId) return;

      // 1. 응답 수정 API 호출
      const response = await client.put(`/responses/${editingResponseId}`, {
        comment: editResponseForm.comment,
        projectId: Number(projectId),
        links: editResponseForm.links.filter(link => !('id' in link)).map(({ urlAddress, urlDescription }) => ({
          urlAddress,
          urlDescription
        }))
      });

      if (response.data.status === 'success') {
        // 2. 파일이 있다면 파일 업로드
        if (editResponseForm.files.length > 0) {
          const formData = new FormData();
          editResponseForm.files.forEach(file => {
            formData.append('file', file);
          });

          await client.post(
            `/responses/${editingResponseId}/files`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        }

        showToast('응답이 성공적으로 수정되었습니다.', 'success');
        setEditingResponseId(null);
        setEditResponseForm({
          comment: '',
          files: [],
          links: []
        });
        // 페이지 새로고침하여 최신 데이터 반영
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update response:', error);
      showToast('응답 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    try {
      if (!requestId) return;

      const response = await client.delete(`/responses/${responseId}`);

      if (response.data.status === 'success') {
        showToast('응답이 성공적으로 삭제되었습니다.', 'success');
        // 페이지 새로고침하여 최신 데이터 반영
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete response:', error);
      showToast('응답 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleResponseLinkDelete = async (responseId: number, linkId: number) => {
    try {
      const response = await client.delete(`/responses/${responseId}/links/${linkId}`);
      if (response.data.status === 'success') {
        showToast('링크가 성공적으로 삭제되었습니다.', 'success');
        // UI에서 링크 제거
        setResponses(prevResponses => 
          prevResponses.map(resp => 
            resp.responseId === responseId 
              ? { ...resp, links: resp.links.filter(link => link.id !== linkId) }
              : resp
          )
        );
      }
    } catch (error) {
      console.error('Failed to delete response link:', error);
      showToast('링크 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleResponseFileDelete = async (responseId: number, fileId: number) => {
    try {
      const response = await client.delete(`/responses/${responseId}/files/${fileId}`);
      if (response.data.status === 'success') {
        showToast('파일이 성공적으로 삭제되었습니다.', 'success');
        // UI에서 파일 제거
        setResponses(prevResponses => 
          prevResponses.map(resp => 
            resp.responseId === responseId 
              ? { ...resp, files: resp.files.filter(file => file.id !== fileId) }
              : resp
          )
        );
      }
    } catch (error) {
      console.error('Failed to delete response file:', error);
      showToast('파일 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  if (!requestDetail) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 헤더 영역 */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              cursor: 'pointer'
            }
          }}
          onClick={() => navigate(`/user/projects/${projectId}`)}
        >
          <ArrowBack fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">프로젝트 대시보드로 돌아가기</Typography>
        </Box>
      </Box>

      {/* 요청 상세 정보 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {editMode ? (
          <>
            <TextField
              fullWidth
              label="제목"
              value={editForm.title}
              onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="내용"
              multiline
              rows={6}
              value={editForm.content}
              onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            {/* 링크와 파일을 가로로 배치 */}
            <Box sx={{ display: 'flex', gap: 4 }}>
              {/* 링크 수정/추가 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>첨부 링크</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="URL"
                    value={newEditLink.urlAddress}
                    onChange={e => setNewEditLink(prev => ({ ...prev, urlAddress: e.target.value }))}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    size="small"
                    placeholder="설명"
                    value={newEditLink.urlDescription}
                    onChange={e => setNewEditLink(prev => ({ ...prev, urlDescription: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                  <IconButton onClick={handleEditLinkAdd} color="primary" sx={{ border: '1px solid #eee' }}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <List>
                  {editLinks.map((link, idx) => (
                    <ListItem key={idx} secondaryAction={
                      <IconButton edge="end" onClick={() => handleEditLinkRemove(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText 
                        primary={
                          <Link
                            href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {link.urlDescription || link.urlAddress}
                          </Link>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* 파일 첨부 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>파일 첨부</Typography>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleEditFileChange}
                  multiple
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<AddIcon />}
                  sx={{ mb: 2 }}
                >
                  파일 선택
                </Button>
                <List>
                  {editFiles.map((file, idx) => (
                    <ListItem key={idx} secondaryAction={
                      <IconButton edge="end" onClick={() => handleEditFileRemove(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>
                {/* 기존 첨부파일 표시 */}
                {requestDetail.files.length > 0 && (
                  <List>
                    {requestDetail.files.map((file) => (
                      <ListItem 
                        key={file.id}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={() => handleFileDelete(file.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText 
                          primary={
                            <Link
                              component="button"
                              onClick={() => window.open(file.url, '_blank')}
                              sx={{ 
                                textAlign: 'left',
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {file.name}
                            </Link>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <>
            {/* 상단 정보 영역 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3
            }}>
              {/* 작성자 정보 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* 프로필 이미지 */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                      fill="#9CA3AF"
                    />
                  </svg>
                </Box>
                {/* 작성자명과 작성일 */}
                <Box>
                  <Typography fontWeight="medium">{requestDetail.memberName}</Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    {dayjs(requestDetail.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusText(requestDetail.status)}
                  sx={{
                    ...getStatusColor(requestDetail.status),
                    fontWeight: 600,
                    px: 2,
                    height: 32,
                    ml: 1
                  }}
                />
              </Box>

              {/* 수정/삭제 버튼 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {user?.memberId === requestDetail.memberId && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    수정
                  </Button>
                )}
              </Box>
            </Box>

            {/* 제목 */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                mb: 3,
                color: 'text.primary'
              }}
            >
              {requestDetail.title}
            </Typography>

            {/* 내용 */}
            <Typography 
              sx={{ 
                whiteSpace: 'pre-wrap',
                mb: 4,
                lineHeight: 1.8,
                color: 'text.primary'
              }}
            >
              {requestDetail.content}
            </Typography>

            {/* 구분선 */}
            <Box 
              sx={{ 
                borderBottom: '1px solid',
                borderColor: '#e5e7eb',
                mb: 4
              }} 
            />

            {/* 링크와 파일을 가로로 배치 */}
            <Box sx={{ display: 'flex', gap: 4 }}>
              {/* 첨부 링크 */}
              <Box sx={{ flex: 1 }}>
                {requestDetail.links.length > 0 && (
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        mb: 1.5,
                        fontWeight: 600,
                        color: 'text.secondary'
                      }}
                    >
                      첨부 링크
                    </Typography>
                    {requestDetail.links.map((link) => (
                      <Box
                        key={link.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1
                        }}
                      >
                        <Link
                          href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {link.urlDescription || link.urlAddress}
                        </Link>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* 첨부 파일 */}
              <Box sx={{ flex: 1 }}>
                {requestDetail.files.length > 0 && (
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        mb: 1.5,
                        fontWeight: 600,
                        color: 'text.secondary'
                      }}
                    >
                      첨부 파일
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {requestDetail.files.map((file) => (
                        <ListItem 
                          key={file.id}
                          sx={{
                            px: 0,
                            py: 0.5,
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <ListItemText 
                            primary={
                              <Link
                                component="button"
                                onClick={() => window.open(file.url, '_blank')}
                                sx={{ 
                                  textAlign: 'left',
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {file.name}
                              </Link>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* 수정 모드일 때 저장/취소 버튼 */}
      {editMode && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setEditMode(false);
              setIsDeleteDialogOpen(false);
            }}
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            승인요청 수정 취소하기
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
          >
            저장
          </Button>
          {user?.memberId === requestDetail.memberId && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setIsDeleteDialogOpen(true)}
              sx={{ ml: 2 }}
            >
              삭제
            </Button>
          )}
        </Box>
      )}

      {/* 응답 내역 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            fontWeight: 700,
            color: 'text.primary'
          }}
        >
          응답 내역
        </Typography>
        
        {responses.length === 0 ? (
          <Box 
            sx={{ 
              py: 6,
              textAlign: 'center',
              bgcolor: 'grey.50',
              borderRadius: 1
            }}
          >
            <Typography color="text.secondary">
              아직 응답이 없습니다.
            </Typography>
          </Box>
        ) : (
          responses.map((response, index) => {
            console.log('Response member ID:', response.memberId, 'type:', typeof response.memberId);
            console.log('User memberId for comparison:', user?.memberId);
            console.log('User object:', user);
            console.log('Comparison result:', user?.memberId === response.memberId);
            
            return (
              <Box
                key={response.responseId}
                sx={{
                  mb: index !== responses.length - 1 ? 3 : 0,
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                {/* 응답 헤더 */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2 
                }}>
                  {/* 왼쪽: 작성자 정보 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
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
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      {dayjs(response.createdAt).format('YYYY-MM-DD HH:mm')}
                    </Typography>
                  </Box>

                  {/* 오른쪽: 수정/삭제 버튼 */}
                  {user?.memberId === response.memberId && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleEditResponseClick(response)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleDeleteResponse(response.responseId)}
                      >
                        삭제
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* 응답 내용 */}
                {editingResponseId === response.responseId ? (
                  <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      {response.status === 'APPROVED' ? '승인 코멘트' : '거절 사유'} 수정
                    </Typography>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder={response.status === 'APPROVED' ? '승인 코멘트를 입력해주세요' : '거절 사유를 입력해주세요'}
                      value={editResponseForm.comment}
                      onChange={(e) => setEditResponseForm(prev => ({ ...prev, comment: e.target.value }))}
                      sx={{ mb: 3 }}
                    />

                    {/* 링크 추가 */}
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>첨부 링크</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        placeholder="URL"
                        value={newEditResponseLink.urlAddress}
                        onChange={e => setNewEditResponseLink(prev => ({ ...prev, urlAddress: e.target.value }))}
                        sx={{ flex: 2 }}
                      />
                      <TextField
                        size="small"
                        placeholder="설명"
                        value={newEditResponseLink.urlDescription}
                        onChange={e => setNewEditResponseLink(prev => ({ ...prev, urlDescription: e.target.value }))}
                        sx={{ flex: 1 }}
                      />
                      <IconButton 
                        onClick={() => {
                          if (newEditResponseLink.urlAddress && newEditResponseLink.urlDescription) {
                            setEditResponseForm(prev => ({
                              ...prev,
                              links: [...prev.links, newEditResponseLink]
                            }));
                            setNewEditResponseLink({ urlAddress: '', urlDescription: '' });
                          }
                        }} 
                        color="primary" 
                        sx={{ border: '1px solid #eee' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <List>
                      {editResponseForm.links.map((link, idx) => (
                        <ListItem key={idx} secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={async () => {
                              // 기존 링크인 경우 API 호출
                              if ('id' in link) {
                                try {
                                  const response = await client.delete(`/responses/${editingResponseId}/links/${link.id}`);
                                  if (response.data.status === 'success') {
                                    showToast('링크가 성공적으로 삭제되었습니다.', 'success');
                                  }
                                } catch (error) {
                                  console.error('Failed to delete response link:', error);
                                  showToast('링크 삭제 중 오류가 발생했습니다.', 'error');
                                  return;
                                }
                              }
                              // UI에서 링크 제거
                              setEditResponseForm(prev => ({
                                ...prev,
                                links: prev.links.filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }>
                          <ListItemText primary={link.urlDescription} secondary={link.urlAddress} />
                        </ListItem>
                      ))}
                    </List>

                    {/* 파일 첨부 */}
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>파일 첨부</Typography>
                    <input
                      type="file"
                      ref={editResponseFileInputRef}
                      onChange={(e) => {
                        if (e.target.files) {
                          setEditResponseForm(prev => ({
                            ...prev,
                            files: [...prev.files, ...Array.from(e.target.files!)]
                          }));
                        }
                      }}
                      multiple
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => editResponseFileInputRef.current?.click()}
                      startIcon={<AddIcon />}
                      sx={{ mb: 2 }}
                    >
                      파일 선택
                    </Button>
                    <List>
                      {editResponseForm.files.map((file, idx) => (
                        <ListItem key={idx} secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={() => {
                              setEditResponseForm(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }>
                          <ListItemText primary={file.name} />
                        </ListItem>
                      ))}
                    </List>

                    {/* 기존 첨부 파일 목록 */}
                    {response.files && response.files.length > 0 && (
                      <List>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                          기존 첨부 파일
                        </Typography>
                        {response.files.map((file) => (
                          <ListItem 
                            key={file.id}
                            sx={{
                              px: 0,
                              py: 0.5,
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}
                          >
                            <ListItemText 
                              primary={
                                <Link
                                  component="button"
                                  onClick={() => window.open(file.url, '_blank')}
                                  sx={{ 
                                    textAlign: 'left',
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                >
                                  {file.name}
                                </Link>
                              }
                            />
                            {editingResponseId === response.responseId && user?.memberId === response.memberId && (
                              <IconButton
                                size="small"
                                onClick={() => handleResponseFileDelete(response.responseId, file.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingResponseId(null);
                          setEditResponseForm({
                            comment: '',
                            files: [],
                            links: []
                          });
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        color={response.status === 'APPROVED' ? 'success' : 'error'}
                        onClick={handleEditResponseSubmit}
                      >
                        {response.status === 'APPROVED' ? '승인하기' : '거절하기'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        mb: 2,
                        lineHeight: 1.8,
                        color: 'text.primary'
                      }}
                    >
                      {response.comment}
                    </Typography>

                    {/* 링크와 파일을 가로로 배치 */}
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      {/* 첨부 링크 */}
                      <Box sx={{ flex: 1 }}>
                        {response.links.length > 0 && (
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                mb: 1.5,
                                fontWeight: 600,
                                color: 'text.secondary'
                              }}
                            >
                              첨부 링크
                            </Typography>
                            {response.links.map((link) => (
                              <Box
                                key={link.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mb: 1
                                }}
                              >
                                <Link
                                  href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                >
                                  {link.urlDescription || link.urlAddress}
                                </Link>
                                {editingResponseId === response.responseId && user?.memberId === response.memberId && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleResponseLinkDelete(response.responseId, link.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>

                      {/* 첨부 파일 */}
                      <Box sx={{ flex: 1 }}>
                        {response.files && response.files.length > 0 && (
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                mb: 1.5,
                                fontWeight: 600,
                                color: 'text.secondary'
                              }}
                            >
                              첨부 파일
                            </Typography>
                            <List sx={{ p: 0 }}>
                              {response.files.map((file) => (
                                <ListItem 
                                  key={file.id}
                                  sx={{
                                    px: 0,
                                    py: 0.5,
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <ListItemText 
                                    primary={
                                      <Link
                                        component="button"
                                        onClick={() => window.open(file.url, '_blank')}
                                        sx={{ 
                                          textAlign: 'left',
                                          color: 'primary.main',
                                          textDecoration: 'none',
                                          '&:hover': {
                                            textDecoration: 'underline'
                                          }
                                        }}
                                      >
                                        {file.name}
                                      </Link>
                                    }
                                  />
                                  {editingResponseId === response.responseId && user?.memberId === response.memberId && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleResponseFileDelete(response.responseId, file.id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            );
          })
        )}

        {/* 응답 박스 */}
        {requestDetail?.status === 'PENDING' && canApproveOrReject() && (
          <Box sx={{ mt: 4 }}>
            {!isResponseBoxOpen ? (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setResponseType('APPROVE');
                    setIsResponseBoxOpen(true);
                  }}
                >
                  승인하기
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setResponseType('REJECT');
                    setIsResponseBoxOpen(true);
                  }}
                >
                  거절하기
                </Button>
              </Box>
            ) : (
              <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {responseType === 'APPROVE' ? '승인 코멘트' : '거절 사유'} 작성
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={responseType === 'APPROVE' ? '승인 코멘트를 입력해주세요' : '거절 사유를 입력해주세요'}
                  value={responseForm.comment}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, comment: e.target.value }))}
                  sx={{ mb: 3 }}
                />

                {/* 링크 추가 */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>첨부 링크</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="URL"
                    value={newResponseLink.urlAddress}
                    onChange={e => setNewResponseLink(prev => ({ ...prev, urlAddress: e.target.value }))}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    size="small"
                    placeholder="설명"
                    value={newResponseLink.urlDescription}
                    onChange={e => setNewResponseLink(prev => ({ ...prev, urlDescription: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                  <IconButton 
                    onClick={() => {
                      if (newResponseLink.urlAddress && newResponseLink.urlDescription) {
                        setResponseForm(prev => ({
                          ...prev,
                          links: [...prev.links, newResponseLink]
                        }));
                        setNewResponseLink({ urlAddress: '', urlDescription: '' });
                      }
                    }} 
                    color="primary" 
                    sx={{ border: '1px solid #eee' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <List>
                  {responseForm.links.map((link, idx) => (
                    <ListItem key={idx} secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => {
                          setResponseForm(prev => ({
                            ...prev,
                            links: prev.links.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText primary={link.urlDescription} secondary={link.urlAddress} />
                    </ListItem>
                  ))}
                </List>

                {/* 파일 첨부 */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>파일 첨부</Typography>
                <input
                  type="file"
                  ref={responseFileInputRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      setResponseForm(prev => ({
                        ...prev,
                        files: [...prev.files, ...Array.from(e.target.files!)]
                      }));
                    }
                  }}
                  multiple
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => responseFileInputRef.current?.click()}
                  startIcon={<AddIcon />}
                  sx={{ mb: 2 }}
                >
                  파일 선택
                </Button>
                <List>
                  {responseForm.files.map((file, idx) => (
                    <ListItem key={idx} secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => {
                          setResponseForm(prev => ({
                            ...prev,
                            files: prev.files.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsResponseBoxOpen(false);
                      setResponseForm({
                        comment: '',
                        files: [],
                        links: []
                      });
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    color={responseType === 'APPROVE' ? 'success' : 'error'}
                    onClick={handleResponseSubmit}
                  >
                    {responseType === 'APPROVE' ? '승인하기' : '거절하기'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>요청 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 요청을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">삭제</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RequestDetail; 