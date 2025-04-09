import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Link,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

interface TaskResponse {
  responseId: number;
  content: string;
  links: Array<{
    linkId: number;
    urlAddress: string;
    urlDescription: string;
  }>;
  files: Array<{
    fileId: number;
    fileName: string;
    fileUrl: string;
  }>;
}

interface TaskResponseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: TaskResponse | null;
  mode: 'create' | 'edit';
  onDeleteLink?: (linkId: number) => void;
  onDeleteFile?: (fileId: number) => void;
}

const TaskResponseModal: React.FC<TaskResponseModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  onDeleteLink,
  onDeleteFile,
}) => {
  const [content, setContent] = useState('');
  const [newLink, setNewLink] = useState({ urlAddress: '', urlDescription: '' });
  const [links, setLinks] = useState<Array<{ urlAddress: string; urlDescription: string }>>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingLinks, setExistingLinks] = useState<Array<{
    linkId: number;
    urlAddress: string;
    urlDescription: string;
  }>>([]);
  const [existingFiles, setExistingFiles] = useState<Array<{
    fileId: number;
    fileName: string;
    fileUrl: string;
  }>>([]);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setExistingLinks(initialData.links);
      setExistingFiles(initialData.files);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setContent('');
    setNewLink({ urlAddress: '', urlDescription: '' });
    setLinks([]);
    setFiles([]);
    setExistingLinks([]);
    setExistingFiles([]);
  };

  const handleSubmit = () => {
    const formData = {
      content,
      links: [
        ...links,
        ...existingLinks.map(({ urlAddress, urlDescription }) => ({
          urlAddress,
          urlDescription,
        })),
      ],
    };

    onSubmit(formData);
    resetForm();
  };

  const handleAddLink = () => {
    if (newLink.urlAddress) {
      setLinks([...links, { ...newLink }]);
      setNewLink({ urlAddress: '', urlDescription: '' });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const handleDeleteNewLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleDeleteExistingLink = (linkId: number) => {
    if (onDeleteLink) {
      onDeleteLink(linkId);
      setExistingLinks(existingLinks.filter((link) => link.linkId !== linkId));
    }
  };

  const handleDeleteExistingFile = (fileId: number) => {
    if (onDeleteFile) {
      onDeleteFile(fileId);
      setExistingFiles(existingFiles.filter((file) => file.fileId !== fileId));
    }
  };

  const handleDeleteNewFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? '응답 작성' : '응답 수정'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="내용"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {mode === 'edit' && (existingLinks.length > 0 || existingFiles.length > 0) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              기존 링크 및 파일
            </Typography>
            {existingLinks.map((link) => (
              <Box
                key={link.linkId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <LinkIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Link
                  href={link.urlAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ flex: 1, fontSize: '0.875rem' }}
                >
                  {link.urlDescription || link.urlAddress}
                </Link>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteExistingLink(link.linkId)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            {existingFiles.map((file) => (
              <Box
                key={file.fileId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <AttachFileIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Link
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ flex: 1, fontSize: '0.875rem' }}
                >
                  {file.fileName}
                </Link>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteExistingFile(file.fileId)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            새 링크 추가
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              label="URL"
              value={newLink.urlAddress}
              onChange={(e) =>
                setNewLink({ ...newLink, urlAddress: e.target.value })
              }
              sx={{ flex: 2 }}
            />
            <TextField
              size="small"
              label="설명"
              value={newLink.urlDescription}
              onChange={(e) =>
                setNewLink({ ...newLink, urlDescription: e.target.value })
              }
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddLink}
              disabled={!newLink.urlAddress}
            >
              추가
            </Button>
          </Box>

          {links.map((link, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <LinkIcon sx={{ mr: 1, fontSize: '1rem' }} />
              <Link
                href={link.urlAddress}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ flex: 1, fontSize: '0.875rem' }}
              >
                {link.urlDescription || link.urlAddress}
              </Link>
              <IconButton
                size="small"
                onClick={() => handleDeleteNewLink(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            파일 첨부
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
          >
            파일 선택
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileChange}
            />
          </Button>

          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <AttachFileIcon sx={{ mr: 1, fontSize: '1rem' }} />
              <Typography sx={{ flex: 1, fontSize: '0.875rem' }}>
                {file.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleDeleteNewFile(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {mode === 'create' ? '작성' : '수정'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskResponseModal; 