import { useState, useEffect, createContext } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppShell } from '@shared/ui'
import { getToken, getAdminName, clearSession } from './lib/api'
import Login from './pages/Login'
import Dashboard from './screens/Dashboard'
import ApprovalQueue from './screens/ApprovalQueue'
import ActiveProducts from './screens/ActiveProducts'
import Negotiations from './screens/Negotiations'
import DeadStock from './screens/DeadStock'
import Pickup from './screens/Pickup'
import InventoryScreen from './screens/InventoryScreen'
import Damage from './screens/Damage'
import Floor from './screens/Floor'
import VendorsScreen from './screens/VendorsScreen'
import Settlements from './screens/Settlements'
import Advances from './screens/Advances'
import Sales from './screens/Sales'
import Invoices from './screens/Invoices'
import Expenses from './screens/Expenses'
import GST from './screens/GST'
import CashFlow from './screens/CashFlow'
import StaffDirectory from './screens/StaffDirectory'
import Attendance from './screens/Attendance'
import Customers from './screens/Customers'
import WhatsApp from './screens/WhatsApp'
import Analytics from './screens/Analytics'
import Notifications from './screens/Notifications'
import Roles from './screens/Roles'
import AuditLogs from './screens/AuditLogs'
import Backup from './screens/Backup'
import Settings from './screens/Settings'

export const AppCtx = createContext(null)

// Migrated to the shared shared/ui/ AppShell+Sidebar (PR #5) — replaces the
// hand-rolled #sidebar/#topbar markup this file used to render inline
// (there was never a dedicated local Sidebar.jsx/AppShell.jsx actually in
// use for this app; those files existed in src/components/Layout/ but were
// dead code — see docs/LEGACY_VANILLA_HTML_REFERENCE.md and this branch's
// PR description for the full discovery). `pages` keeps its page-title
// strings (now `titles`, keyed by /admin/<id> route path instead of a bare
// id) but drops the old breadcrumb sub-line — the shared AppShell's header
// only supports a single title line, same as vastu-griha's.
const pages = {
  'dashboard': 'Dashboard',
  'approval': 'Approval Queue',
  'active-products': 'Active Products',
  'negotiations': 'Negotiations',
  'dead-stock': 'Dead Stock',
  'pickup': 'Pickup Requests',
  'inventory': 'Live Inventory',
  'damage': 'Damage Register',
  'floor': 'Floor Sections',
  'vendors': 'Vendor Directory',
  'settlements': 'Settlements',
  'advances': 'Advance Payments',
  'sales': 'Live Sales & POS',
  'invoices': 'Invoices',
  'expenses': 'Expenses',
  'gst': 'GST & Accounting',
  'cashflow': 'Cash Flow',
  'staff': 'Staff Directory',
  'attendance': 'Attendance',
  'customers': 'Customers',
  'whatsapp': 'WhatsApp Campaigns',
  'analytics': 'Analytics Center',
  'notifications': 'Notifications',
  'roles': 'Roles & Permissions',
  'audit': 'Audit Logs',
  'backup': 'Backup & Export',
  'settings': 'System Settings',
}

const screenMap = {
  'dashboard': Dashboard,
  'approval': ApprovalQueue,
  'active-products': ActiveProducts,
  'negotiations': Negotiations,
  'dead-stock': DeadStock,
  'pickup': Pickup,
  'inventory': InventoryScreen,
  'damage': Damage,
  'floor': Floor,
  'vendors': VendorsScreen,
  'settlements': Settlements,
  'advances': Advances,
  'sales': Sales,
  'invoices': Invoices,
  'expenses': Expenses,
  'gst': GST,
  'cashflow': CashFlow,
  'staff': StaffDirectory,
  'attendance': Attendance,
  'customers': Customers,
  'whatsapp': WhatsApp,
  'analytics': Analytics,
  'notifications': Notifications,
  'roles': Roles,
  'audit': AuditLogs,
  'backup': Backup,
  'settings': Settings,
}

const titles = Object.fromEntries(
  Object.entries(pages).map(([id, label]) => ['/admin/' + id, label])
)

// Same 26 items / 9 sections / 4 badges as the old inline sidebar markup —
// see this branch's PR description for the exact before/after mapping.
// Icons stay as the `ti ti-<name>` webfont classes this app already loads
// via a CDN <link> in index.html (NOT @tabler/icons-react — that package
// is only used by the dead components/Layout/ + pages/ tree, never by this
// live App.jsx/screens/ tree). The shared Sidebar's `icon` slot accepts any
// node, so this needs no changes there.
const navItems = [
  { section: 'Main' },
  { to: '/admin/dashboard', label: 'Dashboard', icon: <i className="ti ti-layout-dashboard" /> },
  { section: 'Products' },
  { to: '/admin/approval', label: 'Approval Queue', icon: <i className="ti ti-checks" />, badge: '7', badgeColor: 'red' },
  { to: '/admin/active-products', label: 'Active Products', icon: <i className="ti ti-package" /> },
  { to: '/admin/negotiations', label: 'Negotiations', icon: <i className="ti ti-arrows-exchange" />, badge: '4', badgeColor: 'amber' },
  { to: '/admin/dead-stock', label: 'Dead Stock', icon: <i className="ti ti-clock-exclamation" />, badge: '12', badgeColor: 'red' },
  { to: '/admin/pickup', label: 'Pickup Requests', icon: <i className="ti ti-truck" /> },
  { section: 'Inventory' },
  { to: '/admin/inventory', label: 'Live Inventory', icon: <i className="ti ti-box" /> },
  { to: '/admin/damage', label: 'Damage Register', icon: <i className="ti ti-alert-triangle" /> },
  { to: '/admin/floor', label: 'Floor Sections', icon: <i className="ti ti-layout-2" /> },
  { section: 'Vendors' },
  { to: '/admin/vendors', label: 'Vendor Directory', icon: <i className="ti ti-users" /> },
  { to: '/admin/settlements', label: 'Settlements', icon: <i className="ti ti-credit-card" /> },
  { to: '/admin/advances', label: 'Advance Payments', icon: <i className="ti ti-coin" /> },
  { section: 'Sales' },
  { to: '/admin/sales', label: 'Live Sales & POS', icon: <i className="ti ti-receipt" /> },
  { to: '/admin/invoices', label: 'Invoices', icon: <i className="ti ti-file-invoice" /> },
  { section: 'Finance' },
  { to: '/admin/expenses', label: 'Expenses', icon: <i className="ti ti-wallet" /> },
  { to: '/admin/gst', label: 'GST & Accounting', icon: <i className="ti ti-report-money" /> },
  { to: '/admin/cashflow', label: 'Cash Flow', icon: <i className="ti ti-arrows-right-left" /> },
  { section: 'Staff' },
  { to: '/admin/staff', label: 'Staff Directory', icon: <i className="ti ti-id-badge" /> },
  { to: '/admin/attendance', label: 'Attendance', icon: <i className="ti ti-calendar-check" /> },
  { section: 'CRM' },
  { to: '/admin/customers', label: 'Customers', icon: <i className="ti ti-heart" /> },
  { to: '/admin/whatsapp', label: 'WhatsApp Campaigns', icon: <i className="ti ti-brand-whatsapp" /> },
  { section: 'Analytics' },
  { to: '/admin/analytics', label: 'Analytics Center', icon: <i className="ti ti-chart-bar" /> },
  { section: 'System' },
  { to: '/admin/notifications', label: 'Notifications', icon: <i className="ti ti-bell" />, badge: '5', badgeColor: 'red' },
  { to: '/admin/roles', label: 'Roles & Permissions', icon: <i className="ti ti-lock" /> },
  { to: '/admin/audit', label: 'Audit Logs', icon: <i className="ti ti-list-search" /> },
  { to: '/admin/backup', label: 'Backup & Export', icon: <i className="ti ti-database-export" /> },
  { to: '/admin/settings', label: 'System Settings', icon: <i className="ti ti-settings" /> },
]

export default function App() {
  const navigate = useNavigate()
  const [modal, setModal] = useState({ open: false, msg: '' })
  const [editModal, setEditModal] = useState({ open: false, data: {} })
  // Real login gate — see Login.jsx's docblock for why this needed adding.
  // `loggedIn` is a plain boolean re-derived from localStorage rather than
  // storing the token itself in state, since nothing here needs the token
  // value directly (lib/api.js's apiFetch reads it straight from
  // localStorage on every request).
  const [loggedIn, setLoggedIn] = useState(() => !!getToken())

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  // Thin wrapper so all 22 screens' existing `nav('some-id')` calls (cross-
  // screen links, e.g. ActiveProducts -> 'dead-stock', VendorsScreen ->
  // 'settlements') keep working unchanged against the same string ids,
  // just routed through react-router now instead of a local `current`
  // state switch.
  const nav = (id) => navigate('/admin/' + id)

  const confirmAction = (msg) => setModal({ open: true, msg })
  const closeModal = () => setModal({ open: false, msg: '' })

  const openEditProduct = (sku, name, vendor, base, sell, margin, stock, section, status) =>
    setEditModal({ open: true, data: { sku, name, vendor, base, sell, margin, stock, section, status } })
  const closeEditModal = () => setEditModal({ open: false, data: {} })

  const ctx = { confirmAction, nav, openEditProduct }

  const headerActions = (
    <>
      <button className="btn" onClick={() => nav('notifications')}><i className="ti ti-bell"></i></button>
      <button className="btn" onClick={() => nav('backup')}><i className="ti ti-database-export"></i> Backup</button>
      <button className="btn btn-primary" onClick={() => confirmAction('Sync triggered — pulling latest data from all connected systems. This may take a few seconds.')}><i className="ti ti-refresh"></i> Sync</button>
    </>
  )

  return (
    <AppCtx.Provider value={ctx}>
      <AppShell
        navItems={navItems}
        brandInitials="BB"
        brandName="BanjaraBazaar"
        brandSubtitle="Admin Panel"
        titles={titles}
        defaultTitle="Dashboard"
        footerNote={
          <>
            <strong className="block text-ink2 mb-0.5">BB GSTIN</strong>27AABCB1234F1ZX
            <div className="mt-1.5">Admin: {getAdminName() || 'Unknown'}</div>
            <button
              onClick={() => { clearSession(); setLoggedIn(false) }}
              className="mt-1.5 text-red hover:underline"
            >
              Logout
            </button>
          </>
        }
        headerActions={headerActions}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          {Object.entries(screenMap).map(([id, Screen]) => (
            <Route key={id} path={'/admin/' + id} element={<Screen />} />
          ))}
        </Routes>
      </AppShell>

      {/* Confirm Modal */}
      <div className={`modal-overlay${modal.open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="modal-box">
          <h3>Confirm Action</h3>
          <p style={{fontSize:'13px',color:'var(--text2)',lineHeight:'1.6'}}>{modal.msg}</p>
          <div className="modal-actions">
            <button className="btn" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={closeModal}><i className="ti ti-check"></i> Confirm</button>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <EditProductModal editModal={editModal} closeEditModal={closeEditModal} confirmAction={confirmAction} />
    </AppCtx.Provider>
  )
}

function EditProductModal({ editModal, closeEditModal, confirmAction }) {
  const { open, data } = editModal
  const [base, setBase] = useState(data.base || 0)
  const [sell, setSell] = useState(data.sell || 0)
  const [name, setName] = useState(data.name || '')
  const [stock, setStock] = useState(data.stock || 0)
  const [section, setSection] = useState(data.section || '')
  const [status, setStatus] = useState(data.status || 'Active')

  useEffect(() => {
    if (open && data) {
      setBase(data.base || 0); setSell(data.sell || 0)
      setName(data.name || ''); setStock(data.stock || 0)
      setSection(data.section || ''); setStatus(data.status || 'Active')
    }
  }, [open, data])

  const margin = base > 0 && sell > 0 ? Math.round(((sell - base) / sell) * 100) : (data.margin || 0)

  const save = () => {
    closeEditModal()
    confirmAction(`Changes saved for ${data.sku} — ${name}. Updated on shelf label and POS.`)
  }

  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && closeEditModal()}>
      <div className="edit-modal-box">
        <h3>Edit Product</h3>
        <div className="edit-form-grid">
          <div className="edit-form-group"><label>SKU</label><input type="text" value={data.sku || ''} readOnly style={{opacity:.6}} /></div>
          <div className="edit-form-group"><label>Vendor</label><input type="text" value={data.vendor || ''} readOnly style={{opacity:.6}} /></div>
          <div className="edit-form-group edit-form-full"><label>Product Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="edit-form-group"><label>Base Price (₹)</label><input type="number" value={base} onChange={e => setBase(parseFloat(e.target.value) || 0)} /></div>
          <div className="edit-form-group"><label>Selling Price (₹)</label><input type="number" value={sell} onChange={e => setSell(parseFloat(e.target.value) || 0)} /></div>
          <div className="edit-form-group"><label>Margin %</label><input type="text" value={margin + '%'} readOnly style={{opacity:.6}} /></div>
          <div className="edit-form-group"><label>Stock Qty</label><input type="number" value={stock} onChange={e => setStock(e.target.value)} /></div>
          <div className="edit-form-group"><label>Section</label><input type="text" value={section} onChange={e => setSection(e.target.value)} /></div>
          <div className="edit-form-group"><label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Active</option><option>Warning</option><option>Dead Stock</option><option>Suspended</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={closeEditModal}>Cancel</button>
          <button className="btn btn-primary" onClick={save}><i className="ti ti-device-floppy"></i> Save Changes</button>
        </div>
      </div>
    </div>
  )
}
