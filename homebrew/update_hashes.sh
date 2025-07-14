#!/bin/bash

# Script to update SHA256 hashes in the Homebrew formula after release

set -e

VERSION="0.1.0"
FORMULA_PATH="./homebrew/claudedeck.rb"

echo "=== ClaudeDeck Homebrew Formula Hash Updater ==="
echo "Version: $VERSION"
echo

# Function to download and calculate SHA256
calculate_sha256() {
    local arch=$1
    local filename="ClaudeDeck_${VERSION}_${arch}.dmg"
    local url="https://github.com/rickoslyder/ClaudeDeck/releases/download/v${VERSION}/${filename}"
    
    echo "Downloading $filename..."
    if curl -L -o "$filename" "$url"; then
        local hash=$(shasum -a 256 "$filename" | cut -d' ' -f1)
        echo "SHA256: $hash"
        echo
        return 0
    else
        echo "Error: Failed to download $filename"
        return 1
    fi
}

# Download and calculate hashes
echo "1. Calculating SHA256 for ARM64 (aarch64)..."
if calculate_sha256 "aarch64"; then
    ARM_HASH=$(shasum -a 256 "ClaudeDeck_${VERSION}_aarch64.dmg" | cut -d' ' -f1)
fi

echo "2. Calculating SHA256 for Intel (x64)..."
if calculate_sha256 "x64"; then
    INTEL_HASH=$(shasum -a 256 "ClaudeDeck_${VERSION}_x64.dmg" | cut -d' ' -f1)
fi

# Update the formula
if [ -n "$ARM_HASH" ] && [ -n "$INTEL_HASH" ]; then
    echo "3. Updating formula with new hashes..."
    
    # Create a backup
    cp "$FORMULA_PATH" "${FORMULA_PATH}.bak"
    
    # Update the formula using sed
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS sed syntax
        sed -i '' "s/PLACEHOLDER_SHA256_ARM64/$ARM_HASH/g" "$FORMULA_PATH"
        sed -i '' "s/PLACEHOLDER_SHA256_X64/$INTEL_HASH/g" "$FORMULA_PATH"
    else
        # GNU sed syntax
        sed -i "s/PLACEHOLDER_SHA256_ARM64/$ARM_HASH/g" "$FORMULA_PATH"
        sed -i "s/PLACEHOLDER_SHA256_X64/$INTEL_HASH/g" "$FORMULA_PATH"
    fi
    
    echo "   ✅ Formula updated successfully!"
    echo
    echo "Updated hashes:"
    echo "  ARM64: $ARM_HASH"
    echo "  Intel: $INTEL_HASH"
    echo
    echo "4. Testing updated formula..."
    ./homebrew/test_formula.sh
    
    # Clean up downloaded files
    rm -f "ClaudeDeck_${VERSION}_aarch64.dmg" "ClaudeDeck_${VERSION}_x64.dmg"
else
    echo "Error: Could not calculate all required hashes"
    exit 1
fi

echo
echo "=== Next Steps ==="
echo "1. Review the changes: git diff $FORMULA_PATH"
echo "2. Commit the updated formula"
echo "3. Test installation: brew install --cask $FORMULA_PATH"
echo "4. Follow instructions in post_release_steps.md for publishing"