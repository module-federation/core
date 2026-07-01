# Layer Architecture

Module Federation is organized as a one-way contract pipeline. Authoring and framework adapters normalize configuration, build integrations generate bundler artifacts and metadata, runtime bridges translate bundler calls, and `runtime-core` owns remote and shared dependency semantics.

## Table of Contents

- [Ownership Layers](#ownership-layers)
- [Layer Interaction Flow](#layer-interaction-flow)
- [Layer Handoff Sequence](#layer-handoff-sequence)
- [Layer-Aware Sharing](#layer-aware-sharing)
- [Layer Boundary Rules](#layer-boundary-rules)
- [Related Documentation](#related-documentation)

## Ownership Layers

| Layer | Packages | Responsibility |
| --- | --- | --- |
| Foundation and legacy utilities | `sdk`, `error-codes`, `utilities`, `core` | Shared types, manifest/snapshot helpers, environment utilities, React helper utilities, normalized webpack-path access, canonical error formatting, and legacy/simple runtime compatibility surfaces. |
| Runtime contract | `runtime-core`, `runtime`, `webpack-bundler-runtime`, `runtime-tools` | Container-compatible loading, shared dependency negotiation, instance/global state, runtime hooks, and webpack runtime bridging. |
| Build integrations | `enhanced`, `rspack`, `rsbuild-plugin`, `rspress-plugin`, `esbuild`, `metro`, Metro adapter packages | Convert bundler/framework config into remote entries, container references, share providers/consumers, manifests, runtime modules, Metro/Rock/RNEF/RNC-CLI behavior, and platform-specific loading. |
| Platform adapters | `nextjs-mf`, `node`, `modern-js`, `modern-js-v3`, bridge packages, `storybook-addon`, native-federation packages | Bind the build/runtime contract to framework lifecycles, SSR/server execution, React/Vue bridge rendering, native federation validation/type flows, Storybook, and application-specific conventions. |
| Metadata and type tooling | `manifest`, `managers`, `dts-plugin`, `third-party-dts-extractor`, `typescript`, `cli`, `create-module-federation` | Generate and consume manifests/stats, derive normalized config, publish/consume federated types, and expose CLI/scaffolding flows. |
| Observability and resilience | `observability-plugin`, `retry-plugin`, `devtools` | Runtime visibility, retry/fallback behavior, dependency graph UI, and browser extension/debugging surfaces. |
| Validation and product surfaces | `apps/*`, `playground`, `website-new`, `treeshake-*`, `assemble-release-plan`, `webpack/` | Examples, e2e fixtures, docs/playground delivery, federated tree-shaking services/UI, release planning, and compatibility fixtures. |

The central design rule is that lower layers receive normalized contracts rather than framework or bundler internals. Build integrations may inspect webpack, Rspack, Metro, or framework-specific state, but runtime packages should only see runtime records, manifests, snapshots, share scopes, hooks, and container-compatible factories.

## Layer Interaction Flow

```mermaid
flowchart LR
    subgraph Authoring["Authoring Layer"]
        UserConfig["module federation config<br/>remotes, exposes, shared, dts, manifest"]
        AppCode["application imports<br/>remote requests and shared packages"]
    end

    subgraph Normalize["Normalization and Metadata Layer"]
        Managers["managers<br/>normalized plugin options"]
        SDKTypes["sdk<br/>types, path helpers, manifest helpers"]
        Manifest["manifest<br/>stats and snapshot artifacts"]
        DTS["dts-plugin<br/>federated type artifacts"]
    end

    subgraph Build["Build Integration Layer"]
        Enhanced["enhanced / rspack<br/>container, reference, share plugins"]
        PlatformBuild["rsbuild, rspress, modern, next, node, metro, esbuild<br/>framework hooks"]
        RuntimeModules["generated runtime modules<br/>remote entries, share init, tree-shaking metadata"]
    end

    subgraph RuntimeLayer["Runtime Contract Layer"]
        BundlerRuntime["webpack-bundler-runtime<br/>bundler bridge"]
        Runtime["runtime<br/>singleton API"]
        RuntimeCore["runtime-core<br/>remote, shared, snapshot handlers"]
        GlobalState["global federation state<br/>instances, share scopes, manifests"]
    end

    UserConfig --> Managers
    UserConfig --> PlatformBuild
    AppCode --> Enhanced
    Managers --> Enhanced
    SDKTypes --> Managers
    SDKTypes --> Manifest
    Enhanced --> RuntimeModules
    Enhanced --> Manifest
    Enhanced --> DTS
    PlatformBuild --> Enhanced
    PlatformBuild --> Manifest
    RuntimeModules --> BundlerRuntime
    Manifest --> RuntimeCore
    BundlerRuntime --> Runtime
    Runtime --> RuntimeCore
    RuntimeCore --> GlobalState
    GlobalState --> AppCode

    style UserConfig fill:#fff2cc,stroke:#333,stroke-width:2px
    style Enhanced fill:#f8cecc,stroke:#333,stroke-width:2px
    style Manifest fill:#d5e8d4,stroke:#333,stroke-width:2px
    style RuntimeCore fill:#dae8fc,stroke:#333,stroke-width:3px
```

## Layer Handoff Sequence

```mermaid
sequenceDiagram
    participant Author as App / Package Author
    participant Adapter as Platform Adapter
    participant Build as Build Integration
    participant Metadata as Metadata Layer
    participant Bridge as Bundler Runtime Bridge
    participant Runtime as Runtime Layer
    participant Core as Runtime Core

    Author->>Adapter: framework config and federation options
    Adapter->>Build: normalized bundler hooks and environment targets
    Build->>Metadata: remotes, exposes, shared, assets, type settings
    Metadata-->>Build: manifest, stats, DTS, normalized manager output
    Build->>Bridge: generated remote entries and runtime modules
    Bridge->>Runtime: loadRemote / loadShare calls
    Runtime->>Core: ModuleFederation instance methods
    Core->>Core: RemoteHandler, SharedHandler, SnapshotHandler
    Core-->>Runtime: normalized module factory or shared factory
    Runtime-->>Bridge: runtime result
    Bridge-->>Author: application import resolves
```

## Layer-Aware Sharing

Shared `layer` and `issuerLayer` are build-time routing hints. They let framework integrations, especially Next.js and SSR-capable adapters, keep server/client or framework-specific sharing boundaries separate while still emitting ordinary shared records for the runtime.

```mermaid
flowchart LR
    Framework["framework adapter<br/>server/client/runtime layer names"] --> SharedConfig["SharedConfig<br/>layer and issuerLayer"]
    SharedConfig --> SharePlugin["SharePlugin<br/>consume and provide maps"]
    SharePlugin --> Provide["ProvideSharedPlugin<br/>match module.layer"]
    SharePlugin --> Consume["ConsumeSharedPlugin<br/>match contextInfo.issuerLayer"]
    Provide --> ProvidedModule["provided shared module<br/>layer-scoped"]
    Consume --> ConsumedModule["consume shared module<br/>issuer-scoped"]
    ProvidedModule --> RuntimeBridge["webpack-bundler-runtime<br/>preserve shareConfig.layer"]
    ConsumedModule --> RuntimeBridge
    RuntimeBridge --> RuntimeCore["runtime-core<br/>version and scope negotiation"]
```

Use layer fields when a bundler/framework has separate compilation surfaces that should not accidentally consume each other's shared implementation. Do not use them as a runtime policy replacement: runtime-core still sees normalized shared candidates and resolves them through scope, version, singleton, and strategy semantics.

## Layer Boundary Rules

- Build integrations may inspect bundler-specific objects, but they should emit normalized runtime data, manifest records, or generated runtime modules before crossing into runtime packages.
- Runtime packages should negotiate remotes and shared dependencies through `runtime-core` handlers and hooks. Platform adapters can add loading mechanics, but they should not invent a different container or share-scope contract.
- Metadata packages should describe artifacts and normalized config; they should not embed framework lifecycle policy.
- Runtime features that span layers, such as shared tree shaking, should keep build analysis in build packages and runtime selection in `runtime-core`.

## Related Documentation

- [Architecture Overview](./architecture-overview.md)
- [Plugin Architecture](./plugin-architecture.md)
- [Runtime Architecture](./runtime-architecture.md)
- [Shared Tree-Shaking Architecture](./shared-tree-shaking-architecture.md)
- [Manifest Specification](./manifest-specification.md)
