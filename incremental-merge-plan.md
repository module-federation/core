# Incremental Merge Plan: app-router-share-filter → share-filter

## Overview
Systematically merge 67 applicable files from `app-router-share-filter` to `share-filter` branch in logical increments, with CI validation after each increment.

## Total Files to Merge: 67
*Excluding: pnpm-lock.yaml, __mocks__, .node binaries, and cypress test files*

---

## Increment A: CI/CD and Development Infrastructure (9 files) ✅ COMPLETED
**Priority**: High - Foundation changes that affect build/test processes

- [x] `.github/workflows/build-and-test.yml`
- [x] `.github/workflows/release.yml`
- [x] `.cursor/rules/running-tests.mdc`
- [x] `.cursorignore`
- [x] `apps/next-app-router/next-app-router-4000/cypress.config.ts`
- [x] `apps/next-app-router/next-app-router-4000/project.json`
- [x] `apps/next-app-router/next-app-router-4001/project.json`
- [x] `packages/enhanced/.cursorrules`
- [x] `package.json`

**Post-Increment**: ✅ CI validation completed

---

## Increment B: Documentation and Changesets (10 files) ✅ COMPLETED
**Priority**: Medium - Documentation and release notes

- [x] `.changeset/ai-eager-wolf.md`
- [x] `.changeset/ai-happy-fox.md`
- [x] `.changeset/ai-hungry-bear.md`
- [x] `.changeset/ai-sleepy-fox.md`
- [x] `.changeset/ai-sleepy-tiger.md`
- [x] `.changeset/brown-badgers-fetch.md`
- [x] `.changeset/shy-snails-battle.md`
- [x] `apps/website-new/docs/en/configure/advanced-sharing.mdx`
- [x] `apps/website-new/docs/en/configure/experiments.mdx`
- [x] `apps/website-new/docs/en/guide/basic/vite.mdx`

**Post-Increment**: ✅ CI validation completed

---

## Increment C: Core Package Dependencies (6 files) ✅ COMPLETED
**Priority**: High - Package.json updates that affect dependencies

- [x] `packages/data-prefetch/package.json`
- [x] `packages/node/package.json`
- [x] `packages/runtime-core/package.json`
- [x] `apps/3000-home/package.json`
- [x] `apps/3001-shop/package.json`
- [x] `apps/3002-checkout/package.json`

**Post-Increment**: ✅ pnpm install completed and CI validation passed

---

## Increment D: Enhanced Library Core Changes (8 files) ✅ COMPLETED
**Priority**: Critical - Core sharing plugin functionality

- [x] `packages/enhanced/src/lib/container/RemoteModule.ts`
- [x] `packages/enhanced/src/lib/container/runtime/EmbedFederationRuntimePlugin.ts`
- [x] `packages/enhanced/src/lib/sharing/ConsumeSharedPlugin.ts`
- [x] `packages/enhanced/src/lib/sharing/resolveMatchedConfigs.ts`
- [x] `packages/enhanced/test/unit/container/RemoteModule.test.ts`
- [x] `packages/enhanced/test/unit/sharing/share.utils.test.ts`
- [x] `packages/nextjs-mf/src/internal.test.ts`
- [x] `packages/managers/__tests__/__snapshots__/SharedManager.spec.ts.snap`

**Post-Increment**: ✅ Tests and CI validation completed

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

## 🎯 CRITICAL BUILD FIX APPLIED:
**Issue**: React 19 TypeScript compatibility error in `packages/modernjs/src/runtime/AwaitDataFetch.tsx`
**Fix**: Updated `useRef<T>()` to `useRef<T | undefined>(undefined)` to provide required initial value
**Result**: ✅ All 35 packages now build successfully (100% success rate)

---

## 📊 PROGRESS SUMMARY:
- ✅ **4/9 Increments Completed** (A, B, C, D)
- ✅ **33 files successfully merged**
- ✅ **Critical functionality preserved** (enhanced layer support, nodeModulesReconstructedLookup)
- ✅ **Build system stable** (all packages building)
- ⏳ **5 increments remaining** (E, F, G, H, I = 34 files)

## 🔄 CURRENT STATUS: 
Ready to proceed with **Increment E: Bridge and Data Prefetch Updates**

---

## Notes:
- **Excluded large files**: pnpm-lock.yaml (handle separately), __mocks__ (400K+ lines), cypress tests
- **Critical increments**: A, C, D ✅ (completed), E (core functionality)
- **Optional increments**: B ✅ (completed), F, G, I (documentation and demos)
- **Stop and investigate** if any increment fails CI