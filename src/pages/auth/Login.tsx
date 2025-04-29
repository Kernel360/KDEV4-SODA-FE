import React, { useState, useEffect } from 'react'
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
  const [showTitle, setShowTitle] = useState(false)
  const [showSoda, setShowSoda] = useState(false)
  const [jump, setJump] = useState(false)

  useEffect(() => {
    setShowTitle(false)
    setShowSoda(false)
    setJump(false)
    const t1 = setTimeout(() => setShowTitle(true), 100)
    const t2 = setTimeout(() => setShowSoda(true), 600)
    const t3 = setTimeout(() => setJump(true), 1200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

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
      } else if (response.code === '2301') {
        showToast('등록되지 않은 아이디입니다.', 'error')
      } else {
        showToast('로그인에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('아이디 또는 비밀번호가 일치하지 않습니다.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="fixed left-0 right-0 top-0 z-10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="text-2xl font-bold tracking-tight text-[#FFB800]">SODA</div>
        </div>
      </header>

      <main className="flex-1 pt-16 relative">
        {/* <img src="logo.png" alt="SODA" className="hidden lg:block absolute z-20" style={{ top: '120px', left: '38%', width: '220px', height: '220px' }} /> */}
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
          <section className="hidden lg:order-1 lg:block">
            <div className="flex flex-row items-start w-full max-w-3xl xl:max-w-5xl">
              <div className="flex flex-col justify-start min-w-[480px] xl:min-w-[600px]">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-4 whitespace-pre-line flex flex-col">
                  <span
                    className={`inline-block transition-all duration-700 ${showTitle ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'}`}
                  >
                    <span className={`inline-block transition-all duration-300 ${jump ? 'text-[#FFB800] animate-bounce' : ''}`}>소</span>통의 사<span className={`inline-block transition-all duration-300 ${jump ? 'text-[#FFB800] animate-bounce' : ''}`}>다</span>리,
                  </span>
                  <span
                    className={`inline-block transition-all duration-700 ${showSoda ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'}`}
                    style={{ transitionDelay: '0.2s' }}
                  >
                    <span className="text-[#FFB800]">SODA</span>
                  </span>
                </h1>
                <p className="text-muted-foreground mb-8 text-base leading-relaxed sm:text-lg lg:mb-16">
                  SODA는 웹 에이전시와 고객사 간의 원활한 협업을 위한 <br></br>올인원 프로젝트 관리 플랫폼입니다.
                </p>
                <div className="grid gap-4 sm:grid-cols-1 sm:gap-6 w-full max-w-full">
                  <div className="flex items-center bg-[#F2F2F2] rounded-xl p-6">
                    <img src="logo.png" alt="SODA" className="h-20 w-20 mr-6" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        SODA-FE Repository
                        <svg className="w-6 h-6 text-gray-700 ml-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        React와 TypeScript를 활용한 프론트엔드 코드베이스입니다. <br></br>사용자 인터페이스와 상호작용을 구현한 저장소입니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-[#F2F2F2] rounded-xl p-6 mt-4">
                    <img src="logo.png" alt="SODA" className="h-20 w-20 mr-6" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        SODA-BE Repository
                        <svg className="w-6 h-6 text-gray-700 ml-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Spring Boot 기반의 백엔드 코드베이스입니다. <br></br>서버 로직과 데이터베이스 관리를 담당하는 저장소입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center justify-center lg:order-2 lg:justify-end">
            <div className="w-full max-w-md">
              <div className="rounded-xl bg-[#FFEFD7] px-8 py-4 text-center mb-6 shadow-sm mx-auto" style={{maxWidth: '310px'}}>
                <div className="font-medium text-lg mb-3">✴️ 테스트 계정 안내 (ID / PW)</div>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="mb-2">
                    <span className="font-medium">관리자: </span>
                    admin01 / admin01!
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">개발사: </span>
                    user01 / user01!
                  </div>
                  <div>
                    <span className="font-medium">고객사: </span>
                    user03 / user03!
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      로그인
                    </h2>
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
                        className="flex h-11 w-full rounded-lg border border-orange-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:h-12 sm:text-base"
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
                        className="flex h-11 w-full rounded-lg border border-orange-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:h-12 sm:text-base"
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
                      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FFB800] px-6 font-medium text-white transition-colors hover:bg-[#E5A600] focus:outline-none focus:ring-2 focus:ring-[#FFB800] focus:ring-offset-2 disabled:opacity-50 sm:h-12 sm:text-base"
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
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-auto bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-full text-sm">
              <span className="font-extrabold text-[#FFB800] mr-1">SODA</span>
              <span className="text-gray-400">Copyright </span>
              <span className="font-bold text-black mx-1">© SODA Corp.</span>
              <span className="text-gray-400">All Rights Reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login
