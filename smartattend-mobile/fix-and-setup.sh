#!/bin/bash
# SmartAttend Mobile - Fix Script
# Run this from your project root: bash fix-and-setup.sh

set -e

PROJECT_DIR="$(pwd)"
echo "🔧 Fixing SmartAttend mobile project at: $PROJECT_DIR"

# 1. Kill watchman recrawl warning
echo ""
echo "→ Clearing Watchman..."
watchman watch-del "$PROJECT_DIR" 2>/dev/null || true
watchman watch-project "$PROJECT_DIR" 2>/dev/null || true

# 2. Remove node_modules and lock file for a clean slate
echo "→ Cleaning node_modules..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

# 3. Replace package.json (removes react-native-reanimated)
echo "→ Writing fixed package.json..."
cat > package.json << 'PKGJSON'
{
  "name": "smartattend-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  },
  "dependencies": {
    "expo": "~52.0.46",
    "expo-camera": "~16.0.18",
    "expo-haptics": "~14.0.1",
    "expo-linear-gradient": "~14.0.2",
    "expo-router": "~4.0.21",
    "expo-secure-store": "~14.0.1",
    "expo-status-bar": "~2.0.1",
    "@expo/vector-icons": "^14.0.4",
    "@tanstack/react-query": "^5.32.0",
    "axios": "^1.6.8",
    "zustand": "^4.5.2",
    "react": "18.3.1",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.3.0",
    "babel-preset-expo": "~12.0.10",
    "typescript": "^5.3.0"
  },
  "private": true
}
PKGJSON

# 4. Write clean babel config (no reanimated plugin)
echo "→ Writing clean babel.config.js..."
cat > babel.config.js << 'BABEL'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated/plugin intentionally removed
  };
};
BABEL

# 5. Write .watchmanconfig
echo "{}" > .watchmanconfig

# 6. Install
echo ""
echo "→ Installing packages (this takes a minute)..."
npm install

echo ""
echo "✅ Done! Now run:"
echo "   npx expo start --clear"
echo ""
echo "⚠️  Remember to update API_URL in src/lib/api.ts with your Mac's WiFi IP:"
echo "   Run: ipconfig getifaddr en0"
