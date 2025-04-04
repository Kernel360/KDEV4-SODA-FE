import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material'
import FileUpload from '../common/FileUpload'
import LinkInput from '../common/LinkInput'

const stages = ['기획', '디자인', '퍼블리싱', '개발', '검수']
const priorities = ['높음', '중간', '낮음']

export interface Link {
  title: string
  url: string
}

export interface ArticleFormData {
  title: string
  content: string
  stage: string
  priority?: string
  files: File[]
  links: Link[]
  dueDate?: string
}

interface ArticleFormProps {
  formData: ArticleFormData
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: ArticleFormData) => void
  onCancel: () => void
  submitLabel?: string
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onCancel,
  submitLabel = '등록'
}) => {
  const handleFileAdd = (newFiles: File[]) => {
    onChange({
      ...formData,
      files: [...formData.files, ...newFiles]
    })
  }

  const handleFileRemove = (index: number) => {
    onChange({
      ...formData,
      files: formData.files.filter((_, i) => i !== index)
    })
  }

  const handleLinkAdd = (link: Link) => {
    onChange({
      ...formData,
      links: [...formData.links, link]
    })
  }

  const handleLinkRemove = (index: number) => {
    onChange({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    })
  }

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={3}>
        {/* 왼쪽 영역: 필수 입력 항목들 */}
        <Stack
          spacing={2}
          sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            color="primary">
            필수사항
          </Typography>

          <FormControl
            fullWidth
            size="small">
            <InputLabel>단계</InputLabel>
            <Select
              value={formData.stage}
              label="단계"
              onChange={e => onChange({ ...formData, stage: e.target.value })}
              required>
              {stages.map(stage => (
                <MenuItem
                  key={stage}
                  value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="제목"
            value={formData.title}
            onChange={e => onChange({ ...formData, title: e.target.value })}
            required
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="내용"
            value={formData.content}
            onChange={e => onChange({ ...formData, content: e.target.value })}
            required
          />

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}>
              <Typography variant="subtitle2">첨부파일</Typography>
              <Typography
                variant="caption"
                color="text.secondary">
                선택사항 (최대 10개)
              </Typography>
            </Stack>
            <FileUpload
              files={formData.files}
              onFileAdd={handleFileAdd}
              onFileRemove={handleFileRemove}
              maxFiles={10}
            />
          </Box>

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}>
              <Typography variant="subtitle2">관련 링크</Typography>
              <Typography
                variant="caption"
                color="text.secondary">
                선택사항 (최대 10개)
              </Typography>
            </Stack>
            <LinkInput
              links={formData.links}
              onLinkAdd={handleLinkAdd}
              onLinkRemove={handleLinkRemove}
              maxLinks={10}
            />
          </Box>
        </Stack>

        {/* 오른쪽 영역: 선택 입력 항목들 */}
        <Stack
          spacing={2}
          sx={{ width: 280 }}>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            color="primary">
            선택사항
          </Typography>

          <FormControl
            fullWidth
            size="small">
            <InputLabel>우선순위</InputLabel>
            <Select
              value={formData.priority || ''}
              label="우선순위"
              onChange={e =>
                onChange({ ...formData, priority: e.target.value })
              }>
              {priorities.map(priority => (
                <MenuItem
                  key={priority}
                  value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="마감일"
            type="date"
            value={formData.dueDate || ''}
            onChange={e => onChange({ ...formData, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true
            }}
          />
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-start"
        sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          variant="contained">
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  )
}

export default ArticleForm
