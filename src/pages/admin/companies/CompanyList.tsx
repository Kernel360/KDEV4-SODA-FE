import { useState, useEffect } from 'react'
import { Box, Typography, Button, CircularProgress } from '@mui/material' // CircularProgress 추가
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { getCompanyList } from '../../../api/company'
import { useToast } from '../../../contexts/ToastContext'
// API 응답 타입을 명시적으로 정의하거나 import 합니다.
// 예시: 실제 API 응답 구조에 맞게 정의해야 합니다.
import type { CompanyListItem } from '../../../types/api'
import DataTable from '../../../components/common/DataTable'

// DataTable 컴포넌트가 사용하는 Column 타입 정의 (이미 존재한다면 중복 정의 불필요)
interface Column<T> {
  id: string
  label: string
  render: (row: T) => React.ReactNode
  onClick?: (row: T) => void
}

// API 응답의 data 부분 타입을 명시적으로 정의
// getCompanyList가 CompanyListItem[] | null 또는 undefined를 반환한다고 가정
//interface CompanyListResponse extends ApiResponse<CompanyListItem[] | null> {}

const CompanyList: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    fetchCompanies()
  }, []) // 마운트 시 한 번만 호출

  const fetchCompanies = async () => {
    setLoading(true) // 데이터 로딩 시작
    try {
      // API 응답 타입을 명시적으로 지정
      const response: any = await getCompanyList()
      if (response.status === 'success') {
        // response.data가 null이나 undefined일 경우 빈 배열([])을 사용 (null 병합 연산자 ??)
        setCompanies(response.data ?? []) // <<--- 여기가 수정된 부분
      } else {
        showToast(
          response.message || '회사 목록을 불러오는데 실패했습니다.',
          'error'
        )
        setCompanies([]) // 에러 발생 시 빈 배열로 초기화
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      const errorMsg =
        err instanceof Error ? err.message : '알 수 없는 오류 발생'
      showToast(`회사 목록 조회 중 오류: ${errorMsg}`, 'error')
      setCompanies([]) // 에러 발생 시 빈 배열로 초기화
    } finally {
      setLoading(false) // 데이터 로딩 종료
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0) // 페이지 당 행 수가 바뀌면 첫 페이지로 이동
  }

  const handleRowClick = (row: CompanyListItem) => {
    navigate(`/admin/companies/${row.id}`)
  }

  const columns: Column<CompanyListItem>[] = [
    {
      id: 'name',
      label: '회사명',
      render: row => row.name,
      onClick: handleRowClick // 행 클릭 시 상세 페이지 이동
    },
    {
      id: 'phoneNumber',
      label: '전화번호',
      render: row => row.phoneNumber || '-' // 데이터가 없을 경우 '-' 표시
    },
    {
      id: 'companyNumber',
      label: '사업자번호',
      render: row => row.companyNumber || '-' // 데이터가 없을 경우 '-' 표시
    },
    {
      id: 'address',
      label: '주소',
      render: row => row.address || '-' // 데이터가 없을 경우 '-' 표시
    }
  ]

  // 클라이언트 측 페이징: 전체 데이터를 받아와서 현재 페이지에 맞는 부분만 잘라냄
  const currentPageData = companies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage // slice의 두 번째 인자는 exclusive
  )

  // 로딩 상태 표시 개선
  if (loading && companies.length === 0) {
    // 초기 로딩 중일 때만 전체 로딩 표시
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh'
        }}>
        <CircularProgress />
      </Box>
    )
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
          component="h1"
          sx={{ fontWeight: 'bold' }} // 제목 강조
        >
          회사 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusCircle size={18} />} // 아이콘 크기 조정
          onClick={() => navigate('/admin/companies/create')}
          sx={{
            bgcolor: 'primary.main', // 테마 기본 색상 사용 또는 원하는 색상 지정
            '&:hover': {
              bgcolor: 'primary.dark' // 호버 시 약간 어둡게
            },
            color: 'white'
          }}>
          새 회사 등록
        </Button>
      </Box>

      <DataTable<CompanyListItem>
        columns={columns}
        data={currentPageData} // 현재 페이지 데이터만 전달
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={companies.length} // 전체 데이터 개수 전달
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading} // DataTable 내부 로딩 상태 전달 (선택적)
        // onRowClick={handleRowClick} // DataTable 자체에 행 클릭 핸들러가 있다면 사용
      />
    </Box>
  )
}

export default CompanyList
