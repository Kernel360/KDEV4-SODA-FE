import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Link,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import TaskResponseModal from './TaskResponseModal';

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
  createdAt: string;
  updatedAt: string;
}

interface TaskResponseListProps {
  responses: TaskResponse[];
  onDeleteResponse: (responseId: number) => void;
  onUpdateResponse: (responseId: number, data: any) => void;
}

const TaskResponseList: React.FC<TaskResponseListProps> = ({
  responses,
  onDeleteResponse,
  onUpdateResponse,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<TaskResponse | null>(null);

  const handleEditClick = (response: TaskResponse) => {
    setSelectedResponse(response);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedResponse(null);
  };

  const handleEditSubmit = (data: any) => {
    if (selectedResponse) {
      onUpdateResponse(selectedResponse.responseId, data);
    }
    handleEditModalClose();
  };

  return (
    <Box>
      {responses.map((response) => (
        <Paper
          key={response.responseId}
          sx={{
            p: 2,
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateY(-2px)',
              transition: 'transform 0.2s ease-in-out',
              boxShadow: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {response.content}
              </Typography>
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => handleEditClick(response)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteResponse(response.responseId)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {(response.links.length > 0 || response.files.length > 0) && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {response.links.length > 0 && (
                  <Chip
                    icon={<LinkIcon />}
                    label={`${response.links.length}개의 링크`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {response.files.length > 0 && (
                  <Chip
                    icon={<AttachFileIcon />}
                    label={`${response.files.length}개의 파일`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            {response.links.map((link) => (
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
                  href={link.urlAddress.startsWith('http') ? link.urlAddress : `https://${link.urlAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="primary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {link.urlDescription || link.urlAddress}
                </Link>
              </Box>
            ))}
            {response.files.map((file) => (
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
                  color="primary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {file.fileName}
                </Link>
              </Box>
            ))}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 2 }}
          >
            {formatDistanceToNow(new Date(response.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </Typography>
        </Paper>
      ))}

      <TaskResponseModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditSubmit}
        initialData={selectedResponse}
        mode="edit"
      />
    </Box>
  );
};

export default TaskResponseList; 