import React, { useEffect, useState } from 'react'
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
  Grid
} from '@mui/material'
import { Database } from 'lucide-react'
import { logService } from '../../services/logService'
import type { Log } from '../../types/log'
import { formatDate } from '../../utils/dateUtils'

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? '예' : '아니오'
  if (Array.isArray(value)) {
    if (value.length === 0) return '없음'
    return value.map(item => formatValue(item)).join(', ')
  }
  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return '없음'
    return JSON.stringify(value, null, 2)
  }
  return value.toString()
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

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`
}

const formatLinks = (links: any[]): string => {
  if (!links || links.length === 0) return '없음'
  return links.map(link => `- ${link.urlDescription}: ${link.urlAddress}`).join('\n')
}

const formatFiles = (files: any[]): string => {
  if (!files || files.length === 0) return '없음'
  return files.map(file => `- ${file.name}`).join('\n')
}

const formatRequestData = (data: any): string => {
  // diff 데이터 처리
  if (data.diff) {
    return Object.entries(data.diff)
      .map(([key, value]) => {
        const fieldName = formatFieldName(key)
        if (key === 'status') {
          return `${fieldName}: ${formatStatus(value as string)}`
        } else if (key === 'createdAt' || key === 'updatedAt') {
          return `${fieldName}: ${formatDateTime(value as string)}`
        } else if (key === 'links') {
          return `${fieldName}:\n${formatLinks(value as any[])}`
        } else if (key === 'files') {
          return `${fieldName}:\n${formatFiles(value as any[])}`
        } else {
          return `${fieldName}: ${value}`
        }
      })
      .join('\n')
  }

  // 일반 데이터 처리
  return `
요청 ID: ${data.requestId || '-'}
작업 ID: ${data.taskId || '-'}
작성자 ID: ${data.memberId || '-'}
작성자: ${data.memberName || '-'}
제목: ${data.title || '-'}
내용: ${data.content || '-'}
상태: ${formatStatus(data.status || '')}
등록일: ${formatDateTime(data.createdAt || '')}
수정일: ${formatDateTime(data.updatedAt || '')}

링크 목록:
${formatLinks(data.links || [])}

파일 목록:
${formatFiles(data.files || [])}
`
}

const DataManagement: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [entityName, setEntityName] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const fetchLogs = async () => {
    try {
      const response = await logService.getLogs({
        page,
        size: 10,
        sort: ['createdAt'],
        entityName: entityName || undefined,
        action: action || undefined,
        from: fromDate || undefined,
        to: toDate || undefined
      })
      setLogs(response.content)
      setTotalPages(Math.max(1, Math.ceil(response.totalElements / 10)))
    } catch (error) {
      console.error('로그 데이터를 불러오는데 실패했습니다:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, entityName, action, fromDate, toDate])

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1)
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
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel>엔티티</InputLabel>
            <Select
              value={entityName}
              label="엔티티"
              onChange={(e) => setEntityName(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="Article">게시글</MenuItem>
              <MenuItem value="Project">프로젝트</MenuItem>
              <MenuItem value="Company">회사</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel>액션</InputLabel>
            <Select
              value={action}
              label="액션"
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="CREATE">생성</MenuItem>
              <MenuItem value="UPDATE">수정</MenuItem>
              <MenuItem value="DELETE">삭제</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="시작일"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="종료일"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>시간</TableCell>
              <TableCell>데이터 종류</TableCell>
              <TableCell>액션</TableCell>
              <TableCell>작업자</TableCell>
              <TableCell>
                {action === 'CREATE' ? '생성된 데이터' :
                 action === 'UPDATE' ? '변경된 데이터' :
                 action === 'DELETE' ? '삭제된 데이터' : '변경 내용'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell>{log.entityName}</TableCell>
                <TableCell>
                  {log.action === 'CREATE' ? '생성' :
                   log.action === 'UPDATE' ? '수정' :
                   log.action === 'DELETE' ? '삭제' : log.action}
                </TableCell>
                <TableCell>{log.operator}</TableCell>
                <TableCell>
                  {log.action === 'CREATE' && log.afterData && (
                    <Box sx={{ whiteSpace: 'pre-line' }}>
                      {formatRequestData(log.afterData)}
                    </Box>
                  )}
                  {log.action === 'UPDATE' && log.diff && (
                    <Box sx={{ whiteSpace: 'pre-line' }}>
                      변경된 내용:
                      {formatRequestData({ diff: log.diff })}
                    </Box>
                  )}
                  {log.action === 'DELETE' && log.beforeData && (
                    <Box sx={{ whiteSpace: 'pre-line' }}>
                      {formatRequestData(log.beforeData)}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  )
}

export default DataManagement 