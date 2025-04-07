import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset, verifyCode, resetPassword } from '../../api/auth';
import { ApiResponse } from '../../types/api';

const FindPassword: React.FC = () => {
  // 단계 관리
  const [step, setStep] = useState(1);
  
  // 폼 데이터
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(180); // 3분 타이머

  // 타이머 관리
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // 타이머 포맷팅
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 인증번호 요청 처리
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await requestPasswordReset({ email }) as ApiResponse;
      if (response.status === 'success') {
        setStep(2);
        setTimer(180);
      } else {
        setError(response.message || '인증번호 발송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('인증번호 발송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인 처리
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timer === 0) {
      setError('인증 시간이 만료되었습니다. 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyCode({ email, code: verificationCode }) as { email: string; verified: boolean };
      console.log('API Response:', JSON.stringify(response, null, 2));
      
      if (response.verified) {
        console.log('Verification successful, moving to step 3');
        setStep(3);
      } else {
        console.log('Verification failed:', response);
        setError('인증번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('인증번호 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 처리
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await resetPassword({
        email,
        newPassword
      });
      console.log('API Response:', response);
      
      if (response === null) {
        console.log('Password reset successful, redirecting to login');
        window.location.href = '/login';
      } else {
        console.log('Password reset failed:', response);
        setError('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="text-2xl font-bold tracking-tight">SODA</div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg sm:p-8">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                비밀번호 찾기
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {step === 1 && "가입 시 등록한 이메일을 입력하세요"}
                {step === 2 && "이메일로 발송된 인증번호를 입력하세요"}
                {step === 3 && "새로운 비밀번호를 설정하세요"}
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendVerification} className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-gray-900 sm:text-base" htmlFor="email">
                    이메일
                  </label>
                  <input
                    type="email"
                    className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                    "인증번호 받기"
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 sm:text-base" htmlFor="verificationCode">
                      인증번호
                    </label>
                    <span className="text-sm text-gray-500">
                      남은 시간: {formatTime(timer)}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 6자리 입력"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base disabled:opacity-50"
                    disabled={isLoading || timer === 0}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
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
                      "인증번호 확인"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-6 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base"
                  >
                    인증번호 다시 받기
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-gray-900 sm:text-base" htmlFor="newPassword">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-gray-900 sm:text-base" htmlFor="confirmPassword">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                    "비밀번호 변경"
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">© 2024 소다. 모든 권리 보유.</p>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">고객센터: 02-123-4567</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FindPassword; 