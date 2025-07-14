# ClaudeDeck Implementation Tasks

## Completed Tasks ✅

1. **Initialize Tauri project with React + TypeScript + Vite template** - COMPLETED
   - Set up basic Tauri structure
   - Configured TypeScript and Vite

2. **Install and configure UI/State management dependencies** - COMPLETED
   - Installed Shadcn/UI, Zustand, Recharts, TanStack Table
   - Configured Tailwind CSS
   - Set up PostCSS

3. **Set up project structure** - COMPLETED
   - Created directories for components, views, lib, store
   - Organized code into logical modules

4. **Implement Rust backend commands** - COMPLETED
   - File discovery and data loading
   - Settings persistence
   - Export functionality
   - System tray management

5. **Adapt ccusage TypeScript library** - COMPLETED
   - Ported data processing logic
   - Created type definitions
   - Implemented cost calculation

6. **Create Zustand stores** - COMPLETED
   - Usage data store with loading/processing
   - Settings store with persistence

7. **Fix PostCSS/Tailwind configuration** - COMPLETED
   - Updated to Tailwind CSS v4 syntax
   - Fixed build issues

8. **Create base UI components** - COMPLETED
   - Card, Skeleton components
   - Layout components (Header, Container)
   - Data table and export button

9. **Implement Dashboard view** - COMPLETED
   - Current Block widget
   - Last 7 Days widget with chart
   - Top Models widget with pie chart

10. **Implement Report views** - COMPLETED
    - Daily Report with bar chart
    - Monthly Report with area chart
    - Blocks Report with active block highlighting

11. **System tray integration** - COMPLETED
    - Real-time monitoring with file watcher
    - Auto-refresh functionality
    - Tray title updates

12. **Settings UI** - COMPLETED
    - Theme switcher
    - Cost mode selection
    - Auto-refresh configuration

## Current Task: Homebrew Distribution Setup 📦

### Research Phase
- [ ] Research Homebrew formula requirements for Tauri apps
- [ ] Study how other Rust/Tauri apps are distributed via Homebrew
- [ ] Investigate bottle (pre-compiled binary) vs source builds
- [ ] Research GitHub Actions workflows for automated releases

### Implementation Phase
- [ ] Create draft Homebrew formula (homebrew/claudedeck.rb)
- [ ] Document release process in docs/RELEASING.md
- [ ] Set up GitHub Actions workflow for automated releases
- [ ] Test formula locally with `brew install --build-from-source`
- [ ] Plan for formula submission to homebrew-cask

### Key Questions to Answer
1. Should we use homebrew-core (source builds) or homebrew-cask (pre-built apps)?
2. What dependencies need to be specified in the formula?
3. How to handle universal binaries for Apple Silicon and Intel Macs?
4. What's the best workflow for GitHub releases → Homebrew updates?

## Pending Tasks 📋

None - All previous tasks have been completed!

## Review

### Summary of Changes

This implementation successfully creates a fully functional ClaudeDeck application with the following features:

1. **Architecture**: Clean separation between Rust backend (file I/O, system integration) and React frontend (UI, data processing)

2. **Data Processing**: Reused ccusage logic adapted for browser environment, supporting multiple cost modes and aggregation levels

3. **UI/UX**: Modern, responsive design using Shadcn/UI components with dark/light theme support

4. **Real-time Updates**: File monitoring in Rust backend with event emission to frontend for live updates

5. **Reports**: Comprehensive reporting views (Daily, Monthly, Sessions, Blocks) with data visualization using Recharts

6. **Desktop Integration**: System tray with live usage display, native file dialogs for export

### Key Technical Decisions

- Used Zustand for simple state management
- Implemented hash-based routing for simplicity (no need for React Router)
- Adapted to Tailwind CSS v4 requirements
- Created modular, reusable components
- Optimized for performance with 90-day default data load

### Areas for Future Enhancement

1. Enhanced session tracking with actual file path information from backend
2. Performance optimization for very large datasets
3. Additional chart types and visualizations
4. Keyboard shortcuts
5. Data caching for offline usage
6. More granular notification settings

### Implementation Notes

**Session Report**: Since file paths are not available in the frontend, I implemented time-based session grouping where a gap of more than 30 minutes between activities creates a new session. This provides a reasonable approximation of work sessions without requiring backend changes.

The application is now ready for use and provides all core functionality requested in the specifications.

## Token Display Enhancement Review (Latest Changes)

### Overview
Updated ClaudeDeck to display token type breakdowns matching ccusage CLI tool's transparency, ensuring users can see detailed token usage including cache tokens.

### Changes Made

1. **✅ Updated BlocksReport.tsx Table Columns**
   - Replaced single "Tokens" column with individual columns: Input, Output, Cache Create, Cache Read, Total
   - Location: `/src/views/BlocksReport.tsx` lines 33-94
   - Impact: Users can now see exact token usage breakdown per billing block

2. **✅ Enhanced Active Block Display**
   - Updated the active block card to show all token types separately
   - Location: `/src/views/BlocksReport.tsx` lines 166-249
   - Impact: Real-time monitoring now shows detailed token breakdown

3. **✅ Updated DailyReport.tsx Table Columns**
   - Added same token type columns as BlocksReport
   - Location: `/src/views/DailyReport.tsx` lines 25-86
   - Impact: Daily reports now match ccusage CLI's detailed view

4. **✅ Added Tooltip Explanations**
   - Created new tooltip component at `/src/components/ui/tooltip.tsx`
   - Added info icons with explanations for cache tokens:
     - Cache Create: "Cache creation tokens are charged at 1.25x the input rate"
     - Cache Read: "Cache read tokens are charged at 0.1x the input rate"
   - Impact: Users understand cost implications of different token types

5. **✅ Verified Export Functionality**
   - Confirmed exports already include all token fields
   - Location: `/src/components/shared/ExportButton.tsx`
   - Impact: CSV/JSON exports contain complete token breakdown

### Technical Summary
- Data processing was already correct (all token types handled properly)
- UI now matches the comprehensive data processing
- Cost calculations remain accurate with proper token weighting
- Export functionality automatically includes all fields

This enhancement brings ClaudeDeck to full parity with ccusage CLI's token transparency while maintaining its superior graphical interface.

## System Tray Advanced Features - Implementation Plan

### Analysis of Current State

#### Existing Commands
- ✅ `update_tray_title(title: String)` - Updates the text shown next to the tray icon

#### Existing Tray Features
- ✅ Basic tray icon with menu (Open ClaudeDeck, Quit)
- ✅ Click handling to show/focus main window
- ✅ Title update capability

#### Missing Commands for Advanced Features

### TODO: New Commands to Add

#### 1. Icon Management
- [ ] Add `update_tray_icon(style: String)` command
  - Parameters: style (e.g., "default", "dark", "light", "custom")
  - Will update the tray icon based on theme or usage state
  - Need to prepare different icon variants (normal, alert states)

#### 2. Notification Support
- [ ] Add `show_tray_notification(title: String, body: String, notification_type: Option<String>)` command
  - Parameters: title, body, notification_type (info/warning/error)
  - Will trigger native OS notifications from the tray
  - Useful for usage limit alerts

#### 3. Tooltip Management
- [ ] Add `set_tray_tooltip(tooltip: String)` command
  - Parameters: tooltip text
  - Will set hover tooltip for the tray icon
  - Can show quick usage stats without clicking

#### 4. Click Behavior Control
- [ ] Add `set_tray_click_behavior(behavior: String)` command
  - Parameters: behavior ("show_window", "show_menu", "toggle_window")
  - Allows frontend to control what happens on tray click
  - Based on user preferences in settings

#### 5. Dynamic Menu Updates
- [ ] Add `update_tray_menu(menu_items: Vec<MenuItem>)` command
  - Parameters: array of menu items with id, label, enabled state
  - Allows adding dynamic items like "Current Usage: $X.XX"
  - Can add quick actions based on context

#### 6. Tray State Management
- [ ] Add `get_tray_state()` command
  - Returns current tray state (icon style, tooltip, visibility)
  - Useful for syncing UI state

### Implementation Considerations

#### Icon Assets
- Need to create icon variants:
  - Normal state (default)
  - Alert state (when limits exceeded)
  - Different theme variants (light/dark)
  - Platform-specific formats (.ico for Windows, .png for macOS/Linux)

#### Platform Differences
- macOS: Supports title text next to icon
- Windows/Linux: Title might not be visible, rely more on tooltips
- Notification API differences between platforms

#### Settings Integration
- New settings needed (Note: Already in progress based on compilation error):
  - `tray_icon_style`: "auto" | "light" | "dark"
  - `tray_click_action`: "show_window" | "show_menu" | "toggle"
  - `show_tray_notifications`: boolean
  - `tray_tooltip_format`: string template

#### Event Flow
1. Frontend monitors usage data changes
2. Frontend calls appropriate tray commands based on:
   - Current usage vs limits
   - User settings
   - Theme preferences
3. Rust backend updates tray accordingly

### Next Steps
1. Implement the new commands in `commands.rs`
2. Extend `tray.rs` with new functionality
3. Update settings structure if needed (appears to be in progress)
4. Create icon assets
5. Update frontend to use new commands

### Review
*To be completed after implementation*