import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  InputAdornment
} from '@mui/material'
import { Search } from 'lucide-react'
import { getCompanyList } from '../../api/company'
import type { CompanyListItem } from '../../types/api'

interface CompanySearchModalProps {
  open: boolean
  onClose: () => void
  onSelect: (company: CompanyListItem) => void
}

export function CompanySearchModal({
  open,
  onClose,
  onSelect
}: CompanySearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 모달이 열릴 때 회사 목록을 가져옵니다
  useEffect(() => {
    if (open) {
      fetchCompanies()
    }
  }, [open])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      setCompanies([]) // 초기화
      const response = await getCompanyList({
        view: 'ACTIVE',
        page: 0,
        size: 1000
      })

      if (response.status === 'success' && response.data?.content) {
        setCompanies(response.data.content)
      } else {
        console.error('회사 목록 데이터 형식이 올바르지 않습니다:', response)
        setCompanies([])
      }
    } catch (error) {
      console.error('회사 목록 조회 중 오류:', error)
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  // 검색어에 따라 회사 목록을 필터링
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies

    const searchLower = searchTerm.toLowerCase()
    return companies.filter(company => {
      if (!company) return false

      const name = company.name?.toLowerCase() || ''
      const businessNumber = company.businessNumber || ''

      return name.includes(searchLower) || businessNumber.includes(searchTerm)
    })
  }, [companies, searchTerm])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: '600px',
          maxHeight: '80vh',
          height: '600px'
        }
      }}>
      <DialogTitle sx={{ pb: 1 }}>회사 검색</DialogTitle>
      <DialogContent
        sx={{
          p: 3,
          height: 'calc(100% - 120px)',
          overflow: 'hidden',
          '&.MuiDialogContent-root': {
            paddingTop: 2
          }
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: 2
          }}>
          <TextField
            fullWidth
            label="회사 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper'
              }
            }}
          />
          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                <Typography color="text.secondary">
                  회사 목록을 불러오는 중...
                </Typography>
              </Box>
            ) : filteredCompanies.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                <Typography color="text.secondary">
                  {searchTerm
                    ? '검색 결과가 없습니다.'
                    : '등록된 회사가 없습니다.'}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555'
                  }
                }}>
                <List>
                  {filteredCompanies.map(company => (
                    <ListItem
                      key={company.id}
                      button
                      onClick={() => {
                        onSelect(company)
                        onClose()
                      }}
                      sx={{
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 500 }}>
                            {company.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span">
                            {company.businessNumber}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  )
}
