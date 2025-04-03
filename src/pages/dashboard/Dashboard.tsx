import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          환영합니다! 프로젝트 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            진행중인 프로젝트
          </h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">대기중인 승인</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-600">5</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            완료된 프로젝트
          </h2>
          <p className="mt-2 text-3xl font-bold text-green-600">8</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          최근 프로젝트
        </h2>
        <div className="space-y-4">
          {/* 프로젝트 목록이 들어갈 자리 */}
          <div className="border-b pb-4">
            <h3 className="font-medium text-gray-900">프로젝트 A</h3>
            <p className="text-sm text-gray-600">진행중</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium text-gray-900">프로젝트 B</h3>
            <p className="text-sm text-gray-600">승인 대기중</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
