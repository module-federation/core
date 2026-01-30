#!/bin/bash
set -e

source /etc/profile

nvm install 22

nvm use 22

echo 'node version is ' && node -v

npm i -g pnpm@10.18.1

pnpm i

npm run build
mkdir -p ./output
mkdir -p ./output_resource
cp -r ./dist/* ./output
cp -r ./dist/* ./output_resource
