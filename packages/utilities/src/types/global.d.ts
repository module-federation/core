export {};

declare global {
  interface Window {
    [index: string | number]: any;
  }
}
