import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Backup() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="alert-bar al-ok" style={{marginBottom:'20px'}}><i className="ti ti-check"></i> Last auto backup: Today 3:00 AM · banjara_db · 4.2 MB · Successful</div>
      <div className="two-col">
        <div>
          <div className="slbl" style={{marginBottom:'12px'}}>Database Backup & Restore</div>
          <div className="backup-option" onClick={() => confirmAction('Start full DB backup now? This may take 1–2 minutes.')}>
            <div className="backup-icon" style={{background:'var(--blue-dim)',color:'var(--blue)'}}><i className="ti ti-database"></i></div>
            <div><h4>Full DB Backup (.sql)</h4><p>Complete banjara_db snapshot — all 16 tables</p></div>
            <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> Backup Now</button>
          </div>
          <div className="backup-option" onClick={() => confirmAction('Download last backup file — banjara_db_20250512_0300.sql?')}>
            <div className="backup-icon" style={{background:'var(--green-dim)',color:'var(--green)'}}><i className="ti ti-clock"></i></div>
            <div><h4>Download Last Backup</h4><p>banjara_db_20250512_0300.sql · 4.2 MB</p></div>
            <button className="btn btn-success btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> Download</button>
          </div>
          <div className="backup-option">
            <div className="backup-icon" style={{background:'var(--amber-dim)',color:'var(--amber)'}}><i className="ti ti-settings"></i></div>
            <div><h4>Auto Backup Schedule</h4><p>Daily at 3:00 AM · Retain last 30 days</p></div>
            <button className="btn btn-sm" style={{marginLeft:'auto'}} onClick={e => { e.stopPropagation(); confirmAction('Edit auto backup schedule — current: Daily at 3:00 AM, retain 30 days.') }}><i className="ti ti-edit"></i> Edit</button>
          </div>
          <div className="backup-option" onClick={() => confirmAction('RESTORE from backup? This will OVERWRITE all current data. Are you sure?')}>
            <div className="backup-icon" style={{background:'var(--red-dim)',color:'var(--red)'}}><i className="ti ti-restore"></i></div>
            <div><h4>Restore from Backup</h4><p>Upload a .sql file to restore — use with extreme caution</p></div>
            <button className="btn btn-danger btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-upload"></i> Restore</button>
          </div>
        </div>
        <div>
          <div className="slbl" style={{marginBottom:'12px'}}>Data Exports</div>
          <div className="backup-option" onClick={() => confirmAction('Export all settlements as CSV?')}>
            <div className="backup-icon" style={{background:'var(--green-dim)',color:'var(--green)'}}><i className="ti ti-file-spreadsheet"></i></div>
            <div><h4>Settlements Export</h4><p>All settlements with UTR, advance logs, margins, payouts</p></div>
            <button className="btn btn-success btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> CSV</button>
          </div>
          <div className="backup-option" onClick={() => confirmAction('Export all vendor data as CSV?')}>
            <div className="backup-icon" style={{background:'var(--blue-dim)',color:'var(--blue)'}}><i className="ti ti-users"></i></div>
            <div><h4>Vendor Export</h4><p>Vendor directory with advance, GST type, bank details</p></div>
            <button className="btn btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> CSV</button>
          </div>
          <div className="backup-option" onClick={() => confirmAction('Export full product catalog?')}>
            <div className="backup-icon" style={{background:'var(--purple-dim)',color:'var(--purple)'}}><i className="ti ti-package"></i></div>
            <div><h4>Product Catalog Export</h4><p>All active products with SKUs, prices, margins, QR URLs</p></div>
            <button className="btn btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> CSV</button>
          </div>
          <div className="backup-option" onClick={() => confirmAction('Export GST report for this month as PDF?')}>
            <div className="backup-icon" style={{background:'var(--amber-dim)',color:'var(--amber)'}}><i className="ti ti-report-money"></i></div>
            <div><h4>GST Report Export</h4><p>Monthly GST summary for filing — PDF + Excel</p></div>
            <button className="btn btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> PDF</button>
          </div>
          <div className="backup-option" onClick={() => confirmAction('Export full audit log as CSV?')}>
            <div className="backup-icon" style={{background:'var(--red-dim)',color:'var(--red)'}}><i className="ti ti-list-search"></i></div>
            <div><h4>Audit Log Export</h4><p>Full system activity — all users, all actions, all dates</p></div>
            <button className="btn btn-danger btn-sm" style={{marginLeft:'auto'}}><i className="ti ti-download"></i> CSV</button>
          </div>
        </div>
      </div>
    </div>
  )
}
