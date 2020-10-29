#!node
const { Command } = require("commander");
const program = new Command();
const path = require("path");
const fs = require("fs");

program.version(require(path.resolve(__dirname, "../package.json")).version);

const nextConfigJS = ({ name, port }) => `const {
  withModuleFederation,
  MergeRuntime,
} = require("@module-federation/nextjs-mf");
const path = require("path");

module.exports = {
  webpack: (config, options) => {
    const { buildId, dev, isServer, defaultLoaders, webpack } = options;
    const mfConf = {
      name: "${name}",
      library: { type: config.output.libraryTarget, name: "${name}" },
      filename: "static/runtime/remoteEntry.js",
      remotes: {
        // test1: isServer
        //   ? path.resolve(
        //       __dirname,
        //       "../test1/.next/server/static/runtime/remoteEntry.js"
        //     )
        //   : "test1", // for client, treat it as a global
      },
      exposes: {},
      shared: [],
    };

    // Configures ModuleFederation and other Webpack properties
    withModuleFederation(config, options, mfConf);

    config.plugins.push(new MergeRuntime());

    if (!isServer) {
      config.output.publicPath = "http://localhost:${port}/_next/";
    }

    return config;
  },
};`;

const documentJS = () => `import Document, { Html, Head, Main, NextScript } from "next/document";
import { patchSharing } from "@module-federation/nextjs-mf";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        {patchSharing()}
        {/* <script src="http://localhost:3000/_next/static/remoteEntryMerged.js" /> */}
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;`;

const upgrade = ({ port: p }) => {
  const port = p || 3000;

  const nextJSMFpkgJSON = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../package.json")).toString()
  );

  // Upgrade package.json
  const pkgJSON = JSON.parse(fs.readFileSync("package.json").toString());
  const name = pkgJSON.name;
  pkgJSON.resolutions = {
    webpack: "5.1.3",
  };
  pkgJSON.scripts.dev = `next dev -p ${port}`;
  pkgJSON.dependencies[
    "@module-federation/nextjs-mf"
  ] = `^${nextJSMFpkgJSON.version}`;
  fs.writeFileSync("package.json", JSON.stringify(pkgJSON, null, 2));

  fs.writeFileSync("next.config.js", nextConfigJS({ name, port }));
  fs.writeFileSync("pages/_document.js", documentJS({ name, port }));
};

program
  .command("upgrade")
  .description("upgrade the NextJS instance in the current directory")
  .option("-p, --port <port>", "port")
  .action(upgrade);

program.parse(process.argv);
