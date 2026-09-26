export type ProxyRule = {
  id: string;
  name: string;
  manifestUrl: string;
  enabled: boolean;
};

export type ProxyConsoleState = {
  open: boolean;
  rules: ProxyRule[];
  message: string;
  messageType: 'idle' | 'success' | 'error';
};

export type ProxyConsoleActions = {
  addRule(): void;
  clearRules(): void;
  close(): void;
  disableDebug(): void;
  removeRule(id: string): void;
  saveRules(): void;
  toggle(): void;
  updateRule(id: string, patch: Partial<Omit<ProxyRule, 'id'>>): void;
};
