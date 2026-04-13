import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../store/auth'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAdminAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
