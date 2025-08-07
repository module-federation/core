#!/bin/bash

# Safe script to strip Claude co-author lines ONLY from commits authored by the current user
# This version includes additional safety checks to avoid modifying others' commits

set -e

# Get current user info
USER_EMAIL=$(git config user.email)
USER_NAME=$(git config user.name)

if [ -z "$USER_EMAIL" ] || [ -z "$USER_NAME" ]; then
    echo "Error: Git user.email and user.name must be configured"
    exit 1
fi

echo "Current user: $USER_NAME <$USER_EMAIL>"

# Parse arguments
DRY_RUN=false
BASE_BRANCH_ARG=""

for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            if [ -z "$BASE_BRANCH_ARG" ]; then
                BASE_BRANCH_ARG="$arg"
            fi
            shift
            ;;
    esac
done

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
    echo "Error: Not on a branch (detached HEAD state)"
    exit 1
fi

echo "Current branch: $CURRENT_BRANCH"

# Function to get base branch from PR if exists
get_pr_base_branch() {
    local current_branch="$1"
    
    # Check if gh CLI is available
    if ! command -v gh &> /dev/null; then
        echo "GitHub CLI (gh) not found, skipping PR detection"
        return 1
    fi
    
    # Try to get PR info for current branch
    local pr_info
    if pr_info=$(gh pr view "$current_branch" --json baseRefName 2>/dev/null); then
        local base_ref
        base_ref=$(echo "$pr_info" | jq -r '.baseRefName')
        if [ "$base_ref" != "null" ] && [ -n "$base_ref" ]; then
            echo "origin/$base_ref"
            return 0
        fi
    fi
    
    return 1
}

# Determine base branch
if [ -n "$BASE_BRANCH_ARG" ]; then
    BASE_BRANCH="$BASE_BRANCH_ARG"
    echo "Using provided base branch: $BASE_BRANCH"
elif PR_BASE=$(get_pr_base_branch "$CURRENT_BRANCH"); then
    BASE_BRANCH="$PR_BASE"
    echo "Detected PR base branch: $BASE_BRANCH"
else
    # Fallback to main/master detection
    if git show-ref --verify --quiet refs/remotes/origin/main; then
        BASE_BRANCH="origin/main"
    elif git show-ref --verify --quiet refs/remotes/origin/master; then
        BASE_BRANCH="origin/master"
    else
        echo "Error: Could not find origin/main or origin/master"
        exit 1
    fi
    echo "Using fallback base branch: $BASE_BRANCH"
fi

MERGE_BASE=$(git merge-base $CURRENT_BRANCH $BASE_BRANCH)

if [ -z "$MERGE_BASE" ]; then
    echo "Error: Could not find merge base with $BASE_BRANCH"
    exit 1
fi

echo "Merge base: $MERGE_BASE"
echo "Base branch: $BASE_BRANCH"

# Get all commits on current branch (excluding merge commits)
ALL_COMMITS=$(git rev-list --no-merges $MERGE_BASE..$CURRENT_BRANCH)

if [ -z "$ALL_COMMITS" ]; then
    echo "No commits to process on current branch"
    exit 0
fi

TOTAL_COMMITS=$(echo "$ALL_COMMITS" | wc -l)
echo "Found $TOTAL_COMMITS total non-merge commits on branch"

# Filter to only YOUR commits
echo ""
echo "=== FILTERING TO YOUR COMMITS ONLY ==="
YOUR_COMMITS=""
YOUR_COMMIT_COUNT=0

while IFS= read -r commit_hash; do
    if [ -z "$commit_hash" ]; then continue; fi
    
    # Get commit author email and name
    commit_author_email=$(git log --format="%ae" -n 1 "$commit_hash")
    commit_author_name=$(git log --format="%an" -n 1 "$commit_hash")
    
    # Only include commits authored by current user
    if [ "$commit_author_email" = "$USER_EMAIL" ] && [ "$commit_author_name" = "$USER_NAME" ]; then
        YOUR_COMMITS="$YOUR_COMMITS$commit_hash"$'\n'
        YOUR_COMMIT_COUNT=$((YOUR_COMMIT_COUNT + 1))
        echo "✓ $commit_hash $(git log --format=%s -n 1 "$commit_hash")"
    else
        echo "✗ $commit_hash $(git log --format=%s -n 1 "$commit_hash") [Author: $commit_author_name <$commit_author_email>] - SKIPPED"
    fi
done <<< "$ALL_COMMITS"

if [ $YOUR_COMMIT_COUNT -eq 0 ]; then
    echo "No commits authored by you found on this branch"
    exit 0
fi

# Check which of YOUR commits contain Claude co-author lines
echo ""
echo "=== YOUR COMMITS WITH CLAUDE CO-AUTHOR LINES ==="
CLAUDE_COMMITS=""
CLAUDE_COMMIT_COUNT=0

while IFS= read -r commit_hash; do
    if [ -z "$commit_hash" ]; then continue; fi
    
    commit_msg=$(git log --format=%B -n 1 "$commit_hash")
    if echo "$commit_msg" | grep -q -E "(🤖 Generated with \\[Claude Code\\]|Co-Authored-By: Claude|Co-authored-by: Claude)"; then
        CLAUDE_COMMITS="$CLAUDE_COMMITS$commit_hash"$'\n'
        CLAUDE_COMMIT_COUNT=$((CLAUDE_COMMIT_COUNT + 1))
        echo "📝 $commit_hash $(git log --format=%s -n 1 "$commit_hash")"
    fi
done <<< "$YOUR_COMMITS"

echo ""
echo "=== SAFETY SUMMARY ==="
echo "Current user: $USER_NAME <$USER_EMAIL>"
echo "Current branch: $CURRENT_BRANCH"
echo "Base branch: $BASE_BRANCH"
echo "Total commits on branch: $TOTAL_COMMITS"
echo "YOUR commits on branch: $YOUR_COMMIT_COUNT"
echo "YOUR commits with Claude co-author: $CLAUDE_COMMIT_COUNT"
echo "Other authors' commits: $((TOTAL_COMMITS - YOUR_COMMIT_COUNT)) (will be PRESERVED)"

if [ $CLAUDE_COMMIT_COUNT -eq 0 ]; then
    echo "No commits authored by you contain Claude co-author lines"
    exit 0
fi

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🔍 DRY RUN MODE - No changes will be made"
    echo "To actually strip Claude co-author lines, run without --dry-run flag"
    exit 0
fi

echo ""
echo "⚠️  WARNING: This will rewrite git history for commits authored by you only"
echo "Other authors' commits will be preserved unchanged"
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 1
fi

# Check for unstaged changes
if ! git diff-index --quiet HEAD --; then
    echo "Stashing unstaged changes..."
    git stash push -m "Auto-stash before stripping Claude co-author"
    STASHED=true
else
    STASHED=false
fi

# Remove any existing filter-branch backup
if git show-ref --verify --quiet refs/original/refs/heads/$CURRENT_BRANCH; then
    echo "Removing existing backup..."
    git update-ref -d refs/original/refs/heads/$CURRENT_BRANCH
fi

# Create a safer filter that only modifies commits by the current user
echo "Rewriting commit messages for YOUR commits only..."
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter "
    # Get current commit hash from environment
    commit_author_email=\$(git log --format='%ae' -n 1 \$GIT_COMMIT 2>/dev/null || echo '')
    commit_author_name=\$(git log --format='%an' -n 1 \$GIT_COMMIT 2>/dev/null || echo '')
    
    # Only modify commits by current user
    if [ \"\$commit_author_email\" = \"$USER_EMAIL\" ] && [ \"\$commit_author_name\" = \"$USER_NAME\" ]; then
        # Strip Claude co-author lines for current user's commits
        sed '/🤖 Generated with \\\\[Claude Code\\\\]/d; /Co-Authored-By: Claude/d; /Co-authored-by: Claude/d'
    else
        # Preserve other authors' commit messages unchanged
        cat
    fi
" $MERGE_BASE..$CURRENT_BRANCH

echo "Successfully processed $YOUR_COMMIT_COUNT of your commits (out of $TOTAL_COMMITS total)"
echo "Stripped Claude co-author lines from $CLAUDE_COMMIT_COUNT commits"

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo "Restoring stashed changes..."
    git stash pop
fi

echo ""
echo "✅ Done! Git history rewritten safely:"
echo "  - Only YOUR commits were modified"
echo "  - Other authors' commits were preserved unchanged"
echo "  - Merge commits were not touched"
echo ""
echo "Use 'git push --force-with-lease origin $CURRENT_BRANCH' to update remote"