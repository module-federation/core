---
'@module-federation/enhanced': patch
---

fix(enhanced): ConsumeSharedPlugin alias-aware and virtual resource handling

- Skip `data:` (virtual) resources in `afterResolve` and `createModule` so webpack's scheme resolver handles them (fixes container virtual-entry compile failure)
- Broaden alias-aware matching in `afterResolve` to include deep-path shares that start with the resolved package name (e.g. `next/dist/compiled/react`), ensuring aliased modules are consumed from federation when configured
- Avoid converting explicit relative/absolute requests into consumes to preserve local nested resolution (fixes deep module sharing version selection)
- Keep prefix and node_modules suffix matching intact; no behavior change there

These changes restore expected behavior for:
- Virtual entry compilation
- Deep module sharing (distinct versions for nested paths)
- Alias-based sharing (Next.js compiled React)

