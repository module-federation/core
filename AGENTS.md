# AGENTS.md - Module Federation Core Repository Guidelines

## Build/Test Commands
```bash
pnpm build              # Build all packages (tag:type:pkg)
pnpm test               # Run all tests via nx
pnpm lint               # Lint all packages
pnpm lint-fix           # Fix linting issues
pnpm nx run <pkg>:test  # Test specific package
npx jest path/to/test.ts --no-coverage  # Run single test file
```

## Code Style
- **Imports**: External → SDK/core → Local (grouped with blank lines)
- **Type imports**: `import type { ... }` explicitly marked
- **Naming**: camelCase functions, PascalCase classes, SCREAMING_SNAKE constants
- **Files**: kebab-case or PascalCase for class files
- **Errors**: Use `@module-federation/error-codes`, minimal try-catch
- **Comments**: Minimal, use `//` inline, `/** */` for deprecation
- **Async**: Named async functions for major ops, arrow functions in callbacks
- **Exports**: Named exports preferred, barrel exports in index files
- **Package manager**: ALWAYS use pnpm, never npm
- **Parallelization**: Break tasks into 3-10 parallel subtasks minimum
