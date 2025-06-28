// Server-side only HMR API endpoint
// Leverages Next.js's built-in HMR infrastructure

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (process.env.NODE_ENV !== 'development') {
    return res
      .status(400)
      .json({ error: 'HMR API only available in development' });
  }

  const { action, targetPath, virtualChunkPath, modulePath } = req.body;

  try {
    console.log(`[Server HMR API] Processing action: ${action}`);

    switch (action) {
      case 'test':
        return res.json({
          success: true,
          message: 'Server HMR API is working',
          timestamp: new Date().toISOString(),
        });

      case 'cache-info':
        try {
          if (
            global.__NATIVE_SERVER_HMR__ &&
            global.__NATIVE_SERVER_HMR__.getCacheInfo
          ) {
            const result = global.__NATIVE_SERVER_HMR__.getCacheInfo();
            return res.json({
              success: true,
              result: {
                ...result,
                method: 'native-server-hmr-getCacheInfo',
              },
            });
          } else {
            // Fallback to manual cache info
            const cacheKeys = Object.keys(require.cache);
            const cwd = process.cwd();
            const userModules = cacheKeys.filter(
              (key) => key.startsWith(cwd) && !key.includes('node_modules'),
            );

            return res.json({
              success: true,
              result: {
                totalCacheSize: cacheKeys.length,
                userModules: userModules.length,
                workingDirectory: cwd,
                nodeEnv: process.env.NODE_ENV,
                method: 'fallback-require-cache',
                warning: 'Native Server HMR not initialized',
              },
            });
          }
        } catch (error) {
          return res.json({
            success: false,
            error: error.message,
          });
        }

      case 'clear-module-cache':
        if (!modulePath) {
          return res.status(400).json({
            error: 'modulePath is required for clear-module-cache',
          });
        }

        try {
          if (
            global.__NATIVE_SERVER_HMR__ &&
            global.__NATIVE_SERVER_HMR__.clearModuleCache
          ) {
            const result =
              global.__NATIVE_SERVER_HMR__.clearModuleCache(modulePath);
            return res.json({
              success: true,
              result: {
                ...result,
                modulePath,
                method: 'native-server-hmr-api',
              },
            });
          } else {
            return res.json({
              success: false,
              error: 'Native Server HMR not initialized',
              availableGlobals: Object.keys(global).filter((key) =>
                key.includes('HMR'),
              ),
            });
          }
        } catch (error) {
          return res.json({
            success: false,
            error: error.message,
          });
        }

      case 'reload-all':
        try {
          if (
            global.__NATIVE_SERVER_HMR__ &&
            global.__NATIVE_SERVER_HMR__.reloadAll
          ) {
            const result = global.__NATIVE_SERVER_HMR__.reloadAll();
            return res.json({
              success: true,
              result: {
                ...result,
                action: action,
              },
            });
          } else {
            return res.json({
              success: false,
              error: 'Native Server HMR not initialized',
              availableGlobals: Object.keys(global).filter((key) =>
                key.includes('HMR'),
              ),
            });
          }
        } catch (error) {
          return res.json({
            success: false,
            error: error.message,
          });
        }

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}`,
          availableActions: [
            'test',
            'cache-info',
            'clear-module-cache',
            'reload-all',
          ],
        });
    }
  } catch (error) {
    console.error('[Server HMR API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
