import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import TaskResponseList from './TaskResponseList';
import TaskResponseModal from './TaskResponseModal';
import {
  getTaskResponses,
  createTaskResponse,
  updateTaskResponse,
  deleteTaskResponse,
  uploadResponseFiles,
  deleteResponseLink,
  deleteResponseFile,
} from '../../api/task';

interface TaskDetailProps {
  taskId: number;
  // ... existing props ...
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId /* ... other props */ }) => {
  // ... existing state ...
  const [responses, setResponses] = useState<any[]>([]);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  // ... existing useEffect ...

  useEffect(() => {
    fetchResponses();
  }, [taskId]);

  const fetchResponses = async () => {
    try {
      const response = await getTaskResponses(taskId);
      setResponses(response.data);
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      // TODO: 에러 처리
    }
  };

  const handleCreateResponse = async (data: any) => {
    try {
      const response = await createTaskResponse(taskId, data);
      
      if (data.files?.length > 0) {
        await uploadResponseFiles(response.data.responseId, data.files);
      }

      await fetchResponses();
      setResponseModalOpen(false);
    } catch (error) {
      console.error('Failed to create response:', error);
      // TODO: 에러 처리
    }
  };

  const handleUpdateResponse = async (responseId: number, data: any) => {
    try {
      await updateTaskResponse(responseId, data);
      
      if (data.files?.length > 0) {
        await uploadResponseFiles(responseId, data.files);
      }

      await fetchResponses();
      setSelectedResponse(null);
    } catch (error) {
      console.error('Failed to update response:', error);
      // TODO: 에러 처리
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    try {
      await deleteTaskResponse(responseId);
      await fetchResponses();
    } catch (error) {
      console.error('Failed to delete response:', error);
      // TODO: 에러 처리
    }
  };

  const handleDeleteResponseLink = async (responseId: number, linkId: number) => {
    try {
      await deleteResponseLink(responseId, linkId);
      await fetchResponses();
    } catch (error) {
      console.error('Failed to delete response link:', error);
      // TODO: 에러 처리
    }
  };

  const handleDeleteResponseFile = async (responseId: number, fileId: number) => {
    try {
      await deleteResponseFile(responseId, fileId);
      await fetchResponses();
    } catch (error) {
      console.error('Failed to delete response file:', error);
      // TODO: 에러 처리
    }
  };

  return (
    <Box>
      {/* ... existing JSX ... */}
      
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">응답</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setResponseModalOpen(true)}
          >
            응답 작성
          </Button>
        </Box>

        <TaskResponseList
          responses={responses}
          onDeleteResponse={handleDeleteResponse}
          onUpdateResponse={handleUpdateResponse}
        />

        <TaskResponseModal
          open={responseModalOpen}
          onClose={() => setResponseModalOpen(false)}
          onSubmit={handleCreateResponse}
          mode="create"
        />
      </Box>
    </Box>
  );
};

export default TaskDetail; 