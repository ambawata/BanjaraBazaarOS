import { useStore } from '../../store/useStore'
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'

const icons = {
  success: <IconCheck size={16} />,
  error: <IconX size={16} />,
  warning: <IconAlertTriangle size={16} />,
  info: <IconInfoCircle size={16} />,
}

const colors = {
  success: 'bg-greenDim border-green text-green',
  error: 'bg-redDim border-red text-red',
  warning: 'bg-amberDim border-amber text-amber',
  info: 'bg-surface2 border-brand text-brand',
}

export default function Toast() {
  const { toasts, removeToast } = useStore()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium shadow-lg min-w-64 max-w-sm ${colors[t.type] || colors.info}`}>
          {icons[t.type] || icons.info}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100">
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
