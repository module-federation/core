#!/bin/bash

set -e

echo "🏗️  Building packages..."
npx nx run-many --targets=build --projects=tag:type:pkg

echo "🧪 Running E2E Test for Next.js Dev - Home"
lsof -ti tcp:3000,3001,3002 | xargs -r kill 2>/dev/null || true
npx nx run 3000-home:test:e2e

echo "🧪 Running E2E Test for Next.js Dev - Shop"
lsof -ti tcp:3000,3001,3002 | xargs -r kill 2>/dev/null || true
npx nx run 3001-shop:test:e2e

echo "🧪 Running E2E Test for Next.js Dev - Checkout"
lsof -ti tcp:3000,3001,3002 | xargs -r kill 2>/dev/null || true
npx nx run 3002-checkout:test:e2e
lsof -ti tcp:3000,3001,3002 | xargs -r kill 2>/dev/null || true
echo "✅ All E2E tests completed successfully!"
