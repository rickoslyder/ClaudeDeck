# Tailwind CSS v4 Setup Guide

This project uses Tailwind CSS v4, which has significant differences from v3.

## Key Differences from v3

1. **CSS Import**: Use `@import "tailwindcss";` instead of the v3 directives
2. **PostCSS Config**: Uses `@tailwindcss/postcss` plugin
3. **No JS Config**: Tailwind v4 doesn't use `tailwind.config.js` - all configuration is in CSS
4. **Theme Extension**: Custom colors and utilities are defined directly in CSS

## Custom Theme Colors

Theme colors using CSS variables (e.g., `--background`, `--foreground`) require manual utility class definitions:

```css
@layer utilities {
  .bg-background { background-color: hsl(var(--background)); }
  .text-foreground { color: hsl(var(--foreground)); }
  .bg-primary { background-color: hsl(var(--primary)); }
  .text-primary-foreground { color: hsl(var(--primary-foreground)); }
  /* ... other color utilities ... */
}
```

## PostCSS Configuration

The project uses a simple PostCSS config:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

## Important Notes

- All Tailwind configuration is now done through CSS, not JavaScript
- Custom utilities must be defined in `@layer utilities` blocks
- Theme colors use HSL values with CSS variables for dark mode support