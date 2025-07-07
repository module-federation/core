#!/bin/bash

set -e

echo "🏗️  Building packages..."
npx nx run-many --targets=build --projects=tag:type:pkg

echo "🧪 Running E2E Test for Next.js Dev - Home"
killall node 2>/dev/null || true
pnpm run app:next:dev
npx nx run 3000-home:test:e2e

echo "🧪 Running E2E Test for Next.js Dev - Shop"
killall node 2>/dev/null || true
pnpm run app:next:dev
npx nx run 3001-shop:test:e2e

echo "🧪 Running E2E Test for Next.js Dev - Checkout"
killall node 2>/dev/null || true
pnpm run app:next:dev
npx nx run 3002-checkout:test:e2e

echo "✅ All E2E tests completed successfully!"
