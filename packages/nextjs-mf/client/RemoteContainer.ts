import type {
  WebpackRemoteContainer,
  EventTypes,
  RemoteData,
  PageMap,
} from '@module-federation/utilities';

import EventEmitter from 'eventemitter3';

import { injectScript } from '../utils';

/**
 * This is a Lazy loader of webpack remote container with some NextJS-specific helper methods.
 *
 * It provides the ability to register remote, and load & init it on the first use.
 */
export class RemoteContainer {
  global: string;
  url: string;
  container: WebpackRemoteContainer | undefined;
  pageMap: PageMap | undefined;
  error?: Error;
  events: EventEmitter<EventTypes>;

  static instances: Record<string, RemoteContainer> = {};

  /**
   * Create or reuse existed remote entry.
   *
   * Be careful, Singleton pattern does not work well in webpack builds,
   * because one module may be copied between different chunks. In such a way
   * you obtain several lists of instances.
   */
  static createSingleton(remote: string | RemoteData) {
    let data: RemoteData | undefined;
    if (typeof remote === 'string') {
      const [global, url] = remote.split('@');
      data = { global, url };
    } else if (remote?.global && remote?.url) {
      data = { global: remote.global, url: remote.url };
    }

    if (!data) {
      console.error(
        `Cannot init RemoteContainer with following data`,
        RemoteContainer,
      );
      throw Error(
        '[nextjs-mf] RemoteContainer.createSingleton(remote) accepts string "shop@http://example.com/_next/static/chunks/remoteEntry.js" OR object { global: "shop", url: "http://example.com/_next/static/chunks/remoteEntry.js"}',
      );
    }

    let container: RemoteContainer;
    if (this.instances[data.global]) {
      container = this.instances[data.global];
    } else {
      container = new RemoteContainer(data);
      this.instances[data.global] = container;
    }

    return container;
  }

  constructor(opts: RemoteData) {
    this.global = opts.global;
    this.url = opts.url;
    this.events = new EventEmitter<EventTypes>();
  }

  /**
   * Check is the current remoteEntry.js loaded or not
   */
  isLoaded(): boolean {
    return !!this.container;
  }

  /**
   * Returns initialized webpack RemoteContainer.
   * If its' script does not loaded - then load & init it firstly.
   */
  async getContainer(): Promise<WebpackRemoteContainer> {
    if (this.container) {
      return this.container;
    }

    this.events.emit('loadStart', this);

    try {
      const container = await injectScript({
        global: this.global,
        url: this.url,
      });

      if (container) {
        this.container = container;
        this.events.emit('loadComplete', this);
        return container;
      }

      throw Error(`[nextjs-mf] Remote container ${this.url} is empty`);
    } catch (e) {
      this.error = e as Error;
      this.events.emit('loadError', (e as Error).message, this);
      throw e;
    }
  }

  /**
   * Return remote module from container.
   * If you provide `exportName` it automatically return exact property value from module.
   *
   * @example
   *   remote.getModule('./pages/index', 'default')
   */
  async getModule(modulePath: string, exportName?: string) {
    const container = await this.getContainer();
    const modFactory = await container.get(modulePath);
    if (!modFactory) {
      return undefined;
    }
    const mod = modFactory();
    if (exportName) {
      return mod && typeof mod === 'object' ? mod[exportName] : undefined;
    } else {
      return mod;
    }
  }

  /**
   * Retrieve registered nextjs' routes from remote app
   */
  async getPageMap(): Promise<PageMap | undefined> {
    if (this.pageMap) {
      return this.pageMap;
    }

    const pageMap = await this.getModule('./pages-map-v2', 'default');
    if (pageMap) {
      this.pageMap = pageMap;
    } else {
      this.pageMap = {};
      console.warn(
        `[nextjs-mf] Container ${this.global} does not expose "./pages-map-v2" module.`,
      );
    }

    return this.pageMap;
  }
}
