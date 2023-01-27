import { NextPage } from 'next';

let useCustomRemoteHook = import('shop/useCustomRemoteHook');
console.log('useCustomRemoteHook', useCustomRemoteHook);
console.log('useCustomRemoteHook resolve', useCustomRemoteHook.then(console.log));
const TestRemoteHook: NextPage = () => {
  let text;

  // if (process.browser) {
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   text = useCustomRemoteHook.default();
  // }



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
