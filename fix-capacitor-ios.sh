#!/bin/bash

# Fix JSValueDecoder.swift
sed -i '' 's/MSEC_PER_SEC/1000/g' node_modules/@capacitor/ios/Capacitor/Capacitor/Codable/JSValueDecoder.swift

# Fix JSValueEncoder.swift  
sed -i '' 's/MSEC_PER_SEC/1000/g' node_modules/@capacitor/ios/Capacitor/Capacitor/Codable/JSValueEncoder.swift

echo "Capacitor iOS files patched successfully"
