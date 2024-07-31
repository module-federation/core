export type Route = {
  id: string;
  type: string;
  loader?: boolean;
  index?: boolean;
  isRoot?: boolean;
  children?: Route[];
};
export type MFModernRouteJson = {
  routes: Record<string, Route[]>;
  prefix: string;
};
