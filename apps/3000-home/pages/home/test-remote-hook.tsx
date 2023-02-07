import { NextPage } from 'next';
import useCustomRemoteHook from 'shop/useCustomRemoteHook';

const TestRemoteHook: NextPage = () => {
  const text = useCustomRemoteHook();

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
