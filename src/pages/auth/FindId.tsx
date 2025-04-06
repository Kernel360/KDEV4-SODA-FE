import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { findId } from '../../api/auth';
import type { FindIdRequest } from '../../types/api';

const FindId: React.FC = () => {
  const [formData, setFormData] = useState<FindIdRequest>({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundId, setFoundId] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await findId(formData);
      if (response.status === 'success' && response.data) {
        setFoundId(response.data.maskedAuthId);
        setSuccess(true);
      } else {
        setError(response.message || '아이디 찾기 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('아이디 찾기 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
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
            {!success ? (
              <>
                <div className="mb-8 space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">아이디 찾기</h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    가입 시 등록한 이름과 이메일을 입력해 주세요.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-gray-900 sm:text-base" htmlFor="name">
                      이름
                    </label>
                    <input
                      type="text"
                      className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="이름을 입력하세요"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-gray-900 sm:text-base" htmlFor="email">
                      이메일
                    </label>
                    <input
                      type="email"
                      className="flex h-11 w-full rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:h-12 sm:text-base"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
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
                      "아이디 찾기"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    아이디 찾기 완료
                  </h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    회원님의 아이디를 확인해 주세요.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-lg font-semibold text-gray-900">{foundId}</p>
                </div>

                <p className="text-sm text-gray-500">
                  개인정보 보호를 위해 아이디의 일부만 표시됩니다.
                </p>

                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base"
                  >
                    로그인하기
                  </Link>
                  <Link
                    to="/find-password"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-6 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-12 sm:text-base"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
              </div>
            )}
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

export default FindId; 