import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Popup } from './views/Popup'
import { useSettingsStore } from './store/settingsStore'
import { useUsageDataStore } from './store/usageDataStore'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Initialize stores
useSettingsStore.getState().loadSettings()
useUsageDataStore.getState().loadUsageData()

function PopupApp() {
  const theme = useSettingsStore(state => state.settings.theme)
  
  useEffect(() => {
    // Apply theme to root element
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  
  return (
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
)