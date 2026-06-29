import React, { useState } from 'react'
import { evaluateRoom } from './AnalysisPanel'

export default function AiChat({ rooms, plot, onSwitchTab }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am your Vastu Acharya AI assistant. I can answer questions about directional principles, room colors, remedies, or scan your current canvas layout. Try asking me to scan your plan!'
    }
  ])
  const [input, setInput] = useState('')

  const appendMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }])
  }

  const handleScanCanvas = () => {
    if (rooms.length === 0) {
      appendMessage('bot', 'Your canvas is currently empty! Please place some rooms first or load a template from the AI Designer tab.')
      return
    }

    const issues = []
    const positive = []
    let scoreSum = 0

    rooms.forEach(r => {
      const evalRes = evaluateRoom(r, plot)
      scoreSum += evalRes.rating
      if (evalRes.rating < 70) {
        issues.push(`${r.label} in ${evalRes.zone} (${evalRes.status})`)
      } else {
        positive.push(`${r.label} in ${evalRes.zone}`)
      }
    })

    const avgScore = Math.round(scoreSum / rooms.length)

    let reportText = `I have scanned your house layout. Your Vastu Compliance score is ${avgScore}%. \n\n`
    if (positive.length > 0) {
      reportText += `✨ Strong points: You have correctly placed the ${positive.join(', ')}. This invites auspicious cosmic rays. \n\n`
    }
    if (issues.length > 0) {
      reportText += `⚠️ Attention Needed: I found defects in the placement of: ${issues.join(', ')}. \n\nI recommend reviewing the defects in the Analysis panel and checking the remedies. Many simple corrections (like sea salt bowls or metal lines) can be found in our Shop tab.`
    } else {
      reportText += `🎉 Congratulations! Your plan follows excellent Vastu guidelines. Your house is perfectly balanced.`
    }

    appendMessage('bot', reportText)
  }

  const handleSendMessage = (textToSend) => {
    const text = textToSend || input
    if (!text.trim()) return

    if (!textToSend) {
      appendMessage('user', text)
      setInput('')
    }

    // Process questions
    setTimeout(() => {
      const query = text.toLowerCase()
      let reply = "I understand you are asking about Vastu. For best health and wealth, the Northeast (water) should have a pooja mandir, Southeast (fire) should have the kitchen, and Southwest (earth) should have the master bedroom. What specific room or element are you designing?"

      if (query.includes('scan') || query.includes('analyze')) {
        handleScanCanvas()
        return
      }
      else if (query.includes('color') || query.includes('paint')) {
        reply = "Here are the recommended paint shades based on Vastu elements:\n" +
          "• Northeast (Water): Light Blue, White, or Cream.\n" +
          "• Southeast (Fire): Light Pink, Orange, or Cream.\n" +
          "• Southwest (Earth): Yellow, Beige, or Warm Brown.\n" +
          "• Northwest (Air): White, Light Grey, or Cream.\n" +
          "Avoid dark black, dark blue, or bright blood-red in large quantities as they cause emotional imbalances."
      } 
      else if (query.includes('toilet') || query.includes('bathroom')) {
        reply = "Toilets should ideally be in the Northwest (Vayavya) or West sectors. Never place a toilet in the Northeast (Ishanya) or Southwest (Nairutya). If you have a Northeast toilet that cannot be moved, keep a bowl of raw sea salt inside and place a brass partition on the entrance."
      }
      else if (query.includes('kitchen') || query.includes('stove')) {
        reply = "The kitchen must be placed in the Southeast (Agneya) quadrant, and the chef should face East while cooking. Northwest is the second-best option. Avoid placing the kitchen in the Northeast, as it represents a water zone clashing with fire."
      }
      else if (query.includes('entrance') || query.includes('door') || query.includes('gate')) {
        reply = "The main door is the mouth of cosmic energy. It should ideally face Northeast, North, or East. South and Southwest entrances are considered unfavorable unless protected by yellow thresholds, lead strips, or a Panchmukhi Hanuman sticker."
      }
      else if (query.includes('remedy') || query.includes('remedies') || query.includes('fix')) {
        reply = "For structural errors that cannot be easily rebuilt, Vastu recommends energy balancers:\n" +
          "1. Brass/Copper Pyramids: Boosts weak direction sectors.\n" +
          "2. Sea Salt: Absorbs negative radiation in toilets.\n" +
          "3. Metal Strips/Helixes: Isolates negative entrances (e.g. lead for Southwest doors).\n" +
          "You can find all these under the 'Shop Remedies' tab!"
      }

      appendMessage('bot', reply)
    }, 400)
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-avatar">
          <i className="ti ti-brand-assistant"></i>
        </div>
        <div className="chat-title-group">
          <span className="chat-bot-name">Vastu Acharya AI</span>
          <span className="chat-bot-status"><i className="ti ti-circle-filled" style={{ fontSize: '8px', marginRight: '4px' }}></i>Active Consultation</span>
        </div>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={handleScanCanvas}>
          <i className="ti ti-scan"></i> Scan Canvas
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message ${m.sender}`}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn btn-sm" onClick={() => { appendMessage('user', 'Scan my canvas for defects'); handleSendMessage('Scan my canvas for defects') }}>
          🔍 Scan Layout
        </button>
        <button className="btn btn-sm" onClick={() => { appendMessage('user', 'What colors are best for the bedroom?'); handleSendMessage('What colors are best for the bedroom?') }}>
          🎨 Room Paint Guidelines
        </button>
        <button className="btn btn-sm" onClick={() => { appendMessage('user', 'Toilet placement rules'); handleSendMessage('Toilet placement rules') }}>
          🚽 Toilet Rules
        </button>
        <button className="btn btn-sm" onClick={() => onSwitchTab('shop')}>
          🛒 Shop Vastu Remedies
        </button>
      </div>

      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder="Ask about entrances, kitchen placement, colors..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="btn btn-primary" onClick={() => handleSendMessage()}>
          <i className="ti ti-send"></i> Send
        </button>
      </div>
    </div>
  )
}
