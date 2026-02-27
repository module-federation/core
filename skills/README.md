# MF Skills

This directory contains general diagnostic Skills for **Module Federation (open source)**, with no dependency on any company-internal infrastructure. They can be used in any MF-based project.

## Skill List

| Directory | Skill Name | Use Case |
|---|---|---|
| `context-fetcher/` | `mf-context` | Collects project MF configuration context; the data foundation for all diagnostic Skills |
| `bridge-usage/` | `mf-bridge-check` | Non-standard Bridge API usage, sub-app integration issues |
| `config-check/` | `mf-config-check` | exposes config format errors, path not found |
| `shared-deps/` | `mf-shared-deps` | Shared dependency version conflicts |
| `type-001/` | `mf-type-check` | TS type files missing, tsconfig not configured |
| `performance/` | `mf-perf` | Slow HMR, slow build speed |
| `version-compat/` | `mf-version-check` | MF package and build tool version mismatch |
| `runtime-008/` | `mf-runtime-008` | remoteEntry cannot be loaded (URL issues) |
| `module-info/` | `mf-module-info` | Fetch remote module metadata (publicPath, remoteEntry, type files, SSR) |

## Script Notes

Each diagnostic Skill runs in two steps: the Agent first calls the `mf-context` Skill to collect MFContext, then passes the MFContext as a JSON string via the `--context` argument to the corresponding `scripts/*.js`. Each diagnostic script is a standalone module with no dependency on the internal implementation of `context-fetcher`.
