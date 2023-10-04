import { sortNextPages } from './helpers';
import { RemotePages } from './RemotePages';

/**
 * Class which provides combined sorted list of local and remote routes.
 */
export class CombinedPages {
  /** Computable list of available local & remote pages in proper sorted order. */
  private sortedPageCache!: string[];

  /** List of pages that belongs to the current host application */
  private localPagesCache!: string[];

  /** List of known remote pages this list might be extent during runtime */
  private remotePagesCache!: string[];

  /** Nextjs getter which obtained from patchNextClientPageLoader */
  private localPagesGetter: () => Promise<string[]>;

  /** Loader of remote pages  */
  private remotePages: RemotePages;

  constructor(
    localPagesGetter: () => Promise<string[]>,
    remotePages: RemotePages,
  ) {
    this.localPagesGetter = localPagesGetter;
    this.remotePages = remotePages;
  }

  /**
   * Check that provided route belongs to host application
   */
  async isLocalRoute(route: string) {
    const localPages = await this.localPagesGetter();
    return localPages.includes(route);
  }

  /**
   * Return sorted list of local & remotes routes.
   * This method is used in patchNextClientPageLoader
   * for patching nextjs' getPageList method.
   */
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
    }
    return this.sortedPageCache;
  }
}
