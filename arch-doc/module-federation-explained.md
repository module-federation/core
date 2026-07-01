# Module Federation Explained

Module Federation lets independently built JavaScript applications share code at runtime. One application can load another application's modules after deployment, while both applications keep their own build, release, and ownership boundaries.

In this repository, Module Federation is not only a webpack plugin. It is a layered system: build plugins create containers and runtime metadata, manifests describe deployed applications, runtime packages load remote modules and shared dependencies, and platform adapters make the same contract work in browsers, servers, React Native, Next.js, Modern.js, Rsbuild, Rspack, Metro, and other hosts.

## Table of Contents

- [The Short Version](#the-short-version)
- [Real-World Scenario: Commerce Shell](#real-world-scenario-commerce-shell)
- [Core Concepts](#core-concepts)
- [What Happens at Build Time](#what-happens-at-build-time)
- [What Happens at Runtime](#what-happens-at-runtime)
- [Shared Dependencies](#shared-dependencies)
- [Manifests and Type Artifacts](#manifests-and-type-artifacts)
- [Platform Scenarios](#platform-scenarios)
- [How This Maps to the Repository](#how-this-maps-to-the-repository)
- [Where to Go Next](#where-to-go-next)

## The Short Version

A host application asks for code by name, such as `checkout/Button`. The host runtime finds the deployed checkout remote, initializes its container with the current share scope, asks the container for the exposed module, and executes the returned module factory.

```mermaid
flowchart LR
    Host["Host app<br/>shop.example.com"] --> Request["loadRemote('checkout/Button')"]
    Request --> RemoteEntry["checkout remoteEntry.js<br/>container contract"]
    RemoteEntry --> Exposed["exposed module factory<br/>./Button"]
    Exposed --> HostRender["host renders checkout button"]

    Host --> ShareScope["share scope<br/>react, react-dom, design system"]
    ShareScope --> RemoteEntry
```

The core contract is small:

- A remote exposes modules.
- A host consumes remotes.
- A container provides `init` and `get`.
- A share scope coordinates dependencies that should not be duplicated accidentally.
- A manifest can describe where deployed assets, types, and metadata live.

## Real-World Scenario: Commerce Shell

Module Federation is useful when several teams own different product areas but customers experience one application.

```mermaid
flowchart TB
    subgraph Customer["Customer Browser"]
        Shell["Storefront Shell<br/>navigation, auth, layout"]
        PDP["Product Detail<br/>remote module"]
        Cart["Cart Drawer<br/>remote module"]
        Checkout["Checkout Flow<br/>remote module"]
        Support["Support Widget<br/>remote module"]
    end

    subgraph Teams["Independent Teams and Deployments"]
        CatalogTeam["Catalog team<br/>deploys product remote"]
        CartTeam["Cart team<br/>deploys cart remote"]
        CheckoutTeam["Checkout team<br/>deploys checkout remote"]
        SupportTeam["Support team<br/>deploys support remote"]
    end

    Shell --> PDP
    Shell --> Cart
    Shell --> Checkout
    Shell --> Support
    CatalogTeam --> PDP
    CartTeam --> Cart
    CheckoutTeam --> Checkout
    SupportTeam --> Support
```

Each team can deploy independently as long as the remote keeps the exposed module contract the shell expects. The shell can compose those remotes without rebuilding every team into one deployment unit.

## Core Concepts

### Host, Remote, Expose, and Container

```mermaid
flowchart LR
    subgraph RemoteBuild["Remote build"]
        Source["source modules<br/>Button, routes, utilities"]
        Exposes["exposes config<br/>'./Button'"]
        Container["remote container<br/>init() and get()"]
        RemoteEntry["remoteEntry.js"]
    end

    subgraph HostBuild["Host build/runtime"]
        Remotes["remotes config<br/>checkout -> URL"]
        Import["import('checkout/Button')"]
        Runtime["federation runtime"]
    end

    Source --> Exposes --> Container --> RemoteEntry
    Import --> Runtime
    Remotes --> Runtime
    Runtime --> RemoteEntry
```

The remote build turns selected source modules into exposed factories. The host does not need those source files at build time; it needs a remote name, an exposed module request, and a way to locate the remote entry or manifest at runtime.

### Container Contract

```mermaid
sequenceDiagram
    participant Host as Host Runtime
    participant Container as Remote Container
    participant Scope as Share Scope
    participant Factory as Module Factory

    Host->>Container: init(shareScope)
    Container->>Scope: register / consume shared packages
    Host->>Container: get('./Button')
    Container-->>Host: factory
    Host->>Factory: factory()
    Factory-->>Host: module exports
```

The container contract is why Module Federation can work across framework adapters and bundlers: build integrations may differ, but the runtime exchange is still container initialization plus module factory lookup.

## What Happens at Build Time

Build integrations convert application config into assets and metadata that the runtime can understand.

```mermaid
flowchart TD
    Config["federation config<br/>name, remotes, exposes, shared, manifest, dts"] --> Adapter["framework / bundler adapter"]
    Adapter --> Plugin["ModuleFederationPlugin family"]
    Plugin --> ContainerPlugin["ContainerPlugin<br/>remote exposes"]
    Plugin --> ReferencePlugin["ContainerReferencePlugin<br/>host remotes"]
    Plugin --> SharePlugin["SharePlugin<br/>provides and consumes"]
    Plugin --> RuntimeModules["runtime modules<br/>federation bridge code"]
    Plugin --> Manifest["manifest / stats metadata"]
    Plugin --> Types["federated type artifacts"]

    ContainerPlugin --> RemoteEntry["remoteEntry.js"]
    ReferencePlugin --> HostBundle["host bundle references"]
    SharePlugin --> ShareInit["share initialization code"]
    RuntimeModules --> BundlerBridge["webpack-bundler-runtime or platform bridge"]
```

Build-time code is allowed to know about webpack, Rspack, Metro, Rsbuild, or framework hooks. Runtime code should receive normalized records and container-compatible factories instead of raw bundler internals.

## What Happens at Runtime

Runtime loading resolves the remote, loads metadata or entry assets, initializes the container, negotiates sharing, and returns the requested module.

```mermaid
sequenceDiagram
    participant App as Application Code
    participant Runtime as Runtime API
    participant Core as Runtime Core
    participant Snapshot as Snapshot / Manifest
    participant Remote as Remote Container
    participant Shared as Shared Handler

    App->>Runtime: loadRemote('checkout/Button')
    Runtime->>Core: instance.loadRemote()
    Core->>Snapshot: find remote entry and metadata
    Snapshot-->>Core: remote URL, version, assets
    Core->>Remote: load remoteEntry.js
    Core->>Remote: init(shareScope)
    Remote->>Shared: register shared providers
    Core->>Remote: get('./Button')
    Remote-->>Core: module factory
    Core-->>Runtime: module exports
    Runtime-->>App: Button component
```

The host can use the convenience API from `@module-federation/runtime`, while `@module-federation/runtime-core` owns the actual remote, shared, snapshot, and hook behavior.

## Shared Dependencies

Shared dependencies let independently built applications agree on packages such as React, React DOM, routing libraries, or design systems.

```mermaid
flowchart TD
    Host["Host provides<br/>react@19"] --> Scope["default share scope"]
    RemoteA["Product remote needs<br/>react ^19"] --> Scope
    RemoteB["Checkout remote needs<br/>react ^18 || ^19"] --> Scope
    Scope --> Strategy{"share strategy"}
    Strategy --> VersionFirst["version-first<br/>prefer compatible highest version"]
    Strategy --> LoadedFirst["loaded-first<br/>prefer already loaded singleton"]
    VersionFirst --> Selected["selected shared factory"]
    LoadedFirst --> Selected
    Selected --> Consumers["host and remotes use one negotiated implementation"]
```

Sharing is not just deduplication. It is runtime negotiation with version, singleton, required-version, strategy, scope, and fallback behavior. Advanced features such as shared tree shaking still pass through the same resolver instead of bypassing the share contract.

## Manifests and Type Artifacts

Manifests and type artifacts make the runtime and developer experience more explicit.

```mermaid
flowchart LR
    RemoteBuild["Remote build"] --> Manifest["mf-manifest.json<br/>entry, exposes, shared, assets"]
    RemoteBuild --> DTS["federated DTS artifacts<br/>remote module types"]

    Manifest --> HostRuntime["Host runtime<br/>snapshot and asset discovery"]
    DTS --> HostEditor["Host editor/build<br/>type-safe remote imports"]

    HostRuntime --> Load["load remote assets"]
    HostEditor --> DX["autocomplete and compile-time feedback"]
```

The manifest is runtime-oriented metadata. DTS artifacts are developer-oriented metadata. Both allow a host to consume a remote with less implicit knowledge about the remote's build output.

## Platform Scenarios

The same federation contract can appear in different deployment shapes.

```mermaid
flowchart TB
    subgraph Browser["Browser application"]
        BrowserHost["shell app"]
        BrowserRemote["remoteEntry.js over CDN"]
    end

    subgraph SSR["Server-rendered application"]
        ServerHost["Node / Next host"]
        ServerRemote["server remote container"]
        ClientHydration["client hydration assets"]
    end

    subgraph Native["Native / Metro application"]
        NativeHost["React Native host"]
        MetroRemote["Metro remote module registry"]
    end

    Contract["Federation contract<br/>remotes, exposes, shared, manifests, runtime hooks"]

    BrowserHost --> Contract
    BrowserRemote --> Contract
    ServerHost --> Contract
    ServerRemote --> Contract
    ClientHydration --> Contract
    NativeHost --> Contract
    MetroRemote --> Contract
```

Platform adapters handle the environment-specific lifecycle: browser script loading, server execution, Next.js server/client separation, Metro module registration, or framework route/data lifecycles. The shared architectural goal is to keep those platform concerns outside `runtime-core`.

## How This Maps to the Repository

```mermaid
flowchart LR
    Concept["Concept"] --> Build["Build plugins<br/>enhanced, rspack, rsbuild, metro, esbuild"]
    Concept --> Runtime["Runtime<br/>runtime-core, runtime, webpack-bundler-runtime"]
    Concept --> Metadata["Metadata<br/>manifest, managers, dts-plugin, sdk"]
    Concept --> Adapters["Platform adapters<br/>nextjs-mf, node, modern-js, bridge, native federation"]
    Concept --> Validation["Validation<br/>apps, e2e fixtures, treeshake demos, devtools"]

    Build --> RemoteEntries["remote entries and runtime modules"]
    Runtime --> Loading["loadRemote, loadShare, hooks, snapshots"]
    Metadata --> Discovery["manifests, normalized config, federated types"]
    Adapters --> Lifecycles["framework and platform lifecycles"]
    Validation --> Confidence["behavioral coverage and examples"]
```

Use this document as the conceptual entry point. Use the deeper architecture docs when you need package ownership, hook timing, runtime lifecycle, manifests, or advanced features.

## Where to Go Next

- [Architecture Overview](./architecture-overview.md) for the repository-wide package map.
- [Layer Architecture](./layers-architecture.md) for ownership boundaries and layer handoff diagrams.
- [Runtime Loading Contract](./runtime-loading-contract.md) for the detailed `loadRemote` and container lifecycle.
- [Runtime Architecture](./runtime-architecture.md) for runtime-core, runtime, global state, and hooks.
- [Plugin Architecture](./plugin-architecture.md) for build-time container, remote, and share plugins.
- [Manifest Specification](./manifest-specification.md) for manifest and snapshot metadata.
- [Shared Tree-Shaking Architecture](./shared-tree-shaking-architecture.md) for shared dependency pruning flows.
