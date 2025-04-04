import React from 'react'
import { DatePicker } from '@mui/x-date-pickers'
import { FormControl, FormHelperText } from '@mui/material'
import { Dayjs } from 'dayjs'

export interface FormDatePickerProps {
  label: string
  value: Dayjs | null
  onChange: (value: Dayjs | null) => void
  minDate?: Dayjs
  error?: boolean
  helperText?: string
  required?: boolean
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  error,
  helperText,
  required
}) => {
  return (
    <FormControl
      fullWidth
      error={error}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        format="YYYY.MM.DD"
        slotProps={{
          textField: {
            required,
            error,
            sx: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              }
            }
          }
        }}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default FormDatePicker
