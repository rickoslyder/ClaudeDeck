# Post-Release Steps for Homebrew Formula

After creating the v0.1.0 release on GitHub and the DMG artifacts are built by the CI/CD pipeline, follow these steps to finalize the Homebrew formula:

## 1. Calculate SHA256 Hashes

Once the release artifacts are available, download both DMG files and calculate their SHA256 hashes:

```bash
# Download the DMG files
curl -L -o ClaudeDeck_0.1.0_aarch64.dmg \
  https://github.com/rickoslyder/ClaudeDeck/releases/download/v0.1.0/ClaudeDeck_0.1.0_aarch64.dmg

curl -L -o ClaudeDeck_0.1.0_x64.dmg \
  https://github.com/rickoslyder/ClaudeDeck/releases/download/v0.1.0/ClaudeDeck_0.1.0_x64.dmg

# Calculate SHA256 hashes
shasum -a 256 ClaudeDeck_0.1.0_aarch64.dmg
shasum -a 256 ClaudeDeck_0.1.0_x64.dmg
```

## 2. Update the Formula

Replace the placeholder SHA256 values in `homebrew/claudedeck.rb`:

```ruby
sha256 arm:   "ACTUAL_SHA256_FOR_AARCH64_DMG",
       intel: "ACTUAL_SHA256_FOR_X64_DMG"
```

## 3. Test the Updated Formula

Run the test script again to ensure everything is correct:

```bash
./homebrew/test_formula.sh
```

## 4. Test Installation Locally

Test the actual installation:

```bash
# Install from local formula
brew install --cask ./homebrew/claudedeck.rb

# Verify installation
ls -la /Applications/ClaudeDeck.app

# Test launching the app
open /Applications/ClaudeDeck.app

# Uninstall for cleanup
brew uninstall --cask claudedeck
```

## 5. Submit to Homebrew

Once tested, you can either:

### Option A: Personal Tap (Recommended for initial release)
1. Create a repository named `homebrew-tap` under your GitHub account
2. Add the formula to that repository
3. Users can install with:
   ```bash
   brew tap rickoslyder/tap
   brew install --cask claudedeck
   ```

### Option B: Submit to Homebrew Cask (For wider distribution)
1. Fork the [homebrew-cask](https://github.com/Homebrew/homebrew-cask) repository
2. Add your formula to `Casks/c/claudedeck.rb`
3. Submit a pull request following their [contribution guidelines](https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md)

## Important Notes

- The formula expects DMG files named exactly: `ClaudeDeck_0.1.0_aarch64.dmg` and `ClaudeDeck_0.1.0_x64.dmg`
- The app bundle inside the DMG must be named `ClaudeDeck.app`
- The bundle identifier must be `com.claudedeck.claudedeck` (as configured in tauri.conf.json)
- Ensure the release tag is `v0.1.0` (with the 'v' prefix)

## Troubleshooting

If the formula fails to install:

1. Check that the download URLs are accessible
2. Verify the SHA256 hashes match exactly
3. Ensure the DMG contains `ClaudeDeck.app` at the root level
4. Check Homebrew logs: `brew --verbose install --cask ./homebrew/claudedeck.rb`

## Future Releases

For future releases:
1. Update the version number in the formula
2. Recalculate and update SHA256 hashes
3. Test locally before publishing
4. Consider using `brew bump-cask-pr` if the formula is in homebrew-cask