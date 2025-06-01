# PNPM Workspace Configuration

This project uses pnpm workspaces to manage multiple packages efficiently.

## Workspace Structure

```
full-demo/
├── pnpm-workspace.yaml    # Workspace configuration
├── package.json           # Root package with workspace scripts
├── backend/               # Backend package (hmr-backend)
│   └── package.json
└── client/                # Client package (hmr-client-demo)
    └── package.json
```

## Benefits of Using PNPM Workspaces

1. **Efficient Dependency Management**: Shared dependencies are hoisted to reduce disk space
2. **Faster Installs**: Dependencies are linked rather than duplicated
3. **Simplified Commands**: Run commands across multiple packages with filters
4. **Better Monorepo Support**: Native support for managing multiple related packages

## Available Commands

### Installation
```bash
# Install all dependencies recursively
pnpm install --recursive
# or
pnpm run install:all
```

### Running Services
```bash
# Start backend only
pnpm --filter hmr-backend start
pnpm run start:backend

# Start client only
pnpm --filter hmr-client-demo start
pnpm run start:client

# Start both services
pnpm run start:all
pnpm run demo
```

### Development Mode
```bash
# Backend development with nodemon
pnpm --filter hmr-backend dev
pnpm run dev:backend

# Client development with webpack watch
pnpm --filter hmr-client-demo dev
pnpm run dev:client

# Build client
pnpm --filter hmr-client-demo build
pnpm run build:client
```

### Advanced Filter Usage

```bash
# Run a command in all packages
pnpm --recursive <command>

# Run a command in packages matching a pattern
pnpm --filter "*backend*" <command>

# Run a command in a specific package
pnpm --filter hmr-backend <command>
pnpm --filter hmr-client-demo <command>

# Install a dependency in a specific package
pnpm --filter hmr-backend add express
pnpm --filter hmr-client-demo add --save-dev webpack
```

## Package Names

- **Backend**: `hmr-backend`
- **Client**: `hmr-client-demo`

These names are defined in each package's `package.json` and used with the `--filter` flag.
