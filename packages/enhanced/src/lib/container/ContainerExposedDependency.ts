import { ModuleDependency, makeSerializable } from "webpack";
import {ObjectSerializerContext, ObjectDeserializerContext} from "./types"
/**
 * @extends {ModuleDependency}
 */
export class ContainerExposedDependency extends ModuleDependency {
	/**
	 * @param {string} exposedName public name
	 * @param {string} request request to module
	 */
	constructor(private exposedName: string, request: string) {
		super(request);
	}

	get type(): string {
		return "container exposed";
	}

	get category(): string {
		return "esm";
	}

	/**
	 * @returns {string | null} an identifier to merge equal requests
	 */getResourceIdentifier(): string | null {
		return `exposed dependency ${this.exposedName}=${this['request']}`;
	}

	/**
	 * @param {ObjectSerializerContext} context context
	 */
	serialize(context: ObjectSerializerContext): void {
		context.write(this.exposedName);
		super.serialize(context);
	}

	/**
	 * @param {ObjectDeserializerContext} context context
	 */
	deserialize(context: ObjectDeserializerContext): void {
		this.exposedName = context.read();
		super.deserialize(context);
	}
}

makeSerializable(
	ContainerExposedDependency,
	"webpack/lib/container/ContainerExposedDependency"
);

export default ContainerExposedDependency;

