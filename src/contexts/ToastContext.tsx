import React, { createContext, useContext, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  onClick?: () => void
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: ToastOptions) => void
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
  const [options, setOptions] = useState<ToastOptions>({})

  const showToast = (message: string, type: ToastType, options?: ToastOptions) => {
    setMessage(message)
    setType(type)
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
        autoHideDuration={3000}
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
