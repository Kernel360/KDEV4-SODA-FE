import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectProps,
  FormHelperText
} from '@mui/material'

interface Option {
  value: string | number
  label: string
}

interface FormSelectProps extends Omit<SelectProps, 'variant'> {
  label: string
  options: Option[]
  error?: boolean
  helperText?: string
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  error,
  helperText,
  ...props
}) => {
  return (
    <FormControl
      fullWidth
      error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        variant="outlined"
        label={label}
        sx={{
          backgroundColor: 'white'
        }}
        {...props}>
        {options.map(option => (
          <MenuItem
            key={option.value}
            value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default FormSelect
