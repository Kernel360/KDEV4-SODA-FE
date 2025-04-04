import React from 'react'
import { Box, Paper, Typography } from '@mui/material'

interface Schedule {
  time: string
  title: string
  projectName: string
}

interface ScheduleListProps {
  schedules: Schedule[]
  title?: string
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  title = '오늘의 일정'
}) => {
  return (
    <Box sx={{ width: 400 }}>
      <Typography
        variant="h5"
        gutterBottom>
        {title}
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {schedules.map((schedule, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.default'
              }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary">
                  {schedule.time}
                </Typography>
              </Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 0.5 }}>
                {schedule.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary">
                {schedule.projectName}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}

export default ScheduleList
