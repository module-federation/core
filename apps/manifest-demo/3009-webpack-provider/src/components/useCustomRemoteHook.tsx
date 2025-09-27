import React from 'react';

function useCustomRemoteHook() {
  const [isOnline, setIsOnline] = React.useState<null | boolean>(null);
  console.log(isOnline);
  React.useEffect(() => {
    console.log('some custom hook');
  }, []);

  return 'Custom hook from localhost:3009 works!';
}
export default useCustomRemoteHook;
