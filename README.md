# ClaudeDeck

A cross-platform desktop application for tracking and analyzing Claude API usage with real-time monitoring, cost tracking, and native system integration.

![ClaudeDeck Dashboard](docs/images/dashboard-screenshot.png)
*Screenshot: ClaudeDeck main dashboard showing usage analytics*

## Features

### Real-time Monitoring
- **Live Usage Tracking**: Monitor your Claude API token usage as you work
- **System Tray Integration**: Always-visible usage indicator in your system tray
- **File Watching**: Automatic updates when Claude writes new usage data

### Comprehensive Analytics
- **Dashboard Overview**: At-a-glance view of your usage patterns
- **Daily Reports**: Detailed breakdown of daily token consumption
- **Monthly Reports**: Track spending and usage trends over time
- **Session Analysis**: Group related conversations and analyze patterns
- **Block-level Details**: Deep dive into individual API calls

### Cost Management
- **Real-time Cost Calculation**: See costs as tokens are consumed
- **Monthly Budget Tracking**: Monitor spending against your budget
- **Model-specific Pricing**: Accurate costs for each Claude model
- **Export Capabilities**: Export data in CSV or JSON format

### Native Desktop Experience
- **Cross-platform**: Works on macOS, Windows, and Linux
- **Dark/Light Themes**: Automatic theme detection or manual selection
- **Keyboard Shortcuts**: Efficient navigation and actions
- **Native Notifications**: Optional alerts for usage milestones

## Installation

### Homebrew (macOS)

*Coming soon: Install via Homebrew*

```bash
brew install --cask claudedeck
```

### Download Pre-built Binaries

*Coming soon: Pre-built binaries will be available from the [Releases page](https://github.com/rickoslyder/ClaudeDeck/releases)*

### Raycast Extension

ClaudeDeck includes a companion Raycast extension for quick access to usage stats:

```bash
# Coming soon: Install from Raycast Store
```

See [raycast-extension/README.md](raycast-extension/README.md) for more details.

### Build from Source

Requirements:
- Node.js 18+ and npm
- Rust 1.70+
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft C++ Build Tools
  - **Linux**: `libwebkit2gtk-4.0-dev`, `build-essential`, `libssl-dev`

```bash
# Clone the repository
git clone https://github.com/rickoslyder/ClaudeDeck.git
cd ClaudeDeck

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Usage

### First Launch

When you first launch ClaudeDeck, it will automatically:
1. Detect your Claude configuration directory
2. Load your usage history (last 90 days by default)
3. Start monitoring for new usage in real-time

### Navigation

- **Dashboard**: Overview of your usage patterns and key metrics
- **Daily Report**: Detailed day-by-day breakdown
- **Monthly Report**: Month-over-month analysis
- **Sessions**: View grouped conversations
- **Blocks**: Individual API call details
- **Settings**: Configure preferences and data retention

### System Tray

The system tray icon shows your current session's token usage:
- Click to open the main window
- Right-click for quick actions menu
- Hover to see detailed usage tooltip

### Keyboard Shortcuts

- `Cmd/Ctrl + ,` - Open Settings
- `Cmd/Ctrl + E` - Export current view
- `Cmd/Ctrl + R` - Refresh data
- `Cmd/Ctrl + D` - Toggle dark mode

## Development

### Prerequisites

Ensure you have the required tools installed:
```bash
# Check Node.js version
node --version  # Should be 18+

# Check Rust version
rustc --version  # Should be 1.70+

# Check npm version
npm --version
```

### Setup

```bash
# Clone and enter the project
git clone https://github.com/rickoslyder/ClaudeDeck.git
cd ClaudeDeck

# Install dependencies
npm install

# Run development server
npm run tauri dev
```

### Project Structure

```
claudedeck/
├── src/                    # Frontend React/TypeScript code
│   ├── components/         # Reusable UI components
│   ├── views/              # Page-level components
│   ├── lib/                # Core logic and utilities
│   ├── store/              # Zustand state management
│   └── hooks/              # Custom React hooks
├── src-tauri/              # Rust backend code
│   ├── src/                # Rust source files
│   └── tauri.conf.json     # Tauri configuration
└── docs/                   # Additional documentation
```

### Testing

```bash
# Run frontend tests
npm test

# Run Rust tests
cd src-tauri && cargo test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

For more detailed development instructions, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Development workflow
- Code style guidelines
- Submitting pull requests
- Reporting issues

## Architecture

ClaudeDeck is built with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri
- **UI**: Tailwind CSS + Shadcn/UI
- **State**: Zustand
- **Charts**: Recharts

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on top of the [ccusage](https://github.com/keidarcy/ccusage) CLI tool
- Powered by [Tauri](https://tauri.app) for native desktop integration
- UI components from [Shadcn/UI](https://ui.shadcn.com)

## Support

- **Issues**: [GitHub Issues](https://github.com/rickoslyder/ClaudeDeck/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rickoslyder/ClaudeDeck/discussions)

---

Made with ❤️ for the Claude community