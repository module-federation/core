#!/bin/bash

# Exit on error
set -e

# Function to get current branch name
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Function to get size of a directory
get_dir_size() {
    du -sb "$1" | cut -f1
}

# Function to build and measure
build_and_measure() {
    local branch=$1
    local output_dir="build_output_${branch}"

    echo "Building on branch: $branch"

    # Checkout branch
    git checkout "$branch"

    # Clean install dependencies
    echo "Installing dependencies..."
    pnpm install

    # Build packages
    echo "Building packages..."
    pnpm build:pkg

    # Build apps
    echo "Building apps..."
    pnpm app:next:build

    # Create output directory
    mkdir -p "$output_dir"

    # Find all dist directories and measure their sizes
    echo "Measuring build sizes..."
    find . -type d -name "dist" | while read -r dist_dir; do
        local size=$(get_dir_size "$dist_dir")
        local relative_path=$(realpath --relative-to=. "$dist_dir")
        echo "$relative_path: $size bytes" >> "$output_dir/sizes.txt"
    done

    echo "Build and measurement complete for $branch"
}

# Store current branch
CURRENT_BRANCH=$(get_current_branch)
MAIN_BRANCH="main"

# Create temporary directory for results
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Build and measure on main branch
build_and_measure "$MAIN_BRANCH"

# Build and measure on current branch
build_and_measure "$CURRENT_BRANCH"

# Compare results
echo -e "\n=== Size Comparison ==="
echo "Comparing builds between $MAIN_BRANCH and $CURRENT_BRANCH"
echo "----------------------------------------"

# Create a combined report
echo "Build Size Comparison Report" > "$TEMP_DIR/comparison.txt"
echo "Generated on: $(date)" >> "$TEMP_DIR/comparison.txt"
echo "----------------------------------------" >> "$TEMP_DIR/comparison.txt"
echo "" >> "$TEMP_DIR/comparison.txt"

# Compare each dist directory
while IFS=: read -r path size; do
    main_size=$(grep "^$path:" "build_output_$MAIN_BRANCH/sizes.txt" | cut -d' ' -f2 || echo "0")
    current_size=$(grep "^$path:" "build_output_$CURRENT_BRANCH/sizes.txt" | cut -d' ' -f2 || echo "0")

    if [ "$main_size" != "0" ] || [ "$current_size" != "0" ]; then
        diff=$((current_size - main_size))
        diff_percent=$((diff * 100 / main_size))

        echo "$path:" >> "$TEMP_DIR/comparison.txt"
        echo "  Main branch:   $(numfmt --to=iec $main_size)" >> "$TEMP_DIR/comparison.txt"
        echo "  Current branch: $(numfmt --to=iec $current_size)" >> "$TEMP_DIR/comparison.txt"
        echo "  Difference:    $(numfmt --to=iec $diff) ($diff_percent%)" >> "$TEMP_DIR/comparison.txt"
        echo "" >> "$TEMP_DIR/comparison.txt"
    fi
done < "build_output_$CURRENT_BRANCH/sizes.txt"

# Display results
cat "$TEMP_DIR/comparison.txt"

# Cleanup
echo -e "\nCleaning up..."
rm -rf "build_output_$MAIN_BRANCH" "build_output_$CURRENT_BRANCH"
rm -rf "$TEMP_DIR"

# Return to original branch
git checkout "$CURRENT_BRANCH"

echo -e "\nComparison complete! Results have been displayed above."
