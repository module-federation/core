---
'@module-federation/lynx': minor
'@module-federation/runtime-core': patch
'@module-federation/sdk': patch
---

Add an Rspeedy build adapter plus background and Lynx for Web main-thread
transports. Dual-realm remotes publish a standard Module Federation manifest
whose remote entry resolves to one HTTP-loadable external `.lynx.bundle`.
Compiled federated `import()` calls skip Lynx's local loader for remote-only
chunk IDs while preserving normal local JavaScript chunk loading.

Load non-eager host, remote-exposure, and descendant chunks through Lynx's
public lazy-bundle API. Split federation requires the Lynx Web Core and template
plugin releases that preserve automatic public paths, expose retryable lazy
loading, and omit assetless remote-only chunk groups.
Bootstrap the ReactLynx lazy-bundle loader before federation async startup so
initial shared chunks use FetchBundle instead of the legacy component loader.
Embed the paired container entry in native split remotes so fetched main-thread
chunks install their snapshot factories before React commits them.
Accept the cache-events plugin 0.2 line used by Rspeedy 0.16.

Resolve manifest `publicPath: 'auto'` from the fetched response URL so
root-relative manifest entries remain portable in browser-like runtimes.
