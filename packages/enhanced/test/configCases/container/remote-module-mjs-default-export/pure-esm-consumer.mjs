import something from 'remote-esm-pkg/module';
import { namedExport } from 'remote-esm-pkg/module';

export function testDefaultImport() {
  return {
    defaultType: typeof something,
    defaultValue: typeof something === 'function' ? something() : something,
    namedExportValue: namedExport,
  };
}
