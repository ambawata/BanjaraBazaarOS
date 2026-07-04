import React from 'react';
import { useAppSetup } from './hooks/useAppSetup';
import ScreenManager from './components/ScreenManager';

export default function App() {
  useAppSetup();

  return <ScreenManager />;
}
