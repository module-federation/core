export { Stats } from "./stats";
import { Assets } from "./asset";
import { Chunks } from "./chunk";
import { Module } from "./module";
import { Origin } from "./origin";
import { WebpackModuleError } from "./error";
import { Warning } from "./warning";
import { Reason } from "./reason";
import { Dependency } from "./dependency";
import { Children } from "./children";
import { Issuer } from "./issuer";

export const types = [
  Stats,
  Assets,
  Chunks,
  Module,
  Origin,
  WebpackModuleError,
  Warning,
  Reason,
  Dependency,
  Children,
  Issuer,
]

export default types;
