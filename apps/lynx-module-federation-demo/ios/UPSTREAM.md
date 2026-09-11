# Official Lynx iOS starter provenance

This application is derived from the official Lynx `HelloLynxSwift` UIKit
starter:

- repository: <https://github.com/lynx-family/integrating-lynx-demo-projects>
- source path: `ios/HelloLynxSwift`
- source commit: `f8230ca6aa1c9e629e30272971d0c03450b13e8e`
- upstream license: Apache-2.0

The standalone shell retains the starter's `LynxEnv`, `LynxConfig`,
`LynxView`, CocoaPods, and embedded `main.lynx.bundle` integration. It upgrades
the official Lynx pods from 3.8.0 to 3.9.0 (including Lynx 3.9.0's published
PrimJS 3.8.0-alpha.6 engine pin), removes the starter's personal signing team
and bundle identifier, uses a programmatic UIKit root view, and adds the
resource fetchers required for HTTP Bundle, Lazy Bundle, and generic resource
loading.

The generated host bundle is intentionally not committed. Run
`pnpm ios:prepare` before opening the workspace.
