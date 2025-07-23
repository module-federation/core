# Rslib Nx Plugin

An Nx plugin that provides executors for building and developing with [Rslib](https://lib.rsbuild.dev/), a framework-agnostic library building solution.

## Executors

### Build (`rslib:build`)

Builds your library using Rslib.

**Options:**
- `configFile` (string): Path to the rslib config file (default: `rslib.config.ts`)
- `outputPath` (string): Output directory for build artifacts
- `watch` (boolean): Enable watch mode (default: `false`)
- `mode` (string): Build mode - `development` or `production` (default: `production`)
- `verbose` (boolean): Enable verbose logging (default: `false`)

**Example usage in `project.json`:**

```json
{
  "targets": {
    "build": {
      "executor": "rslib:build",
      "options": {
        "configFile": "rslib.config.ts",
        "mode": "production"
      }
    }
  }
}
```

### Dev (`rslib:dev`)

Runs Rslib in development mode with hot reloading.

**Options:**
- `configFile` (string): Path to the rslib config file (default: `rslib.config.ts`)
- `port` (number): Port to serve on (default: `3001`)
- `host` (string): Host to serve on (default: `localhost`)
- `open` (boolean): Open browser after starting (default: `false`)
- `mode` (string): Development mode - `watch` or `mf-dev` (default: `mf-dev`)
- `verbose` (boolean): Enable verbose logging (default: `false`)

**Example usage in `project.json`:**

```json
{
  "targets": {
    "dev": {
      "executor": "rslib:dev",
      "options": {
        "port": 3001,
        "mode": "mf-dev",
        "open": true
      }
    }
  }
}
```

### Echo (`rslib:echo`)

Simple echo executor for testing the plugin.

**Options:**
- `message` (string): Message to echo (default: `"Hello from rslib executor!"`)

## Usage

To use this plugin in your Nx workspace:

1. Install the required dependencies:
   ```bash
   npm install @rslib/core
   ```

2. Register the plugin in your `nx.json`:
   ```json
   {
     "plugins": ["tools/rslib-plugin"]
   }
   ```

3. Configure your project's `project.json` to use the rslib executors:
   ```json
   {
     "targets": {
       "build": {
         "executor": "rslib:build"
       },
       "dev": {
         "executor": "rslib:dev"
       }
     }
   }
   ```

4. Create an `rslib.config.ts` file in your project root:
   ```typescript
   import { defineConfig } from '@rslib/core';

   export default defineConfig({
     lib: [
       {
         format: 'esm',
         dts: true,
       },
       {
         format: 'cjs',
       }
     ],
   });
   ```

## Examples

### Building a library
```bash
nx run my-lib:build
```

### Running in development mode
```bash
nx run my-lib:dev
```

### Building with custom config
```bash
nx run my-lib:build --configFile=custom.rslib.config.ts
```

### Running in watch mode
```bash
nx run my-lib:dev --mode=watch
```

## Module Federation Support

This plugin supports Rslib's Module Federation capabilities. Use the `mf-dev` mode to run your federated modules:

```json
{
  "targets": {
    "mf-dev": {
      "executor": "rslib:dev",
      "options": {
        "mode": "mf-dev",
        "port": 3001
      }
    }
  }
}
```

## Requirements

- Nx >= 21.0.0
- @rslib/core >= 0.5.0
- Node.js >= 18.0.0