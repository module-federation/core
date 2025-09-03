declare module 'react-native/Libraries/Utilities/HMRClient' {
  // biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
  export default class HMRClient {
    static registerBundle(bundlePath: string): void;
    static setup(
      platform: string,
      bundleEntry: string,
      host: string,
      port: number | string,
      isEnabled: boolean,
      scheme?: string,
    ): void;
  }
}

declare module 'react-native/Libraries/Utilities/HMRClientProdShim' {
  export default class HMRClientProdShim {}
}

declare module 'react-native/Libraries/Core/Devtools/getDevServer' {
  export default function getDevServer(): {
    url: string;
  };
}
