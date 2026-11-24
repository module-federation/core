/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack';
import { getWebpack } from '../webpack';

import makeSerializable from '../makeSerializable';
const { Dependency } = getWebpack();

class FallbackDependency extends Dependency {
  requests: string[];

  /**
   * @param {string[]} requests requests
   */
  constructor(requests: string[]) {
    super();
    this.requests = requests;
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `fallback ${this.requests.join(' ')}`;
  }

  override get type(): string {
    return 'fallback';
  }

  override get category(): string {
    return 'esm';
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this.requests);
    super.serialize(context);
  }

  static deserialize(context: ObjectDeserializerContext): FallbackDependency {
    const { read } = context;
    const obj = new FallbackDependency(read());
    obj.deserialize(context);
    return obj;
  }
}

makeSerializable(
  FallbackDependency,
  'enhanced/lib/container/FallbackDependency',
);

export default FallbackDependency;
