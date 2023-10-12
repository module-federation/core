#!/bin/bash
set -e

PACKAGES=(@module-federation/storybook-addon @module-federation/native-federation-tests @module-federation/native-federation-typescript @module-federation/nextjs-mf @module-federation/node @module-federation/utilities @module-federation/typescript)

for package in "${PACKAGES[@]}"; do
  # Check if the package is published with "next" tag
  if npm view "$package" dist-tags | grep -q next; then
    echo "Updating $package from 'next' to 'latest'"
    npm dist-tag add "$package@$(npm dist-tag ls $package | grep next | awk '{print $NF}')" latest
    npm dist-tag rm "$package" next
  else
    echo "$package is not published with 'next' tag"
  fi
done
