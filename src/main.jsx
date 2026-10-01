import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx';
import './styles.css';
import { MusicBar } from './components/MusicBar.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary><MusicBar /><div id="game-content"><App /></div></AppErrorBoundary>
  </StrictMode>,
);
