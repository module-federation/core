#!/bin/bash
set -e

BRANCH_FROM="app-router-share-filter"
BRANCH_TO="share-filter"
PACKAGE_DIR="packages/nextjs-mf"

echo "🔍 Analyzing migration between $BRANCH_FROM and $BRANCH_TO"

# Show files that need migration (what's in source that differs from target)
echo "📁 Files with changes (need migration FROM $BRANCH_FROM TO $BRANCH_TO):"
git show --name-only --pretty=format:"" $BRANCH_TO..$BRANCH_FROM -- $PACKAGE_DIR/ | grep -v "^$" | sort | uniq

# Show statistics
echo "📊 Change statistics:"
git diff --stat $BRANCH_TO..$BRANCH_FROM -- $PACKAGE_DIR/

# Function to show file diff
show_file_diff() {
    local file="$1"
    echo "📄 Diff for $file (changes needed to migrate FROM $BRANCH_FROM TO $BRANCH_TO):"
    echo "----------------------------------------"
    git diff $BRANCH_TO..$BRANCH_FROM -- "$file"
    echo "----------------------------------------"
}

# Function to copy file from source branch
copy_file() {
    local file="$1"
    echo "📋 Copying $file from $BRANCH_FROM"
    git show $BRANCH_FROM:"$file" > "$file"
    echo "✅ Copied $file"
}

# Function to preview file from source branch
preview_file() {
    local file="$1"
    echo "👀 Preview of $file from $BRANCH_FROM:"
    echo "========================================"
    git show $BRANCH_FROM:"$file"
    echo "========================================"
}

# Function to compare file sizes
compare_sizes() {
    echo "📏 File size comparison:"
    echo "Source branch ($BRANCH_FROM):"
    git ls-tree -r -l $BRANCH_FROM -- $PACKAGE_DIR/ | awk '{print $4 " " $5}' | head -10
    echo ""
    echo "Target branch ($BRANCH_TO):"
    git ls-tree -r -l $BRANCH_TO -- $PACKAGE_DIR/ | awk '{print $4 " " $5}' | head -10
}

# Function to list all modified files
list_modified_files() {
    echo "🔄 All modified files that need migration:"
    git show --name-only --pretty=format:"" $BRANCH_TO..$BRANCH_FROM -- $PACKAGE_DIR/ | grep -v "^$" | sort | uniq | while read file; do
        echo "  - $file"
    done
}

# Function to verify migration
verify_migration() {
    local file="$1"
    if git diff --quiet $BRANCH_FROM -- "$file" 2>/dev/null; then
        echo "✅ $file is identical to source branch"
    else
        echo "❌ $file differs from source branch"
        echo "Differences:"
        git diff $BRANCH_FROM -- "$file"
    fi
}

# Function to run e2e tests
run_e2e_tests() {
    echo "🧪 Running e2e tests..."
    ./scripts/e2e-next-all.sh
}

# Export functions for use
export -f show_file_diff
export -f copy_file
export -f preview_file
export -f compare_sizes
export -f list_modified_files
export -f verify_migration
export -f run_e2e_tests

echo ""
echo "💡 Available functions:"
echo "  show_file_diff <file>      - Show diff for specific file"
echo "  copy_file <file>           - Copy file from source branch"
echo "  preview_file <file>        - Preview file from source branch"
echo "  verify_migration <file>    - Verify file matches source"
echo "  compare_sizes              - Compare file sizes"
echo "  list_modified_files        - List all modified files"
echo "  run_e2e_tests             - Run e2e tests"
echo ""
echo "📋 Example usage:"
echo "  show_file_diff packages/nextjs-mf/package.json"
echo "  copy_file packages/nextjs-mf/package.json"
echo "  preview_file packages/nextjs-mf/src/internal.ts"
echo "  verify_migration packages/nextjs-mf/package.json"
