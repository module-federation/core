const disabled = 'Shared helpers are disabled by module-federation:no-shared.';

export function getRegisteredShare(): never {
  throw new Error(disabled);
}

export function getGlobalShareScope(): never {
  throw new Error(disabled);
}
