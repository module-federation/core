export type Route = {
  id: string;
  type: string;
  loader?: boolean;
  index?: boolean;
  isRoot?: boolean;
  children?: Route[];
};
export type MFModernRouteJson = {
  baseName: string;
  routes: Array<Route>;
  prefix: string;
};
