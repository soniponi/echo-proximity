
#!/bin/bash

# Fix the isInspectable issue in CapacitorBridge.swift
if [ -f "node_modules/@capacitor/ios/Capacitor/Capacitor/CapacitorBridge.swift" ]; then
    sed -i '' 's/webView\.isInspectable = true/if #available(iOS 16.4, *) { webView.isInspectable = true }/g' node_modules/@capacitor/ios/Capacitor/Capacitor/CapacitorBridge.swift
    echo "iOS isInspectable issue patched successfully"
else
    echo "CapacitorBridge.swift not found - make sure you've run 'npx cap add ios' first"
fi
