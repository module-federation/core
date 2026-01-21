type FederationRemoteConfig = {
  name?: string;
  alias?: string;
  global?: string;
  entry?: string;
};

type FederationInstance = {
  name?: string;
  options?: {
    remotes?: FederationRemoteConfig[];
  };
};

type FederationGlobal = {
  __INSTANCES__?: FederationInstance[];
};

type RscRuntimeState = {
  remoteRSCConfigs?: Map<string, unknown>;
  remoteMFManifests?: Map<string, unknown>;
  remoteServerActionsManifests?: Map<string, unknown>;
  remoteActionIndex?: Map<string, unknown>;
  registeredRemotes?: Set<string>;
  registeringRemotes?: Map<string, Promise<unknown>>;
};

declare global {
  var __FEDERATION__: FederationGlobal | undefined;
  var __RSC_MF_RUNTIME_STATE__: RscRuntimeState | undefined;
  var __RSC_SSR_REGISTRY__: Record<string, unknown> | undefined;
  var __RSC_SSR_MANIFEST__:
    | {
        additionalData?: {
          rsc?: { clientComponents?: Record<string, unknown> };
        };
        rsc?: { clientComponents?: Record<string, unknown> };
      }
    | undefined;
  var __MF_RSC_CLIENT_MANIFEST_REGISTRY__:
    | Map<string, Record<string, unknown>>
    | undefined;
  var __MF_RSC_CLIENT_MANIFEST_WAITERS__:
    | Map<
        string,
        {
          promise: Promise<Record<string, unknown>>;
          resolve: (value: Record<string, unknown>) => void;
        }
      >
    | undefined;
}

export {};
