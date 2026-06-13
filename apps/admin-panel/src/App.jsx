import { useState, useEffect, createContext, useContext, useRef } from 'react'
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

const pages = {
  'dashboard':['Dashboard','Admin / Overview'],
  'approval':['Approval Queue','Products / Approval Queue'],
  'active-products':['Active Products','Products / Active Products'],
  'negotiations':['Negotiations','Products / Negotiations'],
  'dead-stock':['Dead Stock','Products / Dead Stock'],
  'pickup':['Pickup Requests','Products / Pickup Requests'],
  'inventory':['Live Inventory','Inventory / Live Inventory'],
  'damage':['Damage Register','Inventory / Damage Register'],
  'floor':['Floor Sections','Inventory / Floor Sections'],
  'vendors':['Vendor Directory','Vendors / Directory'],
  'settlements':['Settlements','Vendors / Settlements'],
  'advances':['Advance Payments','Vendors / Advance Payments'],
  'sales':['Live Sales & POS','Sales / Live Sales'],
  'invoices':['Invoices','Sales / Invoices'],
  'expenses':['Expenses','Finance / Expenses'],
  'gst':['GST & Accounting','Finance / GST'],
  'cashflow':['Cash Flow','Finance / Cash Flow'],
  'staff':['Staff Directory','Staff / Directory'],
  'attendance':['Attendance','Staff / Attendance'],
  'customers':['Customers','CRM / Customers'],
  'whatsapp':['WhatsApp Campaigns','CRM / WhatsApp'],
  'analytics':['Analytics Center','Analytics'],
  'notifications':['Notifications','System / Notifications'],
  'roles':['Roles & Permissions','System / Roles'],
  'audit':['Audit Logs','System / Audit Logs'],
  'backup':['Backup & Export','System / Backup'],
  'settings':['System Settings','System / Settings'],
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

const NavItem = ({ id, icon, label, badge, badgeType, current, onNav }) => (
  <div className={`nav-item${current === id ? ' active' : ''}`} onClick={() => onNav(id)}>
    <i className={`ti ti-${icon}`}></i> {label}
    {badge && <span className={`nbadge nbadge-${badgeType}`}>{badge}</span>}
  </div>
)

export default function App() {
  const [current, setCurrent] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('bb-theme') || 'dark')
  const [modal, setModal] = useState({ open: false, msg: '' })
  const [editModal, setEditModal] = useState({ open: false, data: {} })
  const contentRef = useRef(null)

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : ''
  }, [theme])

  const nav = (id) => {
    setCurrent(id)
    if (contentRef.current) contentRef.current.scrollTop = 0
  }

  const confirmAction = (msg) => setModal({ open: true, msg })
  const closeModal = () => setModal({ open: false, msg: '' })

  const openEditProduct = (sku, name, vendor, base, sell, margin, stock, section, status) =>
    setEditModal({ open: true, data: { sku, name, vendor, base, sell, margin, stock, section, status } })
  const closeEditModal = () => setEditModal({ open: false, data: {} })

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('bb-theme', next)
  }

  const ctx = { confirmAction, nav, openEditProduct }
  const pageInfo = pages[current] || ['Dashboard', 'Admin / Overview']
  const Screen = screenMap[current] || Dashboard

  return (
    <AppCtx.Provider value={ctx}>
      <nav id="sidebar">
        <div className="sidebar-logo">BanjaraBazaar<span>Admin Panel v3.0</span></div>
        <div className="sidebar-nav">
          <div className="sidebar-section">Main</div>
          <NavItem id="dashboard" icon="layout-dashboard" label="Dashboard" current={current} onNav={nav} />
          <div className="sidebar-section">Products</div>
          <NavItem id="approval" icon="checks" label="Approval Queue" badge="7" badgeType="red" current={current} onNav={nav} />
          <NavItem id="active-products" icon="package" label="Active Products" current={current} onNav={nav} />
          <NavItem id="negotiations" icon="arrows-exchange" label="Negotiations" badge="4" badgeType="amber" current={current} onNav={nav} />
          <NavItem id="dead-stock" icon="clock-exclamation" label="Dead Stock" badge="12" badgeType="red" current={current} onNav={nav} />
          <NavItem id="pickup" icon="truck" label="Pickup Requests" current={current} onNav={nav} />
          <div className="sidebar-section">Inventory</div>
          <NavItem id="inventory" icon="box" label="Live Inventory" current={current} onNav={nav} />
          <NavItem id="damage" icon="alert-triangle" label="Damage Register" current={current} onNav={nav} />
          <NavItem id="floor" icon="layout-2" label="Floor Sections" current={current} onNav={nav} />
          <div className="sidebar-section">Vendors</div>
          <NavItem id="vendors" icon="users" label="Vendor Directory" current={current} onNav={nav} />
          <NavItem id="settlements" icon="credit-card" label="Settlements" current={current} onNav={nav} />
          <NavItem id="advances" icon="coin" label="Advance Payments" current={current} onNav={nav} />
          <div className="sidebar-section">Sales</div>
          <NavItem id="sales" icon="receipt" label="Live Sales & POS" current={current} onNav={nav} />
          <NavItem id="invoices" icon="file-invoice" label="Invoices" current={current} onNav={nav} />
          <div className="sidebar-section">Finance</div>
          <NavItem id="expenses" icon="wallet" label="Expenses" current={current} onNav={nav} />
          <NavItem id="gst" icon="report-money" label="GST & Accounting" current={current} onNav={nav} />
          <NavItem id="cashflow" icon="arrows-right-left" label="Cash Flow" current={current} onNav={nav} />
          <div className="sidebar-section">Staff</div>
          <NavItem id="staff" icon="id-badge" label="Staff Directory" current={current} onNav={nav} />
          <NavItem id="attendance" icon="calendar-check" label="Attendance" current={current} onNav={nav} />
          <div className="sidebar-section">CRM</div>
          <NavItem id="customers" icon="heart" label="Customers" current={current} onNav={nav} />
          <NavItem id="whatsapp" icon="brand-whatsapp" label="WhatsApp Campaigns" current={current} onNav={nav} />
          <div className="sidebar-section">Analytics</div>
          <NavItem id="analytics" icon="chart-bar" label="Analytics Center" current={current} onNav={nav} />
          <div className="sidebar-section">System</div>
          <NavItem id="notifications" icon="bell" label="Notifications" badge="5" badgeType="red" current={current} onNav={nav} />
          <NavItem id="roles" icon="lock" label="Roles & Permissions" current={current} onNav={nav} />
          <NavItem id="audit" icon="list-search" label="Audit Logs" current={current} onNav={nav} />
          <NavItem id="backup" icon="database-export" label="Backup & Export" current={current} onNav={nav} />
          <NavItem id="settings" icon="settings" label="System Settings" current={current} onNav={nav} />
        </div>
        <div className="sidebar-footer">
          <strong>BB GSTIN</strong>27AABCB1234F1ZX
          <div style={{marginTop:'6px'}}>Admin: Rajesh K.</div>
        </div>
      </nav>

      <div id="main">
        <div id="topbar">
          <div>
            <div className="page-title">{pageInfo[0]}</div>
            <div className="breadcrumb">{pageInfo[1]}</div>
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
              <i className={`ti ti-${theme === 'light' ? 'moon' : 'sun'}`}></i>
            </button>
            <button className="btn" onClick={() => nav('notifications')}><i className="ti ti-bell"></i></button>
            <button className="btn" onClick={() => nav('backup')}><i className="ti ti-database-export"></i> Backup</button>
            <button className="btn btn-primary" onClick={() => confirmAction('Sync triggered — pulling latest data from all connected systems. This may take a few seconds.')}><i className="ti ti-refresh"></i> Sync</button>
          </div>
        </div>
        <div id="content" ref={contentRef}>
          <Screen />
        </div>
      </div>

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
