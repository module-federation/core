---
'@module-federation/bridge-react': patch
---

Release unmounted Bridge receive sessions without retaining their DOM, snapshots or resolved promises, while ignoring late frames for released IDs. Cancel and unlock an in-progress Service request body reader when its Request signal aborts.
