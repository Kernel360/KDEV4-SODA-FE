import React, { useState } from 'react'
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Stack
} from '@mui/material'
import { Link2, X, Plus } from 'lucide-react'

interface Link {
  title: string
  url: string
}

interface LinkInputProps {
  links: Link[]
  onLinkAdd: (link: Link) => void
  onLinkRemove: (index: number) => void
  maxLinks?: number
}

const LinkInput: React.FC<LinkInputProps> = ({
  links,
  onLinkAdd,
  onLinkRemove,
  maxLinks = 10
}) => {
  const [newLink, setNewLink] = useState<Link>({
    title: '',
    url: ''
  })

  const handleAddLink = () => {
    if (newLink.title && newLink.url && links.length < maxLinks) {
      onLinkAdd(newLink)
      setNewLink({ title: '', url: '' })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddLink()
    }
  }

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 2 }}>
        <TextField
          size="small"
          value={newLink.title}
          onChange={e =>
            setNewLink(prev => ({ ...prev, title: e.target.value }))
          }
          onKeyPress={handleKeyPress}
          placeholder="링크 제목"
          sx={{ width: '30%' }}
        />
        <TextField
          size="small"
          value={newLink.url}
          onChange={e => setNewLink(prev => ({ ...prev, url: e.target.value }))}
          onKeyPress={handleKeyPress}
          placeholder="URL"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <Link2
                size={20}
                style={{ marginRight: 8 }}
              />
            )
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddLink}
          disabled={links.length >= maxLinks || !newLink.title || !newLink.url}
          startIcon={<Plus size={20} />}
          sx={{ minWidth: '80px' }}>
          추가
        </Button>
      </Stack>

      <List>
        {links.map((link, index) => (
          <ListItem key={index}>
            <Link2
              size={20}
              style={{ marginRight: 8 }}
            />
            <ListItemText
              primary={link.title}
              secondary={link.url}
              primaryTypographyProps={{
                style: {
                  fontWeight: 500
                }
              }}
              secondaryTypographyProps={{
                style: {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => onLinkRemove(index)}
                size="small">
                <X size={20} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default LinkInput
