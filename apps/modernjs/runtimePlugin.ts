// import React from 'react';
// console.log(React);
console.log('runtime plugins active');
export default function () {
  return {
    name: 'eager-react-test-plugin',
    init(args) {
      return args;
    },
    beforeRequest(args) {
      return args;
    },
    resolveShare(args) {
      console.log(args);
      return args;
    },
  };
}
