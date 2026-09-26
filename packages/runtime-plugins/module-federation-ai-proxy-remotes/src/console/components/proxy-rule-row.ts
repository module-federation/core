import type { ProxyConsoleActions, ProxyRule } from '../types';

const createTextInput = (
  value: string,
  placeholder: string,
  onInput: (value: string) => void,
): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.placeholder = placeholder;
  input.addEventListener('input', () => onInput(input.value));
  return input;
};

export const createProxyRuleRow = (
  rule: ProxyRule,
  remoteNames: string[],
  actions: ProxyConsoleActions,
): HTMLElement => {
  const row = document.createElement('div');
  row.className = 'rule';

  const enabled = document.createElement('input');
  enabled.type = 'checkbox';
  enabled.checked = rule.enabled;
  enabled.title = 'Enable override';
  enabled.addEventListener('change', () =>
    actions.updateRule(rule.id, { enabled: enabled.checked }),
  );

  const name = document.createElement('select');
  name.title = 'Remote name';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select remote';
  placeholder.disabled = true;
  name.append(placeholder);
  const options =
    rule.name && !remoteNames.includes(rule.name)
      ? [rule.name, ...remoteNames]
      : remoteNames;
  options.forEach((remoteName) => {
    const option = document.createElement('option');
    option.value = remoteName;
    option.textContent = remoteName;
    name.append(option);
  });
  name.value = rule.name;
  name.addEventListener('change', () =>
    actions.updateRule(rule.id, { name: name.value }),
  );
  const manifest = createTextInput(
    rule.manifestUrl,
    'http://localhost:3001/mf-manifest.json',
    (value) => actions.updateRule(rule.id, { manifestUrl: value }),
  );

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove';
  remove.title = 'Remove rule';
  remove.textContent = '×';
  remove.addEventListener('click', () => actions.removeRule(rule.id));

  row.append(enabled, name, manifest, remove);
  return row;
};
