import { ModuleFederationPluginOptions, NextFederationPluginExtraOptions } from "@module-federation/utilities";
import { Compiler } from "webpack";
import { regexEqual } from "./regex-equal";
import path from "path";

/**

 Apply automatic async boundary.
 @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 @param {NextFederationPluginExtraOptions} extraOptions - The NextFederationPluginExtraOptions instance.
 @param {Compiler} compiler - The Webpack compiler instance.
 @remarks This function applies an automatic async boundary to the Next.js application.
 */
export function applyAutomaticAsyncBoundary(
  options: ModuleFederationPluginOptions,
  extraOptions: NextFederationPluginExtraOptions,
  compiler: Compiler
) {
  const allowedPaths = ["pages/", "app/", "src/pages/", "src/app/"];

  const jsRules = compiler.options.module.rules.find((r) => {
    //@ts-ignore
    return r && r.oneOf;
  });

  //@ts-ignore
  if (jsRules?.oneOf) {
    // @ts-ignore
    const foundJsLayer = jsRules.oneOf.find((r) => {
      //@ts-ignore
      return regexEqual(r.test, /\.(tsx|ts|js|cjs|mjs|jsx)$/) && !r.issuerLayer;
    });

    if (foundJsLayer) {
      const loaderChain = Array.isArray(foundJsLayer.use)
        ? foundJsLayer.use
        : [foundJsLayer.use];

      // Add a new rule for pages that need async boundaries
      //@ts-ignore
      jsRules.oneOf.unshift({
        test: (request: string) => {
          if (
            allowedPaths.some((p) =>
              request.includes(path.join(compiler.context, p))
            )
          ) {
            return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(request);
          }
          return false;
        },
        exclude: [
          /node_modules/,
          /_document/,
          /_middleware/,
          /pages[\\/]middleware/,
          /pages[\\/]api/
        ],
        resourceQuery: (query: string) => !query.includes("hasBoundary"),
        use: [
          //@ts-ignore
          ...loaderChain,
          //@ts-ignore
          {
            // This loader auto-wraps page entrypoints
            // and re-exports them as a dynamic import so module sharing works without eager issues.
            loader: path.resolve(
              __dirname,
              "../../loaders/async-boundary-loader"
            )
          }
        ]
      });
    }
  }
}
