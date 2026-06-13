import { useState } from 'react'
import { useStore } from '../store/useStore'

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-ink3 text-xs mb-1">{label}</p>
      <p className={`text-ink1 text-sm ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  )
}

export default function Profile() {
  const vendor = useStore(s => s.vendor)
  const { addToast } = useStore()
  const [editing, setEditing] = useState(false)

  const handleEditClick = () => {
    addToast('Profile editing will be available in the next release.', 'info')
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Business Info */}
      <div className="bg-surface rounded-xl border border-surface3 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-ink1 font-semibold">Business Information</h3>
          <button
            onClick={handleEditClick}
            className="px-3 py-1.5 rounded-lg bg-surface2 border border-surface3 text-ink2 text-xs hover:text-ink1 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Field label="Business Name" value={vendor?.businessName} />
          <Field label="Vendor Code" value={vendor?.id} mono />
          <Field label="Owner Name" value={vendor?.ownerName} />
          <Field label="City" value={vendor?.city} />
          <Field label="Phone" value={vendor?.phone} mono />
          <Field label="Email" value={vendor?.email} />
          <Field label="Member Since" value={vendor?.joinedAt} />
        </div>
      </div>

      {/* GST */}
      <div className="bg-surface rounded-xl border border-surface3 p-6">
        <h3 className="text-ink1 font-semibold mb-5">Tax Information</h3>
        <Field label="GSTIN" value={vendor?.gstin} mono />
      </div>

      {/* Payment Details */}
      <div className="bg-surface rounded-xl border border-surface3 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-ink1 font-semibold">Payment Details</h3>
          <button
            onClick={handleEditClick}
            className="px-3 py-1.5 rounded-lg bg-surface2 border border-surface3 text-ink2 text-xs hover:text-ink1 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Field label="UPI ID" value={vendor?.upiId} mono />
          <Field label="Bank" value={vendor?.bankName} />
          <Field label="Account No." value={vendor?.accountNo} mono />
          <Field label="IFSC Code" value={vendor?.ifsc} mono />
        </div>
        <p className="text-ink3 text-xs mt-4">To update bank details, contact support at vendors@banjarabazaar.online</p>
      </div>
    </div>
  )
}
