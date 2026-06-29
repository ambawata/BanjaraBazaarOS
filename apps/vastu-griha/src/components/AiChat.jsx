import React, { useState } from 'react'

export default function AiChat({ rooms, plot, onSwitchTab, onGenerateLayout, currentStep, onNextStep }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to Vastu Griha. Let\'s design a harmonious and peaceful home for your family. First, what is the size of your plot?'
    }
  ])
  
  // Conversational onboarding states
  const [wizardData, setWizardData] = useState({
    size: '',
    facing: '',
    bhk: ''
  })
  
  const [chatInput, setChatInput] = useState('')

  const handleQuickReply = (field, value, textToShow) => {
    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: textToShow }])
    
    const updatedData = { ...wizardData, [field]: value }
    setWizardData(updatedData)

    setTimeout(() => {
      if (field === 'size') {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `Great! A ${textToShow} plot. Next, which direction does the main road or street face? This determines your main entrance.`
        }])
        onNextStep('facing') // Move wizard step
      } 
      else if (field === 'facing') {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `A ${textToShow} facing gate is noted. Finally, how many bedrooms are you planning to construct?`
        }])
        onNextStep('bhk')
      } 
      else if (field === 'bhk') {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `Wonderful! I have designed a highly auspious layout matching your ${updatedData.size} ${updatedData.facing}-facing ${textToShow} specifications. Let\'s open the blueprint!`
        }])
        onNextStep('generate')
      }
    }, 400)
  }

  const handleGenerate = () => {
    // Determine template ID based on selections
    let templateId = 'east_2bhk'
    if (wizardData.facing === 'North') {
      templateId = 'north_3bhk'
    } else if (wizardData.facing === 'West') {
      templateId = 'west_2bhk'
    } else if (wizardData.facing === 'South') {
      templateId = 'south_1bhk'
    } else {
      // Default mappings
      if (wizardData.bhk === '3') templateId = 'north_3bhk'
      else if (wizardData.bhk === '1') templateId = 'south_1bhk'
    }

    onGenerateLayout(templateId)
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    const txt = chatInput
    setChatInput('')
    setMessages(prev => [...prev, { sender: 'user', text: txt }])

    setTimeout(() => {
      const query = txt.toLowerCase()
      let reply = "I can guide you on room colors, placements, or balance checks. Try asking: 'What color should I paint my Northwest room?' or 'scan my canvas for defects'."

      if (query.includes('scan') || query.includes('analyze')) {
        // Trigger check
        if (rooms.length === 0) {
          reply = 'Your canvas layout is currently empty. Add rooms or utility items to perform a check!'
        } else {
          const defectsCount = rooms.filter(r => {
            const cx = r.x + r.width / 2
            const cy = r.y + r.height / 2
            let col = cx < 33.3 ? 0 : cx >= 66.6 ? 2 : 1
            let row = cy < 33.3 ? 0 : cy >= 66.6 ? 2 : 1
            const zoneMap = [['NW', 'N', 'NE'], ['W', 'C', 'E'], ['SW', 'S', 'SE']]
            const z = zoneMap[row][col]
            const rules = require('./AnalysisPanel').VASTU_RULES[r.type]
            return rules && rules.ratings[z] < 70
          }).length
          
          reply = `I scanned your layout of ${rooms.length} items. You have placed structures correctly, but ${defectsCount} aspect(s) can be improved. View details in the Health Check panel.`
        }
      } 
      else if (query.includes('color') || query.includes('paint')) {
        reply = "Recommended paint shades:\n• Northeast: Light Blue / Cream\n• Southeast: Light Pink / Orange\n• Southwest: Yellow / Beige\n• Northwest: White / Light Grey\nAvoid dark shades like black or heavy blue in prayer zones."
      }
      else if (query.includes('toilet') || query.includes('bathroom')) {
        reply = "Restrooms drain energy. Place them in the Northwest or West. Avoid the Northeast (Ishanya) and Southwest (Nairutya). Use Himalayan rock salt inside if relocation isn't possible."
      }
      else if (query.includes('borewell') || query.includes('water')) {
        reply = "Underground water pits must go in the Northeast, North, or East. Never dig a borewell in the Southwest or Southeast."
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }])
    }, 400)
  }

  return (
    <div className="chat-container" style={{ margin: '12px auto', maxWidth: '600px', width: '100%', height: 'calc(100vh - 100px)' }}>
      <div className="chat-header">
        <div className="chat-avatar">
          <i className="ti ti-message-chatbot"></i>
        </div>
        <div className="chat-title-group">
          <span className="chat-bot-name">Vastu Acharya</span>
          <span className="chat-bot-status">
            <i className="ti ti-circle-filled" style={{ fontSize: '8px', marginRight: '4px' }}></i>
            {currentStep === 'chat' ? 'Vastu Consultant' : 'Guided Consultation'}
          </span>
        </div>
      </div>

      <div className="chat-messages" style={{ overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message ${m.sender}`}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
          </div>
        ))}
      </div>

      {/* Quick Option Buttons inside wizard Onboarding */}
      <div style={{ padding: '16px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {currentStep === 'size' && (
          <>
            <button className="btn btn-primary" onClick={() => handleQuickReply('size', '30x40', '30x40 ft (Common size)')}>30 × 40 ft</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('size', '40x60', '40x60 ft (Large plot)')}>40 × 60 ft</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('size', '30x50', '30x50 ft (Medium plot)')}>30 × 50 ft</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('size', '30x30', '30x30 ft (Square plot)')}>30 × 30 ft</button>
          </>
        )}

        {currentStep === 'facing' && (
          <>
            <button className="btn btn-primary" onClick={() => handleQuickReply('facing', 'East', 'East-Facing (Auspicious)')}>East Facing ☀️</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('facing', 'North', 'North-Facing (Positive)')}>North Facing 🧭</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('facing', 'West', 'West-Facing (Stable)')}>West Facing 🌅</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('facing', 'South', 'South-Facing (Remedial)')}>South Facing 🔥</button>
          </>
        )}

        {currentStep === 'bhk' && (
          <>
            <button className="btn btn-primary" onClick={() => handleQuickReply('bhk', '1', '1 BHK Layout')}>1 BHK</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('bhk', '2', '2 BHK Layout')}>2 BHK</button>
            <button className="btn btn-primary" onClick={() => handleQuickReply('bhk', '3', '3 BHK Layout')}>3 BHK</button>
          </>
        )}

        {currentStep === 'generate' && (
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 600, animation: 'pulse 2s infinite' }}
            onClick={handleGenerate}
          >
            Generate Vastu House Plan <i className="ti ti-arrow-right" style={{ marginLeft: '6px' }}></i>
          </button>
        )}

        {/* Post-onboarding general chat suggestions */}
        {currentStep === 'chat' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button className="btn btn-sm" onClick={() => { setChatInput('Scan my canvas for defects'); handleSendMessage() }}>🔍 Scan Blueprint</button>
            <button className="btn btn-sm" onClick={() => { setChatInput('What colors are best for the bedroom?'); handleSendMessage() }}>🎨 Paint advice</button>
            <button className="btn btn-sm" onClick={() => { setChatInput('Where should I put the water tank?'); handleSendMessage() }}>💧 Water Tank rules</button>
            <button className="btn btn-sm" onClick={() => onSwitchTab('shop')}>🛒 Shop Vastu Remedies</button>
          </div>
        )}
      </div>

      {currentStep === 'chat' && (
        <div className="chat-input-area" style={{ borderTop: '1px solid var(--border)' }}>
          <input 
            type="text" 
            className="chat-input"
            placeholder="Ask about paint shades, water tanks, entrances..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="btn btn-primary" onClick={handleSendMessage}>
            <i className="ti ti-send"></i> Send
          </button>
        </div>
      )}
    </div>
  )
}
