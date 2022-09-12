import { injectScript } from '../utils';

export type WebpackRemoteContainer = {
  get(modulePath: ModulePath): () => any;
};
export type NextRoute = string;
export type ModulePath = string;
export type RemoteData = {
  global: string;
  url: string;
};
export type PageMap = Record<NextRoute, ModulePath>;

export class RemoteContainer {
  global: string;
  url: string;
  container: WebpackRemoteContainer | undefined;
  pageMap: PageMap | undefined;

  static instances: Record<string, RemoteContainer> = {};

  static parseString(remoteStr: string): RemoteData | undefined {
    const [global, url] = remoteStr.split('@');
    return { global, url };
  }

  static createSingleton(remote: string | RemoteData) {
    let data: RemoteData | undefined;
    if (typeof remote === 'string') {
      data = this.parseString(remote);
    } else if (remote?.global && remote?.url) {
      data = { global: remote.global, url: remote.url };
    }

    if (!data) {
      console.error(
        `Cannot init RemoteContainer with following data`,
        RemoteContainer
      );
      throw Error(
        '[nextjs-mf] RemoteContainer.createSingleton(remote) accepts string "shop@http://example.com/_next/static/chunks/remoteEntry.js" OR object { global: "shop", url: "http://example.com/_next/static/chunks/remoteEntry.js"}'
      );
    }

    let container: RemoteContainer;
    if (this.instances[data.url]) {
      container = this.instances[data.url];
    } else {
      container = new RemoteContainer(data);
      this.instances[data.url] = container;
    }

    return container;
  }

  constructor(opts: RemoteData) {
    this.global = opts.global;
    this.url = opts.url;
  }

  async getContainer(): Promise<WebpackRemoteContainer> {
    if (this.container) {
      return this.container;
    }

    console.log(`Loading remote container: ${this.url}`);
    const container = await injectScript({
      global: this.global,
      url: this.url,
    });
    if (container) {
      this.container = container;
      console.log(`Remote container was loaded: ${this.global}`);
      return container;
    }

    throw Error(`[nextjs-mf] Remote container ${this.url} is empty`);
  }

  async getModule(modulePath: string, exportName?: string) {
    const container = await this.getContainer();
    const modFactory = await container.get(modulePath);
    if (!modFactory) return undefined;
    const mod = modFactory();
    if (exportName) {
      return mod && typeof mod === 'object' ? mod[exportName] : undefined;
    } else {
      return mod;
    }
  }

  async getPageMap(): Promise<PageMap | undefined> {
    if (this.pageMap) {
      return this.pageMap;
    }

    const pageMap = await this.getModule('./pages-map-v2', 'default');
    if (pageMap) {
      this.pageMap = pageMap;
    } else {
      this.pageMap = {};
      console.warn(`[nextjs-mf] Container `);
    }

    return this.pageMap;
  }
}
