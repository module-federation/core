# Module Federation Testing & Debugging Guide

A guide for testing and debugging Module Federation packages, framework integrations, runtime plugins, examples, and e2e fixtures across the current pnpm/Turbo monorepo.

## Table of Contents

- [Validation and Testing Strategy](./testing-strategy.md)
- [Runtime and Issue Debugging](./debugging-techniques.md)
- [Troubleshooting and Error Investigation](./troubleshooting-debugging.md)
- [Development Tools Debugging](./development-tools-debugging.md)
- [Performance and Dynamic Federation Debugging](./performance-debugging.md)

## Documentation Ownership

This file is intentionally only the index for the testing/debugging documentation set. Keep validation commands and test-surface routing in [testing-strategy.md](./testing-strategy.md), runtime debugging techniques in [debugging-techniques.md](./debugging-techniques.md), common issue investigation in [troubleshooting-debugging.md](./troubleshooting-debugging.md), browser/devtool utilities in [development-tools-debugging.md](./development-tools-debugging.md), and performance or dynamic federation tooling in [performance-debugging.md](./performance-debugging.md).

For docs-only architecture edits, no runtime checks are required by default. Formatting is still useful when markdown tables or Mermaid blocks are changed.
