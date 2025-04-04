import React from 'react'

const ResetPassword: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="sr-only">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
              placeholder="이메일"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              비밀번호 재설정 링크 받기
            </button>
          </div>

          <div className="text-center text-sm">
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500">
              로그인으로 돌아가기
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
