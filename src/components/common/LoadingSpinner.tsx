import React from 'react'
import { Box, CircularProgress } from '@mui/material'

interface LoadingSpinnerProps {
  size?: number
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '200px'
      }}>
      <CircularProgress size={size} />
    </Box>
  )
}

export default LoadingSpinner
