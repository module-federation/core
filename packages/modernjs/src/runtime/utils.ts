export function transformName2Prefix(name: string) {
  const NameTransformSymbol = {
    AT: '@',
    HYPHEN: '-',
    SLASH: '/',
    UNDERLINE: '_',
  };
  const NameTransformMap = {
    [NameTransformSymbol.AT]: 'SCOPE',
    [NameTransformSymbol.HYPHEN]: 'HYPHEN',
    [NameTransformSymbol.SLASH]: 'SLASH',
    [NameTransformSymbol.UNDERLINE]: 'UNDERLINE',
  };
  const SPLIT_SYMBOL = '@';
  return `${name
    .replace(
      new RegExp(`${NameTransformSymbol.AT}`, 'g'),
      NameTransformMap[NameTransformSymbol.AT],
    )
    .replace(
      new RegExp(`${NameTransformSymbol.HYPHEN}`, 'g'),
      NameTransformMap[NameTransformSymbol.HYPHEN],
    )
    .replace(
      new RegExp(`${NameTransformSymbol.SLASH}`, 'g'),
      NameTransformMap[NameTransformSymbol.SLASH],
    )
    .replace(
      new RegExp(`${NameTransformSymbol.UNDERLINE}`, 'g'),
      NameTransformMap[NameTransformSymbol.UNDERLINE],
    )}${SPLIT_SYMBOL}`;
}
