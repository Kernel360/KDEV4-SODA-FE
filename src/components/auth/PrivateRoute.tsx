import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'
import { useToast } from '../../contexts/ToastContext'

interface PrivateRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user } = useUserStore()
  const location = useLocation()
  const { showToast } = useToast()

  if (!user) {
    showToast('로그인이 필요합니다.', 'error')
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    showToast('접근 권한이 없습니다.', 'error')
    return (
      <Navigate
        to="/user"
        replace
      />
    )
  }

  return <>{children}</>
}

export default PrivateRoute
