// Shown when the plot's confidence_tier is tier3_compass (backend-derived
// — see VastuVerdictService::getVerdicts, message text itself is DB-driven
// via settings key vastu_verdict.tier3_caution_message, not hardcoded
// business copy on either side).
export default function LowConfidenceBanner({ message }) {
  return (
    <div className="px-4 py-3.5 rounded-xl bg-amberDim border border-amber flex items-start gap-3">
      <span className="text-amber text-lg leading-none">⚠</span>
      <p className="text-amberMuted text-sm font-medium">{message}</p>
    </div>
  )
}
