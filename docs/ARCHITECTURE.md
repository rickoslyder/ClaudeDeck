# ClaudeDeck Architecture

This document describes the technical architecture of ClaudeDeck, a cross-platform desktop application for tracking Claude API usage.

## System Overview

ClaudeDeck follows a modern desktop application architecture using Tauri, which combines a Rust backend with a web-based frontend. This approach provides native performance and system integration while maintaining a familiar web development experience.

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                      Tauri IPC Bridge                        │
├─────────────────────────────────────────────────────────────┤
│                      Rust Backend                            │
│              (File I/O, System Tray, Events)                 │
├─────────────────────────────────────────────────────────────┤
│                    Operating System                          │
│                 (macOS, Windows, Linux)                      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS v4**: Utility-first CSS framework
- **Shadcn/UI**: High-quality React components
- **Recharts**: Declarative charting library
- **TanStack Table**: Powerful table component
- **Zustand**: Lightweight state management

### Backend
- **Rust**: Systems programming language
- **Tauri v2**: Desktop application framework
- **Serde**: Serialization/deserialization
- **Notify**: Cross-platform file watching
- **Tokio**: Async runtime

## Component Architecture

### Frontend Components

```
src/
├── components/              # Reusable UI components
│   ├── layout/             # App structure components
│   │   ├── Header.tsx      # Navigation and branding
│   │   └── Container.tsx   # Layout wrapper
│   ├── widgets/            # Dashboard widgets
│   │   ├── CurrentBlockWidget.tsx
│   │   ├── TotalUsageWidget.tsx
│   │   ├── Last7DaysWidget.tsx
│   │   └── MonthlySummaryWidget.tsx
│   ├── shared/             # Shared components
│   │   ├── DataTable.tsx   # Reusable table
│   │   └── ExportButton.tsx
│   └── ui/                 # Base UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── skeleton.tsx
├── views/                  # Page-level components
│   ├── Dashboard.tsx       # Main overview
│   ├── DailyReport.tsx     # Day-by-day analysis
│   ├── MonthlyReport.tsx   # Monthly summaries
│   ├── SessionReport.tsx   # Conversation groups
│   └── BlocksReport.tsx    # Individual API calls
├── lib/                    # Core business logic
│   ├── data-processor.ts   # JSONL parsing
│   ├── formatters.ts       # Display formatting
│   └── types.ts           # TypeScript types
├── store/                  # State management
│   ├── usageDataStore.ts   # Usage data state
│   └── settingsStore.ts    # App settings
└── hooks/                  # Custom React hooks
    ├── useFileMonitoring.ts
    └── useSystemTray.ts
```

### Backend Architecture

```
src-tauri/src/
├── main.rs          # Application entry point
├── lib.rs           # Library configuration
├── commands.rs      # Tauri command handlers
├── core.rs          # File I/O and path discovery
├── settings.rs      # Settings persistence
├── file_monitor.rs  # File system watching
└── tray.rs         # System tray management
```

## Data Flow

### 1. Initial Data Load

```
Frontend                    Tauri IPC                    Backend
    │                           │                           │
    ├──── invoke('load_usage_entries', { since })────────> │
    │                           │                           │
    │                           │                    ┌──────┴──────┐
    │                           │                    │ Read JSONL  │
    │                           │                    │    files    │
    │                           │                    └──────┬──────┘
    │                           │                           │
    │ <────────── Vec<String> (JSONL lines) ──────────────│
    │                           │                           │
┌───┴────┐                      │                           │
│ Parse  │                      │                           │
│ Process│                      │                           │
└───┬────┘                      │                           │
    │                           │                           │
┌───┴────┐                      │                           │
│ Update │                      │                           │
│ Store  │                      │                           │
└────────┘                      │                           │
```

### 2. Real-time Updates

```
File System              Backend                     Frontend
    │                       │                           │
    ├─── File Change ────> │                           │
    │                       │                           │
    │                  ┌────┴────┐                     │
    │                  │ Debounce│                     │
    │                  └────┬────┘                     │
    │                       │                           │
    │                       ├──── emit('usage-updated')─>
    │                       │                           │
    │                       │                      ┌────┴────┐
    │                       │                      │ Reload  │
    │                       │                      │  Data   │
    │                       │                      └─────────┘
```

### 3. System Tray Updates

```
Frontend                    Backend                 System Tray
    │                          │                         │
    ├─── updateTrayTitle ────> │                         │
    │                          │                         │
    │                          ├──── Update Icon ──────> │
    │                          │      & Tooltip          │
    │                          │                         │
```

## State Management

### Zustand Stores

1. **Usage Data Store**
   ```typescript
   interface UsageDataState {
     entries: UsageEntry[];
     reports: {
       daily: DailyReport[];
       monthly: MonthlyReport[];
       sessions: SessionReport[];
     };
     isLoading: boolean;
     error: string | null;
   }
   ```

2. **Settings Store**
   ```typescript
   interface SettingsState {
     settings: AppSettings;
     updateSettings: (settings: Partial<AppSettings>) => void;
   }
   ```

### State Update Flow

1. User triggers action (e.g., date range change)
2. Component calls store action
3. Store updates state and triggers re-render
4. Components react to state changes
5. Side effects (if any) are handled via hooks

## Performance Optimizations

### 1. Data Loading Strategy
- Default: Load last 90 days of data
- On-demand: Load full history when requested
- Incremental: Load new data as it's created

### 2. Rendering Optimizations
- React.memo for expensive components
- useMemo for computed values
- Virtualization for large lists (planned)
- Debounced file system events

### 3. Memory Management
- Stream JSONL parsing for large files
- Garbage collection of old data
- Efficient data structures

## Security Considerations

### 1. File Access
- Read-only access to Claude data files
- No network requests to external services
- Settings stored in platform-specific secure locations

### 2. Data Privacy
- All data remains local
- No telemetry or analytics
- Export only via user action

### 3. Platform Security
- Code signing for distribution
- Sandboxed file system access
- Secure IPC communication

## Platform-Specific Considerations

### macOS
- Menu bar integration
- Native notifications via NSUserNotificationCenter
- App bundle structure
- Code signing and notarization

### Windows
- System tray integration
- Native notifications via Windows Toast
- MSI installer
- Code signing certificate

### Linux
- AppIndicator/SystemTray support
- Native notifications via libnotify
- AppImage/Deb/RPM packages
- Desktop file integration

## Extension Points

### 1. Data Sources
The architecture supports adding new data sources:
- Different file formats
- Multiple Claude accounts
- Other AI providers

### 2. Export Formats
Extensible export system:
- CSV (implemented)
- JSON (implemented)
- PDF (planned)
- Excel (planned)

### 3. Visualization Types
Modular chart system:
- Line charts (implemented)
- Bar charts (implemented)
- Heatmaps (planned)
- Custom visualizations

## Development Practices

### Code Organization
- Feature-based folder structure
- Separation of concerns
- Reusable components
- Type safety throughout

### Testing Strategy
- Unit tests for utilities
- Component testing with RTL
- Integration tests for Tauri commands
- E2E tests for critical flows

### Build Pipeline
1. TypeScript compilation
2. Vite bundling
3. Rust compilation
4. Tauri packaging
5. Code signing
6. Distribution

## Future Considerations

### Planned Enhancements
1. Plugin system for custom reports
2. Cloud sync (optional)
3. Team usage tracking
4. Budget alerts
5. API for automation

### Technical Debt
1. Migrate to Tauri v2 stable (when available)
2. Implement proper error boundaries
3. Add comprehensive logging
4. Performance profiling
5. Accessibility improvements

## Conclusion

ClaudeDeck's architecture prioritizes:
- **Performance**: Native speed with web flexibility
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new features
- **Security**: Local-first, privacy-focused
- **User Experience**: Responsive and intuitive

This architecture provides a solid foundation for current features while remaining flexible for future enhancements.