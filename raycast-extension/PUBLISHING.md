# Publishing ClaudeDeck to Raycast Store

This guide outlines the steps to publish the ClaudeDeck Raycast extension to the Raycast Store.

## Prerequisites

- Raycast account (sign up at https://raycast.com)
- Extension fully tested and working
- All required assets prepared

## Pre-submission Checklist

- [ ] Extension follows [Raycast guidelines](https://developers.raycast.com/basics/publish-an-extension)
- [ ] Commands have clear, descriptive names
- [ ] Icon is 512x512 PNG with transparent background
- [ ] README includes clear description and screenshots
- [ ] Package.json has all required fields filled out
- [ ] Extension tested on latest Raycast version
- [ ] No API keys or sensitive data in code

## Publishing Steps

### 1. Prepare Assets

- **Icon**: 512x512 PNG with transparent background (update current 64x64 icon)
- **Screenshots**: At least 2 screenshots showing main features
  - Open ClaudeDeck command
  - Usage Stats command with sample data

### 2. Update package.json

Ensure all metadata is complete:
```json
{
  "name": "claudedeck",
  "title": "ClaudeDeck",
  "description": "Monitor Claude AI token usage and costs",
  "icon": "icon.png",
  "author": "your-github-username",
  "categories": ["Developer Tools", "Productivity"],
  "license": "MIT",
  "commands": [
    {
      "name": "open-app",
      "title": "Open ClaudeDeck",
      "description": "Open the ClaudeDeck desktop application",
      "mode": "no-view"
    },
    {
      "name": "usage-stats",
      "title": "View Claude Usage Stats",
      "description": "View your Claude AI token usage statistics",
      "mode": "view"
    }
  ]
}
```

### 3. Test Locally

```bash
# Install dependencies
npm install

# Build and test
npm run build
npm run dev

# Test each command thoroughly
```

### 4. Create Raycast Store Submission

1. Fork the [raycast/extensions](https://github.com/raycast/extensions) repository
2. Create a new branch: `git checkout -b add-claudedeck-extension`
3. Add your extension:
   ```bash
   mkdir -p extensions/claudedeck
   cp -r /path/to/raycast-extension/* extensions/claudedeck/
   ```
4. Ensure no sensitive files are included (check .gitignore)

### 5. Submit Pull Request

1. Push your branch to GitHub
2. Create a pull request to `raycast/extensions`
3. Use this PR template:

```markdown
## Description

ClaudeDeck is a Raycast extension that provides quick access to Claude AI token usage statistics and the ClaudeDeck desktop application.

### Features
- Quick launch of ClaudeDeck desktop app
- View Claude usage statistics directly in Raycast
- Monitor token costs and usage patterns

### Screenshots
[Add screenshots here]

### Checklist
- [ ] I read and followed the [contribution guidelines](https://github.com/raycast/extensions/blob/main/CONTRIBUTING.md)
- [ ] I tested the extension locally
- [ ] I included all required assets
- [ ] The extension follows Raycast design guidelines
```

### 6. Review Process

- Raycast team will review your submission
- Address any feedback or requested changes
- Once approved, your extension will be published to the store

## Post-Publication

### Maintenance

- Monitor user feedback and issues
- Keep extension updated with ClaudeDeck desktop app changes
- Follow Raycast API updates

### Updates

To update the extension:
1. Make changes in your fork
2. Test thoroughly
3. Submit a new PR with changes
4. Include changelog in PR description

## Useful Resources

- [Raycast Developer Documentation](https://developers.raycast.com)
- [Extension Guidelines](https://developers.raycast.com/basics/publish-an-extension)
- [Raycast API Reference](https://developers.raycast.com/api-reference)
- [Extensions Repository](https://github.com/raycast/extensions)

## Support

For help with publishing:
- Raycast Slack community: https://raycast.com/community
- GitHub discussions: https://github.com/raycast/extensions/discussions