import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
);
const { Dependency } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class SharedEntryDependency extends Dependency {
  public name: string;
  public request: string;

  /**
   * @param {string} name entry name
   * @param {string} request the request of the entry
   */
  constructor(name: string, request: string) {
    super();
    this.name = name;
    this.request = request;
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `shared-entry-${this.name}`;
  }

  override get type(): string {
    return 'shared entry';
  }

  override get category(): string {
    return 'esm';
  }
}

makeSerializable(
  SharedEntryDependency,
  'enhanced/lib/container/SharedEntryDependency',
);

export default SharedEntryDependency;
