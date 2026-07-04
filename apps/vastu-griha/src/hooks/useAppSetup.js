import { useEffect } from 'react';
import { useUiStore } from '../stores/uiStore';
import { useCanvasStore } from '../stores/canvasStore';

export function useAppSetup() {
  const theme = useUiStore((state) => state.theme);
  const setIsMobile = useUiStore((state) => state.setIsMobile);
  const loadFromLocalStorage = useCanvasStore((state) => state.loadFromLocalStorage);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (loaded) {
      useUiStore.getState().setScreenState('workspace');
      useUiStore.getState().setActiveTab('home');
    }
  }, [loadFromLocalStorage]);
}
