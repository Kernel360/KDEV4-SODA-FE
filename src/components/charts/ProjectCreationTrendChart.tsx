import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, useTheme } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import dayjs from 'dayjs'
import { client } from '../../api/client'

export type TimeUnit = 'DAY' | 'WEEK' | 'MONTH'

interface TrendData {
  date: string
  count: number
}

interface ProjectCreationTrendChartProps {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  timeUnit: TimeUnit
}

const ProjectCreationTrendChart: React.FC<ProjectCreationTrendChartProps> = ({
  startDate,
  endDate,
  timeUnit
}) => {
  const [trend, setTrend] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await client.get('/projects/creation-trend', {
          params: { startDate, endDate, timeUnit }
        })
        setTrend(response.data.data.trend || [])
      } catch (err: any) {
        setError('데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchTrend()
  }, [startDate, endDate, timeUnit])

  // 가로 스크롤: 데이터가 12개(약 1년 월간) 이상이면 스크롤
  const chartWidth = Math.max(600, trend.length * 60)

  return (
    <Box>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{ minWidth: chartWidth }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 300
              }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography
              color="error"
              align="center">
              {error}
            </Typography>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={300}>
              <LineChart
                data={trend}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 13 }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 14 }}
                  formatter={(value: any) => [`${value}건`, '생성']}
                  labelFormatter={label => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    stroke: theme.palette.primary.main,
                    strokeWidth: 2,
                    fill: '#fff'
                  }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ProjectCreationTrendChart
