import { assert, isPlainObject } from '../../utils';

export type Plugin<T extends Record<string, any>> = {
  [k in keyof T]?: Parameters<T[k]['on']>[0];
} & {
  name: string;
  version?: string;
};

export class PluginSystem<T extends Record<string, any>> {
  lifecycle: T;
  lifecycleKeys: Array<keyof T>;
  registerPlugins: Record<string, Plugin<T>> = {};

  constructor(lifecycle: T) {
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }

  applyPlugin(plugin: Plugin<T>): void {
    assert(isPlainObject(plugin), 'Plugin configuration is invalid.');
    // The plugin's name is mandatory and must be unique
    const pluginName = plugin.name;
    assert(pluginName, 'A name must be provided by the plugin.');

    if (!this.registerPlugins[pluginName]) {
      this.registerPlugins[pluginName] = plugin;

      Object.keys(this.lifecycle).forEach((key) => {
        const pluginLife = plugin[key as string];
        if (pluginLife) {
          this.lifecycle[key].on(pluginLife);
        }
      });
    }
  }

  removePlugin(pluginName: string): void {
    assert(pluginName, 'A name is required.');
    const plugin = this.registerPlugins[pluginName];
    assert(plugin, `The plugin "${pluginName}" is not registered.`);

    Object.keys(plugin).forEach((key) => {
      if (key !== 'name') {
        this.lifecycle[key].remove(plugin[key as string]);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  inherit<T extends PluginSystem<any>>({
    lifecycle,
    registerPlugins,
  }: T): void {
    Object.keys(lifecycle).forEach((hookName) => {
      assert(
        !this.lifecycle[hookName],
        `The hook "${
          hookName as string
        }" has a conflict and cannot be inherited.`,
      );
      (this.lifecycle as any)[hookName] = lifecycle[hookName];
    });

    Object.keys(registerPlugins).forEach((pluginName) => {
      assert(
        !this.registerPlugins[pluginName],
        `The plugin "${pluginName}" has a conflict and cannot be inherited.`,
      );
      this.applyPlugin(registerPlugins[pluginName]);
    });
  }
}
