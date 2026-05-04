#!/bin/bash
# ArenaIQ — start the server

cd "$(dirname "$0")/server"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo ""
echo "⚔️  Starting ArenaIQ server..."
echo "👉  Open http://localhost:3001 in your browser"
echo ""
node index.js
