import { useEffect } from 'react';
import { useUiStore } from '../stores/uiStore';
import { useCanvasStore } from '../stores/canvasStore';

export function useAppSetup() {
  const theme = useUiStore((state) => state.theme);
  const setIsMobile = useUiStore((state) => state.setIsMobile);
  const loadFromLocalStorage = useCanvasStore((state) => state.loadFromLocalStorage);

  // ── Responsive: track mobile breakpoint ──────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // ── Theme: sync body class ────────────────────────────────────────────────
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  // ── Session restore: bring back any autosaved canvas layout ────────────────
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);
}
