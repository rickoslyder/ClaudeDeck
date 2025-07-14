# ClaudeDeck Development Guide

This guide provides detailed instructions for setting up and developing ClaudeDeck.

## Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Rust**: v1.70.0 or higher
- **Git**: For version control

### Platform-Specific Requirements

#### macOS
- Xcode Command Line Tools
  ```bash
  xcode-select --install
  ```

#### Windows
- Microsoft C++ Build Tools or Visual Studio 2019/2022
- Windows 10 SDK
- WebView2 (usually pre-installed on Windows 11)

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.0-devel \
    openssl-devel \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel

# Arch
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/claudedeck.git
cd claudedeck
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# The Rust dependencies will be installed automatically
# when you first run the development server
```

### 3. Verify Installation

```bash
# Check Node.js
node --version  # Should be 18+

# Check npm
npm --version

# Check Rust
rustc --version  # Should be 1.70+
cargo --version

# Check Tauri CLI
npm run tauri --version
```

## Development Workflow

### Running the Development Server

```bash
# Start both frontend and backend in development mode
npm run tauri dev

# Or run them separately:
# Terminal 1 - Frontend only
npm run dev

# Terminal 2 - Tauri in dev mode
npm run tauri dev -- --no-dev-server
```

### Development Features

When running in development mode:
- Hot Module Replacement (HMR) for frontend
- Rust backend auto-recompilation
- Developer tools enabled
- Source maps for debugging
- Verbose logging

### Project Structure

```
claudedeck/
├── src/                    # Frontend source code
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Frontend entry point
│   ├── components/        # React components
│   ├── views/             # Page components
│   ├── lib/               # Core logic
│   ├── store/             # State management
│   └── hooks/             # Custom hooks
├── src-tauri/             # Backend source code
│   ├── src/               # Rust source files
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets
├── index.html             # HTML entry point
├── package.json           # Node dependencies
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript config
```

## Common Development Tasks

### Adding a New Component

1. Create component file:
```bash
touch src/components/MyComponent.tsx
```

2. Write the component:
```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
};
```

3. Add tests:
```bash
touch src/components/__tests__/MyComponent.test.tsx
```

### Adding a New Tauri Command

1. Define the command in `src-tauri/src/commands.rs`:
```rust
#[tauri::command]
pub fn my_new_command(param: String) -> Result<String, String> {
    // Implementation
    Ok(format!("Processed: {}", param))
}
```

2. Register it in `src-tauri/src/lib.rs`:
```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // ... existing commands
        commands::my_new_command,
    ])
```

3. Use it in the frontend:
```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<string>('my_new_command', {
  param: 'test'
});
```

### Working with Styles

ClaudeDeck uses Tailwind CSS v4. Key differences from v3:

1. Import in your CSS:
```css
@import "tailwindcss";
```

2. Define custom utilities:
```css
@layer utilities {
  .bg-primary {
    background-color: hsl(var(--primary));
  }
}
```

3. No JavaScript config file needed

### State Management

Using Zustand for state:

```typescript
// Create a store
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Use in component
const count = useMyStore((state) => state.count);
const increment = useMyStore((state) => state.increment);
```

## Building for Production

### Development Build

```bash
# Build without creating installers
npm run tauri build -- --debug
```

### Production Build

```bash
# Build optimized version with installers
npm run tauri build
```

Build outputs:
- **macOS**: `.app`, `.dmg`
- **Windows**: `.exe`, `.msi`
- **Linux**: `.deb`, `.AppImage`, `.rpm`

Located in: `src-tauri/target/release/bundle/`

## Testing

### Frontend Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Backend Tests

```bash
cd src-tauri
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e
```

## Debugging

### Frontend Debugging

1. **Browser DevTools**
   - Press `F12` or `Cmd+Option+I` (macOS)
   - Use React Developer Tools extension
   - Check Network tab for IPC calls

2. **VS Code Debugging**
   ```json
   // .vscode/launch.json
   {
     "type": "chrome",
     "request": "launch",
     "name": "Debug Frontend",
     "url": "http://localhost:5173",
     "webRoot": "${workspaceFolder}/src"
   }
   ```

### Backend Debugging

1. **Rust Analyzer**
   - Install Rust Analyzer VS Code extension
   - Set breakpoints in Rust code
   - Use `Debug` lens above `main()` function

2. **Console Logging**
   ```rust
   println!("Debug: {:?}", variable);
   dbg!(&variable);
   ```

3. **Tauri Logging**
   ```rust
   use log::{debug, error, info, warn};
   
   info!("Application started");
   debug!("Debug information: {:?}", data);
   ```

### Common Issues

#### Issue: Blank white screen
**Solution**: Check browser console for errors, ensure Vite dev server is running

#### Issue: Tauri commands not working
**Solution**: Verify command is registered in `lib.rs`, check for typos in command name

#### Issue: Styles not applying
**Solution**: Ensure Tailwind CSS is properly imported, check PostCSS config

#### Issue: File monitoring not working
**Solution**: Check file permissions, verify correct path discovery

## Performance Profiling

### Frontend Performance

1. **React DevTools Profiler**
   - Record a session
   - Identify slow components
   - Check for unnecessary re-renders

2. **Chrome Performance Tab**
   - Record performance
   - Analyze flame graphs
   - Check for memory leaks

### Backend Performance

```bash
# Build with profiling
cd src-tauri
cargo build --release --features profiling

# Run with profiler
cargo profiler flamegraph
```

## Code Quality

### Linting

```bash
# Lint TypeScript/React
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Lint Rust code
cd src-tauri
cargo clippy
```

### Formatting

```bash
# Format TypeScript/React
npm run format

# Check formatting
npm run format:check

# Format Rust code
cd src-tauri
cargo fmt
```

### Type Checking

```bash
# Type check TypeScript
npm run typecheck

# Watch mode
npm run typecheck -- --watch
```

## Environment Variables

Create a `.env` file for development:

```bash
# Frontend environment variables
VITE_LOG_LEVEL=debug

# Tauri environment variables
RUST_LOG=debug
TAURI_DEBUG=1
```

## Troubleshooting

### Clear Cache

```bash
# Clear Node modules
rm -rf node_modules package-lock.json
npm install

# Clear Rust build
cd src-tauri
cargo clean
```

### Reset Development Environment

```bash
# Full reset
npm run clean
npm install
npm run tauri dev
```

### Check Logs

- Frontend logs: Browser console
- Backend logs: Terminal running `tauri dev`
- Build logs: `src-tauri/target/debug/`

## Tips and Tricks

### 1. Fast Refresh

- Save files to trigger HMR
- Frontend changes reflect instantly
- Backend changes trigger recompilation

### 2. Mock Data

Create mock data for development:
```typescript
// src/lib/mock-data.ts
export const mockUsageEntries = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    model: 'claude-3-opus',
    input_tokens: 1000,
    output_tokens: 500,
    total_tokens: 1500,
  },
];
```

### 3. Development Shortcuts

```bash
# Alias for common commands
alias tdev="npm run tauri dev"
alias tbuild="npm run tauri build"
alias ttest="npm test && cd src-tauri && cargo test"
```

### 4. Git Hooks

Set up pre-commit hooks:
```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm test
```

## Resources

- [Tauri Documentation](https://tauri.app/v2/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)

## Getting Help

1. Check existing issues on GitHub
2. Ask in discussions
3. Review error messages carefully
4. Enable debug logging
5. Create minimal reproduction

Happy coding! 🚀