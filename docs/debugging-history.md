# ClaudeDeck Debugging History

This document contains historical debugging information from the development of ClaudeDeck.

## React Error #185 (Infinite Loop) Fix

### Problem
The application was experiencing infinite render loops due to improper Zustand store usage.

### Root Cause
Using inline object selectors in Zustand creates new objects on every render, causing React to re-render infinitely.

### Solution
Fixed by using separate selectors instead of destructuring:

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

### Additional Fixes
1. Fixed Rust compilation error with `window.open_devtools()` (returns void, not Result)
2. Added DebugConsole component for capturing console logs in UI
3. Added ErrorBoundary component to catch React errors
4. Enabled React.StrictMode (causes double rendering in development)

## Key Lessons Learned

1. **Zustand Best Practices**: Always use separate selectors to avoid creating new objects
2. **React StrictMode**: Double rendering in development is normal and helps detect side effects
3. **Tauri v2 API Changes**: Check return types carefully when upgrading
4. **Debug Tools**: Having in-app debug console helps when DevTools aren't available