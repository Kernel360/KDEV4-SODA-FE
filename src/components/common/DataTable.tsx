import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Typography
} from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  id: string
  label: string
  minWidth?: number
  align?: 'right' | 'left' | 'center'
  format?: (value: any) => React.ReactNode
  getValue?: (row: T) => any
  render?: (row: T) => React.ReactNode
  onClick?: (row: T) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data?: T[]
  rows?: T[]
  page: number
  rowsPerPage?: number
  totalCount?: number
  onPageChange: (newPage: number) => void
  onRowsPerPageChange?: (newRowsPerPage: number) => void
  getRowId?: (row: T) => string | number
}

export default function DataTable<T>({
  columns,
  data,
  rows,
  page,
  rowsPerPage = 8,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  getRowId
}: DataTableProps<T>) {
  // data 또는 rows 중 하나를 사용
  const tableData = data || rows || []
  const count = totalCount || tableData.length
  const totalPages = Math.ceil(count / rowsPerPage)

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = []
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage)
    }
  }

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10))
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow
                hover
                key={getRowId ? getRowId(row) : index}
                onClick={
                  columns.find(col => col.onClick)?.onClick
                    ? () => columns.find(col => col.onClick)?.onClick?.(row)
                    : undefined
                }
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: columns.find(col => col.onClick)
                    ? 'pointer'
                    : 'default'
                }}>
                {columns.map(column => {
                  let content: React.ReactNode

                  if (column.render) {
                    content = column.render(row)
                  } else if (column.getValue) {
                    const value = column.getValue(row)
                    content = column.format ? column.format(value) : value
                  } else {
                    content = null
                  }

                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}>
                      {content}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 커스텀 페이지네이션 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 2
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            size="small"
            sx={{ p: 0.5 }}>
            <ChevronLeft size={16} />
          </IconButton>

          {getPageNumbers().map(pageNumber => (
            <IconButton
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              sx={{
                mx: 0.5,
                minWidth: 24,
                height: 24,
                borderRadius: '4px',
                backgroundColor:
                  page === pageNumber ? 'primary.main' : 'transparent',
                color: page === pageNumber ? 'white' : 'text.primary',
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor:
                    page === pageNumber ? 'primary.dark' : 'action.hover'
                }
              }}>
              {pageNumber + 1}
            </IconButton>
          ))}

          <IconButton
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            size="small"
            sx={{ p: 0.5 }}>
            <ChevronRight size={16} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
