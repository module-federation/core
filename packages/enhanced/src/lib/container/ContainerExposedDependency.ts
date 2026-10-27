/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/
import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack';
import { getWebpack, getWebpackModule } from '../webpack';

import makeSerializable from '../makeSerializable';
const ModuleDependency = getWebpackModule(
  getWebpack().dependencies?.ModuleDependency,
  'webpack/lib/dependencies/ModuleDependency',
  'webpack/lib/dependencies/core/ModuleDependency',
) as typeof import('webpack/lib/dependencies/ModuleDependency');

class ContainerExposedDependency extends ModuleDependency {
  exposedName: string;
  override request: string;

  /**
   * @param {string} exposedName public name
   * @param {string} request request to module
   */
  constructor(exposedName: string, request: string) {
    super(request);
    this.exposedName = exposedName;
    this.request = request;
  }

  override get type(): string {
    return 'container exposed';
  }

  override get category(): string {
    return 'esm';
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `exposed dependency ${this.exposedName}=${this.request}`;
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    context.write(this.exposedName);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   */
  override deserialize(context: ObjectDeserializerContext): void {
    this.exposedName = context.read();
    super.deserialize(context);
  }
}

makeSerializable(
  ContainerExposedDependency,
  'enhanced/lib/container/ContainerExposedDependency',
);

export default ContainerExposedDependency;
