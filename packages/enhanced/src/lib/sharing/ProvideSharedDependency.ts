/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');
const { Dependency } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/Dependency';

class ProvideSharedDependency extends Dependency {
  shareScope: string | string[];
  name: string;
  version: string | false;
  request: string;
  eager: boolean;
  requiredVersion: string | false;
  strictVersion: boolean;
  singleton: boolean;
  layer?: string;

  /**
   * @param {string|string[]} shareScope share scope
   * @param {string} name module name
   * @param {string | false} version version
   * @param {string} request request
   * @param {boolean} eager true, if this is an eager dependency
   * @param {boolean} requiredVersion version requirement
   * @param {boolean} strictVersion don't use shared version even if version isn't valid
   * @param {boolean} singleton use single global version
   * @param {string} [layer] layer information
   */
  constructor(
    shareScope: string | string[],
    name: string,
    version: string | false,
    request: string,
    eager: boolean,
    requiredVersion: string | false,
    strictVersion: boolean,
    singleton: boolean,
    layer?: string,
  ) {
    super();
    this.shareScope = shareScope;
    this.name = name;
    this.version = version;
    this.request = request;
    this.eager = eager;
    this.requiredVersion = requiredVersion;
    this.strictVersion = strictVersion;
    this.singleton = singleton;
    this.layer = layer;
  }

  override get type(): string {
    return 'provide shared module';
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    const scopeStr = Array.isArray(this.shareScope)
      ? this.shareScope.join('|')
      : this.shareScope;

    return `provide module (${scopeStr})${this.layer ? ` (${this.layer})` : ''} ${this.request} as ${
      this.name
    } @ ${this.version}${this.eager ? ' (eager)' : ''}`;
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    context.write(this.shareScope);
    context.write(this.name);
    context.write(this.version);
    context.write(this.request);
    context.write(this.eager);
    context.write(this.requiredVersion);
    context.write(this.strictVersion);
    context.write(this.singleton);
    context.write(this.layer);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedDependency} deserialize fallback dependency
   */
  static deserialize(
    context: ObjectDeserializerContext,
  ): ProvideSharedDependency {
    const { read } = context;
    const obj = new ProvideSharedDependency(
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
    );
    // @ts-expect-error - webpack serializer pattern requires static property
    this.shareScope = context.read();
    obj.deserialize(context);
    return obj;
  }
}

makeSerializable(
  ProvideSharedDependency,
  'enhanced/lib/sharing/ProvideSharedDependency',
);

export default ProvideSharedDependency;
