# Storybook addon for Module Federation

This addon enables to consume remote Module Federated apps/components

## Install

```shell
# with NPM
npm install @module-federation/storybook-addon

# with Yarn
yarn add @module-federation/storybook-addon
```

## Configuration

In file `./storybook/main.js`:

```js
const moduleFederationConfig = {
  // Module Federation config
};

const storybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    // other addons,
    {
      name: '@module-federation/storybook-addon',
      options: {
        moduleFederationConfig,
      },
    },
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5', // is required webpack 5 builder
  },
};

module.exports = storybookConfig;
```

---

### Rsbuild App or Rslib Module

```js
import { dirname, join } from 'node:path';
import type { StorybookConfig } from 'storybook-react-rsbuild';

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: {
    name: getAbsolutePath('storybook-react-rsbuild'),
    options: {},
  },
  addons: [
    {
      name: '@module-federation/storybook-addon/preset',
      options: {
        // add remote here and then you can load remote in your story
        remotes: {
          'rslib-module':
            'rslib-module@http://localhost:3000/mf/mf-manifest.json',
        },
      },
    },
  ],
};

export default config;

```

### For the [NX](https://nx.dev/getting-started/intro) projects:

Replace NX utils `withModuleFederation` in `webpack.config.js` with our utils `withModuleFederation`.
Example:

```javascript
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { withModuleFederation } = require('@module-federation/storybook-addon');

const baseConfig = require('./module-federation.config');

const config = {
  ...baseConfig,
};

module.exports = composePlugins(withNx(), withReact(), withModuleFederation(config));
```

In file `./storybook/main.js`:

```js
const nxModuleFederationConfig = {
  // Module Federation config
};

const storybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    // other addons,
    {
      name: '@module-federation/storybook-addon',
      options: {
        nxModuleFederationConfig,
      },
    },
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5', // is required webpack 5 builder
  },
};

module.exports = storybookConfig;
```

## Usage

```jsx
import React, { Suspense } from 'react';

const LazyButton = React.lazy(() => import('remote/Button'));

const Button = (props) => (
  <Suspense fallback={<p>Please wait...</p>}>
    <LazyButton {...props} />
  </Suspense>
);

export default {
  title: 'ModuleFederation/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({ variant: 'primary' });
Primary.args = {
  variant: 'primary',
  children: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Button',
};
```
