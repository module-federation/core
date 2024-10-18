declare const MODERN_ROUTER_ID_PREFIX: string | undefined;
export function withMFRouteId(id: string) {
  const prefix =
    typeof MODERN_ROUTER_ID_PREFIX === 'string' ? MODERN_ROUTER_ID_PREFIX : '';
  return prefix + id;
}
