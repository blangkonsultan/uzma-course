#!/bin/bash
set -e

echo "=== Harness Initialization & Verification ==="

# Check working directory
if [ ! -f package.json ]; then
  echo "Error: package.json not found. Run init.sh from repository root."
  exit 1
fi

# Ensure clean dependency state
if [ ! -d node_modules ]; then
  echo "=== Installing dependencies with npm ==="
  npm install
fi

echo "=== 1/3 Running Lint (ESLint) ==="
npm run lint

echo "=== 2/3 Running Automated Tests (Vitest) ==="
npm test

echo "=== 3/3 Running Production Build (Next.js Turbopack) ==="
npm run build

echo "=== Verification Complete ==="
echo ""
echo "Repository state is verified, clean, and restartable."
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Pick ONE unfinished feature to work on"
echo "3. Implement only that feature"
echo "4. Re-run verification before claiming done"
