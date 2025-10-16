# Router Remote6 (React Router v7 Demo)

A Module Federation remote application demonstrating React Router v7 integration.

## Features

- 🎯 **React Router v7**: Latest routing capabilities with improved DX
- ⚡ **Module Federation**: Micro-frontend architecture
- 🔧 **Rsbuild**: Fast build tool with Rspack
- 🎨 **Emotion**: Styled components with great performance
- 🧩 **Bridge Components**: Seamless integration with host applications

## React Router v7 Highlights

This demo showcases React Router v7 new features:
- Enhanced data loading patterns
- Better TypeScript support  
- Improved error boundaries
- Future-ready APIs
- Better performance

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

The application exposes two federated modules:

- `./button`: A styled button component
- `./export-app`: The main app component with routing

## Configuration

The Module Federation configuration explicitly enables bridge router:

```typescript
bridge: {
  enableBridgeRouter: true, // ✅ Explicitly enable bridge router for React Router v7
}
```

## Routes

- `/` - Home page
- `/detail` - Detail page with sample content
- `/about` - About page explaining React Router v7 features

## Port

Development server runs on `http://localhost:2006`
