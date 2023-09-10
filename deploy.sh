#!/usr/bin/env bash

DIR="$(dirname "$(realpath "$0")")"

bun run $DIR/index.ts
