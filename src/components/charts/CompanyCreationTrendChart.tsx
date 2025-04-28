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
import { client } from '../../api/client'

export type CompanyTrendUnit = 'DAY' | 'WEEK' | 'MONTH'

interface CompanyTrendData {
  period: string
  count: number
}

interface CompanyCreationTrendChartProps {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  unit: CompanyTrendUnit
}

const CompanyCreationTrendChart: React.FC<CompanyCreationTrendChartProps> = ({
  startDate,
  endDate,
  unit
}) => {
  const [trend, setTrend] = useState<CompanyTrendData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await client.get('/companies/company-creation-trend', {
          params: { startDate, endDate, unit }
        })
        setTrend(response.data.data || [])
      } catch (err: any) {
        setError('데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchTrend()
  }, [startDate, endDate, unit])

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
                  dataKey="period"
                  tick={{ fontSize: 13 }}
                  tickFormatter={
                    unit === 'WEEK'
                      ? (value: string) => {
                          // value: '2025-04-W2' → '2025년 4월 2주차'
                          const match = value.match(
                            /(\d{4})-(\d{2})-W(\d{1,2})/
                          )
                          if (match) {
                            const year = match[1]
                            const month = parseInt(match[2], 10)
                            const week = parseInt(match[3], 10)
                            return `${year}년 ${month}월 ${week}주차`
                          }
                          return value
                        }
                      : undefined
                  }
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

export default CompanyCreationTrendChart
