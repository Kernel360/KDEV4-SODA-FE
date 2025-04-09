import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

interface Event {
  time: string
  title: string
  type: 'meeting' | 'review' | 'deadline'
}

interface ScheduleCalendarProps {
  events: Event[]
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ events }) => {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'text-green-600'
      case 'review':
        return 'text-blue-600'
      case 'deadline':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB'
              }}>
              시간
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB'
              }}>
              일정
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell
                sx={{
                  width: '30%',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                {event.time}
              </TableCell>
              <TableCell
                sx={{ borderBottom: '1px solid #E5E7EB' }}
                className={getEventColor(event.type)}>
                {event.title}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ScheduleCalendar
