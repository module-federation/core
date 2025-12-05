import UiLib from 'ui-lib';
import { Button } from 'ui-lib-es';

export default () => {
  return `default Uilib has ${Object.values(UiLib).join(
    ', ',
  )} exports not treeshake, and ui-lib-es Button value is ${Button} should treeshake`;
};

export const dynamicUISpecificExport = async () => {
  const { List } = await import('ui-lib-dynamic-specific-export');
  return `dynamic Uilib has ${List} exports not treeshake`;
};
