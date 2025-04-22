import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import { Company } from '../../types/company'
import { Pencil, Trash2 } from 'lucide-react'

interface CompanyDetailProps {
  company: Company
  isEditable?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({
  company,
  isEditable,
  onEdit,
  onDelete
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={3}
        sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography
            variant="h5"
            component="h1">
            {company.name}
          </Typography>
          {isEditable && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Pencil size={18} />}
                variant="contained"
                size="small"
                onClick={onEdit}>
                수정
              </Button>
              <Button
                startIcon={<Trash2 size={18} />}
                variant="outlined"
                color="error"
                size="small"
                onClick={onDelete}>
                삭제
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                전화번호
              </Typography>
              <Typography variant="body1">{company.phoneNumber || '-'}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '250px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                사업자번호
              </Typography>
              <Typography variant="body1">{company.companyNumber || '-'}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                주소
              </Typography>
              <Typography variant="body1">{company.address || '-'}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary">
                상세주소
              </Typography>
              <Typography variant="body1">{company.detailAddress || '-'}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default CompanyDetail
