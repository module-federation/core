const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    const remotes = {
      checkout: `checkout@http://localhost:3002/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      home_app: `home_app@http://localhost:3000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      shop: `shop@http://localhost:3001/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
    };

    config.plugins.push(
      new NextFederationPlugin({
        name: 'root-app',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          checkout: remotes.checkout,
          home: remotes.home_app,
        },
        exposes: {},
        // shared: ["react", "react-dom"],
        exposes: {
          './Button': './src/components/Button.tsx',
        },
        extraOptions: {
          exposePages: false,
        },
      }),
    );
    return config;
  },
};
