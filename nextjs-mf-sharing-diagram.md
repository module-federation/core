# Next.js Module Federation Plugin Sharing Mechanism Documentation

## Overview

This document details the sharing mechanism in the Next.js Module Federation plugin, showing how it handles sharing between client and server environments across Next.js versions 14 and 15.

## Architecture Flow Diagram

```mermaid
flowchart TB
    subgraph "Next.js MF Plugin Core"
        Plugin[NextFederationPlugin]
        Internal[internal.ts]
        Fragments[next-fragments.ts]
    end

    subgraph "Sharing Configuration"
        DSS[DEFAULT_SHARE_SCOPE]
        DSSB[DEFAULT_SHARE_SCOPE_BROWSER]
        RDS[retrieveDefaultShared]
    end

    subgraph "Environment Detection"
        IsServer{isServer?}
        ServerBuild[Server Build]
        ClientBuild[Client Build]
    end

    subgraph "Layer System (Next.js 15)"
        RSC[React Server Components - 'rsc']
        SSR[Server Side Rendering - 'ssr']
        Client[Client/Browser - undefined layer]
        ActionBrowser[Action Browser - 'action-browser']
        API[API Routes - 'api']
        Middleware[Middleware - 'middleware']
        Instrument[Instrumentation - 'instrument']
        EdgeAsset[Edge Assets - 'edge-asset']
        AppPages[App Pages Browser - 'app-pages-browser']
    end

    subgraph "Shared Modules"
        React[React Modules]
        NextModules[Next.js Modules]
        StyledJSX[styled-jsx]
    end

    subgraph "Server Sharing"
        ServerShared[Server Shared Config]
        ServerPlugins[applyServerPlugins]
        ServerExternals[handleServerExternals]
    end

    subgraph "Client Sharing"
        ClientShared[Client Shared Config]
        ClientPlugins[applyClientPlugins]
        ChunkCorrelation[ChunkCorrelationPlugin]
        InvertedContainer[InvertedContainerPlugin]
    end

    Plugin --> IsServer
    IsServer -->|Yes| ServerBuild
    IsServer -->|No| ClientBuild

    ServerBuild --> RDS
    ClientBuild --> RDS

    RDS -->|Server| DSS
    RDS -->|Client| DSSB

    Internal --> DSS
    Internal --> DSSB
    Fragments --> RDS

    DSS --> ServerShared
    DSSB --> ClientShared

    ServerShared --> ServerPlugins
    ServerPlugins --> ServerExternals

    ClientShared --> ClientPlugins
    ClientPlugins --> ChunkCorrelation
    ClientPlugins --> InvertedContainer

    React --> DSS
    React --> DSSB
    NextModules --> DSS
    NextModules --> DSSB
    StyledJSX --> DSS
    StyledJSX --> DSSB

    RSC -.->|Layer-based sharing| React
    SSR -.->|Layer-based sharing| React
    Client -.->|Layer-based sharing| React
```

## Sharing Configuration Details

```mermaid
graph LR
    subgraph "Shared Module Configuration"
        subgraph "Core React Modules"
            R1[react - singleton: true, requiredVersion: false, import: false]
            R2[react/ - singleton: true, requiredVersion: false, import: false]
            R3[react-dom - singleton: true, requiredVersion: false, import: false]
            R4[react-dom/ - singleton: true, requiredVersion: false, import: false]
            R5[react/jsx-runtime - singleton: true, requiredVersion: false]
            R6[react/jsx-dev-runtime - singleton: true, requiredVersion: false]
        end

        subgraph "Next.js Modules"
            N1[next/dynamic - singleton: true, import: undefined]
            N2[next/head - singleton: true, import: undefined]
            N3[next/link - singleton: true, import: undefined]
            N4[next/router - singleton: true, requiredVersion: false]
            N5[next/image - singleton: true, import: undefined]
            N6[next/script - singleton: true, import: undefined]
        end

        subgraph "Styled JSX"
            S1[styled-jsx - singleton: true, versioned]
            S2[styled-jsx/style - singleton: true, import: false, versioned]
            S3[styled-jsx/css - singleton: true, versioned]
        end
    end
```

## Environment-Specific Sharing Flow

```mermaid
sequenceDiagram
    participant Plugin as NextFederationPlugin
    participant Compiler as Webpack Compiler
    participant RDS as retrieveDefaultShared
    participant Server as Server Environment
    participant Client as Client Environment

    Plugin->>Compiler: Check environment (isServer)
    
    alt Server Build
        Compiler->>Plugin: isServer = true
        Plugin->>RDS: retrieveDefaultShared(true)
        RDS->>Plugin: Return DEFAULT_SHARE_SCOPE
        Plugin->>Server: Apply server-specific configuration
        Server->>Server: Set import: false for Next internals
        Server->>Server: Configure externals handling
        Server->>Server: Add node runtime plugin
    else Client Build
        Compiler->>Plugin: isServer = false
        Plugin->>RDS: retrieveDefaultShared(false)
        RDS->>Plugin: Return DEFAULT_SHARE_SCOPE_BROWSER
        Plugin->>Client: Apply client-specific configuration
        Client->>Client: Set import: undefined for all modules
        Client->>Client: Apply ChunkCorrelationPlugin
        Client->>Client: Apply InvertedContainerPlugin
    end
```

## Layer-Based Sharing (Next.js 15)

### Layer Definitions Table

| Layer Name | Key | Description | Usage |
|------------|-----|-------------|-------|
| Shared | `shared` | Shared code between client and server bundles | Common utilities |
| React Server Components | `rsc` | Server-only runtime for RSC | App Router RSC pages |
| Server Side Rendering | `ssr` | SSR layer for app directory | Server-rendered pages |
| Action Browser | `action-browser` | Browser client bundle for actions | Server actions client |
| API | `api` | API routes layer | API endpoints |
| Middleware | `middleware` | Middleware code layer | Edge middleware |
| Instrumentation | `instrument` | Instrumentation hooks | Monitoring/telemetry |
| Edge Asset | `edge-asset` | Assets on the edge | Edge-optimized assets |
| App Pages Browser | `app-pages-browser` | Browser client bundle for App | Client-side app pages |

### Module Sharing by Environment

| Module | Server (DEFAULT_SHARE_SCOPE) | Client (DEFAULT_SHARE_SCOPE_BROWSER) | Notes |
|--------|------------------------------|--------------------------------------|-------|
| react | `import: false` | `import: undefined` | External on server |
| react-dom | `import: false` | `import: undefined` | External on server |
| next/router | `import: undefined` | `import: undefined` | Bundled in both |
| next/link | `import: undefined` | `import: undefined` | Bundled in both |
| next/dynamic | `import: undefined` | `import: undefined` | Bundled in both |
| styled-jsx | `import: undefined` | `import: undefined` | Versioned sharing |

### Layer-Based Sharing Configuration (Currently Commented Out)

```javascript
// Example of layer-based sharing for React
const reactShares = {
  'react-rsc': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    layer: 'rsc',
    issuerLayer: 'rsc'
  },
  'react-ssr': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    layer: 'ssr',
    issuerLayer: 'ssr'
  },
  'react': {
    singleton: true,
    requiredVersion: false,
    import: false,
    layer: undefined,
    issuerLayer: undefined
  }
}
```

## Key Differences Between Next.js 14 and 15

| Aspect | Next.js 14 | Next.js 15 | Notes |
|--------|------------|------------|-------|
| Sharing Mechanism | Traditional sharing | Layer-aware sharing (prepared) | Same core implementation |
| External Handling | Standard externals | Dynamic externals detection | Improved in 8.7.1 |
| Layer Support | Basic layers | Full layer system | RSC, SSR, etc. |
| Runtime Plugins | Standard plugins | Same + Universe tracking | Enhanced tracking |

## Plugin Application Flow

```mermaid
stateDiagram-v2
    [*] --> Initialize: NextFederationPlugin
    Initialize --> ValidateOptions
    ValidateOptions --> DetectEnvironment
    
    DetectEnvironment --> ServerConfig: isServer = true
    DetectEnvironment --> ClientConfig: isServer = false
    
    ServerConfig --> RetrieveServerShared
    RetrieveServerShared --> ApplyServerPlugins
    ApplyServerPlugins --> ConfigureExternals
    ConfigureExternals --> AddNodeRuntime
    AddNodeRuntime --> ApplyModuleFederation
    
    ClientConfig --> RetrieveClientShared
    RetrieveClientShared --> ApplyClientPlugins
    ApplyClientPlugins --> SetLibraryWindow
    SetLibraryWindow --> AddChunkCorrelation
    AddChunkCorrelation --> AddInvertedContainer
    AddInvertedContainer --> ApplyModuleFederation
    
    ApplyModuleFederation --> ConfigureLayers
    ConfigureLayers --> [*]
```

## Runtime Plugin Sharing Resolution

```mermaid
flowchart TD
    Start[resolveShare Called] --> CheckPkg{Is React/Next pkg?}
    CheckPkg -->|No| Return[Return unchanged]
    CheckPkg -->|Yes| GetHost[Get Federation Host]
    GetHost --> CheckHost{Host exists?}
    CheckHost -->|No| Return
    CheckHost -->|Yes| CheckShared{Has shared config?}
    CheckShared -->|No| Return
    CheckShared -->|Yes| SetResolver[Set custom resolver]
    SetResolver --> UpdateScope[Update share scope map]
    UpdateScope --> End[Return modified args]
```

## Summary

The Next.js Module Federation plugin uses a sophisticated sharing mechanism that:

1. **Maintains consistency** across Next.js versions 14 and 15
2. **Differentiates** between server and client environments
3. **Prepares** for layer-based sharing in Next.js 15 (currently commented out)
4. **Handles** React and Next.js internals specially to ensure proper module resolution
5. **Uses** runtime plugins to dynamically resolve shared modules

The main distinction is not between Next.js versions but between server and client builds, with server builds treating React/Next internals as external modules (`import: false`) while client builds bundle them (`import: undefined`).

## Detailed Correlation: Next.js 14 vs 15 Sharing Internals

```mermaid
graph TB
    subgraph "Next.js 14 & 15 Common Core"
        subgraph "internal.ts (Shared by both versions)"
            DS14[DEFAULT_SHARE_SCOPE]
            DSB14[DEFAULT_SHARE_SCOPE_BROWSER]
            subgraph "Commented Layer Config"
                CLS[createSharedConfig]
                RSH[reactShares - Layer-based]
                RDSH[reactDomShares - Layer-based]
                NSH[nextNavigationShares - Layer-based]
            end
        end
        
        subgraph "next-fragments.ts"
            RDS14[retrieveDefaultShared function]
        end
    end

    subgraph "Next.js 14 Implementation"
        N14S[Server Build]
        N14C[Client Build]
        N14T[Traditional Sharing]
    end

    subgraph "Next.js 15 Implementation"
        N15S[Server Build]
        N15C[Client Build]
        N15T[Traditional Sharing Active]
        N15L[Layer Sharing Ready]
    end

    DS14 --> N14S
    DSB14 --> N14C
    DS14 --> N15S
    DSB14 --> N15C

    RDS14 --> N14T
    RDS14 --> N15T

    CLS -.->|Prepared but unused| N15L

    N14S --> |Uses| DS14
    N14C --> |Uses| DSB14
    N15S --> |Uses| DS14
    N15C --> |Uses| DSB14

    style N15L fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## Sharing Configuration Transformation

### Server Environment (Both Next.js 14 & 15)

```mermaid
graph LR
    subgraph "Input: DEFAULT_SHARE_SCOPE"
        I1[react: import: false]
        I2[react-dom: import: false]
        I3[next/router: import: undefined]
        I4[styled-jsx: import: undefined]
    end

    subgraph "Server Processing"
        SP1[handleServerExternals]
        SP2[Check if module in shared]
        SP3[Keep as external if Next/React]
        SP4[Bundle if in shared config]
    end

    subgraph "Output: Server Bundle"
        O1[react: External - from Next.js]
        O2[react-dom: External - from Next.js]
        O3[next/router: Bundled]
        O4[styled-jsx: Bundled with version]
    end

    I1 --> SP1 --> O1
    I2 --> SP1 --> O2
    I3 --> SP2 --> O3
    I4 --> SP4 --> O4
```

### Client Environment (Both Next.js 14 & 15)

```mermaid
graph LR
    subgraph "Input: DEFAULT_SHARE_SCOPE_BROWSER"
        CI1[react: import: undefined]
        CI2[react-dom: import: undefined]
        CI3[next/router: import: undefined]
        CI4[styled-jsx: import: undefined]
    end

    subgraph "Client Processing"
        CP1[applyClientPlugins]
        CP2[All modules bundled]
        CP3[ChunkCorrelationPlugin]
        CP4[InvertedContainerPlugin]
    end

    subgraph "Output: Client Bundle"
        CO1[react: Bundled + Shared]
        CO2[react-dom: Bundled + Shared]
        CO3[next/router: Bundled + Shared]
        CO4[styled-jsx: Bundled + Shared]
    end

    CI1 --> CP1 --> CO1
    CI2 --> CP1 --> CO2
    CI3 --> CP2 --> CO3
    CI4 --> CP2 --> CO4

    CP1 --> CP3
    CP1 --> CP4
```

## Future Layer-Based Sharing (Next.js 15 Ready)

```mermaid
graph TD
    subgraph "Layer-Based Module Resolution"
        subgraph "React Module Variants"
            R_RSC[react-rsc<br/>Layer: rsc]
            R_SSR[react-ssr<br/>Layer: ssr]
            R_Client[react<br/>Layer: undefined]
        end

        subgraph "Import Context"
            RSC_Page[RSC Page Import]
            SSR_Page[SSR Page Import]
            Client_Comp[Client Component Import]
        end

        subgraph "Resolution"
            Resolver{Layer Matcher}
            RSC_Bundle[Use react-rsc variant]
            SSR_Bundle[Use react-ssr variant]
            Client_Bundle[Use standard react]
        end
    end

    RSC_Page --> Resolver
    SSR_Page --> Resolver
    Client_Comp --> Resolver

    Resolver -->|issuerLayer: rsc| RSC_Bundle
    Resolver -->|issuerLayer: ssr| SSR_Bundle
    Resolver -->|issuerLayer: undefined| Client_Bundle

    R_RSC -.-> RSC_Bundle
    R_SSR -.-> SSR_Bundle
    R_Client -.-> Client_Bundle
```

## Complete Sharing Matrix

| Module | Next.js 14 Server | Next.js 14 Client | Next.js 15 Server | Next.js 15 Client | Layer Support (15) |
|--------|-------------------|-------------------|-------------------|-------------------|--------------------|
| react | External (`import: false`) | Bundled (`import: undefined`) | External (`import: false`) | Bundled (`import: undefined`) | RSC, SSR, Client layers ready |
| react-dom | External (`import: false`) | Bundled (`import: undefined`) | External (`import: false`) | Bundled (`import: undefined`) | RSC, SSR, Client layers ready |
| react/jsx-runtime | External | Bundled | External | Bundled | Navigation layers ready |
| next/router | Bundled | Bundled | Bundled | Bundled | No layer config |
| next/link | Bundled | Bundled | Bundled | Bundled | No layer config |
| next/navigation | N/A | N/A | Bundled | Bundled | RSC, SSR layers ready |
| styled-jsx | Bundled + Versioned | Bundled + Versioned | Bundled + Versioned | Bundled + Versioned | No layer config |

## Key Insights

1. **Version Consistency**: The core sharing mechanism remains identical between Next.js 14 and 15
2. **Layer Preparation**: Next.js 15 has layer-based sharing infrastructure ready but currently disabled
3. **Environment Priority**: The primary differentiation is server vs client, not version-based
4. **External Strategy**: Server builds treat React/Next core as external to leverage Next.js's built-in versions
5. **Future-Ready**: The commented layer-based sharing in `internal.ts` shows preparation for more granular control in Next.js 15+