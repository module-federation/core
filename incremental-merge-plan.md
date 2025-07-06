# Incremental Merge Plan: app-router-share-filter → share-filter

## Overview
Systematically merge 67 applicable files from `app-router-share-filter` to `share-filter` branch in logical increments, with CI validation after each increment.

## Total Files to Merge: 67
*Excluding: pnpm-lock.yaml, __mocks__, .node binaries, and cypress test files*

---

## Increment A: CI/CD and Development Infrastructure (9 files)
**Priority**: High - Foundation changes that affect build/test processes

- [ ] `.github/workflows/build-and-test.yml`
- [ ] `.github/workflows/release.yml`
- [ ] `.cursor/rules/running-tests.mdc`
- [ ] `.cursorignore`
- [ ] `apps/next-app-router/next-app-router-4000/cypress.config.ts`
- [ ] `apps/next-app-router/next-app-router-4000/project.json`
- [ ] `apps/next-app-router/next-app-router-4001/project.json`
- [ ] `packages/enhanced/.cursorrules`
- [ ] `package.json`

**Post-Increment**: ✅ Run CI validation

---

## Increment B: Documentation and Changesets (10 files)
**Priority**: Medium - Documentation and release notes

- [ ] `.changeset/ai-eager-wolf.md`
- [ ] `.changeset/ai-happy-fox.md`
- [ ] `.changeset/ai-hungry-bear.md`
- [ ] `.changeset/ai-sleepy-fox.md`
- [ ] `.changeset/ai-sleepy-tiger.md`
- [ ] `.changeset/brown-badgers-fetch.md`
- [ ] `.changeset/shy-snails-battle.md`
- [ ] `apps/website-new/docs/en/configure/advanced-sharing.mdx`
- [ ] `apps/website-new/docs/en/configure/experiments.mdx`
- [ ] `apps/website-new/docs/en/guide/basic/vite.mdx`

**Post-Increment**: ✅ Run CI validation

---

## Increment C: Core Package Dependencies (6 files)
**Priority**: High - Package.json updates that affect dependencies

- [ ] `packages/data-prefetch/package.json`
- [ ] `packages/node/package.json`
- [ ] `packages/runtime-core/package.json`
- [ ] `apps/3000-home/package.json`
- [ ] `apps/3001-shop/package.json`
- [ ] `apps/3002-checkout/package.json`

**Post-Increment**: ✅ Run `pnpm install` and CI validation

---

## Increment D: Enhanced Library Core Changes (8 files)
**Priority**: Critical - Core sharing plugin functionality

- [ ] `packages/enhanced/src/lib/container/RemoteModule.ts`
- [ ] `packages/enhanced/src/lib/container/runtime/EmbedFederationRuntimePlugin.ts`
- [ ] `packages/enhanced/src/lib/sharing/ConsumeSharedPlugin.ts`
- [ ] `packages/enhanced/src/lib/sharing/resolveMatchedConfigs.ts`
- [ ] `packages/enhanced/test/unit/container/RemoteModule.test.ts`
- [ ] `packages/enhanced/test/unit/sharing/share.utils.test.ts`
- [ ] `packages/nextjs-mf/src/internal.test.ts`
- [ ] `packages/managers/__tests__/__snapshots__/SharedManager.spec.ts.snap`

**Post-Increment**: ✅ Run tests and CI validation

---

## Increment E: Bridge and Data Prefetch Updates (4 files)
**Priority**: High - React 19 compatibility and bridge functionality

- [ ] `packages/bridge/bridge-react/__tests__/bridge.spec.tsx`
- [ ] `packages/bridge/bridge-react/src/v19.ts`
- [ ] `packages/data-prefetch/__tests__/react.spec.ts`
- [ ] `packages/modernjs/src/runtime/AwaitDataFetch.tsx`

**Post-Increment**: ✅ Run tests and CI validation

---

## Increment F: Next.js App Router Applications (15 files)
**Priority**: Medium - App router demo applications

- [ ] `apps/next-app-router/next-app-router-4000/app/context/context-click-counter.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/app/error-handling/[categorySlug]/[subCategorySlug]/error.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/app/error-handling/[categorySlug]/error.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/app/error-handling/error.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/app/hooks/page.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/app/layout.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/app/page.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/next.config.js`
- [ ] `apps/next-app-router/next-app-router-4000/package.json`
- [ ] `apps/next-app-router/next-app-router-4000/pages/router-test.tsx`
- [ ] `apps/next-app-router/next-app-router-4000/ui/address-bar.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/app/demo/page.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/next.config.js`
- [ ] `apps/next-app-router/next-app-router-4001/package.json`
- [ ] `apps/next-app-router/next-app-router-4001/pages/router-test.tsx`

**Post-Increment**: ✅ Run CI validation

---

## Increment G: Next.js Demo Apps Package Updates (8 files)
**Priority**: Low - Type definitions and component updates

- [ ] `apps/3000-home/next-env.d.ts`
- [ ] `apps/3001-shop/next-env.d.ts`
- [ ] `apps/3002-checkout/next-env.d.ts`
- [ ] `apps/next-app-router/next-app-router-4000/next-env.d.ts`
- [ ] `apps/next-app-router/next-app-router-4001/next-env.d.ts`
- [ ] `apps/next-app-router/next-app-router-4001/app/hooks/_components/router-context-layout.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/app/isr/layout.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/app/layout.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/app/layouts/[categorySlug]/layout.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/app/page.tsx`
- [ ] `apps/next-app-router/next-app-router-4001/ui/global-nav.tsx`

**Post-Increment**: ✅ Run CI validation

---

## Increment H: Runtime Core and Node Updates (5 files)
**Priority**: Medium - Runtime functionality improvements

- [ ] `packages/runtime-core/__tests__/semver.spec.ts`
- [ ] `packages/runtime-core/src/constant.ts`
- [ ] `packages/runtime-core/src/core.ts`
- [ ] `packages/runtime-core/src/remote/index.ts`
- [ ] `packages/node/src/runtimePlugin.ts`

**Post-Increment**: ✅ Run tests and CI validation

---

## Increment I: Miscellaneous and New Features (4 files)
**Priority**: Low - New features and cleanup

- [ ] `main.py` (New Python script - 196 lines)
- [ ] `apps/next-app-router/next-app-router-4001/classic/button.tsx` (Deleted file)
- [ ] `apps/next-app-router/next-app-router-4001/rsc/button.tsx` (Deleted file)
- [ ] `apps/next-app-router/next-app-router-4001/ui/random.tsx` (Deleted file)

**Post-Increment**: ✅ Run CI validation

---

## Execution Strategy

### For Each Increment:
1. **Checkout files** from `origin/app-router-share-filter`
2. **Review changes** - ensure they're applicable and safe
3. **Resolve conflicts** if any
4. **Commit changes** with descriptive message
5. **Push to remote** 
6. **Wait for CI** to pass before proceeding
7. **Mark increment complete**

### Commands Template:
```bash
# For each file in increment
git checkout origin/app-router-share-filter -- <file-path>

# Review and commit
git add .
git commit -m "feat: merge increment X - <description>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push and wait for CI
git push origin share-filter
```

### Success Criteria:
- ✅ All 67 files successfully merged
- ✅ CI passes after each increment  
- ✅ No regression in existing functionality
- ✅ Enhanced layer support features preserved
- ✅ Branch ready for production use

---

## Notes:
- **Excluded large files**: pnpm-lock.yaml (handle separately), __mocks__ (400K+ lines), cypress tests
- **Critical increments**: A, C, D, E (affect core functionality)
- **Optional increments**: B, F, G, I (documentation and demos)
- **Stop and investigate** if any increment fails CI