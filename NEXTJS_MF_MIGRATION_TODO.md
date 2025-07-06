# NextJS-MF Migration TODO: app-router-share-filter → share-filter

## 📋 **Migration Overview**

**Source Branch**: `app-router-share-filter`  
**Target Branch**: `share-filter`  
**Scope**: `packages/nextjs-mf/` directory only  
**Strategy**: Incremental migration with e2e testing after each increment  

---

## 🔍 **Branch Comparison Methods**

### **1. Basic Diff Analysis**
```bash
# Get list of changed files (names only)
git diff --name-only app-router-share-filter..share-filter -- packages/nextjs-mf/

# Get detailed status (M=Modified, A=Added, D=Deleted)
git diff --name-status app-router-share-filter..share-filter -- packages/nextjs-mf/

# Get statistics of changes
git diff --stat app-router-share-filter..share-filter -- packages/nextjs-mf/
```

### **2. Comprehensive File Discovery**
```bash
# List all files in app-router-share-filter branch
git ls-tree -r --name-only app-router-share-filter -- packages/nextjs-mf/ > /tmp/app-router-files.txt

# List all files in share-filter branch
git ls-tree -r --name-only share-filter -- packages/nextjs-mf/ > /tmp/share-filter-files.txt

# Find files only in app-router-share-filter (missing in share-filter)
comm -23 /tmp/app-router-files.txt /tmp/share-filter-files.txt

# Find files only in share-filter (extra files)
comm -13 /tmp/app-router-files.txt /tmp/share-filter-files.txt

# Compare file lists side by side
diff -u /tmp/share-filter-files.txt /tmp/app-router-files.txt
```

### **3. Individual File Comparison**
```bash
# Show specific file from app-router-share-filter branch
git show app-router-share-filter:packages/nextjs-mf/package.json

# Show specific file from share-filter branch
git show share-filter:packages/nextjs-mf/package.json

# Compare specific file between branches
git diff app-router-share-filter..share-filter -- packages/nextjs-mf/package.json

# Show file diff with context (more lines)
git diff -U10 app-router-share-filter..share-filter -- packages/nextjs-mf/package.json
```

### **4. Advanced Diff Analysis**
```bash
# Show all changes across commits that affected nextjs-mf
git show --name-only share-filter..app-router-share-filter -- packages/nextjs-mf/ | grep "packages/nextjs-mf" | sort | uniq

# Get commit history affecting nextjs-mf
git log --oneline share-filter..app-router-share-filter -- packages/nextjs-mf/

# Show changes with file statistics
git log --stat share-filter..app-router-share-filter -- packages/nextjs-mf/

# Show detailed changes for specific commits
git show <commit-hash> -- packages/nextjs-mf/
```

### **5. Migration Verification Commands**
```bash
# Check if a file exists in both branches
git cat-file -e app-router-share-filter:packages/nextjs-mf/src/internal.ts && echo "EXISTS in app-router-share-filter"
git cat-file -e share-filter:packages/nextjs-mf/src/internal.ts && echo "EXISTS in share-filter"

# Loop through files to find differences
for file in $(cat /tmp/app-router-files.txt); do
    if ! git diff --quiet app-router-share-filter share-filter -- "$file" 2>/dev/null; then
        echo "MODIFIED: $file"
    fi
done

# Check file sizes between branches
git ls-tree -r -l app-router-share-filter -- packages/nextjs-mf/ | awk '{print $4 " " $5}' > /tmp/app-router-sizes.txt
git ls-tree -r -l share-filter -- packages/nextjs-mf/ | awk '{print $4 " " $5}' > /tmp/share-filter-sizes.txt
diff -u /tmp/share-filter-sizes.txt /tmp/app-router-sizes.txt
```

### **6. Per-Increment Migration Commands**

#### **Before Each Increment:**
```bash
# Backup current state
git stash push -m "backup before increment N"

# Verify current branch
git branch --show-current

# Check working directory is clean
git status --porcelain
```

#### **During Each Increment:**
```bash
# Copy specific file from app-router-share-filter
git show app-router-share-filter:packages/nextjs-mf/package.json > packages/nextjs-mf/package.json

# Or use checkout for specific file
git checkout app-router-share-filter -- packages/nextjs-mf/package.json

# Verify the change
git diff packages/nextjs-mf/package.json

# Check if file is identical to source
git diff app-router-share-filter -- packages/nextjs-mf/package.json
```

#### **After Each Increment:**
```bash
# Add changes to staging
git add packages/nextjs-mf/

# Commit the increment
git commit -m "feat(nextjs-mf): increment N - [description]"

# Run e2e tests
./scripts/e2e-next-all.sh
```

### **7. Detailed File Analysis**
```bash
# Show word-by-word diff
git diff --word-diff app-router-share-filter..share-filter -- packages/nextjs-mf/src/internal.ts

# Show side-by-side diff
git diff --side-by-side app-router-share-filter..share-filter -- packages/nextjs-mf/src/internal.ts

# Show only additions/deletions
git diff --unified=0 app-router-share-filter..share-filter -- packages/nextjs-mf/src/internal.ts

# Show diff with ignore whitespace
git diff -w app-router-share-filter..share-filter -- packages/nextjs-mf/src/internal.ts
```

### **8. Migration Helper Scripts**

#### **Create a migration helper script:**
```bash
# Create migration-helper.sh
cat > migration-helper.sh << 'EOF'
#!/bin/bash
set -e

BRANCH_FROM="app-router-share-filter"
BRANCH_TO="share-filter"
PACKAGE_DIR="packages/nextjs-mf"

echo "🔍 Analyzing migration between $BRANCH_FROM and $BRANCH_TO"

# Show files that need migration
echo "📁 Files with changes:"
git diff --name-status $BRANCH_FROM..$BRANCH_TO -- $PACKAGE_DIR/

# Show statistics
echo "📊 Change statistics:"
git diff --stat $BRANCH_FROM..$BRANCH_TO -- $PACKAGE_DIR/

# Function to show file diff
show_file_diff() {
    local file="$1"
    echo "📄 Diff for $file:"
    echo "----------------------------------------"
    git diff $BRANCH_FROM..$BRANCH_TO -- "$file"
    echo "----------------------------------------"
}

# Function to copy file from source branch
copy_file() {
    local file="$1"
    echo "📋 Copying $file from $BRANCH_FROM"
    git show $BRANCH_FROM:"$file" > "$file"
    echo "✅ Copied $file"
}

# Export functions for use
export -f show_file_diff
export -f copy_file

echo "💡 Usage:"
echo "  show_file_diff packages/nextjs-mf/package.json"
echo "  copy_file packages/nextjs-mf/package.json"
EOF

chmod +x migration-helper.sh
```

#### **Usage of helper script:**
```bash
# Source the helper
source migration-helper.sh

# Show diff for specific file
show_file_diff packages/nextjs-mf/src/internal.ts

# Copy file from source branch
copy_file packages/nextjs-mf/package.json
```

---

## ✅ **Migration Status**

### **NextJS-MF Directory Analysis:**
```bash
git show --name-only share-filter..app-router-share-filter -- packages/nextjs-mf/
# Shows 27 files with changes across commits
```

### **Files Analysis:**
- **Total files in nextjs-mf**: 54 files 
- **Files with changes**: **27 files** (substantial migration needed)
- **Scope**: Core functionality updates, RSC support, version detection
- **Migration complexity**: **Medium-High** (production code changes)

### **Files to Migrate:**
```
packages/nextjs-mf/package.json
packages/nextjs-mf/project.json
packages/nextjs-mf/src/__snapshots__/share-internals-client.test.ts.snap
packages/nextjs-mf/src/constants.ts
packages/nextjs-mf/src/federation-noop-appdir-client.ts
packages/nextjs-mf/src/federation-noop-appdir-server.ts
packages/nextjs-mf/src/internal-helpers.ts
packages/nextjs-mf/src/internal.test.ts
packages/nextjs-mf/src/internal.ts
packages/nextjs-mf/src/loaders/next-flight-loader.ts
packages/nextjs-mf/src/plugins/container/InvertedContainerPlugin.ts
packages/nextjs-mf/src/plugins/container/InvertedContainerRuntimeModule.ts
packages/nextjs-mf/src/plugins/container/runtimePlugin.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/apply-server-plugins.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/flight-client-entry-plugin.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/flight-manifest-plugin.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/index.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/next-fragments.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/remove-unnecessary-shared-keys.test.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/remove-unnecessary-shared-keys.ts
packages/nextjs-mf/src/plugins/NextFederationPlugin/RscManifestInterceptPlugin.ts
packages/nextjs-mf/src/router-context.ts
packages/nextjs-mf/src/share-internals-client.test.ts
packages/nextjs-mf/src/share-internals-client.ts
packages/nextjs-mf/src/share-internals-server.ts
packages/nextjs-mf/src/types/btoa.d.ts
```

---

## 📝 **Migration Tasks**

### **Increment 1: Core Configuration Files** ⏳
**Files**: 
- `package.json`
- `project.json`

**Changes**: Update dependencies and project configuration

---

### **Increment 2: Constants & Core Types** ⏳
**Files**:
- `src/constants.ts`
- `src/types/btoa.d.ts`

**Changes**: Enhanced constants and type definitions

---

### **Increment 3: Internal Helpers & Version Detection** ⏳
**Files**:
- `src/internal-helpers.ts`
- `src/internal.ts`

**Changes**: Next.js version detection and enhanced internal functions

---

### **Increment 4: Share Internals System** ⏳
**Files**:
- `src/share-internals-client.ts`
- `src/share-internals-server.ts`
- `src/router-context.ts`

**Changes**: Enhanced client/server sharing configurations

---

### **Increment 5: Federation Noop App Directory** ⏳
**Files**:
- `src/federation-noop-appdir-client.ts`
- `src/federation-noop-appdir-server.ts`

**Changes**: App router federation noop implementations

---

### **Increment 6: Flight Loader & RSC Support** ⏳
**Files**:
- `src/loaders/next-flight-loader.ts`

**Changes**: React Server Components flight loader

---

### **Increment 7: Container Plugins** ⏳
**Files**:
- `src/plugins/container/InvertedContainerPlugin.ts`
- `src/plugins/container/InvertedContainerRuntimeModule.ts`
- `src/plugins/container/runtimePlugin.ts`

**Changes**: Enhanced container plugin functionality

---

### **Increment 8: Next Federation Plugin Core** ⏳
**Files**:
- `src/plugins/NextFederationPlugin/index.ts`
- `src/plugins/NextFederationPlugin/apply-server-plugins.ts`
- `src/plugins/NextFederationPlugin/next-fragments.ts`

**Changes**: Core Next.js federation plugin enhancements

---

### **Increment 9: Flight Plugins (RSC)** ⏳
**Files**:
- `src/plugins/NextFederationPlugin/flight-client-entry-plugin.ts`
- `src/plugins/NextFederationPlugin/flight-manifest-plugin.ts`
- `src/plugins/NextFederationPlugin/RscManifestInterceptPlugin.ts`

**Changes**: React Server Components flight plugins

---

### **Increment 10: Shared Keys Management** ⏳
**Files**:
- `src/plugins/NextFederationPlugin/remove-unnecessary-shared-keys.ts`
- `src/plugins/NextFederationPlugin/remove-unnecessary-shared-keys.test.ts`

**Changes**: Enhanced shared keys optimization

---

### **Increment 11: Test Files & Snapshots** ⏳
**Files**:
- `src/internal.test.ts`
- `src/share-internals-client.test.ts`
- `src/__snapshots__/share-internals-client.test.ts.snap`

**Changes**: Updated tests and test snapshots

---

## 🧪 **Testing Strategy**

### **After Each Increment:**
1. **Run e2e tests**: `./scripts/e2e-next-all.sh`
2. **Verify build success**: All 35 packages should build
3. **Check test results**: NextJS-MF tests should pass
4. **Validate Module Federation**: Ensure MF functionality works

### **Critical Test Points:**
- [ ] NextJS-MF unit tests pass
- [ ] Enhanced package builds successfully  
- [ ] 3000-home e2e test passes
- [ ] 3001-shop e2e test passes
- [ ] 3002-checkout e2e test passes
- [ ] RSC functionality works (Next.js 15+ features)
- [ ] Version detection works correctly

---

## 🎯 **Expected Outcomes**

### **Post-Migration Benefits:**
- ✅ **React Server Components Support**: Full RSC integration
- ✅ **Next.js Version Detection**: Automatic version-aware configurations
- ✅ **Enhanced Sharing**: Improved client/server share configurations
- ✅ **Flight Plugins**: Advanced RSC plugin system
- ✅ **Better Testing**: Comprehensive test coverage

### **Risk Assessment:**
- **🟡 Medium Risk**: Production code changes affecting core functionality
- **🟡 Breaking Changes**: Potential Next.js version compatibility changes
- **🟢 Incremental**: Safe step-by-step migration approach

---

## 📊 **Progress Tracking**

- **Total Increments**: 11
- **Completed**: 0/11 
- **Current Status**: Ready to begin Increment 1
- **Estimated Effort**: High (27 files, core functionality changes)

---

## ✅ **Completion Criteria**

Migration is complete when:
- [ ] All 11 increments applied successfully
- [ ] All e2e tests pass consistently  
- [ ] No test failures or regressions
- [ ] Build process remains stable (35/35 packages)
- [ ] Module Federation functionality verified
- [ ] RSC features working (Next.js 15+ compatibility)
- [ ] Version detection working correctly

---

*Migration prepared for incremental execution with comprehensive testing between each step. **This is a substantial migration with 27 files and core functionality changes.*** 
