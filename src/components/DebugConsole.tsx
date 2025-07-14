import { useEffect, useState } from 'react';

interface LogEntry {
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: Date;
}

export function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(c => c + 1);
  }, []);

  useEffect(() => {
    // Capture console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: LogEntry['type'], ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev.slice(-50), { type, message, timestamp: new Date() }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 bg-background border rounded-tl-lg shadow-lg overflow-hidden">
      <div className="bg-muted px-2 py-1 text-xs font-mono">
        Debug Console (Renders: {renderCount})
      </div>
      <div className="overflow-y-auto h-full p-2 text-xs font-mono">
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`mb-1 ${
              log.type === 'error' ? 'text-red-500' : 
              log.type === 'warn' ? 'text-yellow-500' : 
              'text-muted-foreground'
            }`}
          >
            [{log.timestamp.toLocaleTimeString()}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}