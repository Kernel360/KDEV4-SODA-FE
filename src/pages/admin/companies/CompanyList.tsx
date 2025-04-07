import { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import DataTable from '@/components/common/DataTable'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { getCompanyList } from '../../../api/company'
import { useToast } from '../../../contexts/ToastContext'
import type { CompanyListItem } from '../../../types/api'

interface Column<T> {
  id: string;
  label: string;
  getValue: (row: T) => any;
  style?: React.CSSProperties;
}

const CompanyList: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList()
      if (response.status === 'success') {
        setCompanies(response.data)
      } else {
        showToast(response.message || '회사 목록을 불러오는데 실패했습니다.', 'error')
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      showToast('회사 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const columns: Column<CompanyListItem>[] = [
    {
      id: 'name',
      label: '회사명',
      getValue: (row) => row.name,
      style: {
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline'
        }
      }
    },
    {
      id: 'phoneNumber',
      label: '전화번호',
      getValue: (row) => row.phoneNumber
    },
    {
      id: 'companyNumber',
      label: '사업자번호',
      getValue: (row) => row.companyNumber
    },
    {
      id: 'address',
      label: '주소',
      getValue: (row) => row.address
    }
  ]

  const currentPageData = companies.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  )

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Typography
          variant="h5"
          component="h1">
          회사 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusCircle />}
          onClick={() => navigate('/admin/companies/create')}
          sx={{
            bgcolor: 'black',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)'
            }
          }}>
          새 회사 등록
        </Button>
      </Box>

      <DataTable<CompanyListItem>
        columns={columns}
        data={currentPageData}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={companies.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  )
}

export default CompanyList
