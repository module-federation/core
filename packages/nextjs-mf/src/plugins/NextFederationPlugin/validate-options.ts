import { Compiler } from "webpack";
import { ModuleFederationPluginOptions } from "@module-federation/utilities";

/**
 * Utility function to validate compiler options.
 *
 * @param compiler - The Webpack compiler instance.
 * @returns True if the compiler options are valid, false otherwise.
 *
 * @remarks
 * This function validates the options passed to the Webpack compiler. It throws an error if the name
 * option is not defined in the options. It also checks if the name option is set to either "server" or
 * "client", as Module Federation is only applied to the main server and client builds in Next.js.
 */
export function validateCompilerOptions(compiler: Compiler): boolean {
  // Throw an error if the name option is not defined in the options
  if (!compiler.options.name) {
    throw new Error("name is not defined in Compiler options");
  }

  // Only apply Module Federation to the main server and client builds in Next.js
  return ["server", "client"].includes(compiler.options.name);
}

/**
 * Utility function to validate NextFederationPlugin options.
 *
 * @param options - The ModuleFederationPluginOptions instance.
 *
 * @remarks
 * This function validates the options passed to NextFederationPlugin. It throws an error if the filename
 * option is not defined in the options.
 *
 * A requirement for using Module Federation is that a name must be specified.
 */
export function validatePluginOptions(
  options: ModuleFederationPluginOptions
): void {
  // Throw an error if the filename option is not defined in the options
  if (!options.filename) {
    throw new Error("filename is not defined in NextFederation options");
  }

  // A requirement for using Module Federation is that a name must be specified
  if (!options.name) {
    throw new Error("Module federation \"name\" option must be specified");
  }
}
