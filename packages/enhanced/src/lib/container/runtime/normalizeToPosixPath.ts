import path from 'path';

function toPosixSeparators(value: string): string {
  return value.replace(/\\/g, '/').replace(/(?<!^)\/+/g, '/');
}

export function normalizeToPosixPath(value: string): string {
  const input = toPosixSeparators(path.normalize(value || ''));
  let result = toPosixSeparators(path.normalize(input));

  if (
    input.startsWith('./') &&
    !result.startsWith('./') &&
    !result.startsWith('..')
  ) {
    result = `./${result}`;
  } else if (input.startsWith('//') && !result.startsWith('//')) {
    result = input.startsWith('//./') ? `//.${result}` : `/${result}`;
  }

  return result;
}
