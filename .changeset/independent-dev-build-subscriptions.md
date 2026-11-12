---
'@module-federation/dts-plugin': minor
'@module-federation/enhanced': minor
---

Expose framework-owned development build subscriptions independently of type generation. Identify producers by name and manifest endpoint, replay readiness after reconnecting, and wait for asynchronous consumer updates before marking a subscription synchronized.

Honor explicit JavaScript live reload with `dts: false` and clean up development workers when their compiler closes.
