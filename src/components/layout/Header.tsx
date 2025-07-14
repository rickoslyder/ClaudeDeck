import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/store"

export function Header() {
  const theme = useSettingsStore(state => state.settings.theme)
  const updateSettings = useSettingsStore(state => state.updateSettings)
  const [currentView, setCurrentView] = useState('dashboard')
  
  // Listen for hash changes to update active navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard'
      setCurrentView(hash)
    }
    
    handleHashChange() // Set initial state
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const toggleTheme = useCallback(() => {
    // Cycle through: system -> light -> dark -> system
    let newTheme: 'light' | 'dark' | 'system'
    if (theme === 'system') {
      newTheme = 'light'
    } else if (theme === 'light') {
      newTheme = 'dark'
    } else {
      newTheme = 'system'
    }
    updateSettings({ theme: newTheme })
    // Theme application is handled in App.tsx useEffect
  }, [theme, updateSettings])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-8 flex items-center">
          <h1 className="text-xl font-bold">ClaudeDeck</h1>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a 
              href="#dashboard" 
              className={`transition-colors hover:text-foreground ${
                currentView === 'dashboard' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </a>
            <a 
              href="#daily" 
              className={`transition-colors hover:text-foreground ${
                currentView === 'daily' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Daily
            </a>
            <a 
              href="#monthly" 
              className={`transition-colors hover:text-foreground ${
                currentView === 'monthly' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </a>
            <a 
              href="#session" 
              className={`transition-colors hover:text-foreground ${
                currentView === 'session' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Sessions
            </a>
            <a 
              href="#blocks" 
              className={`transition-colors hover:text-foreground ${
                currentView === 'blocks' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Blocks
            </a>
            <a 
              href="#settings" 
              className={`transition-colors hover:text-foreground ${
                currentView === 'settings' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Settings
            </a>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-4"
          >
            {theme === 'dark' ? '🌞' : theme === 'light' ? '🌙' : '💻'}
          </Button>
        </div>
      </div>
    </header>
  )
}