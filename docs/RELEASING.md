# Release Process

This document outlines the process for releasing new versions of ClaudeDeck.

## Version Numbering

ClaudeDeck follows [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality additions
- PATCH version for backwards-compatible bug fixes

## Release Steps

### 1. Prepare the Release

1. Update version numbers:
   ```bash
   # Update version in Cargo.toml
   # Update version in package.json
   # Update version in src-tauri/tauri.conf.json
   ```

2. Update CHANGELOG.md with release notes

3. Run tests and ensure everything passes:
   ```bash
   npm test
   cd src-tauri && cargo test
   ```

4. Build and test the release locally:
   ```bash
   npm run tauri build
   ```

### 2. Create GitHub Release

1. Commit all changes:
   ```bash
   git add .
   git commit -m "chore: bump version to v0.1.0"
   ```

2. Create and push a tag:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin main --tags
   ```

3. GitHub Actions will automatically:
   - Build binaries for all platforms
   - Create a draft release with artifacts
   - Generate release notes

4. Edit the draft release on GitHub:
   - Add detailed release notes
   - Mark as pre-release if applicable
   - Publish the release

### 3. Update Homebrew Formula

After the GitHub release is published:

1. Calculate SHA256 for the macOS releases:
   ```bash
   # For Apple Silicon
   shasum -a 256 ClaudeDeck_0.1.0_aarch64.dmg
   
   # For Intel
   shasum -a 256 ClaudeDeck_0.1.0_x64.dmg
   ```

2. Update the Homebrew formula:
   - Update version number
   - Update download URLs
   - Update SHA256 checksums

3. Test the formula locally:
   ```bash
   brew install --build-from-source ./homebrew/claudedeck.rb
   brew test claudedeck
   brew audit --strict claudedeck
   ```

4. Submit PR to homebrew-cask repository

### 4. Update Other Package Managers

#### Raycast Extension
1. Update version in raycast-extension/package.json
2. Test the extension
3. Submit to Raycast store

#### Other Platforms
- Windows: Consider Chocolatey or Scoop
- Linux: Consider Snap, Flatpak, or AppImage

## Automated Release (GitHub Actions)

The `.github/workflows/release.yml` workflow automates:
1. Building binaries for all platforms
2. Creating GitHub releases
3. Uploading artifacts
4. Generating checksums

Triggered by pushing tags matching `v*.*.*`

## Platform-Specific Notes

### macOS
- Ensure code signing is configured
- Test on both Apple Silicon and Intel
- Verify Gatekeeper compatibility

### Windows
- Test installer on Windows 10 and 11
- Ensure Windows Defender doesn't flag the app

### Linux
- Test on major distributions
- Verify desktop integration works