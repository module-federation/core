import { getModuleInfo } from '../index';

export interface FormItemStatus {
  keyStatus: boolean;
  valueStatus: boolean;
}

type ParametersTypeOfRoot = Parameters<typeof getModuleInfo>;
type ReturnTypeOfRoot = ReturnType<typeof getModuleInfo>;
export interface RootComponentProps {
  handleSnapshot?: (...args: ParametersTypeOfRoot) => Promise<ReturnTypeOfRoot>;
  versionList?: Array<Array<string>>;
  setVersionList?: React.Dispatch<React.SetStateAction<Array<Array<string>>>>;
  getVersion?: (moduleName: string) => Promise<Array<string>>;
  handleProxyAddress?: (address: string) => string;
  customValueValidate?: (schema: string) => boolean;
}
