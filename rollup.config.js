import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import { obfuscator } from "rollup-obfuscator";

export default {
  input: "src/NextFederationPlugin.js",
  output: {
    file: "lib/NextFederationPlugin.js",
    format: "cjs",
  },
  external: ["fs", "path", "webpack", "crypto", "next"], // tells Rollup 'I know what I'm doing here'
  plugins: [
    nodeResolve({ preferBuiltins: true }), // or `true`
    commonjs(),
    globals({
      dirname: false,
    }),
    builtins(),
    obfuscator(),
  ],
};
