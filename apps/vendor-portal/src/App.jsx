import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Login from './pages/Login'
import AppShell from './components/AppShell'

export default function App() {
  const vendor = useStore(s => s.vendor)
  if (!vendor) return <Login />
  return (
    <Routes>
      <Route path="/*" element={<AppShell />} />
    </Routes>
  )
}
