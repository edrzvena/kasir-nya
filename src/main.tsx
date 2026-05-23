import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.tsx'

if (Capacitor.isNativePlatform()) {
  const viewport = document.querySelector('meta[name=viewport]');
  viewport?.setAttribute('content', 'width=1280, user-scalable=no');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
