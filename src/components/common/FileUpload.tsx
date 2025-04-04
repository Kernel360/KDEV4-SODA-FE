import React from 'react'
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import { Upload, X, File } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onFileAdd: (files: File[]) => void
  onFileRemove: (index: number) => void
  maxFiles?: number
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFileAdd,
  onFileRemove,
  maxFiles = 10
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (files.length + droppedFiles.length <= maxFiles) {
      onFileAdd(droppedFiles)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (files.length + selectedFiles.length <= maxFiles) {
        onFileAdd(selectedFiles)
      }
    }
  }

  return (
    <Box>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          textAlign: 'center',
          bgcolor: 'background.default',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main'
          }
        }}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          style={{ cursor: 'pointer' }}>
          <Upload />
          <Typography sx={{ mt: 1 }}>
            파일을 드래그하거나 클릭하여 업로드
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary">
            최대 {maxFiles}개 파일
          </Typography>
        </label>
      </Box>

      <List>
        {files.map((file, index) => (
          <ListItem key={index}>
            <File
              size={20}
              style={{ marginRight: 8 }}
            />
            <ListItemText
              primary={file.name}
              secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => onFileRemove(index)}
                size="small">
                <X size={20} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default FileUpload
