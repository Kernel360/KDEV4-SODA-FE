import React from 'react'
import { Box, Typography } from '@mui/material'
import { format, startOfWeek, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Event {
  time: string
  title: string
  type: 'meeting' | 'review' | 'deadline'
}

interface SimpleCalendarProps {
  events: Event[]
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ events }) => {
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 })
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i))

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'text-blue-600'
      case 'review':
        return 'text-green-600'
      case 'deadline':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 2
        }}>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <Typography
            key={day}
            variant="caption"
            align="center"
            sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {day}
          </Typography>
        ))}
        {weekDays.map(date => (
          <Box
            key={date.toString()}
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 36
            }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                ...(isToday(date) && {
                  backgroundColor: 'primary.main',
                  color: 'white'
                })
              }}>
              <Typography variant="body2">{format(date, 'd')}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: 'text.secondary' }}>
          {format(today, 'M월 d일 EEEE', { locale: ko })}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {events.map((event, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', width: 80 }}>
                {event.time}
              </Typography>
              <Typography
                variant="body2"
                className={getEventColor(event.type)}>
                {event.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default SimpleCalendar
