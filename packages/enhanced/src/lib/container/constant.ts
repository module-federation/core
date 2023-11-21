import path from "path";

const FEDERATION_SUPPORTED_TYPES = ["script"];
const TEMP_DIR = path.join(`${process.cwd()}/node_modules`, `.federation`);

export {
  FEDERATION_SUPPORTED_TYPES,
  TEMP_DIR
}
