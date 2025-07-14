import { useEffect, useState } from 'react';
import { useUsageDataStore, useSettingsStore } from './store';
import { useFileMonitoring, useAutoRefresh, useSystemTray } from './hooks';
import { Header } from './components/layout/Header';
import { Dashboard } from './views/Dashboard';
import { DailyReport } from './views/DailyReport';
import { MonthlyReport } from './views/MonthlyReport';
import { SessionReport } from './views/SessionReport';
import { BlocksReport } from './views/BlocksReport';
import { Settings } from './views/Settings';
// import { DebugConsole } from './components/DebugConsole';

type View = 'dashboard' | 'daily' | 'monthly' | 'session' | 'blocks' | 'settings';

let renderCount = 0;

function App() {
  renderCount++;
  console.log(`[App] Render #${renderCount} - App component rendering`);
  
  // State hooks
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Store hooks - always call these
  const isLoadingData = useUsageDataStore(state => state.isLoading);
  const isLoadingSettings = useSettingsStore(state => state.isLoading);
  const dataError = useUsageDataStore(state => state.error);
  const settingsError = useSettingsStore(state => state.error);
  const theme = useSettingsStore(state => state.settings.theme);
  
  console.log('[App] Loading states:', { isLoadingData, isLoadingSettings });
  console.log('[App] Errors:', { dataError, settingsError });
  
  // Custom hooks - always call these
  useFileMonitoring();
  useAutoRefresh();
  useSystemTray();
  
  // Apply theme
  useEffect(() => {
    console.log('[App] Theme effect running. Current theme:', theme);
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Apply the appropriate theme
    if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
      console.log(`[App] System theme applied: ${prefersDark ? 'dark' : 'light'}`);
    } else {
      root.classList.add(theme);
      console.log(`[App] ${theme} theme applied`);
    }
  }, [theme]);
  
  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'dashboard' || hash === 'daily' || hash === 'monthly' || hash === 'session' || hash === 'blocks' || hash === 'settings') {
        setCurrentView(hash as View);
      } else if (!hash) {
        setCurrentView('dashboard');
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Initialize data
  useEffect(() => {
    console.log(`[App] Init effect running. isInitialized: ${isInitialized}`);
    if (!isInitialized) {
      console.log('[App] Starting initialization...');
      setIsInitialized(true);
      
      const initializeApp = async () => {
        try {
          console.log('[App] Getting store functions...');
          // Get stable function references from store
          const { loadSettings: loadSettingsFn } = useSettingsStore.getState();
          const { loadUsageData: loadUsageDataFn } = useUsageDataStore.getState();
          
          console.log('[App] Loading settings...');
          // Load settings first
          await loadSettingsFn();
          console.log('[App] Settings loaded');
          
          // Then load usage data for last 90 days
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          const sinceDate = ninetyDaysAgo.toISOString().split('T')[0];
          console.log('[App] Loading usage data since:', sinceDate);
          await loadUsageDataFn(sinceDate);
          console.log('[App] Usage data loaded');
          console.log('[App] Initialization complete');
        } catch (error) {
          console.error('[App] Initialization error:', error);
        }
      };
      
      initializeApp();
    }
  }, [isInitialized]); // Remove function dependencies to prevent infinite loop
  
  // Handle errors
  const error = dataError || settingsError;
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoadingData || isLoadingSettings) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoadingSettings ? 'Loading settings...' : 'Loading usage data...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Render views
  const renderView = () => {
    switch (currentView) {
      case 'daily':
        return <DailyReport />;
      case 'monthly':
        return <MonthlyReport />;
      case 'session':
        return <SessionReport />;
      case 'blocks':
        return <BlocksReport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };
  
  // Main app
  console.log('[App] Rendering main app with view:', currentView);
  
  try {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-4">
          {renderView()}
        </main>
        {/* <DebugConsole /> */}
      </div>
    );
  } catch (error) {
    console.error('[App] Error rendering main app:', error);
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Rendering Error</h1>
          <p className="text-muted-foreground">{String(error)}</p>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer">Stack trace</summary>
            <pre className="mt-2 text-xs overflow-auto">{error instanceof Error ? error.stack : 'No stack trace'}</pre>
          </details>
        </div>
      </div>
    );
  }
}

export default App;

// Add error boundary debugging
if (typeof window !== 'undefined') {
  (window as any).__REACT_ERROR_BOUNDARY_DEBUG__ = true;
}