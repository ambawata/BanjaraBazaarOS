import React from 'react'

export default function PlotConfig({ plot, onChange }) {
  const { width, length, shape, facing, tilt } = plot

  const handleChange = (key, val) => {
    onChange({ ...plot, [key]: val })
  }

  return (
    <div className="upload-screen-panel">
      <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 600, marginBottom: '14px' }}>Plot Configuration</h3>
      
      <div className="slider-group" style={{ marginBottom: '14px' }}>
        <label>
          <span>Plot Shape</span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{shape}</span>
        </label>
        <select 
          className="btn" 
          style={{ width: '100%', padding: '8px', cursor: 'pointer' }}
          value={shape}
          onChange={(e) => handleChange('shape', e.target.value)}
        >
          <option value="Rectangular">Rectangular (Vastu Approved)</option>
          <option value="Square">Square (Highly Auspicious)</option>
          <option value="Irregular">Irregular (Needs Remedies)</option>
        </select>
      </div>

      <div className="slider-group" style={{ marginBottom: '14px' }}>
        <label>
          <span>Width (East-West)</span>
          <span style={{ fontFamily: 'var(--fm)' }}>{width} ft</span>
        </label>
        <input 
          type="range" 
          min="15" 
          max="120" 
          value={width} 
          onChange={(e) => handleChange('width', parseInt(e.target.value))} 
        />
      </div>

      <div className="slider-group" style={{ marginBottom: '14px' }}>
        <label>
          <span>Length (North-South)</span>
          <span style={{ fontFamily: 'var(--fm)' }}>{length} ft</span>
        </label>
        <input 
          type="range" 
          min="15" 
          max="120" 
          value={length} 
          onChange={(e) => handleChange('length', parseInt(e.target.value))} 
        />
      </div>

      <div className="slider-group" style={{ marginBottom: '14px' }}>
        <label>
          <span>Facing Direction</span>
          <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{facing}</span>
        </label>
        <select 
          className="btn" 
          style={{ width: '100%', padding: '8px', cursor: 'pointer' }}
          value={facing}
          onChange={(e) => handleChange('facing', e.target.value)}
        >
          <option value="East">East Facing (Highly Auspicious)</option>
          <option value="North">North Facing (Auspicious)</option>
          <option value="West">West Facing (Neutral/Good)</option>
          <option value="South">South Facing (Requires Specific Entry)</option>
        </select>
      </div>

      <div className="slider-group" style={{ marginBottom: '14px' }}>
        <label>
          <span>Compass Orientation Tilt</span>
          <span style={{ fontFamily: 'var(--fm)' }}>{tilt}°</span>
        </label>
        <input 
          type="range" 
          min="-45" 
          max="45" 
          value={tilt} 
          onChange={(e) => handleChange('tilt', parseInt(e.target.value))} 
        />
      </div>

      <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border2)', marginTop: '10px' }}>
        <h4 style={{ fontSize: '11px', fontFamily: 'var(--fm)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px' }}>Vastu Guidance</h4>
        <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.4' }}>
          {shape === 'Square' && "Square plots have balanced electromagnetic energies in all four corners. Excellent for overall well-being."}
          {shape === 'Rectangular' && "Rectangular plots with width:length ratios up to 1:2 are highly recommended for peace and progress."}
          {shape === 'Irregular' && "Irregular shapes lead to energy leaks. Recommend placing brass boundaries or copper pyramids to align the layout."}
        </p>
      </div>
    </div>
  )
}
