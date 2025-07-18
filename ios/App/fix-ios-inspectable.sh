
#!/bin/bash

# Comprehensive iOS Capacitor fix script
echo "🔧 Fixing iOS Capacitor compatibility issues..."

# Fix path
CAPACITOR_BRIDGE_PATH="../../node_modules/@capacitor/ios/Capacitor/Capacitor/CapacitorBridge.swift"

if [ -f "$CAPACITOR_BRIDGE_PATH" ]; then
    echo "✅ Found CapacitorBridge.swift"
    
    # Create backup
    cp "$CAPACITOR_BRIDGE_PATH" "${CAPACITOR_BRIDGE_PATH}.backup"
    echo "📋 Created backup"
    
    # Fix isInspectable issue with proper Swift syntax
    if grep -q "webView\.isInspectable = true" "$CAPACITOR_BRIDGE_PATH"; then
        echo "🔍 Found isInspectable issue, applying fix..."
        sed -i '' '/webView\.isInspectable = true/c\
        if #available(iOS 16.4, *) {\
            webView.isInspectable = true\
        }' "$CAPACITOR_BRIDGE_PATH"
        echo "✅ Fixed isInspectable compatibility"
    else
        echo "ℹ️ No isInspectable issue found"
    fi
    
    echo "🎉 iOS fixes applied successfully!"
    echo "Next steps:"
    echo "1. Clean your Xcode build: Product → Clean Build Folder (Cmd+Shift+K)"
    echo "2. Rebuild the project in Xcode"
    
else
    echo "❌ CapacitorBridge.swift not found at: $CAPACITOR_BRIDGE_PATH"
    echo "📍 Current directory: $(pwd)"
    echo "🔍 Searching for CapacitorBridge.swift files..."
    find ../.. -name "CapacitorBridge.swift" 2>/dev/null | head -5
fi
