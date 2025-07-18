
#!/bin/bash

# Fix the isInspectable issue in CapacitorBridge.swift
CAPACITOR_BRIDGE_PATH="node_modules/@capacitor/ios/Capacitor/Capacitor/CapacitorBridge.swift"

if [ -f "$CAPACITOR_BRIDGE_PATH" ]; then
    echo "Found CapacitorBridge.swift, applying fix..."
    
    # Create a backup
    cp "$CAPACITOR_BRIDGE_PATH" "${CAPACITOR_BRIDGE_PATH}.backup"
    
    # Replace the problematic line with a version check
    sed -i '' 's/webView\.isInspectable = true/if #available(iOS 16.4, *) {\
            webView.isInspectable = true\
        }/g' "$CAPACITOR_BRIDGE_PATH"
    
    echo "iOS isInspectable issue patched successfully"
    echo "Backup created at: ${CAPACITOR_BRIDGE_PATH}.backup"
else
    echo "CapacitorBridge.swift not found at: $CAPACITOR_BRIDGE_PATH"
    echo "Make sure you've run 'npx cap add ios' first"
    echo "Current directory: $(pwd)"
    echo "Looking for Capacitor files..."
    find . -name "CapacitorBridge.swift" 2>/dev/null || echo "No CapacitorBridge.swift files found"
fi
