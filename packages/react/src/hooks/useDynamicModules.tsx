import { getModules } from '@module-federation/utilities';
import { useState } from 'react';
import { useEffect } from 'react';

// TODO - figure out types here, maybe an object input of modulePath + type instead of just path.
const useDynamicModules = () => {
  const [error, setError] = useState<Error>();
  const [modules, setModules] = useState<any[]>();

  useEffect(() => {
    getModules({
      remoteContainer: 'http://localhost:3001/remoteEntry.js',
      modulePaths: ['./test', '.test2'],
    })
      .then((dynamicModules) => {
        setModules(dynamicModules);
      })
      .catch((err) => {
        setError(err);
      });
  });

  return {
    modules,
    error,
  };
};

export default useDynamicModules;
