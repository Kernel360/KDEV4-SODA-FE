import React, { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Comment as CommentIcon,
  Article as ArticleIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { noticeService } from '../../services/noticeService'
import type { Notice } from '../../types/notice'
import { formatDistanceToNow, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'

interface NoticeResponse {
  content: Notice[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // 초기 알림 목록 로드
    console.log('NotificationCenter mounted')
    loadNotices()

    // SSE 구독
    noticeService.subscribeToNotices((notice) => {
      console.log('New notice received:', notice)
      setNotices((prev) => [notice, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      noticeService.unsubscribe()
    }
  }, [navigate])

  useEffect(() => {
    console.log('anchorEl changed:', anchorEl)
  }, [anchorEl])

  const loadNotices = async () => {
    try {
      console.log('Loading notices...')
      const response = await noticeService.getNotices()
      console.log('Loaded notices response:', response)
      if (response.data?.content) {
        setNotices(response.data.content)
        setUnreadCount(response.data.content.filter((notice) => !notice.isRead).length)
      } else {
        setNotices([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to load notices:', error)
      setNotices([])
      setUnreadCount(0)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('IconButton clicked')
    console.log('event.currentTarget:', event.currentTarget)
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    console.log('Menu closed')
    setAnchorEl(null)
  }

  const handleNoticeClick = async (notice: Notice) => {
    try {
      // 먼저 화면 이동
      navigate(notice.link)
      handleClose()

      // 그 다음 읽음 상태 변경
      if (!notice.isRead) {
        await noticeService.markAsRead(notice.notificationId)
        // 읽음 처리된 알림을 목록에서 제거
        setNotices((prev) => prev.filter((n) => n.notificationId !== notice.notificationId))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to handle notice click:', error)
      // 에러가 발생해도 화면 이동은 유지
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await noticeService.markAllAsRead()
      // 모든 알림을 목록에서 제거
      setNotices([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNoticeIcon = (type: Notice['type']) => {
    switch (type) {
      case 'NEW_COMMENT_ON_POST':
        return <CommentIcon />
      case 'NEW_ARTICLE':
      case 'ARTICLE_STATUS_CHANGED':
        return <ArticleIcon />
      case 'PROJECT_STATUS_CHANGED':
      case 'NEW_PROJECT_MEMBER':
      case 'NEW_PROJECT_ASSIGNMENT':
        return <AssignmentIcon />
      default:
        return <BusinessIcon />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (!isValid(date)) {
        return '날짜 정보 없음'
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: ko })
    } catch (error) {
      console.error('Error formatting date:', error)
      return '날짜 정보 없음'
    }
  }

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          ml: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}>
        <Badge
          badgeContent={unreadCount}
          color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(event, reason) => {
          console.log('Menu onClose:', reason)
          handleClose()
        }}
        keepMounted
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480
          }
        }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <Typography variant="h6">알림</Typography>
          {notices.length > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}>
              모두 읽음 표시
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notices && notices.length > 0 ? (
            notices.map((notice) => (
              <ListItem
                key={notice.memberNoticeId}
                button
                onClick={() => handleNoticeClick(notice)}
                sx={{
                  bgcolor: notice.isRead ? 'inherit' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}>
                <ListItemIcon>{getNoticeIcon(notice.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word'
                      }}>
                      {notice.message}
                    </Typography>
                  }
                  secondary={formatDate(notice.createdAt)}
                />
              </ListItem>
            ))
          ) : (
            <ListItem key="no-notices">
              <ListItemText
                primary="알림이 없습니다"
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          )}
        </List>
      </Menu>
    </>
  )
}

export default NotificationCenter 