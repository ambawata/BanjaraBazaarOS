import React from 'react'
import ProductIcon from './ProductIcon'
import PRODUCTS from '../../data/placeholderProducts'
import { getShoppingInfo } from '../../data/vastuShoppingTiers'
import { t } from '../../lib/vastuLang'
import { useUiStore } from '../../stores/uiStore'

function Stars({ rating }) {
  const full = Math.round(rating)
  return (
    <span style={{ fontSize: '11px', color: '#E0A83C', letterSpacing: '1px' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

// Every Vastu answer ends in a purchase opportunity — direct match, closest
// match, or (tier 3) a generic Vastu-shopping CTA. This is the ONE place
// that renders that opportunity; it reads entirely through
// vastuShoppingTiers.js + placeholderProducts.js, never hardcodes a
// product per-entry, so swapping in real vendor data later only touches
// those two data files.
export default function ShopPanel({ entryId, lang, compact = false }) {
  const [added, setAdded] = React.useState(false)
  const { tier, productId, labelKey } = getShoppingInfo(entryId)
  const product = PRODUCTS[productId]
  if (!product) return null

  const isTier3 = tier === 3

  const handleClick = () => {
    if (isTier3) {
      // No specific-item Add to Cart for tier 3 — this is a category
      // browse CTA, matching the app's existing bottom-nav Shop tab.
      useUiStore.getState().setScreenState('workspace')
      useUiStore.getState().setActiveTab('shop')
      return
    }
    useUiStore.getState().addNotification({
      id: Date.now().toString(),
      text: `Added ${product.name} to cart`,
      time: 'Just now',
      type: 'shop',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{
      background: 'var(--cream)', border: '1px solid var(--border-soft)', borderRadius: '14px',
      padding: compact ? '10px' : '12px', display: 'flex', flexDirection: 'column', gap: '8px',
      minWidth: compact ? '132px' : '150px',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--orange-dark)', lineHeight: 1.3 }}>
        {t(lang, labelKey)}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <ProductIcon icon={product.icon} size={compact ? 40 : 44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
            {product.name}
          </div>
          <div style={{ fontSize: '9.5px', color: 'var(--ink-faint)', marginTop: '1px' }}>{product.meta}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Stars rating={product.rating} />
        <span style={{ fontSize: '9.5px', color: 'var(--ink-faint)' }}>{product.rating} {t(lang, 'reviewsCount', product.reviews)}</span>
      </div>

      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
        ₹{product.price.toLocaleString('en-IN')}
      </div>

      <button
        onClick={handleClick}
        style={{
          padding: '8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%',
          background: isTier3 ? 'transparent' : (added ? 'var(--success)' : 'var(--orange)'),
          color: isTier3 ? 'var(--orange-dark)' : '#ffffff',
          border: isTier3 ? '1.5px solid var(--orange)' : 'none',
          transition: 'background 0.2s ease',
        }}
      >
        {isTier3 ? t(lang, 'shopVastuEssentials') : (added ? t(lang, 'addedToCart') : t(lang, 'addToCart'))}
      </button>
    </div>
  )
}
