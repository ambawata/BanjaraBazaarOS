import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell_v1_20260717'

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppShell />} />
    </Routes>
  )
}
