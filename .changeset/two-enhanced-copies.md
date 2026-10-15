---
'@module-federation/enhanced': patch
---

Let two installed copies of `@module-federation/enhanced` load in one webpack
process. Each copy now registers its cache serializers under its own install
directory, so the second copy no longer throws "serializer ... is already
registered" and both copies restore their modules from the filesystem cache.
