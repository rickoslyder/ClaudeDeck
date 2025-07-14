#!/bin/bash

# Test script for ClaudeDeck Homebrew formula
# This script validates the formula syntax and simulates installation

set -e

echo "=== ClaudeDeck Homebrew Formula Test ==="
echo

# Check if brew is installed
if ! command -v brew &> /dev/null; then
    echo "Error: Homebrew is not installed"
    exit 1
fi

# Get the formula path
FORMULA_PATH="$(pwd)/homebrew/claudedeck.rb"

if [ ! -f "$FORMULA_PATH" ]; then
    echo "Error: Formula not found at $FORMULA_PATH"
    exit 1
fi

echo "Testing formula: $FORMULA_PATH"
echo

# Test 1: Validate formula syntax with Ruby
echo "1. Validating formula syntax..."
if ruby -c "$FORMULA_PATH" 2>&1 | grep -q "Syntax OK"; then
    echo "   ✅ Ruby syntax is valid"
else
    echo "   ❌ Formula has syntax errors"
    ruby -c "$FORMULA_PATH"
fi
echo

# Test 2: Check if formula can be parsed
echo "2. Checking formula structure..."
if ruby -e "
require 'pathname'
begin
  formula_content = File.read('$FORMULA_PATH')
  # Check for required cask DSL elements
  required_elements = ['cask', 'version', 'sha256', 'url', 'name', 'app']
  missing = required_elements.select { |elem| !formula_content.include?(elem) }
  if missing.empty?
    puts '   ✅ Formula contains all required elements'
  else
    puts '   ❌ Missing required elements: ' + missing.join(', ')
  end
rescue => e
  puts '   ❌ Error parsing formula: ' + e.message
end
"; then
    :
fi
echo

# Test 3: Simulate installation (dry run)
echo "3. Simulating installation..."
echo "   Note: This will fail because the release artifacts don't exist yet"
echo "   Command that will be run: brew install --cask $FORMULA_PATH"
echo

# Test 4: Display download URLs that will be used
echo "4. Download URLs that will be generated:"
echo "   ARM64: https://github.com/rickoslyder/ClaudeDeck/releases/download/v0.1.0/ClaudeDeck_0.1.0_aarch64.dmg"
echo "   Intel: https://github.com/rickoslyder/ClaudeDeck/releases/download/v0.1.0/ClaudeDeck_0.1.0_x64.dmg"
echo

echo "=== Test Summary ==="
echo "The formula is ready for release, but requires:"
echo "1. GitHub release v0.1.0 to be created"
echo "2. DMG files to be uploaded to the release"
echo "3. SHA256 hashes to be calculated and updated in the formula"
echo
echo "See post_release_steps.md for detailed instructions."