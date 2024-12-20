/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import { ExposeOptions } from './ContainerEntryModule';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import type { containerPlugin } from '@module-federation/sdk';

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
  public injectRuntimeEntry: string;
  /** Additional experimental options for container plugin customization */
  public experiments: containerPlugin.ContainerPluginOptions['experiments'];
  public dataPrefetch: containerPlugin.ContainerPluginOptions['dataPrefetch'];

  /**
   * @param {string} name entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   * @param {string[]} injectRuntimeEntry the path of injectRuntime file.
   * @param {containerPlugin.ContainerPluginOptions['experiments']} experiments additional experiments options
   * @param {containerPlugin.ContainerPluginOptions['dataPrefetch']} dataPrefetch whether enable dataPrefetch
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
    injectRuntimeEntry: string,
    experiments: containerPlugin.ContainerPluginOptions['experiments'],
    dataPrefetch: containerPlugin.ContainerPluginOptions['dataPrefetch'],
  ) {
    super();
    this.name = name;
    this.exposes = exposes;
    this.shareScope = shareScope;
    this.injectRuntimeEntry = injectRuntimeEntry;
    this.experiments = experiments;
    this.dataPrefetch = dataPrefetch;
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
