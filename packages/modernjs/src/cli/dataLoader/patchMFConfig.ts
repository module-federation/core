import path from 'path';
import { fs } from '@modern-js/utils';
import { MODERN_JS_ROUTE_SERVER_LOADER } from '../../constant';
import {
  MF_ROUTES,
  MODERN_JS_FILE_SYSTEM_ROUTES_FILE_NAME,
} from '../../constant';
import { generateRoutes } from './ast';
import { type moduleFederationPlugin } from '@module-federation/sdk';

type PatchMFConfigOptions = {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  metaName: string;
  isServer: boolean;
  internalDirectory: string;
  entries: Set<string>;
};

function generateExtraExposeFiles(options: PatchMFConfigOptions) {
  const { internalDirectory, mfConfig, isServer, entries } = options;
  const entryMap: {
    [entryName: string]: {
      routesPath: string;
      routeServerLoaderPath: string;
      clientRouteServerLoaderPath: string;
    };
  } = {};

  const outputDir = path.resolve(
    process.cwd(),
    'node_modules/.federation/data-loader',
  );
  fs.ensureDirSync(outputDir);
  const addSuffix = (fileName: string, ext = '.jsx') => {
    if (!isServer) {
      return `${fileName}${ext}`;
    }
    return `${fileName}.server${ext}`;
  };
  // add routes.js routes.server.js route-server-loader.js to exposes
  const generateEntryRoutes = (entry: string) => {
    const outputEntryDir = path.resolve(outputDir, entry);
    fs.ensureDirSync(outputEntryDir);

    const sourceDir = path.resolve(internalDirectory, entry);

    const routesFilePath = path.resolve(
      sourceDir,
      addSuffix(MODERN_JS_FILE_SYSTEM_ROUTES_FILE_NAME, '.js'),
    );
    const routesFileContent = fs.readFileSync(routesFilePath, 'utf-8');
    const outputFullRoutesPath = path.resolve(
      outputEntryDir,
      addSuffix(MF_ROUTES),
    );

    generateRoutes({
      sourceCode: routesFileContent,
      filePath: outputFullRoutesPath,
    });

    const routeServerLoaderPath = path.resolve(
      sourceDir,
      `${MODERN_JS_ROUTE_SERVER_LOADER}.js`,
    );
    const outputRouteServerLoaderPath = path.resolve(
      outputEntryDir,
      `${MODERN_JS_ROUTE_SERVER_LOADER}.js`,
    );
    const clientRouteServerLoaderPath = outputRouteServerLoaderPath.replace(
      MODERN_JS_ROUTE_SERVER_LOADER,
      `${MODERN_JS_ROUTE_SERVER_LOADER}-client`,
    );
    if (isServer) {
      const routeServerLoaderContent = fs.readFileSync(
        routeServerLoaderPath,
        'utf-8',
      );
      generateRoutes({
        sourceCode: routeServerLoaderContent,
        filePath: outputRouteServerLoaderPath,
      });
    } else {
      fs.writeFileSync(clientRouteServerLoaderPath, `export const routes = []`);
    }

    entryMap[entry] = {
      routesPath: outputFullRoutesPath,
      routeServerLoaderPath: outputRouteServerLoaderPath,
      clientRouteServerLoaderPath,
    };
  };
  entries.forEach((entry) => {
    generateEntryRoutes(entry);
  });

  return {
    entryMap,
  };
}
function addExpose(options: PatchMFConfigOptions) {
  const { mfConfig, isServer } = options;
  const { entryMap } = generateExtraExposeFiles(options);

  const addExposeByEntry = (
    entry: string,
    routesPath: string,
    routeServerLoaderPath: string,
    clientRouteServerLoaderPath: string,
  ) => {
    if (!mfConfig.exposes) {
      mfConfig.exposes = {};
    }

    const routesKey = `./${entry}/${MF_ROUTES}`;
    if (!mfConfig.exposes[routesKey]) {
      mfConfig.exposes[routesKey] = routesPath;
    }
    const routeServerLoaderKey = `./${entry}/${MODERN_JS_ROUTE_SERVER_LOADER}`;
    if (!mfConfig.exposes[routeServerLoaderKey]) {
      if (isServer) {
        mfConfig.exposes[routeServerLoaderKey] = routeServerLoaderPath;
      } else {
        mfConfig.exposes[routeServerLoaderKey] = clientRouteServerLoaderPath;
      }
    }
  };

  Object.keys(entryMap).forEach((entry) => {
    const { routesPath, routeServerLoaderPath, clientRouteServerLoaderPath } =
      entryMap[entry];
    addExposeByEntry(
      entry,
      routesPath,
      routeServerLoaderPath,
      clientRouteServerLoaderPath,
    );
  });
}
function addShared(options: PatchMFConfigOptions) {
  const { metaName, mfConfig } = options;
  const alias = `@${metaName}/runtime/router`;
  if (!mfConfig.shared) {
    mfConfig.shared = {
      [alias]: { singleton: true },
    };
  } else {
    if (!Array.isArray(mfConfig.shared)) {
      mfConfig.shared[alias] = { singleton: true };
    } else {
      mfConfig.shared.push(alias);
    }
  }
}

export function patchMFConfig(options: PatchMFConfigOptions) {
  addShared(options);
  addExpose(options);
}
