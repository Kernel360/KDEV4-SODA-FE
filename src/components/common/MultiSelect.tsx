import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material'
import { X, Check, UserPlus, UserMinus } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  error?: boolean
  helperText?: string
  required?: boolean
  variant?: 'select' | 'employee-list'
  onAssignRole?: (employeeId: string, role: 'manager' | 'participant') => void
  selectedEmployees?: {
    managers: string[]
    participants: string[]
  }
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  required,
  variant = 'select',
  onAssignRole,
  selectedEmployees = { managers: [], participants: [] }
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onChange(typeof value === 'string' ? [value] : value)
  }

  const handleRemove = (itemToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onChange(value.filter(item => item !== itemToRemove))
  }

  const handleEmployeeSelect = (employeeId: string) => {
    if (value.includes(employeeId)) {
      onChange(value.filter(id => id !== employeeId))
    } else {
      onChange([...value, employeeId])
    }
  }

  const isEmployeeSelected = (employeeId: string) => {
    return value.includes(employeeId)
  }

  const isEmployeeManager = (employeeId: string) => {
    return selectedEmployees.managers.includes(employeeId)
  }

  const isEmployeeParticipant = (employeeId: string) => {
    return selectedEmployees.participants.includes(employeeId)
  }

  const handleAssignRole = (
    employeeId: string,
    role: 'manager' | 'participant',
    event: React.MouseEvent
  ) => {
    event.stopPropagation()
    if (onAssignRole) {
      onAssignRole(employeeId, role)
    }
  }

  if (variant === 'employee-list') {
    return (
      <FormControl
        fullWidth
        error={error}
        required={required}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1 }}>
          {label}
        </Typography>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 1,
            maxHeight: 300,
            overflow: 'auto'
          }}>
          {options.length > 0 ? (
            options.map(option => {
              const isSelected = isEmployeeSelected(option.value)
              const isManager = isEmployeeManager(option.value)
              const isParticipant = isEmployeeParticipant(option.value)

              return (
                <React.Fragment key={option.value}>
                  <ListItem
                    onClick={() => handleEmployeeSelect(option.value)}
                    sx={{
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer'
                    }}>
                    <ListItemText
                      primary={option.label}
                      sx={{
                        color: isManager
                          ? 'primary.main'
                          : isParticipant
                            ? 'secondary.main'
                            : 'text.primary',
                        fontWeight:
                          isManager || isParticipant ? 'bold' : 'normal'
                      }}
                    />
                    <ListItemSecondaryAction>
                      {isSelected && (
                        <>
                          {!isManager && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={e =>
                                handleAssignRole(option.value, 'manager', e)
                              }
                              sx={{ mr: 1 }}>
                              <UserPlus size={16} />
                            </IconButton>
                          )}
                          {!isParticipant && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={e =>
                                handleAssignRole(option.value, 'participant', e)
                              }
                              sx={{ mr: 1 }}>
                              <UserPlus size={16} />
                            </IconButton>
                          )}
                          {(isManager || isParticipant) && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={e => handleRemove(option.value, e)}>
                              <UserMinus size={16} />
                            </IconButton>
                          )}
                        </>
                      )}
                      {isSelected && (
                        <Check
                          size={16}
                          color="primary"
                        />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              )
            })
          ) : (
            <ListItem>
              <ListItemText primary="선택된 회사의 직원이 없습니다." />
            </ListItem>
          )}
        </List>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }

  return (
    <FormControl
      fullWidth
      error={error}
      required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        label={label}
        renderValue={selected => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map(value => {
              const option = options.find(option => option.value === value)
              return option ? (
                <Box
                  key={value}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    padding: '2px 8px',
                    margin: '2px'
                  }}>
                  <Typography
                    variant="body2"
                    sx={{ mr: 0.5 }}>
                    {option.label}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={e => handleRemove(value, e)}
                    sx={{
                      padding: '2px',
                      marginLeft: '2px',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.12)' }
                    }}>
                    <X size={14} />
                  </IconButton>
                </Box>
              ) : null
            })}
          </Box>
        )}>
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

export default MultiSelect
