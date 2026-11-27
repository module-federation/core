export = loadLoader;
/**
 * @param {LoaderObject} loader the loader to load
 * @param {(err?: Error) => void} callback callback
 * @returns {void}
 */
declare function loadLoader(loader: LoaderObject, callback: (err?: Error) => void): void;
declare namespace loadLoader {
    export { LoadedLoader };
}
import type { LoaderObject } from "./LoaderRunner";
type LoadedLoader = LoaderDefinition | RawLoaderDefinition | LoaderModule;
import type { LoaderDefinition } from "./LoaderRunner";
import type { RawLoaderDefinition } from "./LoaderRunner";
import type { LoaderModule } from "./LoaderRunner";
