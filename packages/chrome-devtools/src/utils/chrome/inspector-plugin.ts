import type { FederationRuntimePlugin } from '@module-federation/runtime/types';
import type React from 'react';

import { definePropertyGlobalVal } from '../sdk';
import { __FEDERATION_DEVTOOLS__ } from '../../template';

const inspectorPluginPlugin = (): FederationRuntimePlugin => {
  return {
    name: 'mf-inspector-plugin',
    async onLoad(args) {
      let enableInspector = false;

      const devtoolsMessageStr = localStorage.getItem(__FEDERATION_DEVTOOLS__);
      if (devtoolsMessageStr) {
        try {
          const devtoolsMessage = JSON.parse(devtoolsMessageStr);
          enableInspector = devtoolsMessage?.enableInspector;
        } catch (e) {
          console.debug('Fast Refresh Plugin Error: ', e);
        }
      }
      if (!enableInspector) {
        return;
      }

      const { exposeModuleFactory, exposeModule, remote } = args;
      let react: typeof React;
      try {
        // eslint-disable-next-line prettier/prettier
        react = args.options.host.loadShareSync('react')() as typeof React;
      } catch (e) {
        console.error('Inspector failed! React lib not found!');
      }
      // @ts-expect-error if react not found, return
      if (!react) {
        return;
      }
      // @ts-expect-error set react lib
      window._mfReact = react;

      const isReactComponent = (
        component: any,
      ): component is React.Component => {
        const isFunctionComponent = (component: any) => {
          return (
            typeof component === 'function' &&
            !component.prototype?.isReactComponent && // 类组件会有 isReactComponent
            !component.prototype?.render // 类组件原型有 render 方法
          );
        };
        const isClassComponent = (component: any) => {
          return (
            typeof component === 'function' &&
            component.prototype?.isReactComponent === true &&
            component.prototype?.render !== undefined
          );
        };
        return isFunctionComponent(component) || isClassComponent(component);
      };
      const { wrapComponent } = await import(
        /* webpackMode: "eager" */ './ComponentInspector'
      );

      const getMod = (
        factory: () => React.Component | { default?: React.Component },
      ) => {
        const mod = factory();
        if ('default' in mod) {
          return mod.default;
        }
        return mod;
      };

      if (exposeModuleFactory) {
        let factory = () => {
          const mod = getMod(exposeModuleFactory);
          if (isReactComponent(mod) && 'name' in mod) {
            return () =>
              wrapComponent({
                react,
                //@ts-ignore
                CustomComponent: mod,
                //@ts-ignore
                componentName: mod.name,
                mfName: remote.name,
              });
          }
          // no handle element
          return mod;
        };
        return factory;
      }
      if (exposeModule) {
        if (isReactComponent(exposeModule) && 'name' in exposeModule) {
          return wrapComponent({
            react,
            //@ts-ignore
            CustomComponent: exposeModule,
            //@ts-ignore
            componentName: exposeModule.name,
            mfName: remote.name,
          });
        }
      }
      return;
    },
  };
};

if (!window?.__FEDERATION__) {
  definePropertyGlobalVal(window, '__FEDERATION__', {});
  definePropertyGlobalVal(window, '__VMOK__', window.__FEDERATION__);
}

if (!window?.__FEDERATION__.__GLOBAL_PLUGIN__) {
  window.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
}

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(inspectorPluginPlugin());
