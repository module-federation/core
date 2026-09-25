---
'@module-federation/rspack': patch
---

Support lazy compilation in remotes. `rspack serve` turns lazy compilation on by default, and Rspack's client sent its request to the page origin, which for a remote is the host, so the request failed with HTTP 404. Remotes now resolve the lazy compilation endpoint against their own public path, so the request reaches the remote's dev server. Rspack's own client and protocol are unchanged.
