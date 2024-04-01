// The purpose of this script is: the global plug-in injection is very early, the post message sends the message, the devtools receives the message listener is not running, resulting in the initial data is not available
// To get the initial data, actively get the global variable to send the message
const moduleInfo = window?.__FEDERATION__?.moduleInfo;
window.postMessage(
  {
    moduleInfo,
  },
  '*',
);
