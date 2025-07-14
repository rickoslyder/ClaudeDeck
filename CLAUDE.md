# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RULES TO ALWAYS FOLLOW WHEN WORKING ON THIS PROJECT
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.

## Project Overview

ClaudeDeck is a cross-platform desktop GUI application built with Tauri that provides a visual interface for analyzing Claude Code token usage and costs. It leverages the core logic of the existing `ccusage` CLI tool but presents data in an intuitive graphical dashboard with real-time updates and native desktop integration.

## Commands

Since this is a greenfield project that hasn't been initialized yet, here are the commands you'll need once the project is set up:

### Initial Setup
```bash
# Create Tauri app with React + TypeScript + Vite
npm create tauri-app@latest -- --ts --manager npm --template react-ts

# Install dependencies
npm install

# Install recommended UI/State libraries
npm install @tanstack/react-table recharts zustand
npm install -D @tailwindcss/forms @tailwindcss/typography
npx shadcn-ui@latest init
```

### Development
```bash
# Run development server (frontend + backend)
npm run tauri dev

# Run frontend only
npm run dev

# Build Rust backend only
cd src-tauri && cargo build
```

### Build & Package
```bash
# Build for production
npm run tauri build

# Generate app bundles (.dmg, .msi, .deb)
npm run tauri build -- --bundles dmg,msi,deb
```

### Testing
```bash
# Run frontend tests
npm run test

# Run Rust tests
cd src-tauri && cargo test

# Run E2E tests (once configured)
npm run test:e2e
```

### Linting & Type Checking
```bash
# Lint TypeScript/React code
npm run lint

# Type check
npm run typecheck

# Format code
npm run format
```

## Architecture

### Technology Stack
- **Backend**: Rust (Tauri) - Thin layer for OS integrations
- **Frontend**: React + TypeScript + Vite
- **UI Library**: Shadcn/UI (Radix UI + Tailwind CSS)
- **Charts**: Recharts
- **Tables**: TanStack Table
- **State Management**: Zustand
- **File Monitoring**: notify (Rust crate)

### Project Structure
```
/
├── src/                    # Frontend React/TypeScript code
│   ├── components/         # Reusable UI components
│   ├── views/              # Page-level components (Dashboard, Daily, etc.)
│   ├── lib/                # Core logic adapted from ccusage
│   ├── store/              # Zustand state management
│   └── hooks/              # Custom React hooks
├── src-tauri/              # Rust backend code
│   ├── src/
│   │   ├── commands.rs     # Tauri command definitions
│   │   ├── core.rs         # File I/O and path discovery
│   │   ├── settings.rs     # Settings persistence
│   │   └── tray.rs         # System tray management
│   └── tauri.conf.json     # Tauri configuration
```

### Key Design Decisions

1. **Data Processing**: The Rust backend reads raw JSONL files and passes them as strings to the frontend. The TypeScript frontend uses adapted `ccusage` library functions to parse and aggregate data.

2. **State Management**: Zustand is used for global state with two main stores:
   - `useUsageDataStore`: Holds processed usage reports
   - `useSettingsStore`: Manages application settings

3. **Real-time Updates**: File system monitoring in Rust emits events to the frontend when Claude data changes, enabling live updates of the current block widget and system tray.

4. **Performance**: By default, loads only the last 90 days of data. Users can opt to load full history on demand.

### Tauri Commands

Key commands to implement in `src-tauri/src/commands.rs`:

- `load_usage_entries(since_date: Option<String>) -> Result<Vec<String>, String>`
- `export_data(format: String, content: String, default_filename: String) -> Result<()>`
- `get_settings() -> AppSettings`
- `save_settings(settings: AppSettings) -> Result<()>`
- `update_tray_title(title: String) -> Result<()>`

## Development Tips

1. **File Discovery**: Implement Claude path discovery logic similar to ccusage, checking:
   - `CLAUDE_CONFIG_DIR` environment variable
   - `~/.config/claude`
   - `~/.claude`

2. **Error Handling**: Gracefully skip corrupted JSONL entries without crashing. Maintain a count of skipped entries for user feedback.

3. **Testing**: Mock Tauri's `invoke` and `listen` functions when testing React components. Use the `notify` crate's test utilities for file watcher tests.

4. **Performance**: For large datasets, consider implementing virtualization in data tables using TanStack Virtual.

5. **Theme Support**: Implement dark/light/system theme options using Tailwind CSS class-based theming.

## Critical Lessons Learned

### Tailwind CSS v4 Setup
**Important**: This project uses Tailwind CSS v4, which has significant differences from v3:

1. **CSS Import**: Use `@import "tailwindcss";` instead of the v3 directives
2. **PostCSS Config**: Uses `@tailwindcss/postcss` plugin
3. **Custom Colors**: Theme colors using CSS variables (e.g., `--background`, `--foreground`) require manual utility class definitions:
   ```css
   @layer utilities {
     .bg-background { background-color: hsl(var(--background)); }
     .text-foreground { color: hsl(var(--foreground)); }
   }
   ```
4. **No JS Config**: Tailwind v4 doesn't use `tailwind.config.js` - all configuration is in CSS

### React/Zustand Pitfalls
**Critical**: Avoid inline object selectors in Zustand to prevent React error #185 (infinite loops):

```typescript
// ❌ BAD - Creates new object on every render
const { theme, updateSettings } = useSettingsStore(state => ({
  theme: state.settings.theme,
  updateSettings: state.updateSettings
}))

// ✅ GOOD - Separate selectors
const theme = useSettingsStore(state => state.settings.theme)
const updateSettings = useSettingsStore(state => state.updateSettings)
```

### Tauri v2 API Changes
1. **Window Access**: Use `app.get_webview_window("main")` instead of v1 methods
2. **DevTools**: `window.open_devtools()` returns void, not Result
3. **CSP Configuration**: Ensure `withGlobalTauri: true` in tauri.conf.json

### Development Workflow
1. **Dev Server**: Run with `npm run tauri:dev` (or `npm run tauri dev`)
2. **Background Process**: If running dev server in background, pipe to log file:
   ```bash
   npm run tauri:dev > /tmp/tauri-dev.log 2>&1 &
   ```
3. **Build Time**: Production builds take 2-5 minutes - always test locally first
4. **React StrictMode**: Causes double rendering in development (normal behavior)

### File Monitoring
- The app watches Claude's JSONL files for changes using Rust's `notify` crate
- Updates are throttled to prevent excessive re-renders
- Current block widget updates in real-time when new tokens are used

### Performance Optimizations
1. Default loads last 90 days of data (configurable)
2. JSONL parsing happens in parallel where possible
3. Reports are cached in Zustand stores to avoid recomputation
4. Heavy computations (like session grouping) are memoized