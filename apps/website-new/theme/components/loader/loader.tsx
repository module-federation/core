import React from 'react';
import styles from './loader.css?inline';

export default () => {
  return (
    <div className="inline-flex flex justify-center items-center gap-1">
      <div
        className={`inline-block bg-blue-gray-300 h-2 w-2 rounded-full animation animation--first`}
      ></div>
      <div
        className={`inline-block bg-blue-gray-500 h-2 w-2 rounded-full animation animation--second`}
      ></div>
      <div
        className={`inline-block bg-blue-gray-900 h-2 w-2 rounded-full animation animation--third`}
      ></div>
    </div>
  );
};
