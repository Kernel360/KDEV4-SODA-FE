import React, { createContext, useContext, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  onClick?: () => void
  duration?: number
}

interface ToastContextType {
  showToast: (
    message: string,
    type: ToastType,
    duration?: number,
    options?: ToastOptions
  ) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<ToastType>('info')
  const [duration, setDuration] = useState(1000)
  const [options, setOptions] = useState<ToastOptions>({})

  const showToast = (
    message: string,
    type: ToastType,
    duration: number = 1000,
    options?: ToastOptions
  ) => {
    setMessage(message)
    setType(type)
    setDuration(duration)
    setOptions(options || {})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleClick = () => {
    if (options.onClick) {
      options.onClick()
    }
    handleClose()
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert
          onClose={handleClose}
          onClick={handleClick}
          severity={type}
          sx={{
            width: '100%',
            cursor: options.onClick ? 'pointer' : 'default'
          }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export default ToastProvider
