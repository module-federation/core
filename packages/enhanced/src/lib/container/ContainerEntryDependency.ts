/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import { ExposeOptions } from './ContainerEntryModule';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
);
const { Dependency } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ContainerEntryDependency extends Dependency {
  public name: string;
  public exposes: [string, ExposeOptions][];
  public shareScope: string;
  public runtimePlugins: string[];
  public bundlerRuntimePath?: string;

  /**
   * @param {string} name entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   * @param {string[]} runtimePlugins Runtime plugin file paths or package name.
   * @param {string} bundlerRuntimePath bundler runtime path.
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
    runtimePlugins: string[],
    bundlerRuntimePath?: string,
  ) {
    super();
    this.name = name;
    this.exposes = exposes;
    this.shareScope = shareScope;
    this.runtimePlugins = runtimePlugins;
    this.bundlerRuntimePath = bundlerRuntimePath;
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `container-entry-${this.name}`;
  }

  override get type(): string {
    return 'container entry';
  }

  override get category(): string {
    return 'esm';
  }
}

makeSerializable(
  ContainerEntryDependency,
  'enhanced/lib/container/ContainerEntryDependency',
);

export default ContainerEntryDependency;
