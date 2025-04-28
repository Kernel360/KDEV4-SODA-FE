import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  InputAdornment,
  Button
} from '@mui/material'
import { Database, Search } from 'lucide-react'
import { logService } from '../../services/logService'
import type { Log } from '../../types/log'
import { formatDate } from '../../utils/dateUtils'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'

interface DiffValue {
  before: any;
  after: any;
}

// formatValue는 순수 텍스트만 반환
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? '예' : '아니오'
  if (Array.isArray(value)) return '[...]'
  if (typeof value === 'object') return '{...}'
  return value.toString()
}

// ToggleableValue는 그대로 유지
const ToggleableValue: React.FC<{ value: any }> = ({ value }) => {
  const [open, setOpen] = useState(false)
  const isObjectOrArray = typeof value === 'object' && value !== null
  if (!isObjectOrArray) return <>{String(value)}</>
  const summary = Array.isArray(value)
    ? `[${value.length > 0 ? '...' : ''}]`
    : '{...}'
  return (
    <Box
      component="span"
      sx={{
        cursor: 'pointer',
        color: 'inherit',
        borderBottom: open ? '1px solid #1976d2' : 'none',
        transition: 'border-bottom 0.2s',
        '&:hover': {
          borderBottom: '1px dashed #1976d2',
        },
        fontWeight: 500
      }}
      onClick={() => setOpen((prev) => !prev)}
    >
      {open ? (
        <Box
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: '#222',
            background: '#f8f8f8',
            borderRadius: 1,
            p: 1,
            m: 0,
            fontSize: '0.95em',
            boxShadow: 'none',
            display: 'inline',
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Box>
      ) : summary}
    </Box>
  )
}

const formatFieldName = (name: string): string => {
  const fieldNames: { [key: string]: string } = {
    title: '제목',
    content: '내용',
    priority: '우선순위',
    memberName: '작성자',
    stageName: '단계',
    fileList: '파일 목록',
    linkList: '링크 목록',
    parentArticleId: '부모 게시글 ID',
    deadLine: '마감일',
    urlAddress: 'URL 주소',
    urlDescription: 'URL 설명'
  }
  return fieldNames[name] || name
}

const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'PENDING': '대기중',
    'APPROVED': '승인됨',
    'REJECTED': '거절됨'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error)
    return '-'
  }
}

const formatLinks = (links: any[] | null | undefined): string => {
  if (!links || !Array.isArray(links) || links.length === 0) return '없음'
  return links.map(link => `- ${link.urlDescription}: ${link.urlAddress}`).join('\n')
}

const formatFiles = (files: any[]): string => {
  if (!files || files.length === 0) return '없음'
  return files.map(file => `- ${file.name}`).join('\n')
}

const formatRequestData = (data: any): JSX.Element => {
  const groupData = (entries: [string, any][]) => {
    const groups: { [key: string]: (string | JSX.Element)[] } = {
      ids: [],      // ID 관련 정보
      status: [],   // 상태 정보
      content: [],  // 내용 정보
      links: [],    // 링크 관련
      files: [],    // 파일 관련
      dates: []     // 날짜 관련
    }

    entries.forEach(([key, value]) => {
      const fieldName = formatFieldName(key)
      let formattedValue: string | JSX.Element = ''

      // 값이 비어있으면 출력하지 않음
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
      ) {
        return
      }

      if (typeof value === 'object' && value !== null && 'before' in value && 'after' in value) {
        const diffValue = value as DiffValue
        if (key === 'status') {
          formattedValue = `${fieldName}: ${formatStatus(diffValue.before as string)} → ${formatStatus(diffValue.after as string)}`
        } else if (key === 'createdAt' || key === 'updatedAt') {
          formattedValue = `${fieldName}: ${formatDateTime(diffValue.before as string)} → ${formatDateTime(diffValue.after as string)}`
        } else if (key === 'links') {
          formattedValue = `${fieldName}:\n  변경 전:\n    ${formatLinks(diffValue.before as any[]).replace(/\n/g, '\n    ')}\n  변경 후:\n    ${formatLinks(diffValue.after as any[]).replace(/\n/g, '\n    ')}`
        } else if (key === 'files') {
          formattedValue = `${fieldName}:\n  변경 전:\n    ${formatFiles(diffValue.before as any[]).replace(/\n/g, '\n    ')}\n  변경 후:\n    ${formatFiles(diffValue.after as any[]).replace(/\n/g, '\n    ')}`
        } else if (typeof diffValue.before === 'object' && diffValue.before !== null) {
          const beforeValue = 'id' in diffValue.before ? diffValue.before.id : 
                            'name' in diffValue.before ? diffValue.before.name : 
                            'title' in diffValue.before ? diffValue.before.title : 
                            'content' in diffValue.before ? diffValue.before.content : 
                            JSON.stringify(diffValue.before)
          const afterValue = 'id' in diffValue.after ? diffValue.after.id : 
                           'name' in diffValue.after ? diffValue.after.name : 
                           'title' in diffValue.after ? diffValue.after.title : 
                           'content' in diffValue.after ? diffValue.after.content : 
                           JSON.stringify(diffValue.after)
          formattedValue = `${fieldName}: ${beforeValue} → ${afterValue}`
        } else {
          formattedValue = `${fieldName}: ${diffValue.before} → ${diffValue.after}`
        }
      } else {
        if (key === 'links' || key === 'files') {
          formattedValue = (
            <>
              {fieldName}: <ToggleableValue value={value} />
            </>
          )
        } else if (typeof value === 'object' && value !== null) {
          formattedValue = (
            <>
              {fieldName}: <ToggleableValue value={value} />
            </>
          )
        } else {
          formattedValue = `${fieldName}: ${formatValue(value)}`
        }
      }

      // 데이터 분류
      if (key.toLowerCase().includes('id')) {
        groups.ids.push(formattedValue)
      } else if (key === 'status') {
        groups.status.push(formattedValue)
      } else if (key === 'links') {
        groups.links.push(formattedValue)
      } else if (key === 'files') {
        groups.files.push(formattedValue)
      } else if (key === 'createdAt' || key === 'updatedAt') {
        groups.dates.push(formattedValue)
      } else {
        groups.content.push(formattedValue)
      }
    })

    return (
      <Box>
        {groups.ids.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ID 정보:
            </Typography>
            <Box ml={4}>
              {groups.ids.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom component="pre" sx={{ whiteSpace: 'pre-line' }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.status.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              상태 정보:
            </Typography>
            <Box ml={4}>
              {groups.status.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom component="pre" sx={{ whiteSpace: 'pre-line' }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.content.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              내용 정보:
            </Typography>
            <Box ml={4}>
              {groups.content.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom component="pre" sx={{ whiteSpace: 'pre-line' }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.links.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              링크 정보:
            </Typography>
            <Box ml={4}>
              {groups.links.map((value, index) => (
                <Typography key={index} variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', ml: 2 }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.files.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              파일 정보:
            </Typography>
            <Box ml={4}>
              {groups.files.map((value, index) => (
                <Typography key={index} variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', ml: 2 }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.dates.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              시간 정보:
            </Typography>
            <Box ml={4}>
              {groups.dates.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom component="pre" sx={{ whiteSpace: 'pre-line' }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  if (data.diff) {
    return groupData(Object.entries(data.diff))
  }
  return groupData(Object.entries(data))
}

const DataManagement: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [entityName, setEntityName] = useState('')
  const [action, setAction] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [tempSearchTerm, setTempSearchTerm] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 날짜 변환 로직
      const fromDateISO = fromDate ? new Date(fromDate).toISOString() : new Date('2024-01-01').toISOString()
      const toDateISO = toDate ? new Date(toDate).toISOString() : new Date().toISOString()

      const response = await logService.getLogs({
        page: pagination.page,
        size: pagination.size,
        keyword: searchTerm || undefined,
        entityName: entityName || undefined,
        action: action || undefined,
        from: fromDateISO,
        to: toDateISO
      })
      setLogs(response.content)
      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements,
        totalPages: response.totalPages
      }))
    } catch (err) {
      setError('로그를 불러오는 중 오류가 발생했습니다.')
      console.error('Error fetching logs:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, searchTerm, entityName, action, fromDate, toDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs, entityName, action, fromDate, toDate])

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm)
    setPagination(prev => ({ ...prev, page: 0 }))
    fetchLogs()
  }

  const handleFilterChange = () => {
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value - 1 }))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Database size={24} style={{ marginRight: '8px' }} />
        <Typography variant="h5" component="h1">
          데이터 관리
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>데이터 종류</InputLabel>
            <Select
              value={entityName}
              label="데이터 종류"
              onChange={(e) => {
                setEntityName(e.target.value)
                handleFilterChange()
              }}
              displayEmpty
              notched
              sx={{
                '& .MuiSelect-select': {
                  backgroundColor: 'white'
                }
              }}
            >
              <MenuItem value="">데이터 종류 전체</MenuItem>
              <MenuItem value="Article">게시글</MenuItem>
              <MenuItem value="Project">프로젝트</MenuItem>
              <MenuItem value="Company">회사</MenuItem>
              <MenuItem value="Stage">단계</MenuItem>
              <MenuItem value="Request">승인요청</MenuItem>
              <MenuItem value="Response">응답</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>액션</InputLabel>
            <Select
              value={action}
              label="액션"
              onChange={(e) => {
                setAction(e.target.value)
                handleFilterChange()
              }}
              displayEmpty
              notched
              sx={{
                '& .MuiSelect-select': {
                  backgroundColor: 'white'
                }
              }}
            >
              <MenuItem value="">액션 전체</MenuItem>
              <MenuItem value="CREATE">생성</MenuItem>
              <MenuItem value="UPDATE">수정</MenuItem>
              <MenuItem value="DELETE">삭제</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={8}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              value={tempSearchTerm}
              onChange={(e) => setTempSearchTerm(e.target.value)}
              placeholder="검색어를 입력하세요"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              size="small"
            >
              검색
            </Button>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="시작일"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                handleFilterChange()
              }}
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: 'white'
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="종료일"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                handleFilterChange()
              }}
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: 'white'
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px', fontWeight: 'bold' }}>시간</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px', fontWeight: 'bold' }}>데이터 종류</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px', fontWeight: 'bold' }}>액션</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px', fontWeight: 'bold' }}>작업자</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px', fontWeight: 'bold' }}>변경 내용</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px' }}>{formatDate(log.timestamp)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px' }}>{log.entityName}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px' }}>
                  {log.action === 'CREATE' ? '생성' :
                   log.action === 'UPDATE' ? '수정' :
                   log.action === 'DELETE' ? '삭제' : log.action}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 8px' }}>{log.operator}</TableCell>
                <TableCell sx={{ padding: '6px 8px', minWidth: 220, maxWidth: 400 }}>
                  <Box
                    sx={{
                      minHeight: 48,
                      display: 'flex',
                      alignItems: 'center',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-all',
                      width: '100%'
                    }}
                  >
                    {log.action === 'CREATE' && log.afterData && (
                      formatRequestData(log.afterData)
                    )}
                    {log.action === 'UPDATE' && log.diff && (
                      formatRequestData({ diff: log.diff })
                    )}
                    {log.action === 'DELETE' && log.beforeData && (
                      formatRequestData(log.beforeData)
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  )
}

export default DataManagement 