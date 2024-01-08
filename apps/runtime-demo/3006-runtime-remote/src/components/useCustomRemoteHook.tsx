import React, { useState, useEffect } from 'react';

function useCustomRemoteHook() {
  const [isOnline, setIsOnline] = useState(null);
  console.log(isOnline);
  useEffect(() => {
    console.log('some custom hook');
  }, []);

  return 'Custom hook from localhost:3006 works!';
}
export default useCustomRemoteHook;
