import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination
} from '@mui/material'
import { Pencil, Trash2 } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import { Company } from '../../../types/api'
import { getCompanies } from '../../../api/company'

const CompanyList: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
      showToast('회사 목록을 불러오는 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEdit = (companyId: number) => {
    navigate(`/admin/companies/${companyId}`)
  }

  const handleDelete = async (companyId: number) => {
    // TODO: Implement delete functionality
    console.log('Delete company:', companyId)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">회사 목록</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/companies/create')}
        >
          회사 생성
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>회사명</TableCell>
                <TableCell>대표자명</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell>사업자등록번호</TableCell>
                <TableCell>주소</TableCell>
                <TableCell>상세주소</TableCell>
                <TableCell align="right">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    회사가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                companies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.ownerName}</TableCell>
                      <TableCell>{company.phoneNumber}</TableCell>
                      <TableCell>{company.companyNumber}</TableCell>
                      <TableCell>{company.address}</TableCell>
                      <TableCell>{company.detailAddress}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(company.id)}
                        >
                          <Pencil size={20} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={companies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}

export default CompanyList
