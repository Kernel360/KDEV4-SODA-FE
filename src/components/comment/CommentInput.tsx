import React, { useState } from 'react'
import { Box, TextField, Button, Stack } from '@mui/material'
import { Send, X } from 'lucide-react'

interface CommentInputProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit: (content: string) => void
  onCancel?: () => void
  placeholder?: string
  submitText?: string
  sx?: any
}

const CommentInput: React.FC<CommentInputProps> = ({
  value: externalValue,
  onChange: externalOnChange,
  onSubmit,
  onCancel,
  placeholder = '댓글을 입력하세요',
  submitText = '작성',
  sx
}) => {
  const [internalValue, setInternalValue] = useState('')
  const value = externalValue ?? internalValue
  const onChange = externalOnChange ?? setInternalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value)
      if (!externalValue) {
        setInternalValue('')
      }
    }
  }

  return (
    <Box sx={{ ...sx }}>
      <Stack
        direction="row"
        spacing={1}>
        <TextField
          fullWidth
          multiline
          rows={1}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Stack
          direction="row"
          spacing={0.5}>
          {onCancel && (
            <Button
              size="small"
              variant="outlined"
              onClick={onCancel}
              startIcon={<X size={16} />}>
              취소
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={handleSubmit}
            startIcon={<Send size={16} />}>
            {submitText}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default CommentInput
