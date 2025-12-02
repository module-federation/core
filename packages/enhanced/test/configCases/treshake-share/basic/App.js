import UiLib, { Button } from 'ui-lib';

export default () => {
  return `Uilib has ${Object.values(UiLib).join(
    ', ',
  )} exports, and Button value is ${Button}`;
};
