import { NextPage } from 'next';

let useCustomRemoteHook = require('shop/useCustomRemoteHook');

const TestRemoteHook: NextPage = () => {
  let text = useCustomRemoteHook.default();

  return (
    <>
      <div>
        Page with custom remote hook. You must see text in red box below:
      </div>
      <div style={{ border: '1px solid red', padding: 5 }}>{text}</div>
    </>
  );
};

export default TestRemoteHook;
