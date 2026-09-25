---
'@module-federation/rspack': patch
---

Support Rspack 2 lazy compilation in remotes. `rspack serve` turns lazy compilation on by default, and Rspack's client sent its request to the page origin, which for a remote is the host, so the request failed with HTTP 404. Remotes now use a client that sends the request to the remote's own dev server, resolved from the remote's public path.
