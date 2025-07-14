# Project Name

ccusage-desktop

## Project Description

A cross-platform desktop GUI application built with Tauri that provides a rich, visual, and interactive interface for analyzing Claude Code token usage and costs. The application will leverage the core logic of the `ccusage` CLI but present the data in an intuitive graphical dashboard, with real-time updates and native desktop integration.

## Target Audience

- Individual developers using Claude Code who want a persistent, graphical dashboard to track their usage and costs.
- Users who prefer a GUI over a command-line interface.

## Desired Features

### Data Handling & Core Logic
- [ ] [Requirement] Automatically discover and read usage data from the default Claude Code local directories.
- [ ] [Requirement] For performance, load the last 90 days of usage data by default on startup.
    - [ ] [Sub-requirement] Provide a clear UI option for the user to load their entire data history on demand.
    - [ ] [Sub-requirement] Provide a setting to allow users to make loading all historical data the default behavior.
- [ ] [Requirement] Gracefully handle and skip corrupted or malformed usage files/entries without crashing.
- [ ] [Requirement] Reuse the core reporting logic from the `ccusage` library for data aggregation (Daily, Monthly, Session, Blocks).
- [ ] [Requirement] Implement all cost calculation modes ('auto', 'calculate', 'display') with a simple UI toggle.
- [ ] [Requirement] Allow users to export data from tables to CSV and JSON formats.

### UI & Visualization
- [ ] [Requirement] A primary dashboard view for an at-a-glance summary of usage.
    - [ ] [Sub-requirement] A "Current Block" widget showing real-time cost and token usage for the active 5-hour billing cycle.
    - [ ] [Sub-requirement] A "Last 7 Days" sparkline chart showing daily costs.
    - [ ] [Sub-requirement] A "Top Models" pie chart visualizing the usage proportion between models.
- [ ] [Requirement] Dedicated views/tabs for Daily, Monthly, Session, and Blocks reports.
    - [ ] [Sub-requirement] Use interactive bar charts and progress bars to visualize costs and usage.
    - [ ] [Sub-requirement] All views with tabular data should support interactive sorting and text-based filtering.
- [ ] [Requirement] An interactive, graphical date-range selector for filtering data.
- [ ] [Requirement] A dedicated settings screen for application configuration.
    - [ ] [Sub-requirement] Allow users to manage custom Claude data directories.
    - [ ] [Sub-requirement] Allow users to configure token limits for notifications.
    - [ ] [Sub-requirement] Persist user settings locally on the user's machine.
- [ ] [Requirement] Display a helpful welcome/empty state on first launch or if no data is found, guiding the user on next steps.
- [ ] [Requirement] Display a subtle, non-intrusive indicator if corrupted data files were detected and skipped during processing.

### Desktop Integration
- [ ] [Requirement] Run in the background and monitor the Claude data directory for changes in real-time.
- [ ] [Requirement] Display a system tray (Windows) or menu bar (macOS) icon.
    - [ ] [Sub-requirement] The icon should display the real-time cost of the current active 5-hour block.
    - [ ] [Sub-requirement] Clicking the icon should open/focus the main application window.
- [ ] [Requirement] Send native system notifications when usage approaches or exceeds a configurable limit.
- [ ] [Requirement] Application should be packaged into standard installers (.dmg, .msi, .deb) with auto-update capabilities.

## Design Requests

- [ ] [Requirement] The UI should be clean, modern, and data-focused, inspired by tools like Vercel Analytics or Supabase's dashboard.
    - [ ] [Design detail] Use a dark theme by default, with an optional light theme.

## Other Notes

- [Additional considerations] The application will be built using the Tauri framework. The existing `ccusage` TypeScript codebase will be reused as the core data processing library.