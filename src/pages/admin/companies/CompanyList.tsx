import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch
} from '@mui/material'
import { Plus } from 'lucide-react'
import { companyService } from '@/services/companyService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { useNavigate } from 'react-router-dom'

interface Company {
  id: number
  name: string
  ceoName: string
  phoneNumber: string
  businessNumber: string
  address: string
  isActive: boolean
}

const CompanyList = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const data = await companyService.getAllCompanies()
        setCompanies(data)
      } catch (err) {
        setError('회사 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleToggleActive = async (
    companyId: number,
    currentStatus: boolean
  ) => {
    try {
      await companyService.updateCompanyStatus(companyId, !currentStatus)
      setCompanies(
        companies.map(company =>
          company.id === companyId
            ? { ...company, isActive: !currentStatus }
            : company
        )
      )
    } catch (err) {
      console.error('Error updating company status:', err)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">회사 관리</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/admin/companies/new')}>
          새 회사 등록
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>회사명</TableCell>
              <TableCell>대표자명</TableCell>
              <TableCell>대표자 번호</TableCell>
              <TableCell>사업자 등록 번호</TableCell>
              <TableCell>회사 주소</TableCell>
              <TableCell align="center">활성화</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map(company => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.ceoName}</TableCell>
                <TableCell>{company.phoneNumber}</TableCell>
                <TableCell>{company.businessNumber}</TableCell>
                <TableCell>{company.address}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={company.isActive}
                    onChange={() =>
                      handleToggleActive(company.id, company.isActive)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default CompanyList
