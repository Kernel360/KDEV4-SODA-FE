import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  IconButton,
  styled,
  Checkbox,
  FormControlLabel,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { Stage } from '../../types/stage'
import { PriorityType } from '../../types/article'
import { ArrowLeft, Link2, Upload, FileText, Trash2, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { projectService } from '../../services/projectService'

const UploadBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#F8F9FA',
  borderRadius: theme.shape.borderRadius,
  border: '1px dashed #DDE2E6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    backgroundColor: '#F0F2F4'
  }
}))

export interface ArticleFormData {
  title: string
  content: string
  stageId: string
  priority: PriorityType
  deadLine: dayjs.Dayjs | null
  fileList: Array<{
    id?: number
    name: string
    url: string
    type?: string
  }>
  linkList: { id?: number; urlAddress: string; urlDescription: string }[]
  articleId?: number
}

interface VoteForm {
  title: string
  voteItems: string[]
  allowMultipleSelection: boolean
  allowTextAnswer: boolean
  deadLine: dayjs.Dayjs | null
}

interface ArticleFormProps {
  mode: 'create' | 'edit'
  formData: ArticleFormData
  stages: Stage[]
  isLoading?: boolean
  isReply?: boolean
  projectId: number
  articleId: any
  validationErrors?: {
    title?: string
    content?: string
    stageId?: string
  }
  onChange: (data: ArticleFormData) => void
  onSubmit: (e: React.FormEvent, voteData?: VoteForm) => void
  onCancel: () => void
  onDeleteLink?: (linkId: number) => void
  onDeleteFile?: (fileId: number) => void
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  mode,
  formData,
  stages,
  isLoading,
  isReply = false,
  projectId,
  articleId,
  validationErrors = {},
  onChange,
  onSubmit,
  onCancel,
  onDeleteLink,
  onDeleteFile
}) => {
  const { articleId: urlArticleId } = useParams<{ articleId: string }>()
  console.log('Extracted articleId from URL:', articleId)

  const [localFormData, setLocalFormData] = useState<ArticleFormData>({
    ...formData,
    articleId: articleId || Number(urlArticleId)
  })
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [, setIsDeletingLink] = useState(false)
  const [showVoteForm, setShowVoteForm] = useState(false)
  const [voteForm, setVoteForm] = useState<VoteForm>({
    title: '',
    voteItems: ['', ''],
    allowMultipleSelection: false,
    allowTextAnswer: false,
    deadLine: null
  })
  const navigate = useNavigate()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<number | null>(null)
  const [openFileDeleteDialog, setOpenFileDeleteDialog] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<number | null>(null)

  useEffect(() => {
    setLocalFormData(prev => ({
      ...prev,
      ...formData,
      articleId: articleId || Number(urlArticleId)
    }))
  }, [formData, articleId, urlArticleId])

  useEffect(() => {
    // Ensure each link in linkList has an id
    const updatedLinkList = formData.linkList.map((link, index) => ({
      ...link,
      id: link.id || index // Assign index as id if id is missing
    }))
    setLocalFormData({ ...formData, linkList: updatedLinkList })
  }, [formData])

  const handleChange = (
    field: keyof ArticleFormData,
    value:
      | string
      | dayjs.Dayjs
      | null
      | Array<{
          id?: number
          name: string
          url: string
          type?: string
        }>
      | { urlAddress: string; urlDescription: string }[]
  ) => {
    const newFormData = { ...localFormData, [field]: value }
    setLocalFormData(newFormData)
    onChange(newFormData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }))
      handleChange('fileList', [...(localFormData.fileList || []), ...files])
    }
  }

  const handleAddLink = () => {
    if (linkTitle && linkUrl) {
      // 중복 링크 체크
      const isDuplicate = localFormData.linkList.some(
        link => link.urlAddress === linkUrl && link.urlDescription === linkTitle
      )

      if (isDuplicate) {
        console.log('중복된 링크입니다:', { title: linkTitle, url: linkUrl })
        return
      }

      console.log('새 링크 추가:', { title: linkTitle, url: linkUrl })
      const newLinks = [
        ...(localFormData.linkList || []).map(link => ({
          urlAddress: link.urlAddress,
          urlDescription: link.urlDescription
        })),
        { urlAddress: linkUrl, urlDescription: linkTitle }
      ]
      console.log('추가 후 링크 목록:', newLinks)
      handleChange('linkList', newLinks)
      setLinkTitle('')
      setLinkUrl('')
    }
  }

  const handleRemoveLink = async (index: number, linkId?: number) => {
    try {
      console.log('링크 삭제 버튼 클릭:', {
        index,
        linkId,
        mode,
        linkList: localFormData.linkList
      })
      setIsDeletingLink(true)

      const targetLink = localFormData.linkList?.[index]
      console.log('삭제할 링크 정보:', targetLink)

      if (mode === 'edit' && onDeleteLink) {
        if (targetLink?.id) {
          console.log('수정 모드에서 링크 삭제 API 호출:', {
            linkId: targetLink.id
          })
          await onDeleteLink(targetLink.id)
          console.log('링크 삭제 API 호출 완료')

          // API 호출 성공 후 로컬 상태에서 링크 제거
          const updatedLinks = localFormData.linkList.filter(
            link => link.id !== targetLink.id
          )
          console.log('업데이트된 링크 목록:', updatedLinks)
          handleChange('linkList', updatedLinks)
        } else {
          console.log('새로 추가된 링크 삭제:', { index })
          const links = [...(localFormData.linkList || [])]
          links.splice(index, 1)
          handleChange('linkList', links)
        }
      } else {
        console.log('생성 모드에서 로컬 링크 삭제:', { index })
        const links = [...(localFormData.linkList || [])]
        links.splice(index, 1)
        handleChange('linkList', links)
      }
    } catch (error) {
      console.error('링크 삭제 중 에러 발생:', error)
    } finally {
      setIsDeletingLink(false)
    }
  }

  const handleOpenFileDeleteDialog = (fileId: number) => {
    setFileToDelete(fileId)
    setOpenFileDeleteDialog(true)
  }

  const handleCloseFileDeleteDialog = () => {
    setFileToDelete(null)
    setOpenFileDeleteDialog(false)
  }

  const confirmDeleteFile = async () => {
    if (fileToDelete !== null) {
      try {
        console.log('Deleting file with ID:', fileToDelete)
        await projectService.deleteArticleFile(articleId, fileToDelete)
        console.log('File deletion API call successful')

        const updatedFiles = localFormData.fileList.filter(
          file => file.id !== fileToDelete
        )
        handleChange('fileList', updatedFiles)
      } catch (error) {
        console.error('Error during file deletion API call:', error)
      } finally {
        handleCloseFileDeleteDialog()
      }
    }
  }

  const handleRemoveFile = (fileId: number | undefined) => {
    if (fileId) {
      handleOpenFileDeleteDialog(fileId)
    } else {
      console.log('No file ID provided for deletion')
    }
  }

  const getTitle = () => {
    if (mode === 'edit') return '게시글 수정'
    if (isReply) return '답글 작성'
    return '새 게시글 작성'
  }

  const handleBack = () => {
    if (isReply) {
      onCancel()
    } else {
      navigate(`/user/projects/${projectId}?tab=articles`)
    }
  }

  const handleAddVoteItem = () => {
    setVoteForm(prev => ({
      ...prev,
      voteItems: [...prev.voteItems, '']
    }))
  }

  const handleVoteItemChange = (index: number, value: string) => {
    setVoteForm(prev => ({
      ...prev,
      voteItems: prev.voteItems.map((item, i) => (i === index ? value : item))
    }))
  }

  const handleRemoveVoteItem = (index: number) => {
    setVoteForm(prev => ({
      ...prev,
      voteItems: prev.voteItems.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e, showVoteForm ? voteForm : undefined)
  }

  const handleOpenDeleteDialog = (linkId: number) => {
    setLinkToDelete(linkId)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setLinkToDelete(null)
    setOpenDeleteDialog(false)
  }

  const confirmDeleteLink = async () => {
    if (linkToDelete !== null) {
      try {
        console.log('Using articleId prop:', articleId)

        if (typeof articleId !== 'number') {
          throw new Error('Article ID is missing or not a number')
        }

        // Ensure linkToDelete is the correct linkId
        const linkId = linkToDelete

        await projectService.deleteArticleLink(articleId, linkId)
        console.log('링크 삭제 API 호출 완료')

        const updatedLinks = localFormData.linkList.filter(
          link => link.id !== linkId
        )
        handleChange('linkList', updatedLinks)
      } catch (error) {
        console.error('링크 삭제 API 호출 중 에러 발생:', error)
      } finally {
        handleCloseDeleteDialog()
      }
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h6">{getTitle()}</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* 필수사항 */}
          <FormControl error={!!validationErrors.stageId}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1 }}>
              단계
            </Typography>
            <Select
              labelId="stage-label"
              id="stage"
              value={localFormData.stageId || ''}
              onChange={e => handleChange('stageId', e.target.value)}
              required
              fullWidth>
              {stages.map(stage => (
                <MenuItem
                  key={stage.id}
                  value={String(stage.id)}>
                  {stage.name}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.stageId && (
              <FormHelperText>{validationErrors.stageId}</FormHelperText>
            )}
          </FormControl>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1 }}>
              제목
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={localFormData.title}
              onChange={e =>
                handleChange('title', e.target.value.slice(0, 100))
              }
              error={
                !!validationErrors.title || localFormData.title.length > 100
              }
              helperText={
                localFormData.title.length > 100
                  ? '제목은 100자 이내로 작성해야 합니다'
                  : validationErrors.title
              }
              required
              placeholder="제목을 입력하세요"
              InputProps={{
                endAdornment: (
                  <span
                    style={{
                      fontSize: '0.8em',
                      color: '#888',
                      marginLeft: 8
                    }}>{`${localFormData.title.length}/100`}</span>
                )
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1 }}>
              내용
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={localFormData.content}
              onChange={e =>
                handleChange('content', e.target.value.slice(0, 1000))
              }
              error={
                !!validationErrors.content ||
                localFormData.content.length > 1000
              }
              helperText={
                localFormData.content.length > 1000
                  ? '내용은 1000자 이내로 작성해야 합니다'
                  : validationErrors.content
              }
              required
              placeholder="내용을 입력하세요"
              InputProps={{
                sx: { position: 'relative', paddingBottom: '20px' },
                endAdornment: (
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      bottom: 8,
                      fontSize: '0.8em',
                      color: '#888',
                      pointerEvents: 'none'
                    }}>
                    {`${localFormData.content.length}/1000`}
                  </span>
                )
              }}
            />
          </Box>

          {/* 선택사항 구분선 */}
          <Box sx={{ my: 4 }}>
            <Divider>
              <Typography
                variant="body2"
                color="text.secondary">
                선택사항
              </Typography>
            </Divider>
          </Box>

          {/* 선택사항 */}
          <FormControl>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1 }}>
              우선순위
            </Typography>
            <Select
              value={localFormData.priority}
              onChange={e =>
                handleChange('priority', e.target.value as PriorityType)
              }
              size="small">
              <MenuItem value={PriorityType.HIGH}>높음</MenuItem>
              <MenuItem value={PriorityType.MEDIUM}>중간</MenuItem>
              <MenuItem value={PriorityType.LOW}>낮음</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1 }}>
              마감일
            </Typography>
            <DateTimePicker
              value={localFormData.deadLine}
              onChange={date => handleChange('deadLine', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}>
              관련 링크 (선택사항, 최대 10개)
            </Typography>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1}>
                <TextField
                  size="small"
                  placeholder="링크 제목"
                  value={linkTitle}
                  onChange={e => setLinkTitle(e.target.value)}
                />
                <TextField
                  size="small"
                  placeholder="URL"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Link2
                        size={16}
                        color="#6B7280"
                      />
                    )
                  }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddLink}
                  disabled={
                    !linkTitle ||
                    !linkUrl ||
                    (localFormData.linkList?.length ?? 0) >= 10
                  }
                  size="small">
                  추가
                </Button>
              </Stack>
              {localFormData.linkList && localFormData.linkList.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block' }}>
                    추가된 링크
                  </Typography>
                  <Stack spacing={1}>
                    {localFormData.linkList.map((link, index) => (
                      <Box
                        key={link.id || index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          bgcolor: 'grey.50',
                          borderRadius: 1
                        }}>
                        <Link2 size={16} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            {link.urlDescription}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary">
                            {link.urlAddress}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(link.id || 0)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}>
              첨부 파일 (선택사항)
            </Typography>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <UploadBox>
                <Upload size={24} />
                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}>
                  클릭하여 파일 선택
                </Typography>
              </UploadBox>
            </label>
            {localFormData.fileList && localFormData.fileList.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}>
                  첨부된 파일
                </Typography>
                <Stack spacing={1}>
                  {localFormData.fileList.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1
                      }}>
                      <FileText size={16} />
                      <Typography
                        variant="body2"
                        sx={{ flex: 1 }}>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(file.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* 투표 만들기 */}
          {!showVoteForm ? (
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => setShowVoteForm(true)}>
              투표 만들기
            </Button>
          ) : (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2 }}>
                투표 만들기
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="투표 제목"
                  value={voteForm.title}
                  onChange={e =>
                    setVoteForm(prev => ({
                      ...prev,
                      title: e.target.value.slice(0, 100)
                    }))
                  }
                  placeholder="투표 제목을 입력하세요"
                  error={voteForm.title.length > 100}
                  helperText={
                    voteForm.title.length > 100
                      ? '100자 이내로 작성해야 합니다'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <span
                        style={{
                          fontSize: '0.8em',
                          color: '#888',
                          marginLeft: 8
                        }}>{`${voteForm.title.length}/100`}</span>
                    )
                  }}
                />

                {!voteForm.allowTextAnswer && (
                  <>
                    <Typography variant="subtitle2">투표 항목</Typography>
                    {voteForm.voteItems.map((item, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1}
                        alignItems="center">
                        <TextField
                          fullWidth
                          value={item}
                          onChange={e =>
                            handleVoteItemChange(
                              index,
                              e.target.value.slice(0, 100)
                            )
                          }
                          placeholder={`항목 ${index + 1}`}
                          error={item.length > 100}
                          helperText={
                            item.length > 100
                              ? '100자 이내로 작성해야 합니다'
                              : ''
                          }
                          InputProps={{
                            endAdornment: (
                              <span
                                style={{
                                  fontSize: '0.8em',
                                  color: '#888',
                                  marginLeft: 8
                                }}>{`${item.length}/100`}</span>
                            )
                          }}
                        />
                        {voteForm.voteItems.length > 2 && (
                          <IconButton
                            onClick={() => handleRemoveVoteItem(index)}>
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                      onClick={handleAddVoteItem}
                      sx={{ alignSelf: 'flex-start' }}>
                      항목 추가
                    </Button>
                  </>
                )}

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={voteForm.allowMultipleSelection}
                        onChange={e =>
                          setVoteForm(prev => ({
                            ...prev,
                            allowMultipleSelection: e.target.checked
                          }))
                        }
                        disabled={voteForm.allowTextAnswer}
                      />
                    }
                    label="다중 선택 허용"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={voteForm.allowTextAnswer}
                        onChange={e =>
                          setVoteForm(prev => ({
                            ...prev,
                            allowTextAnswer: e.target.checked
                          }))
                        }
                      />
                    }
                    label="텍스트 입력 받기"
                  />
                </Stack>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}>
                    마감 기한 (선택)
                  </Typography>
                  <DateTimePicker
                    value={voteForm.deadLine}
                    onChange={date =>
                      setVoteForm(prev => ({ ...prev, deadLine: date }))
                    }
                    slotProps={{
                      textField: { size: 'small', fullWidth: true }
                    }}
                  />
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setShowVoteForm(false)
                    setVoteForm({
                      title: '',
                      voteItems: ['', ''],
                      allowMultipleSelection: false,
                      allowTextAnswer: false,
                      deadLine: null
                    })
                  }}
                  sx={{ alignSelf: 'flex-start' }}>
                  투표 취소
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>

        <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ minWidth: 120 }}
            disabled={
              isLoading ||
              !localFormData.stageId ||
              !localFormData.title.trim() ||
              !localFormData.content.trim() ||
              localFormData.title.length > 100 ||
              localFormData.content.length > 1000 ||
              (showVoteForm &&
                (voteForm.title.length > 100 ||
                  (!voteForm.allowTextAnswer &&
                    voteForm.voteItems.some(item => item.length > 100))))
            }>
            {isLoading ? '처리 중...' : mode === 'create' ? '등록' : '수정'}
          </Button>
        </Box>
      </form>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 링크를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="primary">
            취소
          </Button>
          <Button
            onClick={confirmDeleteLink}
            color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openFileDeleteDialog}
        onClose={handleCloseFileDeleteDialog}>
        <DialogTitle>파일 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 파일을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFileDeleteDialog}
            color="primary">
            취소
          </Button>
          <Button
            onClick={confirmDeleteFile}
            color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ArticleForm
