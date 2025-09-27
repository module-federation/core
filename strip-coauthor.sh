#!/bin/bash

# Strip Co-authored-by lines from commits authored by current user on current branch
# Excludes merge commits and commits from other authors

set -e

# Get current branch and user info
CURRENT_BRANCH=$(git branch --show-current)
USER_NAME=$(git config user.name)
USER_EMAIL=$(git config user.email)

echo "Current branch: $CURRENT_BRANCH"
echo "User: $USER_NAME <$USER_EMAIL>"
echo ""

# Get commits by current user on current branch (excluding merges)
COMMITS=$(git log --format="%H" --author="$USER_NAME" --no-merges $CURRENT_BRANCH ^main)

if [ -z "$COMMITS" ]; then
    echo "No commits by $USER_NAME found on branch $CURRENT_BRANCH"
    exit 0
fi

echo "Found commits by $USER_NAME on $CURRENT_BRANCH:"
git log --oneline --author="$USER_NAME" --no-merges $CURRENT_BRANCH ^main
echo ""

# Check if any commits have Co-authored-by lines
HAS_COAUTHOR=false
for commit in $COMMITS; do
    if git show --format="%B" -s "$commit" | grep -q "^Co-authored-by:"; then
        HAS_COAUTHOR=true
        break
    fi
done

if [ "$HAS_COAUTHOR" = false ]; then
    echo "No Co-authored-by lines found in your commits on this branch."
    exit 0
fi

echo "Found Co-authored-by lines in some commits. Proceeding with cleanup..."
echo ""

# Create a backup branch
BACKUP_BRANCH="${CURRENT_BRANCH}-backup-$(date +%s)"
git branch "$BACKUP_BRANCH"
echo "Created backup branch: $BACKUP_BRANCH"
echo ""

# Process commits in reverse order (oldest first)
COMMITS_REVERSE=$(echo "$COMMITS" | tac)

for commit in $COMMITS_REVERSE; do
    # Get the commit message
    COMMIT_MSG=$(git show --format="%B" -s "$commit")
    
    # Check if this commit has Co-authored-by lines
    if echo "$COMMIT_MSG" | grep -q "^Co-authored-by:"; then
        echo "Processing commit: $(git show --format="%h %s" -s "$commit")"
        
        # Remove Co-authored-by lines from commit message
        CLEAN_MSG=$(echo "$COMMIT_MSG" | grep -v "^Co-authored-by:" | sed '/^$/N;/^\n$/d')
        
        # Amend the commit with clean message
        git commit --amend --no-edit --message="$CLEAN_MSG" --quiet
        
        echo "  ✓ Removed Co-authored-by lines"
    fi
done

echo ""
echo "✅ Successfully stripped Co-authored-by lines from your commits on $CURRENT_BRANCH"
echo "📦 Backup created at: $BACKUP_BRANCH"
echo ""
echo "To restore if needed: git reset --hard $BACKUP_BRANCH"
echo "To delete backup: git branch -D $BACKUP_BRANCH"