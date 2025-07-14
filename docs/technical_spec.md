<specification_planning>
### 1. Core System Architecture and Key Workflows

*   **Architecture:** The application will be a Tauri-based cross-platform desktop application.
    *   **Backend (Rust):** A thin layer responsible for native OS integrations. It will handle file system access, real-time directory monitoring, system tray icon management, and native notifications. It will expose a set of `Tauri Commands` to be invoked by the frontend. The core data processing logic will *not* be re-implemented in Rust; instead, the Rust backend will call into the TypeScript library for data processing.
    *   **Frontend (TypeScript/React):** The entire user interface will be a single-page application running inside the Tauri webview. It will be responsible for all rendering, data visualization, and user interaction. I recommend using React with Vite for the frontend stack due to its popularity and rich ecosystem.
    *   **Core Logic (`ccusage` library):** The existing `ccusage` TypeScript library will be integrated into the frontend's context. The Rust backend will read the raw data from files and pass it to the frontend, which will then use the `ccusage` library functions (`loadDailyUsageData`, `loadMonthlyUsageData`, etc., adapted for in-memory processing) to aggregate and format the data for display. This avoids re-implementing complex aggregation logic and leverages the existing, tested codebase.

*   **Key Workflows:**
    1.  **Application Startup:**
        *   The Tauri app starts.
        *   The frontend UI mounts.
        *   The frontend invokes a Tauri command `get_initial_data` (loading the last 90 days by default).
        *   The Rust backend discovers Claude directories, reads the relevant files, and returns the raw usage entries as a JSON string to the frontend.
        *   The frontend parses the data and uses the `ccusage` library logic to generate reports (Daily, Monthly, etc.).
        *   The frontend populates the UI with the processed data.
        *   The Rust backend initializes the system tray icon and starts monitoring the data directories for changes.
    2.  **Real-time Update (Current Block):**
        *   The Rust file watcher detects a change in the Claude data directory.
        *   It emits a `data-changed` event to the frontend.
        *   The frontend, upon receiving the event, re-invokes a Tauri command `get_current_block_data`.
        *   The backend reads only the most recent data needed for the active block and returns it.
        *   The frontend updates the "Current Block" widget and the system tray icon text.
    3.  **User Changes Filter (e.g., Date Range):**
        *   User interacts with the date range picker.
        *   The frontend state is updated.
        *   The frontend re-processes its in-memory data based on the new filter. For performance on large datasets, it could re-invoke a Tauri command with the new date range to get a smaller, pre-filtered set of raw data. The latter is preferable.
        *   The UI re-renders with the filtered data.

*   **Challenges:**
    *   Efficiently passing potentially large datasets (full history) from Rust to the frontend can be a performance bottleneck. The specification should emphasize streaming or passing raw file content to be processed on the frontend side.
    *   Reusing the `ccusage` library, which is designed for a Node.js CLI environment, might require some adaptation to run in a browser/webview context (e.g., file system access will be handled by Rust). The plan is to have Rust handle all `fs` operations and pass raw data strings/arrays to the TS logic.

### 2. Project Structure and Organization

*   **Structure:** A standard Tauri project structure will be used.
    *   `/`: Root directory with `package.json`, `vite.config.ts`, etc.
    *   `/src`: Frontend TypeScript/React code.
        *   `/src/components`: Reusable UI components (e.g., `Card`, `BarChart`, `DataTable`).
        *   `/src/views`: Top-level views/pages (e.g., `Dashboard`, `DailyReport`, `Settings`).
        *   `/src/hooks`: Custom React hooks (e.g., `useUsageData`, `useSettings`).
        *   `/src/lib`: Core logic adapted from the `ccusage` library and other utilities.
        *   `/src/store`: State management logic (e.g., using Zustand).
        *   `/src/styles`: Global CSS and theme definitions.
        *   `/src/main.tsx`: Frontend entry point.
    *   `/src-tauri`: Rust backend code.
        *   `/src-tauri/src/main.rs`: Main application entry point, Tauri builder configuration.
        *   `/src-tauri/src/commands.rs`: Definitions of all Tauri commands exposed to the frontend.
        *   `/src-tauri/src/core.rs`: Logic for discovering paths, reading files, and interacting with the `ccusage` logic if necessary.
        *   `/src-tauri/src/settings.rs`: Logic for managing user settings persistence.
        *   `/src-tauri/src/tray.rs`: System tray icon management.

*   **Organization:** Logic will be clearly separated. The Rust side will be a minimal native bridge, while the frontend will contain the application's business logic and the UI.

### 3. Detailed Feature Specifications

*   I will break down each feature from the request into a user story, implementation steps, and error handling. For example, for "Data Handling", I'll specify the exact function signatures for the Tauri commands and the data structures they will pass.
*   For UI features, I'll describe the component interactions and the data they need to display.
*   For Desktop Integration, I'll specify which Tauri APIs/plugins to use (`tauri-plugin-store`, `tauri-plugin-notification`, `SystemTray`).

### 4. Database Schema Design

*   A full database is overkill. I will specify the use of `tauri-plugin-store` for key-value persistence.
*   The schema will be a simple JSON object. I will define the exact keys and their types (e.g., `theme: 'dark' | 'light'`, `customDataDirs: string[]`, `notificationLimit: number`, `loadFullHistoryDefault: boolean`).

### 5. Server Actions and Integrations

*   The "Server" is the Tauri Rust backend. I will list all the Tauri commands that need to be created, defining their exact function signatures (arguments and return types) in Rust.
*   I'll detail the file handling logic, emphasizing that Rust reads files and returns raw string content, and the frontend parses the JSONL. This leverages the performant file I/O of Rust and the existing JSON parsing in the TS library.
*   I will specify the logic for skipping corrupted files: the Rust file reader should wrap JSONL line parsing in a `Result` and simply `continue` on error, potentially incrementing a counter to report back to the frontend.

### 6. Design System and Component Architecture

*   **Design System:** I'll propose a concrete design system based on the "Vercel/Supabase" inspiration. This includes:
    *   A color palette for both dark and light themes (e.g., Background, Foreground, Card, Primary, Accent).
    *   Typography specifications.
    *   A recommendation for a component library like **Shadcn/UI** for React, as it aligns perfectly with the requested aesthetic and is highly customizable.
*   **Component Architecture:** I will define the key components and their props.
    *   `DashboardView`: The main layout.
    *   `StatCard`: For summary widgets like "Current Block".
    *   `UsageChart`: A generic chart component wrapping a library like **Recharts**, configured for bar, pie, and sparkline charts.
    *   `UsageDataTable`: A table component with built-in sorting and filtering. I'll recommend using a library like **TanStack Table**.

### 7. Authentication and Authorization Implementation

*   This is not required for a local desktop application. The specification will state this clearly.

### 8. Data Flow and State Management

*   **State Management:** I will recommend **Zustand** for its simplicity and minimal boilerplate.
*   **Data Flow Diagram:**
    1.  UI Event (e.g., app load, filter change) -> State Store Action.
    2.  State Store Action -> Invoke Tauri command with parameters.
    3.  Tauri Command (Rust) -> Read files / perform native action.
    4.  Tauri Command -> Return raw data/result to frontend.
    5.  State Store Action -> Process raw data using `ccusage` lib -> Update state.
    6.  React components re-render based on new state.
*   **Real-time Flow:**
    1.  File Watcher (Rust) -> `data-changed` event.
    2.  Event Listener (Frontend) -> State Store Action.
    3.  Flow continues from step 2 above, re-fetching only the necessary data.

### 9. Payment Implementation

*   Not required. The specification will state this.

### 10. Analytics Implementation

*   Not required. The specification will state this.

### 11. Testing Strategy

*   **Rust (Backend):**
    *   Unit tests for `commands.rs` functions. Mock file system interactions to test path discovery and file reading logic.
    *   Test settings persistence logic.
*   **TypeScript (Frontend):**
    *   Use **Vitest** for unit and component testing.
    *   Mock the `@tauri-apps/api/tauri` `invoke` and `listen` functions to test components in isolation from the Rust backend.
    *   Test data processing functions from the adapted `ccusage` library with mock data.
    *   Test React components using **React Testing Library**.
*   **End-to-End (e2e):**
    *   Use Tauri's built-in e2e testing capabilities (based on Playwright/WebDriver).
    *   Define key test scenarios:
        1.  App loads and displays default 90-day data.
        2.  User changes date range, and charts/tables update correctly.
        3.  User changes a setting (e.g., theme), and it persists after restart.
        4.  App correctly displays the welcome/empty state when no data is found.

This detailed planning ensures all requirements are mapped to concrete technical decisions, potential issues are identified, and the final specification is robust and comprehensive.
</specification_planning>

# ClaudeDeck Technical Specification

## 1. System Overview

### Core Purpose and Value Proposition

`ClaudeDeck` is a cross-platform desktop GUI application that provides a rich, visual, and interactive interface for analyzing Claude Code token usage and costs. It serves as a persistent graphical dashboard, offering a user-friendly alternative to the `ccusage` CLI for developers who wish to monitor their token consumption and associated costs in real-time.

### Key Workflows

1.  **Initial Data Load & Display:** On startup, the application automatically locates the user's Claude Code data directories, loads the last 90 days of usage data, processes it using the core `ccusage` logic, and displays an overview dashboard with summary widgets and charts.
2.  **Real-time Monitoring:** The application runs in the background, monitoring the Claude data directories for file changes. When a change is detected, it updates the "Current Block" usage and the system tray icon in real-time without requiring a full application reload.
3.  **Data Filtering & Exploration:** The user can interact with a date-range selector to filter the entire dataset. They can also switch between different report views (Daily, Monthly, Session, Blocks) and interact with tables (sorting, filtering) to explore their usage patterns.
4.  **Configuration & Export:** The user can access a settings screen to configure custom data directories, set notification thresholds, and change the theme. Data from any table can be exported to CSV or JSON format.

### System Architecture

The application is built on the **Tauri** framework, creating a clear separation between the native backend and the web-based frontend.

*   **Backend (Rust):** A minimal Rust application that serves as the bridge to the operating system.
    *   **Responsibilities:**
        *   File system access (discovering paths, reading usage files).
        *   Real-time file system monitoring using `notify`.
        *   System Tray icon creation and updates.
        *   Sending native OS notifications.
        *   Managing a local key-value store for user settings via `tauri-plugin-store`.
    *   **Interface:** Exposes a set of asynchronous `Tauri Commands` that can be invoked by the frontend.

*   **Frontend (TypeScript & React):** A modern single-page application rendered within the Tauri webview.
    *   **Responsibilities:**
        *   All UI rendering and data visualization.
        *   State management (using Zustand).
        *   Invoking Rust backend commands to fetch data and trigger native actions.
        *   Processing raw usage data using the adapted `ccusage` library logic.
        *   Handling all user interactions (filtering, sorting, navigation).
    *   **Frameworks/Libraries:**
        *   **React** with **Vite**
        *   **Shadcn/UI** for the component library (based on Radix UI and Tailwind CSS).
        *   **Recharts** for data visualizations (pie, bar, sparkline charts).
        *   **TanStack Table** for interactive data tables.
        *   **Zustand** for global state management.

*   **Core Logic (`ccusage` library):**
    *   The core data processing and aggregation logic from the existing `ccusage` TypeScript library (`data-loader.ts`, `calculate-cost.ts`, `_session-blocks.ts`) will be adapted and included directly in the frontend's codebase (`/src/lib/ccusage-core`).
    *   Functions like `loadDailyUsageData` will be refactored to accept an array of raw usage entries (a string from the read files) as input instead of handling file system I/O directly.



## 2. Project Structure

```
/
├── .github/
├── .vscode/
├── dist/
├── node_modules/
├── public/                     # Static assets (icons, etc.)
├── src/                        # Frontend source code
│   ├── components/
│   │   ├── layout/             # Main layout components (Sidebar, Header)
│   │   ├── ui/                 # Shadcn/UI components
│   │   └── widgets/            # Dashboard widgets (StatCard, UsageChart)
│   ├── hooks/                  # Custom React hooks (e.g., useSettings)
│   ├── lib/
│   │   ├── ccusage-core/       # Adapted core logic from ccusage library
│   │   └── utils.ts            # Frontend-specific utility functions
│   ├── store/                  # Zustand state management stores
│   │   ├── settingsStore.ts
│   │   └── usageDataStore.ts
│   ├── styles/                 # Global styles and Tailwind CSS config
│   │   └── globals.css
│   ├── views/                  # Top-level view components
│   │   ├── DashboardView.tsx
│   │   ├── DailyView.tsx
│   │   ├── MonthlyView.tsx
│   │   ├── SessionView.tsx
│   │   ├── BlocksView.tsx
│   │   └── SettingsView.tsx
│   ├── App.tsx                 # Main application component with routing
│   └── main.tsx                # Frontend entry point
├── src-tauri/                  # Rust backend source code
│   ├── build.rs
│   ├── icons/
│   ├── src/
│   │   ├── commands.rs         # Tauri command definitions
│   │   ├── core.rs             # Core backend logic (file I/O)
│   │   ├── error.rs            # Custom error types
│   │   ├── settings.rs         # Settings management
│   │   ├── tray.rs             # System tray logic
│   │   └── main.rs             # Rust entry point and Tauri builder
│   ├── tauri.conf.json
│   └── Cargo.toml
├── package.json
└── tsconfig.json
```

## 3. Feature Specification

### 3.1 Data Handling & Core Logic

*   **User Story:** As a user, I want the application to automatically find and process my Claude usage data, handle file errors gracefully, and give me control over how much historical data is loaded.
*   **Implementation Steps:**
    1.  **Data Discovery (Rust):**
        *   Create a `core::get_claude_paths()` function in Rust that replicates the logic from `ccusage/data-loader.ts`, checking `CLAUDE_CONFIG_DIR`, `~/.config/claude`, and `~/.claude`.
    2.  **Data Loading (Rust -> TS):**
        *   Create a Tauri command `commands::load_usage_entries(since_date: Option<String>) -> Result<Vec<String>, String>`.
        *   This command will:
            *   Discover all `*.jsonl` files within the found data directories.
            *   If `since_date` is provided, it will filter files based on their last modification date to optimize the initial read.
            *   Read the content of each valid file into a string.
            *   Return a `Vec<String>`, where each string is the full content of one `.jsonl` file.
    3.  **Data Processing (TS):**
        *   Refactor the `ccusage` library's `load...Data` functions to accept `raw_files: string[]` as input.
        *   These functions will parse the JSONL strings, handle malformed lines by skipping them and counting them, and perform the aggregation as they currently do. A `skipped_files_count` will be returned along with the processed data.
    4.  **Initial Load Flow:**
        *   On frontend mount, the `usageDataStore` will call `invoke('load_usage_entries', { sinceDate: '...'})` to get data for the last 90 days.
        *   The returned `string[]` is passed to the refactored processing functions.
        *   The store is populated with all report types (daily, monthly, etc.).
    5.  **Full History Load:**
        *   A "Load Full History" button in the UI will call `invoke('load_usage_entries', { sinceDate: null })`.
        *   The frontend will show a loading indicator, process the full dataset, and update the store.
*   **Error Handling:**
    *   If no data directories are found, the `load_usage_entries` command will return an error. The frontend will display a "Welcome/Empty State" screen with instructions on how to get started with Claude Code.
    *   During file reading, Rust will wrap I/O operations in a `Result`. If a file cannot be read, it will be skipped, and its path can be logged for debugging.
    *   The TypeScript JSONL parser will wrap `JSON.parse` in a try-catch block to skip malformed lines without crashing. A count of skipped entries will be maintained and displayed subtly in the UI (e.g., in a footer status bar).

### 3.2 UI & Visualization

*   **User Story:** As a user, I want a clean, data-focused dashboard that gives me an at-a-glance summary of my usage, with options to dive deeper into specific reports with interactive charts and tables.
*   **Implementation Steps:**
    1.  **Dashboard (`DashboardView.tsx`):**
        *   A grid-based layout (using CSS Grid).
        *   **"Current Block" Widget:** Displays data for the currently active 5-hour block. It will show cost and token count. It will be updated by the real-time flow.
        *   **"Last 7 Days" Widget:** A `recharts` Sparkline chart showing daily costs for the last 7 days.
        *   **"Top Models" Widget:** A `recharts` Pie chart showing token usage proportion by model over the current data period.
    2.  **Report Views (`DailyView.tsx`, etc.):**
        *   Each view will have a dedicated tab in the main navigation.
        *   Will contain a combination of `recharts` bar charts and a `UsageDataTable` component.
        *   **`UsageDataTable` Component:**
            *   Built using `TanStack Table`.
            *   Props: `data: T[]`, `columns: ColumnDef<T>[]`.
            *   Will implement client-side sorting and a text input for filtering.
    3.  **Date Range Selector:**
        *   Use the `Date Range Picker` from Shadcn/UI.
        *   When the date changes, it will update a global filter state in Zustand.
        *   The frontend will re-filter its in-memory data based on this state.
    4.  **Export Functionality:**
        *   Each `UsageDataTable` will have an "Export" button.
        *   On click, a dropdown shows "CSV" and "JSON".
        *   The frontend prepares the data in the chosen format and invokes a Tauri command `commands::export_data(format: &str, content: &str, default_filename: &str)`.
        *   This Rust command will open a native "Save File" dialog and write the content to the selected location.

*   **Edge Cases:**
    *   **No Data for Chart:** Charts will display an "No data available" message if the filtered data is empty.
    *   **Large Datasets:** The `UsageDataTable` should use virtualization (e.g., `TanStack Virtual`) if performance becomes an issue with full history loads.

### 3.3 Settings

*   **User Story:** As a user, I want to configure the application's data sources, set up usage notifications, and persist my preferences.
*   **Implementation Steps:**
    1.  **Settings Store (`tauri-plugin-store`):**
        *   Initialize the store on the Rust side in `main.rs`.
        *   The store will be saved to `app-data-dir/settings.json`.
    2.  **Settings Schema:** Define a `Settings` struct in Rust and a corresponding TypeScript type.
        ```typescript
        interface AppSettings {
          theme: 'dark' | 'light' | 'system';
          customDataDirs: string[];
          notificationLimitTokens: number | null; // null means disabled
          loadFullHistoryDefault: boolean;
        }
        ```
    3.  **Tauri Commands:**
        *   `commands::get_settings() -> AppSettings`
        *   `commands::save_settings(settings: AppSettings) -> Result<(), String>`
    4.  **Settings Screen (`SettingsView.tsx`):**
        *   A form built with Shadcn/UI components.
        *   It fetches initial settings from the `get_settings` command.
        *   On save, it calls `save_settings`.
        *   The "Manage Custom Directories" part will allow users to add/remove folder paths. Adding a path will open a native folder selection dialog.
*   **Error Handling:**
    *   The form will have validation (e.g., notification limit must be a positive number).
    *   Errors from saving settings (e.g., disk full) will be caught and displayed as a toast notification.

### 3.4 Desktop Integration

*   **User Story:** As a user, I want the app to integrate seamlessly with my desktop, running in the background, showing real-time usage in my system tray, and sending me native notifications.
*   **Implementation Steps:**
    1.  **Background Monitoring (Rust):**
        *   In `main.rs`, on app setup, spawn a new thread for file system watching.
        *   Use the `notify` crate to watch all discovered Claude data directories recursively.
        *   When a `Modify` or `Create` event is detected, debounce it (e.g., 500ms) and then emit a `data-changed` event to the frontend using `window.emit("data-changed", ...)`.
    2.  **System Tray (Rust):**
        *   Use `tauri::SystemTray`.
        *   The title of the tray icon will be updated with the cost of the current block.
        *   Create a Tauri command `commands::update_tray_title(title: String)`.
        *   The frontend will call this command whenever the "Current Block" data changes.
        *   The tray menu will have "Open" and "Quit" items. Clicking the icon will show/focus the main window.
    3.  **Native Notifications (Rust -> TS):**
        *   The frontend will be responsible for the notification logic.
        *   When the "Current Block" data is updated, the frontend will check if the token count exceeds the `notificationLimitTokens` from settings.
        *   If it does, it will call the `sendNotification` function from `@tauri-apps/api/notification`.
    4.  **Packaging & Auto-Update:**
        *   Configure `tauri.conf.json` to build `.dmg`, `.msi`, and `.deb` installers.
        *   Enable the built-in Tauri updater in `tauri.conf.json`. The `"pubkey"` will need to be generated and stored securely.

## 4. Database Schema

A formal database is not required. User settings will be persisted in a JSON file managed by the `tauri-plugin-store`.

### 4.1 Settings Store (`settings.json`)

*   **Location:** Application Data Directory
*   **Format:** JSON
*   **Schema:**
    ```json
    {
      "theme": { "type": "string", "enum": ["dark", "light", "system"], "default": "dark" },
      "customDataDirs": { "type": "array", "items": { "type": "string" }, "default": [] },
      "notificationLimitTokens": { "type": ["number", "null"], "default": null },
      "loadFullHistoryDefault": { "type": "boolean", "default": false },
      "dataLoadDays": { "type": "number", "default": 90 }
    }
    ```

## 5. Server Actions

These are Tauri commands implemented in Rust (`src-tauri/src/commands.rs`).

### 5.1 File & Data Actions

| Command Signature (Rust)                                                               | Description                                                                                      | Input Parameters                                                                                       | Return Value                                         |
| :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| `load_usage_entries(since_date: Option<String>) -> Result<Vec<String>, String>`        | Discovers Claude data directories and reads all `*.jsonl` files, returning their raw content.    | `since_date`: Optional `YYYY-MM-DD` string. If provided, only files modified after this date are read. | `Ok(Vec<String>)` with file contents, or `Err(msg)`. |
| `export_data(format: String, content: String, default_filename: String) -> Result<()>` | Opens a native "Save File" dialog and writes the provided content to the user-selected location. | `format`, `content`, `default_filename`.                                                               | `Ok(())` on success, `Err(msg)` on failure/cancel.   |
| `open_directory_dialog() -> Result<Option<String>, String>`                            | Opens a native dialog for the user to select a directory.                                        | None.                                                                                                  | `Ok(Some(path))` or `Ok(None)` if canceled.          |
| `update_tray_title(app: AppHandle, title: String) -> Result<()>`                       | Updates the text of the system tray icon.                                                        | `title`: The new text to display (e.g., "$0.12").                                                      | `Ok(())`.                                            |

### 5.2 Settings Actions

| Command Signature (Rust)                                | Description                                 | Input Parameters                        | Return Value                       |
| :------------------------------------------------------ | :------------------------------------------ | :-------------------------------------- | :--------------------------------- |
| `get_settings(store: State<Store<Wry>>) -> AppSettings` | Retrieves the current application settings. | None (via Tauri state management).      | `AppSettings` struct.              |
| `save_settings(settings: AppSettings) -> Result<()>`    | Saves the provided settings object.         | `settings`: The complete `AppSettings`. | `Ok(())` or `Err(msg)` on failure. |

## 6. Design System

### 6.1 Visual Style

*   **Inspiration:** Vercel Analytics, Supabase Dashboard. Clean, spacious, modern, and data-focused.
*   **Theme:** Dark theme by default, with an optional light theme. A "System" option will also be available.
*   **Color Palette (Dark Theme Example):**
    *   `background`: `#020817` (Slate 950)
    *   `foreground`: `#e2e8f0` (Slate 200)
    *   `card`: `#0f172a` (Slate 900)
    *   `card-foreground`: `#e2e8f0` (Slate 200)
    *   `primary`: `#3b82f6` (Blue 500)
    *   `primary-foreground`: `#f8fafc` (Slate 50)
    *   `accent`: `#10b981` (Emerald 500)
*   **Typography:**
    *   **Font:** Inter (sans-serif).
    *   **Headings:** `font-semibold`
    *   **Body:** `font-normal`
*   **Component Library:** **Shadcn/UI** will be used to provide the base components and styling.

### 6.2 Core Components

*   **`AppLayout`:** Main layout component containing a sidebar for navigation and a main content area.
*   **`Sidebar`:** Contains navigation links to Dashboard, Daily, Monthly, Session, Blocks, and Settings views.
*   **`StatCard`:** A card component for displaying a key metric.
    *   Props: `title: string`, `value: string`, `change?: string`, `changeType?: 'up' | 'down'`, `children?: ReactNode` (for a sparkline).
*   **`UsageChart`:** A wrapper around `recharts`.
    *   Props: `type: 'bar' | 'pie' | 'sparkline'`, `data: any[]`, `dataKey: string`, `categoryKey: string`.
*   **`UsageDataTable`:** A wrapper around `TanStack Table`.
    *   Props: `data: any[]`, `columns: ColumnDef<any>[]`.
    *   Includes a text input for global filtering and headers are clickable for sorting.

## 7. Component Architecture

(This section is not applicable in the same way as a web app, as there's no server/client distinction in the traditional sense. It will be interpreted as Frontend component design.)

### 7.1 View Components (`/src/views`)

*   These are the top-level components for each page.
*   **Responsibility:** Fetching data from the Zustand store and passing it down to presentation components.
*   **Example (`DashboardView.tsx`):**
    ```typescript
    const DashboardView = () => {
      const summaryData = useUsageDataStore(state => state.summary);
      const dailyData = useUsageDataStore(state => state.daily);

      return (
        <div className="grid ...">
          <StatCard title="Current Block Cost" value={...} />
          <UsageChart type="sparkline" data={dailyData.slice(-7)} ... />
          {/* ... more widgets */}
        </div>
      );
    }
    ```

### 7.2 Widget & UI Components (`/src/components`)

*   These are pure presentation components.
*   **Responsibility:** Rendering UI based on the props they receive. They do not contain business logic or fetch data.
*   **Example (`StatCard.tsx`):**
    ```typescript
    interface StatCardProps {
      title: string;
      value: string;
      // ... other props
    }

    const StatCard = ({ title, value }: StatCardProps) => {
      return (
        <Card>
          <CardHeader>{title}</CardHeader>
          <CardContent>{value}</CardContent>
        </Card>
      );
    }
    ```

## 8. Authentication & Authorization

This is a local desktop application that reads local files. Authentication and authorization are not required.

## 9. Data Flow

*   **State Management:** **Zustand** will be used for managing global frontend state. Two main stores will be created:
    1.  `useUsageDataStore`: Holds all the processed usage reports (daily, monthly, etc.), the raw entries, and loading/error states.
    2.  `useSettingsStore`: Holds the application settings, providing a reactive interface to the data persisted by `tauri-plugin-store`.
*   **Data Flow on Initial Load:**
    1.  `App.tsx` triggers an action in `useUsageDataStore`: `fetchInitialData()`.
    2.  `fetchInitialData` sets `loading: true`, then calls `invoke('load_usage_entries', { sinceDate: ... })`.
    3.  The Rust command returns `string[]`.
    4.  The action then calls the `ccusage-core` processing functions with the raw data.
    5.  The store is updated with the processed reports (e.g., `set({ daily: ..., monthly: ..., loading: false })`).
    6.  React components subscribed to the store re-render with the new data.
*   **Data Flow on Real-time Update:**
    1.  Rust backend file watcher emits a `data-changed` event.
    2.  A `useEffect` in `App.tsx` listens for this event using `listen('data-changed', ...)`.
    3.  On event, it calls an action in `useUsageDataStore`: `updateCurrentBlock()`.
    4.  This action invokes a specific, lightweight Tauri command to get only the current block's data.
    5.  The `currentBlock` slice of the state is updated, causing only the relevant components (Current Block widget, tray title) to re-render.

## 10. Stripe Integration

Not applicable for this project.

## 11. PostHog Analytics

Not applicable for this project.

## 12. Testing

*   **Unit Tests (Vitest):**
    *   **Rust:**
        *   Test path discovery logic in `core.rs` with mock environment variables and file systems.
        *   Test settings serialization/deserialization in `settings.rs`.
    *   **TypeScript:**
        *   Test `ccusage-core` data processing functions with various sets of mock usage data.
        *   Test Zustand store actions, ensuring state is updated correctly.
        *   Test UI components in isolation using React Testing Library, mocking any props and hooks. The `invoke` and `listen` functions from the Tauri API will be mocked.
*   **E2E Tests (Tauri/Playwright):**
    *   A suite of e2e tests will be created under `/src-tauri/tests/`.
    *   **Key Scenarios:**
        1.  **First Launch (Empty State):** Launch the app with no pre-existing Claude data and verify the empty/welcome state is shown.
        2.  **Data Load & Display:** Launch the app with a fixture of mock data. Verify the dashboard widgets and tables are populated correctly.
        3.  **Filtering:** Interact with the date-range picker and verify that the charts and tables update to reflect the new range.
        4.  **Settings Persistence:** Change the theme in the settings, restart the application, and verify the new theme is applied on launch.
        5.  **Export:** Click the export button, choose CSV, and verify a file is created (the test can check for the dialog's appearance).