import React from 'react'
import { Box, Button, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  count: number
  page: number
  onChange: (page: number) => void
  boundaryCount?: number
  siblingCount?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  count,
  page,
  onChange,
  boundaryCount = 1,
  siblingCount = 1
}) => {
  const getPageNumbers = () => {
    const totalPages = Math.ceil(count / 10) // 한 페이지당 10개 항목
    const pageNumbers: (number | string)[] = []

    // 시작 페이지들
    for (let i = 0; i < boundaryCount; i++) {
      pageNumbers.push(i)
    }

    // 현재 페이지 주변
    const startPage = Math.max(boundaryCount, page - siblingCount)
    const endPage = Math.min(
      totalPages - boundaryCount - 1,
      page + siblingCount
    )

    // 시작 부분 줄임표
    if (startPage > boundaryCount) {
      pageNumbers.push('...')
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    // 끝 부분 줄임표
    if (endPage < totalPages - boundaryCount - 1) {
      pageNumbers.push('...')
    }

    // 마지막 페이지들
    for (let i = totalPages - boundaryCount; i < totalPages; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        py: 2
      }}>
      <IconButton
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        size="small">
        <ChevronLeft size={20} />
      </IconButton>

      {getPageNumbers().map((pageNum, index) => {
        if (pageNum === '...') {
          return (
            <Box
              key={`ellipsis-${index}`}
              sx={{ px: 1 }}>
              ...
            </Box>
          )
        }

        return (
          <Button
            key={pageNum}
            variant={page === pageNum ? 'contained' : 'text'}
            onClick={() => onChange(pageNum as number)}
            size="small"
            sx={{
              minWidth: 32,
              height: 32,
              p: 0,
              backgroundColor: page === pageNum ? 'black' : 'transparent',
              color: page === pageNum ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: page === pageNum ? 'black' : 'action.hover'
              }
            }}>
            {(pageNum as number) + 1}
          </Button>
        )
      })}

      <IconButton
        onClick={() => onChange(page + 1)}
        disabled={page >= Math.ceil(count / 10) - 1}
        size="small">
        <ChevronRight size={20} />
      </IconButton>
    </Box>
  )
}

export default Pagination
