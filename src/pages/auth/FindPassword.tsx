import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestPasswordReset, verifyCode, resetPassword } from '../../api/auth'
import type { ApiResponse } from '../../types/api'

interface VerifyCodeResponse {
  email: string
  verified: boolean
}

const FindPassword: React.FC = () => {
  const navigate = useNavigate()
  // 단계 관리
  const [step, setStep] = useState(1)

  // 폼 데이터
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(180) // 3분 타이머

  // 타이머 관리
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer])

  // 타이머 포맷팅
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 인증번호 요청 처리
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = (await requestPasswordReset({
        email
      })) as ApiResponse<null>
      
      // API 응답 로깅 추가
      console.log('비밀번호 찾기 API 응답:', response)

      // 성공 응답 처리
      if (response.status === 'success') {
        setStep(2)
        setTimer(180)
        return
      }

      // 실패 응답 처리
      const errorMessage = response.message || '인증번호 발송 중 오류가 발생했습니다.'
      
      // 가입되지 않은 이메일인 경우
      if (response.code === '404' || 
          errorMessage.includes('가입되지 않은 이메일') ||
          errorMessage.includes('존재하지 않는 사용자')) {
        setError('가입되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.')
        return
      }

      // 기타 에러 처리
      setError(errorMessage)

    } catch (error: any) {
      console.error('비밀번호 찾기 API 에러:', error)
      
      // API 에러 응답 처리
      const errorData = error.response?.data
      const errorMessage = errorData?.message || '인증번호 발송 중 오류가 발생했습니다.'
      
      // 가입되지 않은 이메일인 경우
      if (errorData?.code === '404' || 
          errorMessage.includes('가입되지 않은 이메일') ||
          errorMessage.includes('존재하지 않는 사용자')) {
        setError('가입되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.')
        return
      }

      // 기타 에러 처리
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 인증번호 확인 처리
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (timer === 0) {
      setError('인증 시간이 만료되었습니다. 다시 시도해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = (await verifyCode({
        email,
        code: verificationCode
      })) as ApiResponse<VerifyCodeResponse>

      console.log('인증번호 확인 응답:', response)

      if (response.status === 'success') {
        if (response.data?.verified) {
          console.log('인증 성공, 다음 단계로 이동')
          setStep(3)
        } else {
          console.log('인증 실패: verified가 false')
          setError('인증번호가 일치하지 않습니다.')
        }
      } else {
        console.log('인증 실패: 서버 에러', response.message)
        setError(response.message || '인증번호 확인 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('인증번호 확인 중 에러:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('인증번호 확인 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 재설정 처리
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = (await resetPassword({
        email,
        newPassword
      })) as ApiResponse<null>

      if (response.status === 'success') {
        navigate('/login', { replace: true })
      } else {
        setError(response.message || '비밀번호 변경 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="fixed left-0 right-0 top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <span className="text-2xl font-extrabold text-[#FFB800]">SODA</span>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                비밀번호 찾기
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {step === 1 && '가입 시 등록한 이메일을 입력하세요'}
                {step === 2 && '이메일로 발송된 인증번호를 입력하세요'}
                {step === 3 && '새로운 비밀번호를 설정하세요'}
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 1 && (
              <form
                onSubmit={handleSendVerification}
                className="space-y-6">
                <div className="space-y-2.5">
                  <label
                    className="text-sm font-medium text-gray-900 sm:text-base"
                    htmlFor="email">
                    이메일
                  </label>
                  <input
                    type="email"
                    className="flex h-11 w-full rounded-lg border border-orange-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:h-12 sm:text-base"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FFB800] px-6 font-medium text-white transition-colors hover:bg-[#FFA000] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 sm:h-12 sm:text-base"
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
                    '인증번호 받기'
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={handleVerifyCode}
                className="space-y-6">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-medium text-gray-900 sm:text-base"
                      htmlFor="verificationCode">
                      인증번호
                    </label>
                    <span className="text-sm text-gray-500">
                      남은 시간: {formatTime(timer)}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="flex h-11 w-full rounded-lg border border-orange-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:h-12 sm:text-base"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="인증번호 6자리 입력"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FFB800] px-6 font-medium text-white transition-colors hover:bg-[#FFA000] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 sm:h-12 sm:text-base"
                    disabled={isLoading || timer === 0}>
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
                      '인증번호 확인'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-orange-200 bg-white px-6 font-medium text-gray-900 transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 sm:h-12 sm:text-base">
                    인증번호 다시 받기
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-6">
                <div className="space-y-2.5">
                  <label
                    className="text-sm font-medium text-gray-900 sm:text-base"
                    htmlFor="newPassword">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    className="flex h-11 w-full rounded-lg border border-orange-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:h-12 sm:text-base"
                    id="newPassword"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <label
                    className="text-sm font-medium text-gray-900 sm:text-base"
                    htmlFor="confirmPassword">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    className="flex h-11 w-full rounded-lg border border-orange-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:h-12 sm:text-base"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FFB800] px-6 font-medium text-white transition-colors hover:bg-[#FFA000] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 sm:h-12 sm:text-base"
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
                    '비밀번호 변경'
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
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

export default FindPassword
