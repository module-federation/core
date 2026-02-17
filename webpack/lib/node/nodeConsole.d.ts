declare function _exports({
  colors,
  appendOnly,
  stream,
}: {
  colors: any;
  appendOnly: any;
  stream: any;
}): {
  log: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  trace: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  logTime: (...args: any[]) => void;
  group: (...args: any[]) => void;
  groupCollapsed: (...args: any[]) => void;
  groupEnd: () => void;
  profile: (name: any) => void;
  profileEnd: (name: any) => void;
  clear: () => void;
  status: (...args: any[]) => void;
};
export = _exports;
