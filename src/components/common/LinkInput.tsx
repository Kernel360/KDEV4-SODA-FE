import React, { useState } from 'react'
import { Box, TextField, Button, Stack, Typography } from '@mui/material'
import { Link2 } from 'lucide-react'

interface Link {
  title: string
  url: string
}

interface LinkInputProps {
  links: Link[]
  onChange: (links: Link[]) => void
  maxLinks?: number
}

const LinkInput: React.FC<LinkInputProps> = ({
  links,
  onChange,
  maxLinks = 5
}) => {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const handleAdd = () => {
    if (title.trim() && url.trim()) {
      if (links.length >= maxLinks) {
        alert(`최대 ${maxLinks}개의 링크만 추가할 수 있습니다.`)
        return
      }
      onChange([...links, { title, url }])
      setTitle('')
      setUrl('')
    }
  }

  const handleRemove = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    onChange(newLinks)
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1 }}>
        관련 링크
      </Typography>
      <Stack spacing={1}>
        {links.map((link, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1}>
            <Typography variant="body2">{link.title}</Typography>
            <Button
              size="small"
              onClick={() => handleRemove(index)}>
              삭제
            </Button>
          </Stack>
        ))}
        {links.length < maxLinks && (
          <Stack
            direction="row"
            spacing={1}>
            <TextField
              size="small"
              placeholder="링크 제목"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <TextField
              size="small"
              placeholder="URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <Button
              startIcon={<Link2 size={16} />}
              onClick={handleAdd}>
              추가
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default LinkInput
