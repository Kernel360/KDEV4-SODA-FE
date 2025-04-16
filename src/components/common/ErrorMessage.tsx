import React from 'react'
import { Box, Button } from '@mui/material'
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
      <Box
        sx={{
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'error.main',
          textAlign: 'center'
        }}>
        {message}
      </Box>
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
