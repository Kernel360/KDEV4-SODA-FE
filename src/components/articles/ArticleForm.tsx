import React, { useState } from 'react'
import {
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Container,
  Paper
} from '@mui/material'
import { ArrowLeft, Link2 } from 'lucide-react'

export interface Link {
  title: string
  url: string
}

export interface ArticleFormData {
  title: string
  content: string
  stage: string
  priority: string
  files: File[]
  links: Link[]
  dueDate?: string
}

export interface ParentArticle {
  id: number
  title: string
  content: string
  author: {
    name: string
  }
  createdAt: string
}

interface ArticleFormProps {
  mode: 'create' | 'edit' | 'reply'
  formData: ArticleFormData
  parentArticle?: ParentArticle
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: ArticleFormData) => void
  onCancel: () => void
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  mode,
  formData,
  parentArticle,
  onSubmit,
  onChange,
  onCancel
}) => {
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onChange({
        ...formData,
        files: [...formData.files, ...Array.from(files)]
      })
    }
  }

  const handleAddLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (linkTitle && linkUrl) {
      onChange({
        ...formData,
        links: [...formData.links, { title: linkTitle, url: linkUrl }]
      })
      setLinkTitle('')
      setLinkUrl('')
    }
  }

  const getFormTitle = () => {
    switch (mode) {
      case 'create':
        return '새 게시글 작성'
      case 'edit':
        return '게시글 수정'
      case 'reply':
        return '답글 작성'
      default:
        return ''
    }
  }

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        p: 3,
        width: '100%',
        maxWidth: '100%'
      }}>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}>
            <IconButton onClick={onCancel}>
              <ArrowLeft />
            </IconButton>
            <Typography variant="h6">{getFormTitle()}</Typography>
          </Stack>

          {mode === 'reply' && parentArticle && (
            <Paper
              variant="outlined"
              sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary">
                  원본 글
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold">
                  {parentArticle.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap>
                  {parentArticle.content}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary">
                  작성자: {parentArticle.author.name} · 작성일:{' '}
                  {new Date(parentArticle.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </Paper>
          )}

          <Stack
            direction="row"
            spacing={3}>
            {/* 필수사항 */}
            <Stack
              spacing={3}
              sx={{ flex: 2 }}>
              <Typography
                variant="subtitle1"
                color="primary">
                필수사항
              </Typography>

              <FormControl fullWidth>
                <InputLabel>단계</InputLabel>
                <Select
                  value={formData.stage}
                  label="단계"
                  onChange={e =>
                    onChange({ ...formData, stage: e.target.value })
                  }>
                  <MenuItem value="요구사항">요구사항</MenuItem>
                  <MenuItem value="설계">설계</MenuItem>
                  <MenuItem value="개발">개발</MenuItem>
                  <MenuItem value="테스트">테스트</MenuItem>
                  <MenuItem value="배포">배포</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="제목"
                value={formData.title}
                onChange={e => onChange({ ...formData, title: e.target.value })}
                required
                fullWidth
                placeholder="제목을 입력하세요"
              />

              <TextField
                label="내용"
                value={formData.content}
                onChange={e =>
                  onChange({ ...formData, content: e.target.value })
                }
                multiline
                rows={10}
                required
                fullWidth
                placeholder="내용을 입력하세요"
              />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}>
                  첨부파일 선택사항 (최대 10개)
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#F8F9FA',
                    borderRadius: 1,
                    textAlign: 'center',
                    border: '1px dashed #DDE2E6',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                  <Typography>파일을 드래그하거나 클릭하여 업로드</Typography>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}>
                  관련 링크 선택사항 (최대 10개)
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}>
                  <TextField
                    value={linkTitle}
                    onChange={e => setLinkTitle(e.target.value)}
                    placeholder="링크 제목"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="URL"
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Link2 size={16} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    onClick={handleAddLink}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 64 }}>
                    추가
                  </Button>
                </Stack>
              </Box>
            </Stack>

            {/* 선택사항 */}
            <Stack
              spacing={3}
              sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                color="primary">
                선택사항
              </Typography>

              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={formData.priority}
                  label="우선순위"
                  onChange={e =>
                    onChange({ ...formData, priority: e.target.value })
                  }>
                  <MenuItem value="낮음">낮음</MenuItem>
                  <MenuItem value="보통">보통</MenuItem>
                  <MenuItem value="높음">높음</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="마감일"
                type="date"
                value={formData.dueDate || ''}
                onChange={e =>
                  onChange({ ...formData, dueDate: e.target.value })
                }
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-start">
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 120 }}>
              {mode === 'edit' ? '수정' : '등록'}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default ArticleForm
