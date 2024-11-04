const getDocsUrl = (errorCode: string) => {
  const type = errorCode.split('-')[0].toLowerCase();
  return `https://module-federation.io/guide/troubleshooting/${type}/${errorCode}`;
};

export const getShortErrorMsg = (
  errorCode: string,
  errorDescMap: Record<string, string>,
  args?: Record<string, unknown>,
  originalErrorMsg?: string,
) => {
  const msg = [`${[errorDescMap[errorCode]]} #${errorCode}`];
  args && msg.push(`args: ${JSON.stringify(args)}`);
  msg.push(getDocsUrl(errorCode));
  originalErrorMsg && msg.push(`Original Error Message:\n ${originalErrorMsg}`);
  return msg.join('\n');
};
