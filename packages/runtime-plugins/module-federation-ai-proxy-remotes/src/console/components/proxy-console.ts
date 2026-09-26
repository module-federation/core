import { consoleStyles } from '../styles';
import type { ProxyConsoleActions, ProxyConsoleState } from '../types';
import { createProxyRuleRow } from './proxy-rule-row';

const createButton = (
  label: string,
  className: string,
  action: () => void,
): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', action);
  return button;
};

export const renderProxyConsole = (
  root: ShadowRoot,
  state: ProxyConsoleState,
  remoteNames: string[],
  actions: ProxyConsoleActions,
): void => {
  root.replaceChildren();
  const style = document.createElement('style');
  style.textContent = consoleStyles;

  const trigger = createButton('MF', 'trigger', actions.toggle);
  trigger.title = 'Module Federation proxy console';

  const panel = document.createElement('section');
  panel.className = state.open ? 'panel' : 'panel hidden';
  const header = document.createElement('header');
  const titleWrap = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = 'Remote proxy overrides';
  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Route host remotes to local manifests';
  titleWrap.append(title, subtitle);
  header.append(titleWrap, createButton('Close', 'icon-button', actions.close));

  const content = document.createElement('div');
  content.className = 'content';
  if (state.rules.length) {
    state.rules.forEach((rule) =>
      content.append(createProxyRuleRow(rule, remoteNames, actions)),
    );
  } else {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No proxy overrides configured.';
    content.append(empty);
  }
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  toolbar.append(createButton('+ Add remote', 'button', actions.addRule));
  content.append(toolbar);

  const footer = document.createElement('footer');
  const message = document.createElement('div');
  message.className = `message ${state.messageType}`;
  message.textContent = state.message;
  const buttons = document.createElement('div');
  buttons.className = 'toolbar';
  buttons.append(
    createButton('Disable debug', 'button danger', actions.disableDebug),
    createButton('Clear', 'button danger', actions.clearRules),
    createButton('Save', 'button primary', actions.saveRules),
  );
  footer.append(message, buttons);
  panel.append(header, content, footer);
  root.append(style, trigger, panel);
};
