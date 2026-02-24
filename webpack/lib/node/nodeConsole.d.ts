declare namespace _exports {
  export { InfrastructureLoggingNormalizedWithDefaults, LoggerConsole };
}
declare function _exports({
  colors,
  appendOnly,
  stream,
}: {
  colors?: boolean | undefined;
  appendOnly?: boolean | undefined;
  stream: InfrastructureLoggingNormalizedWithDefaults['stream'];
}): LoggerConsole;
export = _exports;
type InfrastructureLoggingNormalizedWithDefaults =
  import('../config/defaults').InfrastructureLoggingNormalizedWithDefaults;
type LoggerConsole = import('../logging/createConsoleLogger').LoggerConsole;
