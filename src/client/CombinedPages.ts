import { sortNextPages } from './helpers';
import { RemotePages } from './RemotePages';

export class CombinedPages {
  /**
   * Computable list of available local & remote pages in proper sorted order.
   */
  private sortedPageCache: string[];

  /**
   * List of pages that belongs to the current host application
   */
  private localPagesCache: string[];
  private remotePagesCache: string[];
  private localPagesGetter: () => Promise<string[]>;
  private remotePages: RemotePages;

  constructor(
    localPagesGetter: () => Promise<string[]>,
    remotePages: RemotePages
  ) {
    this.localPagesGetter = localPagesGetter;
    this.remotePages = remotePages;
  }

  async isLocalRoute(route: string) {
    const localPages = await this.localPagesGetter();
    return localPages.includes(route);
  }

  async getPageList(): Promise<string[]> {
    const localPages = await this.localPagesGetter();
    const remotePages = this.remotePages.getPageList();
    if (
      localPages !== this.localPagesCache ||
      remotePages !== this.remotePagesCache
    ) {
      this.localPagesCache = localPages;
      this.remotePagesCache = remotePages;
      this.sortedPageCache = sortNextPages([...localPages, ...remotePages]);
      console.log('SORTING PAGES!!!!');
    }
    console.log('Combined page list', this.sortedPageCache);
    return this.sortedPageCache;
  }
}
