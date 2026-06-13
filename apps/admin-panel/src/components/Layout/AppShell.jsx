import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Toast from '../UI/Toast'
import Dashboard from '../../pages/Dashboard'
import ApprovalQueue from '../../pages/ApprovalQueue'
import DeadStock from '../../pages/DeadStock'
import Settlements from '../../pages/Settlements'
import Vendors from '../../pages/Vendors'
import Inventory from '../../pages/Inventory'
import AuditLogs from '../../pages/AuditLogs'

export default function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-full bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar path={pathname} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/approvals" element={<ApprovalQueue />} />
            <Route path="/deadstock" element={<DeadStock />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  )
}
