import UiLib, { Button } from 'ui-lib';

export default () => {
  return `Uilib has ${Object.keys(UiLib).length} exports, and Button value is ${Button}`;
};
