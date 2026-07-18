import React from 'react'

export default function Compass({ tilt }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '2px solid var(--gold)',
          background: 'var(--bg3)',
          position: 'relative',
          boxShadow: 'var(--shadow)',
          transform: `rotate(${tilt}deg)`,
          transition: 'transform 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Needle */}
        <div 
          style={{
            position: 'absolute',
            width: '4px',
            height: '80px',
            background: 'linear-gradient(to bottom, var(--terracotta) 50%, var(--text3) 50%)',
            borderRadius: '2px'
          }}
        />
        
        {/* Compass Center Pin */}
        <div 
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--marker-white)',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)'
          }}
        />
        
        {/* Direction Text Labels */}
        <span style={{ position: 'absolute', top: '4px', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--fd)', color: 'var(--terracotta)' }}>N</span>
        <span style={{ position: 'absolute', right: '4px', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--fd)', color: 'var(--gold)' }}>E</span>
        <span style={{ position: 'absolute', bottom: '4px', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--fd)', color: 'var(--text2)' }}>S</span>
        <span style={{ position: 'absolute', left: '4px', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--fd)', color: 'var(--gold)' }}>W</span>
      </div>
      <span style={{ fontSize: '10px', fontFamily: 'var(--fm)', color: 'var(--text3)', marginTop: '8px' }}>
        TILT: {tilt}°
      </span>
    </div>
  )
}
