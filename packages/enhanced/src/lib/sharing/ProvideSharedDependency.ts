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

import {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from '../../declarations/plugins/container/Dependency';

class ProvideSharedDependency extends Dependency {
  shareScope: string;
  name: string;
  version: string | false;
  request: string;
  eager: boolean;

  /**
   * @param {string} shareScope share scope
   * @param {string} name module name
   * @param {string | false} version version
   * @param {string} request request
   * @param {boolean} eager true, if this is an eager dependency
   */
  constructor(
    shareScope: string,
    name: string,
    version: string | false,
    request: string,
    eager: boolean,
  ) {
    super();
    this.shareScope = shareScope;
    this.name = name;
    this.version = version;
    this.request = request;
    this.eager = eager;
  }

  override get type(): string {
    return 'provide shared module';
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `provide module (${this.shareScope}) ${this.request} as ${
      this.name
    } @ ${this.version}${this.eager ? ' (eager)' : ''}`;
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    context.write(this.shareScope);
    context.write(this.name);
    context.write(this.request);
    context.write(this.version);
    context.write(this.eager);
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
    );
    //@ts-ignore
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
