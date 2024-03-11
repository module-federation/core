// 这个脚本的目的是： 全局插件注入很早，post message 发送消息，devtools 接收消息的监听器还没有运行，导致初始数据拿不到
// 为了获取初始数据，主动获取全局变量来发送消息
const moduleInfo = window?.__FEDERATION__?.moduleInfo;
window.postMessage(
  {
    moduleInfo,
  },
  '*',
);
