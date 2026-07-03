// Design System – Motion
// Duration and easing constants for transitions and animations.

export const motion = {
  // Duration
  duration: {
    instant:  '0ms',
    fast:     '120ms',
    base:     '200ms',
    moderate: '300ms',
    slow:     '400ms',
    verySlow: '600ms',
  },

  // CSS easing curves
  easing: {
    linear:   'linear',
    ease:     'ease',
    easeIn:   'cubic-bezier(0.4, 0, 1, 1)',
    easeOut:  'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut:'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Shorthand transition strings
  transition: {
    base:     'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast:     'all 120ms cubic-bezier(0.4, 0, 0.2, 1)',
    color:    'color 200ms ease, background-color 200ms ease, border-color 200ms ease',
    opacity:  'opacity 200ms ease',
    transform:'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}
