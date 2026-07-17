import { useState } from 'react'
import AddressSearchStep from '../components/onboarding/AddressSearchStep'
import TraceBoundaryStep from '../components/onboarding/TraceBoundaryStep'
import RoomTaggingStep from '../components/onboarding/RoomTaggingStep'
import ResultsStep from '../components/onboarding/ResultsStep'

// Consumer-friendly onboarding wizard — the "easy mode" alternative to
// /vastu-griha/geometry-tool (which stays exactly as-is, untouched, for
// Vastu consultants / power users who want raw coordinates and manual
// True North calibration). See CORE UX PRINCIPLE in the task this was
// built from: tracing directly on a real satellite map makes the geometry
// inherently north-up, so every technical concept (coordinates, bearing,
// confidence tier, rotation) is hidden end-to-end in this flow — the
// backend (VastuMapOnboardingService) still computes all of it, this page
// and its child steps never render any of it.
export default function MyHomeWizardPage() {
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState(null)
  const [addressLabel, setAddressLabel] = useState('')
  const [plot, setPlot] = useState(null)
  const [zoneGrid, setZoneGrid] = useState(null)
  const [taggedRooms, setTaggedRooms] = useState([])

  function handleLocationChosen(loc, label) {
    setLocation(loc)
    setAddressLabel(label)
    setStep(2)
  }

  function handleBoundaryDone(createdPlot, grid) {
    setPlot(createdPlot)
    setZoneGrid(grid)
    setStep(3)
  }

  function handleRoomsComplete(rooms) {
    setTaggedRooms(rooms)
    setStep(4)
  }

  function handleSkipRooms() {
    setTaggedRooms([])
    setStep(4)
  }

  return (
    <div className="h-full flex flex-col">
      <StepProgress step={step} />

      <div className="flex-1 overflow-y-auto py-6">
        {step === 1 && <AddressSearchStep onLocationChosen={handleLocationChosen} />}
        {step === 2 && (
          <TraceBoundaryStep center={location} addressLabel={addressLabel} onComplete={handleBoundaryDone} />
        )}
        {step === 3 && (
          <RoomTaggingStep plot={plot} zoneGrid={zoneGrid} onComplete={handleRoomsComplete} onSkip={handleSkipRooms} />
        )}
        {step === 4 && <ResultsStep plot={plot} taggedRooms={taggedRooms} />}
      </div>
    </div>
  )
}

function StepProgress({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 bg-surface border-b border-surface3">
      {[1, 2, 3, 4].map(n => (
        <div
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === step ? 'w-8 bg-brand' : n < step ? 'w-4 bg-brand' : 'w-4 bg-surface3'
          }`}
        />
      ))}
    </div>
  )
}
