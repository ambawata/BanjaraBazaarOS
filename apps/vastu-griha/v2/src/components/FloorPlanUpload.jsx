import React, { useRef } from 'react'
import { useCanvasStore } from '../stores/canvasStore'

export default function FloorPlanUpload() {
  const { imageSettings, setImageSettings } = useCanvasStore()
  const { url, scale, opacity, rotation, xOffset, yOffset } = imageSettings
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setImageSettings({
        ...imageSettings,
        url: localUrl
      })
    }
  }

  const handleSettingChange = (key, val) => {
    setImageSettings({
      ...imageSettings,
      [key]: val
    })
  }

  const triggerUpload = () => {
    fileInputRef.current.click()
  }

  const resetImage = () => {
    setImageSettings({
      url: '',
      scale: 1,
      opacity: 0.5,
      rotation: 0,
      xOffset: 0,
      yOffset: 0
    })
  }

  return (
    <div className="upload-screen-panel">
      <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 600, marginBottom: '14px' }}>Floor Plan Upload</h3>

      {!url ? (
        <div className="file-dropzone" onClick={triggerUpload}>
          <i className="ti ti-upload"></i>
          <p style={{ fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>Click to Upload Floorplan</p>
          <p style={{ fontSize: '11px', color: 'var(--text3)' }}>PNG, JPG, or PDF snapshot</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*" 
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={resetImage}>
              <i className="ti ti-trash"></i> Remove Plan
            </button>
            <button className="btn" onClick={triggerUpload}>
              <i className="ti ti-replace"></i> Replace
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/*" 
              />
            </button>
          </div>

          <div className="slider-group">
            <label>
              <span>Overlay Opacity</span>
              <span>{Math.round(opacity * 100)}%</span>
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05" 
              value={opacity} 
              onChange={(e) => handleSettingChange('opacity', parseFloat(e.target.value))} 
            />
          </div>

          <div className="slider-group">
            <label>
              <span>Overlay Scale</span>
              <span>{Math.round(scale * 100)}%</span>
            </label>
            <input 
              type="range" 
              min="0.3" 
              max="3.0" 
              step="0.05" 
              value={scale} 
              onChange={(e) => handleSettingChange('scale', parseFloat(e.target.value))} 
            />
          </div>

          <div className="slider-group">
            <label>
              <span>Overlay Rotation</span>
              <span>{rotation}°</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={rotation} 
              onChange={(e) => handleSettingChange('rotation', parseInt(e.target.value))} 
            />
          </div>

          <div className="slider-group">
            <label>
              <span>Horizontal Offset</span>
              <span>{xOffset}px</span>
            </label>
            <input 
              type="range" 
              min="-200" 
              max="200" 
              value={xOffset} 
              onChange={(e) => handleSettingChange('xOffset', parseInt(e.target.value))} 
            />
          </div>

          <div className="slider-group">
            <label>
              <span>Vertical Offset</span>
              <span>{yOffset}px</span>
            </label>
            <input 
              type="range" 
              min="-200" 
              max="200" 
              value={yOffset} 
              onChange={(e) => handleSettingChange('yOffset', parseInt(e.target.value))} 
            />
          </div>

          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '11px', fontFamily: 'var(--fm)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px' }}>Calibration Tip</h4>
            <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.4' }}>
              Align your drawing's entrance with the matching Vastu Grid entrance zone. Use rotation and offset sliders to calibrate the compass alignments.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
