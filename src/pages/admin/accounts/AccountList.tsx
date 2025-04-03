import { useState } from 'react'
import { Box, Typography, Switch, Button } from '@mui/material'
import DataTable from '@/components/common/DataTable'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'

interface Account {
  id: string
  name: string
  username: string
  companyName: string
  isActive: boolean
}

// 더미 데이터
const dummyAccounts: Account[] = [
  {
    id: '1',
    name: '김개발',
    username: 'dev.kim',
    companyName: '테크솔루션',
    isActive: true
  },
  {
    id: '2',
    name: '이매니저',
    username: 'manager.lee',
    companyName: '클라우드시스템',
    isActive: true
  },
  {
    id: '3',
    name: '박디자인',
    username: 'design.park',
    companyName: '디자인스튜디오',
    isActive: false
  },
  {
    id: '4',
    name: '최프론트',
    username: 'front.choi',
    companyName: '테크솔루션',
    isActive: true
  },
  {
    id: '5',
    name: '정백엔드',
    username: 'back.jung',
    companyName: '클라우드시스템',
    isActive: true
  },
  {
    id: '6',
    name: '강풀스택',
    username: 'full.kang',
    companyName: '디자인스튜디오',
    isActive: false
  },
  {
    id: '7',
    name: '조데브옵스',
    username: 'devops.jo',
    companyName: '테크솔루션',
    isActive: true
  },
  {
    id: '8',
    name: '윤기획',
    username: 'plan.yoon',
    companyName: '클라우드시스템',
    isActive: true
  },
  {
    id: '9',
    name: '한마케팅',
    username: 'marketing.han',
    companyName: '디자인스튜디오',
    isActive: false
  },
  {
    id: '10',
    name: '임테스트',
    username: 'test.im',
    companyName: '테크솔루션',
    isActive: true
  }
]

export default function AccountList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [accounts, setAccounts] = useState<Account[]>(dummyAccounts)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleToggleActive = (accountId: string) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === accountId
          ? { ...account, isActive: !account.isActive }
          : account
      )
    )
  }

  // 현재 페이지에 해당하는 데이터만 추출
  const currentPageData = accounts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const columns = [
    {
      id: 'name',
      label: '이름',
      getValue: (row: Account) => row.name,
      onClick: (row: Account) => navigate(`/admin/accounts/${row.id}`),
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
      id: 'username',
      label: '아이디',
      getValue: (row: Account) => row.username,
      style: { cursor: 'default' }
    },
    {
      id: 'companyName',
      label: '회사',
      getValue: (row: Account) => row.companyName,
      style: { cursor: 'default' }
    },
    {
      id: 'isActive',
      label: '활성화',
      align: 'center' as const,
      getValue: (row: Account) => ({ value: row.isActive, id: row.id }),
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
          계정 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusCircle />}
          onClick={() => navigate('/admin/accounts/create')}
          sx={{
            bgcolor: 'black',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)'
            }
          }}>
          새 계정 생성
        </Button>
      </Box>

      <DataTable<Account>
        columns={columns}
        data={currentPageData}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={accounts.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  )
}
