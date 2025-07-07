#!/bin/bash

set -e

echo "🏗️  Building packages..."
npx nx run-many --targets=build --projects=tag:type:pkg
pnpm run app:next:dev
echo "🧪 Running E2E Test for Next.js Dev - Home"
npx nx run 3000-home:test:e2e

echo "🧪 Running E2E Test for Next.js Dev - Shop"
npx nx run 3001-shop:test:e2e

echo "🧪 Running E2E Test for Next.js Dev - Checkout"
npx nx run 3002-checkout:test:e2e

echo "✅ All E2E tests completed successfully!"
