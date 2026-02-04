import {
  DataPrefetch,
  EntryRuntime,
  Exposes,
  LibraryOptions,
} from './ModuleFederationPlugin';

export interface ContainerPluginOptions {
  /**
   * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
   */
  exposes: Exposes;
  /**
   * The filename for this container relative path inside the `output.path` directory.
   */
  filename?: string;
  /**
   * Options for library.
   */
  library?: LibraryOptions;
  /**
   * The name for this container.
   */
  name: string;
  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: EntryRuntime;
  /**
   * The name of the share scope which is shared with the host (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * Runtime plugin file paths or package name. Supports tuple [path, params].
   */
  runtimePlugins?: (string | [string, Record<string, unknown>])[];

  dataPrefetch?: DataPrefetch;
}
