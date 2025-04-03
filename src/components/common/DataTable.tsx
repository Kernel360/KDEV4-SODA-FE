import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from '@mui/material'
import { Pagination } from './Pagination'

interface Column<T> {
  id: string
  label: string
  render: (row: T) => React.ReactNode
  onClick?: (row: T) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  page: number
  rowsPerPage: number
  totalCount: number
  onPageChange: (newPage: number) => void
  onRowsPerPageChange: (newRowsPerPage: number) => void
}

const DataTable = <T extends { id: number | string }>({
  columns,
  data,
  onRowClick,
  page,
  totalCount,
  onPageChange
}: DataTableProps<T>) => {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider'
        }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  sx={{ fontWeight: 600, backgroundColor: 'white' }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                {columns.map(column => (
                  <TableCell
                    key={`${row.id}-${column.id}`}
                    onClick={e => {
                      if (column.onClick) {
                        e.stopPropagation()
                        column.onClick(row)
                      }
                    }}
                    sx={
                      column.onClick
                        ? {
                            color: '#374151',
                            textDecoration: 'none',
                            '&:hover': {
                              color: '#111827',
                              textDecoration: 'underline'
                            },
                            cursor: 'pointer'
                          }
                        : undefined
                    }>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}>
        <Pagination
          count={totalCount}
          page={page}
          onChange={onPageChange}
        />
      </Box>
    </Box>
  )
}

export default DataTable
