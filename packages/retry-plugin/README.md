# @module-federation/retry-plugin

> A robust retry plugin for Module Federation that provides automatic retry mechanisms for failed module requests with domain rotation, cache-busting, and comprehensive error handling.

## Features

- 🔄 **Automatic Retry**: Automatically retries failed fetch and script requests
- 🌐 **Domain Rotation**: Rotate through multiple domains for better reliability
- ⚡ **Cache Busting**: Add query parameters to bypass cache issues
- 📊 **Lifecycle Callbacks**: Comprehensive callbacks for retry events
- 🎯 **Flexible Configuration**: Highly configurable retry strategies
- 🔧 **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install @module-federation/retry-plugin
# or
yarn add @module-federation/retry-plugin
# or
pnpm add @module-federation/retry-plugin
```

## Basic Usage

### Runtime Plugin Registration

```ts
import { createInstance } from '@module-federation/enhanced/runtime';
import { RetryPlugin } from '@module-federation/retry-plugin';

const mf = createInstance({
  name: 'host',
  remotes: [
    {
      name: 'remote1',
      entry: 'http://localhost:2001/mf-manifest.json',
    },
  ],
  plugins: [
    RetryPlugin({
      retryTimes: 3,
      retryDelay: 1000,
      domains: ['https://cdn1.example.com', 'https://cdn2.example.com'],
      manifestDomains: ['https://domain1.example.com', 'https://domain2.example.com'],
      addQuery: ({ times, originalQuery }) => `${originalQuery}&retry=${times}`,
      onRetry: ({ times, url }) => console.log('Retrying...', times, url),
      onSuccess: ({ url }) => console.log('Success!', url),
      onError: ({ url }) => console.log('Failed!', url),
    }),
  ],
});
```

### Build Plugin Registration

```ts
// webpack.config.js
import { ModuleFederationPlugin } from '@module-federation/webpack';
import { RetryPlugin } from '@module-federation/retry-plugin';

export default {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        remote1: 'remote1@http://localhost:2001/mf-manifest.json',
      },
      runtimePlugins: [path.join(__dirname, './src/runtime-plugin/retry.ts')],
    }),
  ],
};
```

```ts
// src/runtime-plugin/retry.ts
import { RetryPlugin } from '@module-federation/retry-plugin';

export default () =>
  RetryPlugin({
    retryTimes: 3,
    retryDelay: 1000,
    domains: ['https://cdn1.example.com', 'https://cdn2.example.com'],
    manifestDomains: ['https://domain1.example.com', 'https://domain2.example.com'],
    addQuery: ({ times, originalQuery }) => `${originalQuery}&retry=${times}`,
    onRetry: ({ times, url }) => console.log('Retrying...', times, url),
    onSuccess: ({ url }) => console.log('Success!', url),
    onError: ({ url }) => console.log('Failed!', url),
  });
```

## Configuration Options

### CommonRetryOptions

| Option            | Type                  | Default     | Description                              |
| ----------------- | --------------------- | ----------- | ---------------------------------------- |
| `retryTimes`      | `number`              | `3`         | Number of retry attempts                 |
| `retryDelay`      | `number`              | `1000`      | Delay between retries in milliseconds    |
| `successTimes`    | `number`              | `0`         | Number of successful requests required   |
| `domains`         | `string[]`            | `[]`        | Alternative domains for script resources |
| `manifestDomains` | `string[]`            | `[]`        | Alternative domains for manifest files   |
| `addQuery`        | `boolean \| function` | `false`     | Add query parameters for cache busting   |
| `fetchOptions`    | `RequestInit`         | `{}`        | Additional fetch options                 |
| `onRetry`         | `function`            | `undefined` | Callback when retry occurs               |
| `onSuccess`       | `function`            | `undefined` | Callback when request succeeds           |
| `onError`         | `function`            | `undefined` | Callback when all retries fail           |

### addQuery Function

```ts
addQuery: ({ times, originalQuery }) => {
  // Add retry count and timestamp for cache busting
  const separator = originalQuery ? '&' : '?';
  return `${originalQuery}${separator}retry=${times}&t=${Date.now()}`;
};
```

### Callback Functions

```ts
onRetry: ({ times, domains, url, tagName }) => {
  console.log(`Retry attempt ${times} for ${url}`);
  console.log(`Available domains: ${domains?.join(', ')}`);
},

onSuccess: ({ domains, url, tagName }) => {
  console.log(`Successfully loaded ${url}`);
  console.log(`Used domain: ${domains?.[0]}`);
},

onError: ({ domains, url, tagName }) => {
  console.error(`Failed to load ${url} after all retries`);
  console.error(`Tried domains: ${domains?.join(', ')}`);
}
```

## Advanced Examples

### Custom Retry Strategy

```ts
RetryPlugin({
  retryTimes: 5,
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // Exponential backoff
  domains: ['https://cdn1.example.com', 'https://cdn2.example.com', 'https://cdn3.example.com'],
  manifestDomains: ['https://api1.example.com', 'https://api2.example.com'],
  addQuery: ({ times, originalQuery }) => {
    const params = new URLSearchParams(originalQuery);
    params.set('retry', times.toString());
    params.set('cache_bust', Date.now().toString());
    return params.toString();
  },
  onRetry: ({ times, url, domains }) => {
    console.log(`Retry ${times}/5 for ${url}`);
    console.log(`Trying domain: ${domains?.[times % domains.length]}`);
  },
  onSuccess: ({ url, domains }) => {
    console.log(`✅ Successfully loaded ${url}`);
    console.log(`✅ Used domain: ${domains?.[0]}`);
  },
  onError: ({ url, domains }) => {
    console.error(`❌ Failed to load ${url} after all retries`);
    console.error(`❌ Tried all domains: ${domains?.join(', ')}`);
  },
});
```

### Error Handling with Fallback

```ts
RetryPlugin({
  retryTimes: 3,
  retryDelay: 1000,
  domains: ['https://cdn1.example.com', 'https://cdn2.example.com'],
  onError: ({ url, domains }) => {
    // Log error for monitoring
    console.error('Module loading failed:', { url, domains });

    // Send error to monitoring service
    if (window.gtag) {
      window.gtag('event', 'module_load_error', {
        event_category: 'module_federation',
        event_label: url,
        value: domains?.length || 0,
      });
    }

    // Show user-friendly error message
    const errorElement = document.createElement('div');
    errorElement.className = 'module-load-error';
    errorElement.innerHTML = `
      <div style="padding: 16px; border: 1px solid #ffa39e; border-radius: 4px; background: #fff1f0; color: #cf1322;">
        <h4>Module Loading Failed</h4>
        <p>Unable to load module: ${url}</p>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
    document.body.appendChild(errorElement);
  },
});
```

### Production Configuration

```ts
RetryPlugin({
  retryTimes: 3,
  retryDelay: 1000,
  domains: ['https://cdn1.prod.example.com', 'https://cdn2.prod.example.com', 'https://cdn3.prod.example.com'],
  manifestDomains: ['https://api1.prod.example.com', 'https://api2.prod.example.com'],
  addQuery: ({ times, originalQuery }) => {
    const params = new URLSearchParams(originalQuery);
    params.set('retry', times.toString());
    params.set('v', process.env.BUILD_VERSION || '1.0.0');
    return params.toString();
  },
  fetchOptions: {
    cache: 'no-cache',
    headers: {
      'X-Requested-With': 'ModuleFederation',
    },
  },
  onRetry: ({ times, url }) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Retry ${times} for ${url}`);
    }
  },
  onSuccess: ({ url }) => {
    // Track successful loads
    if (window.analytics) {
      window.analytics.track('module_loaded', { url });
    }
  },
  onError: ({ url, domains }) => {
    // Send error to monitoring service
    if (window.errorReporting) {
      window.errorReporting.captureException(new Error(`Module loading failed: ${url}`), { extra: { domains, url } });
    }
  },
});
```

## How It Works

1. **Fetch Retry**: Intercepts failed fetch requests for manifest files and retries with domain rotation
2. **Script Retry**: Intercepts failed script loading and retries with alternative domains
3. **Domain Rotation**: Cycles through provided domains to find working alternatives
4. **Cache Busting**: Adds query parameters to prevent cache-related issues
5. **Lifecycle Hooks**: Provides callbacks for monitoring and debugging

## Error Scenarios Handled

- Network timeouts and connection errors
- DNS resolution failures
- Server errors (5xx status codes)
- CDN failures and regional issues
- Cache-related loading problems
- CORS and security policy violations

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## TypeScript Support

The plugin includes full TypeScript definitions:

```ts
import { RetryPlugin, type CommonRetryOptions } from '@module-federation/retry-plugin';

const options: CommonRetryOptions = {
  retryTimes: 3,
  retryDelay: 1000,
  domains: ['https://cdn1.example.com'],
  onRetry: ({ times, url }) => {
    console.log(`Retry ${times} for ${url}`);
  },
};

const plugin = RetryPlugin(options);
```

## Migration Guide

### From v0.18.x to v0.19.x

The plugin configuration has been simplified. The old `fetch` and `script` configuration objects are deprecated:

```ts
// ❌ Old way (deprecated)
RetryPlugin({
  fetch: {
    url: 'http://localhost:2008/not-exist-mf-manifest.json',
    fallback: () => 'http://localhost:2001/mf-manifest.json',
  },
  script: {
    url: 'http://localhost:2001/static/js/async/src_App_tsx.js',
    customCreateScript: (url, attrs) => {
      /* ... */
    },
  },
});

// ✅ New way
RetryPlugin({
  retryTimes: 3,
  retryDelay: 1000,
  domains: ['http://localhost:2001'],
  manifestDomains: ['http://localhost:2001'],
  addQuery: ({ times, originalQuery }) => `${originalQuery}&retry=${times}`,
});
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](https://github.com/module-federation/core/blob/main/CONTRIBUTING.md) and submit pull requests to our [GitHub repository](https://github.com/module-federation/core).

## License

`@module-federation/retry-plugin` is [MIT licensed](https://github.com/module-federation/core/blob/main/packages/retry-plugin/LICENSE).

## Related

- [Module Federation Documentation](https://module-federation.io/)
- [Module Federation Runtime](https://www.npmjs.com/package/@module-federation/runtime)
- [Module Federation Enhanced](https://www.npmjs.com/package/@module-federation/enhanced)
