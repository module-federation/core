# @module-federation/playground

Embeddable Module Federation Playground for loading a manifest, selecting an
expose, editing runtime code, and previewing a remote component.

```tsx
import ModuleFederationPlayground from '@module-federation/playground';

export function PlaygroundPage() {
  return <ModuleFederationPlayground autoRun defaultManifestUrl="https://example.com/mf-manifest.json" defaultExpose="./Button" defaultRemoteProps={{ title: 'Preview' }} />;
}
```

`defaultRemoteProps` initializes the **Remote Props** JSON editor. The parsed
object is passed to a loaded component or Bridge remote whenever the preview is
run.

## Divebell quickstart

Use the built-in preset to open the published Divebell example automatically:

```tsx
<ModuleFederationPlayground defaultPreset="divebell-quickstart" />
```

The hosted Playground accepts the same preset through the URL:

```text
/playground/?preset=divebell-quickstart
```

The shorter `preset=divebell` alias is also accepted. An explicit manifest or
expose query value takes precedence over the preset default. Divebell update
actions replace the active manifest or props and reload the preview.

## Divebell target and actions

The Playground reuses a Divebell runtime installed on `window`, or creates one
with source `mf-playground`. It registers:

- Target `playground:remote` (`playground.remote`) with `idle`, `loading`,
  `ready`, and `error` statuses.
- `playground.updateManifest` with payload `{ "url": "https://..." }`.
- `playground.updateProps` with payload `{ "props": { ... } }`.
- `playground.reloadRemote` with no payload.

The target snapshot includes the current manifest URL, remote name, expose,
props, status, latest terminal error, and wait descriptors for `ready` and
`error`. The three actions are state-changing and return the target id plus the
statuses callers should wait for.

```bash
divebell wait-for playground:remote ready --url "https://module-federation.io/playground/?preset=divebell-quickstart"
divebell run-action playground.updateProps --url "https://module-federation.io/playground/?preset=divebell-quickstart" --payload '{"props":{"title":"Updated"}}'
```

## Relevant props

| Prop                  | Type                      | Description                                                        |
| --------------------- | ------------------------- | ------------------------------------------------------------------ |
| `autoRun`             | `boolean`                 | Run the initial manifest/expose automatically.                     |
| `defaultManifestUrl`  | `string`                  | Initial remote manifest URL.                                       |
| `defaultExpose`       | `string`                  | Initial expose name.                                               |
| `defaultExportName`   | `string`                  | Export selected from the exposed module.                           |
| `defaultPreviewRoute` | `string`                  | Initial route passed to the preview.                               |
| `defaultRemoteProps`  | `Record<string, unknown>` | Initial props passed to the remote.                                |
| `defaultPreset`       | `'divebell-quickstart'`   | Apply the Divebell manifest, expose, props, and auto-run defaults. |
