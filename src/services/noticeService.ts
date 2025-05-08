import { client } from './client'
import type { Notice } from '../types/notice'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { ApiResponse } from '../types/api'

interface NoticeResponse {
  content: Notice[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

class NoticeService {
  private controller: AbortController | null = null

  subscribeToNotices(onNotice: (notice: Notice) => void) {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No access token found')
      return
    }

    // 기존 연결이 있다면 중단
    if (this.controller) {
      this.controller.abort()
    }

    // 새로운 AbortController 생성
    this.controller = new AbortController()

    // SSE 연결 설정
    fetchEventSource('https://api.s0da.co.kr/notifications/subscribe', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      },
      signal: this.controller.signal,
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get('content-type') === 'text/event-stream'
        ) {
          console.log('SSE connection opened successfully')
          return
        } else if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          console.error(
            'SSE connection failed:',
            response.status,
            response.statusText
          )
          throw new Error('Client error')
        } else {
          console.error(
            'SSE connection failed:',
            response.status,
            response.statusText
          )
          throw new Error('Server error')
        }
      },
      onmessage(event) {
        try {
          // 서버에서 보내는 메시지가 JSON 형식인 경우에만 파싱
          if (event.data.startsWith('{')) {
            const notice: Notice = JSON.parse(event.data)
            onNotice(notice)
          } else {
            // 일반 텍스트 메시지는 무시
            console.log('Received text message:', event.data)
          }
        } catch (error) {
          console.error('Error parsing notice:', error)
        }
      },
      onerror(err) {
        console.error('EventSource failed:', err)
        // 기본적으로 라이브러리가 재연결을 시도합니다
      }
    }).catch(error => {
      console.error('SSE connection error:', error)
    })
  }

  unsubscribe() {
    if (this.controller) {
      this.controller.abort()
      this.controller = null
    }
  }

  async getNotices(): Promise<ApiResponse<NoticeResponse>> {
    try {
      const response = await client.get('/notifications')
      console.log('Notices API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notices:', error)
      throw error
    }
  }

  async markAsRead(notificationId: number): Promise<void> {
    try {
      await client.patch(`/notifications/${notificationId}/read`)
    } catch (error) {
      console.error('Failed to mark notice as read:', error)
      throw error
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await client.patch('/notifications/read-all')
    } catch (error) {
      console.error('Failed to mark all notices as read:', error)
    }
  }
}

export const noticeService = new NoticeService()
