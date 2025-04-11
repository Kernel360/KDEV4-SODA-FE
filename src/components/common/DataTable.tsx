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
  CircularProgress
} from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  id: string
  label: string
  render: (row: T) => React.ReactNode
  onClick?: (row: T) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  page: number
  rowsPerPage: number
  totalCount: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  loading: boolean
  onRowClick?: (row: T) => void
}

export default function DataTable<T>({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  loading,
  onRowClick
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalCount / rowsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage)
    }
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider'
      }}>
      {/* 페이지당 행 수 선택 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1
        }}>
        <span>페이지당 행 수:</span>
        <select
          value={rowsPerPage}
          onChange={e => onRowsPerPageChange(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white'
          }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: 'grey.50'
                  }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': onRowClick
                      ? {
                          backgroundColor: 'action.hover'
                        }
                      : {},
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}>
                  {columns.map(column => (
                    <TableCell key={column.id}>{column.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 2,
          pb: 2
        }}>
        <IconButton
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0 || loading}
          size="small"
          sx={{ p: 0.5 }}>
          <ChevronLeft size={16} />
        </IconButton>

        {getPageNumbers().map(pageNumber => (
          <IconButton
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            disabled={loading}
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
          disabled={page >= totalPages - 1 || loading}
          size="small"
          sx={{ p: 0.5 }}>
          <ChevronRight size={16} />
        </IconButton>
      </Box>
    </Paper>
  )
}
