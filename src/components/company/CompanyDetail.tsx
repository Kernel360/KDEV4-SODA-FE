import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Stack
} from '@mui/material'
import { Company } from '../../types/company'
import {
  Pencil,
  Trash2,
  Building2,
  Phone,
  FileText,
  MapPin,
  User
} from 'lucide-react'

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
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Building2
              size={32}
              color="#000000"
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#000000',
                letterSpacing: '-0.5px'
              }}>
              {company.name}
            </Typography>
          </Box>
          {isEditable && (
            <Stack
              direction="row"
              spacing={2}>
              <Button
                startIcon={<Pencil size={18} />}
                variant="contained"
                size="medium"
                onClick={onEdit}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                수정
              </Button>
              <Button
                startIcon={<Trash2 size={18} />}
                variant="outlined"
                color="error"
                size="medium"
                onClick={onDelete}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}>
                삭제
              </Button>
            </Stack>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid
          container
          spacing={4}>
          <Grid
            item
            xs={12}
            md={6}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <User
                size={24}
                color="#000000"
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: 500 }}>
                  대표자
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}>
                  {company.ownerName || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Phone
                size={24}
                color="#000000"
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: 500 }}>
                  전화번호
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}>
                  {company.phoneNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <FileText
                size={24}
                color="#000000"
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: 500 }}>
                  사업자번호
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}>
                  {company.companyNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <MapPin
                size={24}
                color="#000000"
              />
              <Box sx={{ flex: 1 }}>
                <Grid
                  container
                  spacing={2}>
                  <Grid
                    item
                    xs={12}
                    md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}>
                      주소
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500 }}>
                      {company.address || '-'}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}>
                      상세주소
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500 }}>
                      {company.detailAddress || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default CompanyDetail
