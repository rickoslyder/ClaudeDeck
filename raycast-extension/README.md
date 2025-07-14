# ClaudeDeck Raycast Extension

Quick access to your Claude API usage stats directly from Raycast.

## Features

- **View Usage Stats** - See current block, daily, and monthly token usage and costs
- **Open ClaudeDeck** - Quickly launch the full ClaudeDeck desktop app
- **Daily Cost Tracking** - Monitor your daily API spending

## Requirements

- ClaudeDeck desktop app must be installed
- macOS 12.0 or later
- Raycast

## Installation

1. Install ClaudeDeck desktop app first
2. Install this extension from Raycast Store
3. The extension will automatically connect to your ClaudeDeck data

## Development

To develop this extension:

```bash
cd raycast-extension
npm install
npm run dev
```

## Future Enhancements

- Real-time usage notifications
- Quick session history view
- Cost alerts and limits
- Model usage breakdown

## Communication with ClaudeDeck

The extension communicates with the ClaudeDeck desktop app through:
- Shared data files in `~/.claude/` directory
- Future: IPC communication for real-time updates