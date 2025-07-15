#!/bin/bash

# Script to strip Claude co-author lines from commit messages on current branch
# Usage: ./strip-claude-coauthor.sh

set -e

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
    echo "Error: Not on a branch (detached HEAD state)"
    exit 1
fi

echo "Current branch: $CURRENT_BRANCH"

# Find the merge base with main/master
if git show-ref --verify --quiet refs/remotes/origin/main; then
    BASE_BRANCH="origin/main"
elif git show-ref --verify --quiet refs/remotes/origin/master; then
    BASE_BRANCH="origin/master"
else
    echo "Error: Could not find origin/main or origin/master"
    exit 1
fi

MERGE_BASE=$(git merge-base $CURRENT_BRANCH $BASE_BRANCH)

if [ -z "$MERGE_BASE" ]; then
    echo "Error: Could not find merge base with $BASE_BRANCH"
    exit 1
fi

echo "Merge base: $MERGE_BASE"
echo "Base branch: $BASE_BRANCH"

# Check if there are any commits to rewrite
COMMIT_COUNT=$(git rev-list --count $MERGE_BASE..$CURRENT_BRANCH)

if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo "No commits to rewrite on current branch"
    exit 0
fi

echo "Found $COMMIT_COUNT commits to process"

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

# Run filter-branch to strip Claude co-author lines
echo "Rewriting commit messages..."
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter '
    sed "/🤖 Generated with \\[Claude Code\\]/d; /Co-Authored-By: Claude/d; /Co-authored-by: Claude/d"
' $MERGE_BASE..$CURRENT_BRANCH

echo "Successfully stripped Claude co-author lines from $COMMIT_COUNT commits"

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo "Restoring stashed changes..."
    git stash pop
fi

echo "Done! Use 'git push --force-with-lease origin $CURRENT_BRANCH' to update remote"
