import { useState } from 'react'
import { Box, Typography, Switch, Button } from '@mui/material'
import DataTable from '@/components/common/DataTable'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'

interface Company {
  id: string
  name: string
  representativeName: string
  representativePhone: string
  businessNumber: string
  address: string
  isActive: boolean
}

// 더미 데이터
const dummyCompanies: Company[] = [
  {
    id: '1',
    name: '테크솔루션',
    representativeName: '김대표',
    representativePhone: '010-1234-5678',
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 123',
    isActive: true
  },
  {
    id: '2',
    name: '클라우드시스템',
    representativeName: '이사장',
    representativePhone: '010-2345-6789',
    businessNumber: '234-56-78901',
    address: '서울특별시 서초구 서초대로 456',
    isActive: true
  },
  {
    id: '3',
    name: '디자인스튜디오',
    representativeName: '박대표',
    representativePhone: '010-3456-7890',
    businessNumber: '345-67-89012',
    address: '서울특별시 마포구 와우산로 789',
    isActive: false
  },
  {
    id: '4',
    name: '소프트웨어랩',
    representativeName: '최사장',
    representativePhone: '010-4567-8901',
    businessNumber: '456-78-90123',
    address: '서울특별시 영등포구 여의대로 101',
    isActive: true
  },
  {
    id: '5',
    name: '데이터시스템즈',
    representativeName: '정대표',
    representativePhone: '010-5678-9012',
    businessNumber: '567-89-01234',
    address: '서울특별시 송파구 올림픽로 202',
    isActive: true
  },
  {
    id: '6',
    name: '인터넷서비스',
    representativeName: '강사장',
    representativePhone: '010-6789-0123',
    businessNumber: '678-90-12345',
    address: '서울특별시 강동구 천호대로 303',
    isActive: false
  },
  {
    id: '7',
    name: '모바일테크',
    representativeName: '조대표',
    representativePhone: '010-7890-1234',
    businessNumber: '789-01-23456',
    address: '서울특별시 성동구 왕십리로 404',
    isActive: true
  },
  {
    id: '8',
    name: '웹개발사',
    representativeName: '윤사장',
    representativePhone: '010-8901-2345',
    businessNumber: '890-12-34567',
    address: '서울특별시 중구 을지로 505',
    isActive: true
  },
  {
    id: '9',
    name: '보안솔루션',
    representativeName: '한대표',
    representativePhone: '010-9012-3456',
    businessNumber: '901-23-45678',
    address: '서울특별시 용산구 이태원로 606',
    isActive: false
  },
  {
    id: '10',
    name: '네트워크시스템',
    representativeName: '임사장',
    representativePhone: '010-0123-4567',
    businessNumber: '012-34-56789',
    address: '서울특별시 광진구 능동로 707',
    isActive: true
  }
]

export default function CompanyList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [companies, setCompanies] = useState<Company[]>(dummyCompanies)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleToggleActive = (companyId: string) => {
    setCompanies(prevCompanies =>
      prevCompanies.map(company =>
        company.id === companyId
          ? { ...company, isActive: !company.isActive }
          : company
      )
    )
  }

  // 현재 페이지에 해당하는 데이터만 추출
  const currentPageData = companies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const columns = [
    {
      id: 'name',
      label: '회사명',
      getValue: (row: Company) => row.name,
      onClick: (row: Company) => navigate(`/admin/companies/${row.id}`),
      style: {
        cursor: 'pointer',
        color: 'text.primary',
        '&:hover': {
          color: 'primary.main',
          textDecoration: 'underline'
        }
      }
    },
    {
      id: 'representativeName',
      label: '대표자명',
      getValue: (row: Company) => row.representativeName,
      style: { cursor: 'default' }
    },
    {
      id: 'representativePhone',
      label: '대표자 번호',
      getValue: (row: Company) => row.representativePhone,
      style: { cursor: 'default' }
    },
    {
      id: 'businessNumber',
      label: '사업자 등록 번호',
      getValue: (row: Company) => row.businessNumber,
      style: { cursor: 'default' }
    },
    {
      id: 'address',
      label: '회사 주소',
      getValue: (row: Company) => row.address,
      style: { cursor: 'default' }
    },
    {
      id: 'isActive',
      label: '활성화',
      align: 'center' as const,
      getValue: (row: Company) => ({ value: row.isActive, id: row.id }),
      format: (data: { value: boolean; id: string }) => (
        <Switch
          checked={data.value}
          onChange={() => handleToggleActive(data.id)}
          color="primary"
        />
      ),
      style: { cursor: 'default' }
    }
  ]

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

      <DataTable<Company>
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
