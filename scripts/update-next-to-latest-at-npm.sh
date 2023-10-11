#!/bin/bash
set -e

PACKAGES=(@bruno-module-federation/storybook-addon @bruno-module-federation/native-federation-tests @bruno-module-federation/native-federation-typescript @bruno-module-federation/nextjs-mf @bruno-module-federation/node @bruno-module-federation/utilities @bruno-module-federation/typescript)

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
