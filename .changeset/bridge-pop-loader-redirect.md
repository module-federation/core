---
'@module-federation/bridge-shared': patch
'@module-federation/bridge-react': patch
---

Keep the original history entry associated with a pending Bridge Router navigation when a loader redirects. This prevents native back or forward navigation from repeatedly restarting loaders while the redirected destination is loading. A different history entry, including a new key at the same URL, still cancels the previous navigation.
