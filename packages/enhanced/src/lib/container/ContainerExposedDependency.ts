/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import ModuleDependency, {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/dependencies/ModuleDependency';
import makeSerializable from 'webpack/lib/util/makeSerializable';

/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */

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
  'webpack/lib/container/ContainerExposedDependency',
);

export default ContainerExposedDependency;
