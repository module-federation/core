import type {
  AIDebugConsoleOptions,
  AIDebugRuntimePluginOptions,
} from '../core';
import { AI_DEBUG_CONSOLE_KEY } from '../core';
import {
  createEmptyRule,
  readAvailableRemoteNames,
  readProxyRules,
  validateProxyRules,
  writeProxyRules,
} from './storage';
import { renderProxyConsole } from './components/proxy-console';
import type { ProxyConsoleActions, ProxyConsoleState } from './types';

export const AI_DEBUG_CONSOLE_ELEMENT_ID = 'mf-ai-debug-console';

const mount = (
  consoleOptions: AIDebugConsoleOptions,
  pluginOptions: AIDebugRuntimePluginOptions,
): HTMLElement | undefined => {
  if (!document.body || document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)) {
    return undefined;
  }
  const host = document.createElement('div');
  host.id = AI_DEBUG_CONSOLE_ELEMENT_ID;
  host.style.position = 'relative';
  host.style.zIndex = String(consoleOptions.zIndex ?? 2147483647);
  const root = host.attachShadow({ mode: 'open' });
  const state: ProxyConsoleState = {
    open: consoleOptions.defaultOpen === true,
    rules: readProxyRules(
      sessionStorage,
      pluginOptions.storageKey ?? undefined,
    ),
    message: '',
    messageType: 'idle',
  };

  const render = () =>
    renderProxyConsole(root, state, readAvailableRemoteNames(), actions);
  const actions: ProxyConsoleActions = {
    addRule() {
      state.rules.push(createEmptyRule());
      render();
    },
    clearRules() {
      state.rules = [];
      writeProxyRules(sessionStorage, state.rules, pluginOptions);
      state.message = 'Overrides cleared.';
      state.messageType = 'success';
      render();
      if (consoleOptions.reloadOnSave !== false) {
        location.reload();
      }
    },
    close() {
      state.open = false;
      render();
    },
    disableDebug() {
      sessionStorage.removeItem(AI_DEBUG_CONSOLE_KEY);
      host.remove();
      if (consoleOptions.reloadOnSave !== false) {
        location.reload();
      }
    },
    removeRule(id) {
      state.rules = state.rules.filter((rule) => rule.id !== id);
      render();
    },
    saveRules() {
      const error = validateProxyRules(state.rules, pluginOptions.allowedHosts);
      if (error) {
        state.message = error;
        state.messageType = 'error';
        render();
        return;
      }
      writeProxyRules(sessionStorage, state.rules, pluginOptions);
      state.message = 'Overrides saved.';
      state.messageType = 'success';
      render();
      if (consoleOptions.reloadOnSave !== false) {
        location.reload();
      }
    },
    toggle() {
      state.open = !state.open;
      render();
    },
    updateRule(id, patch) {
      const rule = state.rules.find((item) => item.id === id);
      if (rule) {
        Object.assign(rule, patch);
        state.message = '';
        state.messageType = 'idle';
      }
    },
  };

  document.body.append(host);
  render();
  return host;
};

export const mountAIDebugConsole = (
  consoleOptions: AIDebugConsoleOptions = {},
  pluginOptions: AIDebugRuntimePluginOptions = {},
): void => {
  if (typeof document !== 'object' || typeof sessionStorage !== 'object') {
    return;
  }
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => mount(consoleOptions, pluginOptions),
      { once: true },
    );
  } else {
    mount(consoleOptions, pluginOptions);
  }
};
