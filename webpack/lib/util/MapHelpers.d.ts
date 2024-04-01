export function getOrInsert<K, V>(map: Map<K, V>, key: K, computer: () => V): V;
