import React from 'react'
import { Box, Typography, Button, Stack } from '@mui/material'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onChange,
  maxFiles = 5
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    if (files.length + newFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
      return
    }
    onChange([...files, ...newFiles])
  }

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1 }}>
        첨부파일
      </Typography>
      <Stack spacing={1}>
        {files.map((file, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1}>
            <Typography variant="body2">{file.name}</Typography>
            <Button
              size="small"
              onClick={() => handleRemove(index)}>
              삭제
            </Button>
          </Stack>
        ))}
        {files.length < maxFiles && (
          <Button
            component="label"
            startIcon={<Upload size={16} />}>
            파일 선택
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileChange}
            />
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default FileUpload
