/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/dependencies/ModuleDependency';
//@ts-ignore
import ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
//@ts-ignore
import makeSerializable = require('webpack/lib/util/makeSerializable');

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
