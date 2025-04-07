import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100%',
        height: '100%',
        minHeight: '200px'
      }}>
      <AlertTriangle
        size={48}
        color="error"
      />
      <Typography
        variant="h6"
        color="error"
        align="center">
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          color="primary"
          onClick={onRetry}
          startIcon={<RefreshCw size={16} />}>
          다시 시도
        </Button>
      )}
    </Box>
  )
}

export default ErrorMessage
