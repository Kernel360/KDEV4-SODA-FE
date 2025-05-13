import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { InputAdornment } from '@mui/material'
import { Search } from 'lucide-react'
import { Company, CompanyMember } from '../../../types'
import { useToast } from '../../../contexts/ToastContext'

interface ProjectFormData {
  title: string
  description: string
  startDate: string
  endDate: string
  stageNames: string[]
  clientAssignments: {
    companyId: number
    managerIds: number[]
    memberIds: number[]
  }[]
}

const ProjectCreate = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    stageNames: ['기획', '설계', '개발', '테스트', '배포'],
    clientAssignments: []
  })
  const [loading, setLoading] = useState(false)
  const [companies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyMembers] = useState<CompanyMember[]>([])
  const [selectedManagers, setSelectedManagers] = useState<number[]>([])
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      // 필수 필드 검증
      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
        throw new Error('필수 항목을 모두 입력해주세요.')
      }

      // 날짜 유효성 검증 및 ISO 형식 변환
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (startDate >= endDate) {
        throw new Error('종료일은 시작일보다 이후여야 합니다.')
      }

      // 클라이언트 할당 검증
      if (formData.clientAssignments.length === 0) {
        throw new Error('최소 하나의 고객사를 할당해야 합니다.')
      }

      // 각 고객사에 대한 담당자 검증
      for (const assignment of formData.clientAssignments) {
        if (assignment.managerIds.length === 0) {
          throw new Error('각 고객사에 최소 한 명의 담당자를 지정해야 합니다.')
        }
      }

      // API 요청 데이터 준비
      const requestData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        clientAssignments: formData.clientAssignments.map(assignment => ({
          companyId: Number(assignment.companyId),
          managerIds: assignment.managerIds.map(id => Number(id)),
          memberIds: assignment.memberIds.map(id => Number(id))
        }))
      }

      console.log('Sending request data:', requestData) // 디버깅용 로그

      showToast('프로젝트가 성공적으로 생성되었습니다.', 'success')
      navigate('/admin/projects')
    } catch (error) {
      console.error('프로젝트 생성 실패:', error)
      showToast(
        error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompany = () => {
    if (!selectedCompany) return

    const newAssignment = {
      companyId: selectedCompany.id,
      managerIds: selectedManagers,
      memberIds: selectedMembers
    }

    setFormData(prev => ({
      ...prev,
      clientAssignments: [...prev.clientAssignments, newAssignment]
    }))

    setShowAddCompanyDialog(false)
    setSelectedCompany(null)
    setSelectedManagers([])
    setSelectedMembers([])
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/admin/projects')}
            sx={{ color: 'text.primary' }}>
            목록으로
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            프로젝트 생성
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="프로젝트명"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="프로젝트 설명"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="종료일"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">고객사 할당</Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowAddCompanyDialog(true)}
                  startIcon={<Plus size={20} />}>
                  고객사 추가
                </Button>
              </Box>
              <List>
                {formData.clientAssignments.map((assignment, index) => {
                  const company = companies.find(c => c.id === assignment.companyId)
                  return (
                    <ListItem key={index}>
                      <ListItemText
                        primary={company?.name}
                        secondary={`담당자: ${assignment.managerIds.length}명, 일반 멤버: ${assignment.memberIds.length}명`}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            clientAssignments: prev.clientAssignments.filter((_, i) => i !== index)
                          }))
                        }}>
                        <X size={20} />
                      </IconButton>
                    </ListItem>
                  )
                })}
              </List>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/projects')}>
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}>
                  {loading ? '생성 중...' : '생성'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Add Company Dialog */}
      <Dialog
        open={showAddCompanyDialog}
        onClose={() => {
          setShowAddCompanyDialog(false)
          setSelectedCompany(null)
          setSelectedManagers([])
          setSelectedMembers([])
        }}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>고객사 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <List>
              {companies.map(company => (
                <ListItem
                  key={company.id}
                  button
                  onClick={() => {
                    setSelectedCompany(company)
                    setShowAddCompanyDialog(false)
                    setShowAddMemberDialog(true)
                  }}>
                  <ListItemText
                    primary={company.name}
                    secondary={company.ownerName}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddCompanyDialog(false)
              setSelectedCompany(null)
            }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={showAddMemberDialog}
        onClose={() => {
          setShowAddMemberDialog(false)
          setSelectedCompany(null)
          setSelectedManagers([])
          setSelectedMembers([])
        }}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          {selectedCompany?.name} 멤버 선택
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="멤버 검색"
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            <List>
              {companyMembers
                .filter(member =>
                  member.name.toLowerCase().includes(memberSearch.toLowerCase())
                )
                .map(member => (
                  <ListItem key={member.id}>
                    <ListItemText
                      primary={member.name}
                      secondary={member.position}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color={selectedManagers.includes(member.id) ? "primary" : "inherit"}
                        onClick={() => {
                          if (selectedMembers.includes(member.id)) {
                            setSelectedMembers(prev => prev.filter(id => id !== member.id))
                          }
                          setSelectedManagers(prev =>
                            prev.includes(member.id)
                              ? prev.filter(id => id !== member.id)
                              : [...prev, member.id]
                          )
                        }}>
                        담당자
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color={selectedMembers.includes(member.id) ? "primary" : "inherit"}
                        onClick={() => {
                          if (selectedManagers.includes(member.id)) {
                            setSelectedManagers(prev => prev.filter(id => id !== member.id))
                          }
                          setSelectedMembers(prev =>
                            prev.includes(member.id)
                              ? prev.filter(id => id !== member.id)
                              : [...prev, member.id]
                          )
                        }}>
                        일반멤버
                      </Button>
                    </Box>
                  </ListItem>
                ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddMemberDialog(false)
              setSelectedCompany(null)
              setSelectedManagers([])
              setSelectedMembers([])
            }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCompany}
            disabled={selectedManagers.length === 0}>
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectCreate 