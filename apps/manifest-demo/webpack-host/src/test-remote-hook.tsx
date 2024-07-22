import useCustomRemoteHook from 'remote1/useCustomRemoteHook';

// function RemoteHookText() {
//   // @ts-ignore ignore
//   const RemoteText = React.lazy(async () => {
//     //@ts-ignore
//     const useCustomRemoteHook = await loadRemote('app2/useCustomRemoteHook') as ()=>string;
//     console.log(111,useCustomRemoteHook)
//     const text = useCustomRemoteHook.default();
//     console.log(23424,text)
//     return text;
//   });
//   return (
//     <React.Suspense fallback="Loading Button">
//       <div style={{ border: '1px solid red', padding: 5 }}>{RemoteText}</div>
//     </React.Suspense>
//   );
// }

const TestRemoteHook = () => {
  const text = useCustomRemoteHook();

  return (
    <>
      <div>
        Page with custom remote hook. You must see text in red box below:
        <div
          className="remote1-text"
          style={{ border: '1px solid red', padding: 5 }}
        >
          {text}
        </div>
      </div>
    </>
  );
};

export default TestRemoteHook;
