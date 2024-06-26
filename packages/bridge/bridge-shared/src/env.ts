export function dispatchPopstateEnv() {
  const evt = new PopStateEvent('popstate', { state: window.history.state });
  window.dispatchEvent(evt);
}
