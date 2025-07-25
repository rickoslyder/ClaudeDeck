cask "claudedeck" do
  version "0.1.0"
  sha256 arm:   "PLACEHOLDER_SHA256_ARM64",
         intel: "PLACEHOLDER_SHA256_X64"

  url "https://github.com/rickoslyder/ClaudeDeck/releases/download/v#{version}/ClaudeDeck_#{version}_#{arch}.dmg"
  name "ClaudeDeck"
  desc "Desktop app for tracking Claude API usage and costs"
  homepage "https://github.com/rickoslyder/ClaudeDeck"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true
  depends_on macos: ">= :monterey"

  app "ClaudeDeck.app"

  uninstall quit: "com.claudedeck.claudedeck"

  zap trash: [
    "~/Library/Application Support/com.claudedeck.claudedeck",
    "~/Library/Caches/com.claudedeck.claudedeck",
    "~/Library/Preferences/com.claudedeck.claudedeck.plist",
    "~/Library/Saved Application State/com.claudedeck.claudedeck.savedState",
  ]
end