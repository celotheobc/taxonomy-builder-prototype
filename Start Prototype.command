#!/bin/bash
# Double-click in Finder (macOS). Do NOT open index.html directly.

cd "$(dirname "$0")"

# Finder launches with a minimal PATH — load Node from common installs
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
fi
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env)"
fi

echo "=============================================="
echo "  Perspective Builder prototype"
echo "=============================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js was not found."
  echo ""
  echo "Install Node.js from https://nodejs.org/"
  echo "Then double-click this file again."
  echo ""
  read -r -p "Press Enter to close..."
  exit 1
fi

echo "Node: $(node -v)"
echo "Folder: $(pwd)"
echo ""

if [ ! -d "node_modules" ]; then
  echo "First run — installing dependencies (one-time, ~30s)..."
  npm install
  if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: npm install failed."
    read -r -p "Press Enter to close..."
    exit 1
  fi
  echo ""
fi

echo "Starting server at http://127.0.0.1:5199/"
echo "Your browser should open automatically."
echo ""
echo "KEEP THIS WINDOW OPEN while using the prototype."
echo "Press Ctrl+C to stop."
echo ""

npm run dev

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "Server exited with error $EXIT_CODE"
  read -r -p "Press Enter to close..."
fi
