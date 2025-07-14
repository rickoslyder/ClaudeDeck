# ClaudeDeck API Documentation

This document describes the Tauri commands and events used for communication between the frontend and backend in ClaudeDeck.

## Tauri Commands

Tauri commands are invoked from the frontend using the `invoke` function and handled by the Rust backend.

### `load_usage_entries`

Loads usage entries from Claude's JSONL files.

**Parameters:**
- `since_date` (optional): ISO date string to filter entries from

**Returns:** `Vec<String>` - Array of JSONL strings

**Example:**
```typescript
import { invoke } from '@tauri-apps/api/core';

const entries = await invoke<string[]>('load_usage_entries', {
  since_date: '2024-01-01'
});
```

**Error Cases:**
- File not found
- Permission denied
- Invalid date format

---

### `export_data`

Exports data to a file in the specified format.

**Parameters:**
- `format`: Export format ('csv' | 'json')
- `content`: String content to export
- `default_filename`: Suggested filename

**Returns:** `void`

**Example:**
```typescript
await invoke('export_data', {
  format: 'csv',
  content: csvData,
  default_filename: 'claude-usage-2024-01.csv'
});
```

**Error Cases:**
- Invalid format
- Write permission denied
- User cancels save dialog

---

### `get_settings`

Retrieves the current application settings.

**Parameters:** None

**Returns:** `AppSettings` object

**Example:**
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dataRetentionDays: number;
  showSystemTray: boolean;
  systemTrayFormat: string;
  autoStart: boolean;
  refreshInterval: number;
}

const settings = await invoke<AppSettings>('get_settings');
```

---

### `save_settings`

Saves application settings to persistent storage.

**Parameters:**
- `settings`: AppSettings object

**Returns:** `void`

**Example:**
```typescript
await invoke('save_settings', {
  settings: {
    theme: 'dark',
    dataRetentionDays: 90,
    showSystemTray: true,
    systemTrayFormat: '{tokens} tokens',
    autoStart: false,
    refreshInterval: 60
  }
});
```

**Error Cases:**
- Invalid settings format
- Write permission denied

---

### `update_tray_title`

Updates the system tray icon title/tooltip.

**Parameters:**
- `title`: String to display

**Returns:** `void`

**Example:**
```typescript
await invoke('update_tray_title', {
  title: '1,234 tokens'
});
```

---

### `start_file_monitoring`

Starts monitoring Claude data files for changes.

**Parameters:**
- `path`: Directory path to monitor

**Returns:** `void`

**Example:**
```typescript
await invoke('start_file_monitoring', {
  path: '/Users/username/.config/claude'
});
```

---

### `stop_file_monitoring`

Stops file monitoring.

**Parameters:** None

**Returns:** `void`

**Example:**
```typescript
await invoke('stop_file_monitoring');
```

---

### `get_claude_config_path`

Discovers the Claude configuration directory path.

**Parameters:** None

**Returns:** `string | null` - Path to Claude config directory

**Example:**
```typescript
const configPath = await invoke<string | null>('get_claude_config_path');
if (configPath) {
  console.log('Claude config found at:', configPath);
}
```

---

### `show_in_folder`

Opens the file explorer to show a file or directory.

**Parameters:**
- `path`: Path to show

**Returns:** `void`

**Example:**
```typescript
await invoke('show_in_folder', {
  path: '/Users/username/.config/claude'
});
```

## Events

Events are emitted from the backend and listened to in the frontend using the `listen` function.

### `usage-updated`

Emitted when Claude usage files are modified.

**Payload:** None (frontend should reload data)

**Example:**
```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('usage-updated', (event) => {
  console.log('Usage data updated, reloading...');
  reloadUsageData();
});

// Clean up listener
unlisten();
```

---

### `settings-changed`

Emitted when settings are modified externally.

**Payload:** `AppSettings` object

**Example:**
```typescript
const unlisten = await listen<AppSettings>('settings-changed', (event) => {
  console.log('Settings updated:', event.payload);
  updateLocalSettings(event.payload);
});
```

---

### `file-watch-error`

Emitted when file monitoring encounters an error.

**Payload:**
```typescript
interface FileWatchError {
  message: string;
  path?: string;
}
```

**Example:**
```typescript
const unlisten = await listen<FileWatchError>('file-watch-error', (event) => {
  console.error('File watch error:', event.payload.message);
  showErrorNotification(event.payload.message);
});
```

## Window Management

### `open_devtools`

Opens the developer tools (development only).

**Example:**
```typescript
import { getCurrent } from '@tauri-apps/api/window';

const window = getCurrent();
await window.openDevtools();
```

---

### `minimize_to_tray`

Minimizes the window to system tray.

**Example:**
```typescript
const window = getCurrent();
await window.minimize();
```

## Error Handling

All Tauri commands return a `Result` type in Rust, which translates to either a resolved or rejected Promise in JavaScript.

### Error Response Format

```typescript
interface TauriError {
  message: string;
  code?: string;
}
```

### Common Error Codes

- `FILE_NOT_FOUND`: Claude data files not found
- `PERMISSION_DENIED`: No read/write access
- `INVALID_FORMAT`: Invalid data format
- `SETTINGS_ERROR`: Settings operation failed
- `MONITOR_ERROR`: File monitoring error

### Error Handling Example

```typescript
try {
  const entries = await invoke<string[]>('load_usage_entries');
  processEntries(entries);
} catch (error) {
  const tauriError = error as TauriError;
  
  switch (tauriError.code) {
    case 'FILE_NOT_FOUND':
      showSetupWizard();
      break;
    case 'PERMISSION_DENIED':
      showPermissionError();
      break;
    default:
      showGenericError(tauriError.message);
  }
}
```

## Type Definitions

### Core Types

```typescript
// Usage entry from JSONL
interface UsageEntry {
  id: string;
  timestamp: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  conversation_id?: string;
}

// Application settings
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dataRetentionDays: number;
  showSystemTray: boolean;
  systemTrayFormat: string;
  autoStart: boolean;
  refreshInterval: number;
}

// Export formats
type ExportFormat = 'csv' | 'json';

// Report types
interface DailyReport {
  date: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  sessionCount: number;
}

interface MonthlyReport {
  month: string;
  totalTokens: number;
  cost: number;
  dailyAverage: number;
  topModels: ModelUsage[];
}
```

## Best Practices

### 1. Command Invocation

Always handle errors when invoking commands:

```typescript
async function loadData() {
  try {
    setLoading(true);
    const data = await invoke('load_usage_entries');
    processData(data);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
}
```

### 2. Event Listeners

Clean up event listeners to prevent memory leaks:

```typescript
useEffect(() => {
  let unlisten: (() => void) | undefined;

  const setupListener = async () => {
    unlisten = await listen('usage-updated', handleUpdate);
  };

  setupListener();

  return () => {
    unlisten?.();
  };
}, []);
```

### 3. Type Safety

Always use TypeScript types for command parameters and returns:

```typescript
// Define command types
type Commands = {
  load_usage_entries: {
    args: { since_date?: string };
    returns: string[];
  };
  export_data: {
    args: { format: string; content: string; default_filename: string };
    returns: void;
  };
};

// Type-safe invoke wrapper
async function invokeCommand<K extends keyof Commands>(
  cmd: K,
  args?: Commands[K]['args']
): Promise<Commands[K]['returns']> {
  return invoke(cmd, args);
}
```

### 4. Performance

- Debounce rapid command calls
- Use loading states for long operations
- Cache results when appropriate
- Handle large datasets efficiently

## Testing

### Mocking Tauri APIs

For unit tests, mock the Tauri APIs:

```typescript
// __mocks__/@tauri-apps/api/core.ts
export const invoke = jest.fn().mockImplementation((cmd, args) => {
  switch (cmd) {
    case 'load_usage_entries':
      return Promise.resolve(mockUsageEntries);
    case 'get_settings':
      return Promise.resolve(mockSettings);
    default:
      return Promise.reject(new Error('Unknown command'));
  }
});

// __mocks__/@tauri-apps/api/event.ts
export const listen = jest.fn().mockResolvedValue(() => {});
```

### Integration Testing

For integration tests, use Tauri's testing utilities:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_load_usage_entries() {
        let entries = load_usage_entries(None).unwrap();
        assert!(!entries.is_empty());
    }
}
```

## Version History

- **v1.0.0**: Initial API
  - Basic CRUD operations
  - File monitoring
  - Settings management
  - Export functionality