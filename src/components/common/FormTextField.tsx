import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'

interface FormTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  error?: boolean
  helperText?: string
}

const FormTextField: React.FC<FormTextFieldProps> = ({
  error,
  helperText,
  ...props
}) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      size="medium"
      error={error}
      helperText={helperText}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'white'
        }
      }}
      {...props}
    />
  )
}

export default FormTextField
