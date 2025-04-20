import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import type { LoginRequest, User } from '../../types/api'
import { useUserStore } from '../../stores/userStore'
import { useToast } from '../../contexts/ToastContext'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { setUser } = useUserStore()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<LoginRequest>({
    authId: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await login(formData)
      console.log('Login Response:', response)

      if (response.status === 'success' && response.data) {
        // 토큰이 없으면 에러 처리
        if (!response.data.token) {
          setError('토큰이 없습니다. 다시 시도해주세요.')
          return
        }

        // 토큰과 사용자 정보 저장
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data))

        // userStore 상태 업데이트
        const userData: User = {
          id: response.data.data.memberId,
          memberId: response.data.data.memberId,
          name: response.data.data.name,
          authId: response.data.data.authId,
          position: response.data.data.position,
          phoneNumber: response.data.data.phoneNumber,
          role: response.data.data.role.toUpperCase() as 'ADMIN' | 'USER',
          firstLogin: response.data.data.firstLogin,
          email: '',
          company: response.data.data.company
        }
        setUser(userData)
        showToast('환영합니다!', 'success')

        // firstLogin 값 확인하여 초기 정보 설정 화면으로 리다이렉션
        if (response.data.data.firstLogin) {
          navigate('/user-info')
          return
        }

        // role에 따른 라우팅 (대소문자 구분 없이 체크)
        console.log('User Role:', response.data.data.role)
        const userRole = response.data.data.role?.toUpperCase()
        if (userRole === 'ADMIN') {
          navigate('/admin')
        } else if (userRole === 'USER') {
          navigate('/user')
        } else {
          setError('잘못된 사용자 역할입니다.')
        }
      } else {
        showToast('로그인에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('로그인 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="fixed left-0 right-0 top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="text-2xl font-bold tracking-tight">SODA</div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
          <section className="hidden lg:order-1 lg:block">
            <div>
              <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-extrabold tracking-tight text-gray-900 text-transparent sm:text-4xl lg:mb-6 lg:text-6xl">
                프로젝트 관리의
                <br className="hidden sm:block" />
                새로운 기준
              </h1>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed sm:text-lg lg:mb-16">
                소다는 웹 에이전시와 고객사 간의 원활한 협업을 위한 올인원
                프로젝트 관리 플랫폼입니다. 실시간 소통과 체계적인 프로세스
                관리로 프로젝트 성공을 지원합니다.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="text-card-foreground group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg sm:p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
                    회원 관리
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    체계적인 사용자 권한 관리와 팀 협업 기능을 제공합니다
                  </p>
                </div>
                <div className="text-card-foreground group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg sm:p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
                    프로젝트 관리
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    직관적인 대시보드로 프로젝트 진행 상황을 한눈에 파악할 수
                    있습니다
                  </p>
                </div>
                <div className="text-card-foreground group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg sm:p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
                    커뮤니케이션
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    실시간 알림과 댓글로 원활한 소통이 가능합니다
                  </p>
                </div>
                <div className="text-card-foreground group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg sm:p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
                    승인 프로세스
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    단계별 승인 절차로 업무 진행을 체계적으로 관리합니다
                  </p>
                </div>
                <div className="text-card-foreground group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg sm:p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
                    자료 관리
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    프로젝트 산출물과 문서를 체계적으로 관리할 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center lg:order-2 lg:justify-end">
            <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg sm:p-8 lg:max-w-md">
              <form
                className="space-y-6"
                onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    로그인
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    소다 서비스를 이용하시려면 로그인해 주세요.<br></br><br></br>
                    어드민 ID,PW: admin01 / admin01!<br></br>
                    사용자 ID,PW: seoyeon1234 / password1234
                  </p>
                </div>
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label
                      className="text-sm font-medium text-gray-900 sm:text-base"
                      htmlFor="authId">
                      아이디
                    </label>
                    <input
                      type="text"
                      className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                      id="authId"
                      name="authId"
                      placeholder="아이디를 입력하세요"
                      required
                      value={formData.authId}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label
                      className="text-sm font-medium text-gray-900 sm:text-base"
                      htmlFor="password">
                      비밀번호
                    </label>
                    <input
                      type="password"
                      className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 sm:h-12 sm:text-base"
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        처리중...
                      </>
                    ) : (
                      '로그인'
                    )}
                  </button>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <Link
                      to="/find-id"
                      className="transition-colors hover:text-gray-900">
                      아이디 찾기
                    </Link>
                    <div className="h-4 w-px bg-gray-200" />
                    <Link
                      to="/find-password"
                      className="transition-colors hover:text-gray-900">
                      비밀번호 찾기
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-auto bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              © 2024 소다. 모든 권리 보유.
            </p>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                고객센터: 02-123-4567
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login
