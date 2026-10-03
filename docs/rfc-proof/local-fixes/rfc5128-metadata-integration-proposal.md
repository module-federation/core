# Supported v1 metadata integration: review candidate only

No metadata implementation is included in the external-kernel fix. This proposal supersedes the initial directional-capability sketch. It keeps the existing `RuntimeImageDescriptorV1` and its comparisons, the current globals, and the current permissive absence policy.

## Contract and policy

Reuse all seven supported fields: `contract:1`, `compatibilityId`, `required`, `forbidden`, `available`, `target`, `entryLoadingIdentity`. `compatibilityId` remains the explicit state/core/adapter ABI identifier; name and package version remain diagnostic. Keep the existing helper semantics exactly: provider `available ∪ required` covers consumer `available ∪ required`, consumer `forbidden` does not intersect the provider union, and ABI/target/loader identifiers compare equal.

Treat input as `unknown`. Only `undefined` denotes absence. A supplied null, array, incomplete record, bad scalar/array member, or unsupported contract value is malformed and rejects before the comparison helper. Parse into a freshly constructed v1 value with copied arrays; do not use a cast to claim an unknown global payload is a descriptor. No new required/available directional semantics, ABI negotiation, broad registry, schema version, implicit opt-out, or new policy option is proposed.

Preserve existing absence policy explicitly unless the parent chooses a stricter change: both undefined allow unchecked reuse; exactly one undefined warns and allows reuse through the existing helper. Malformed supplied metadata and known mismatches always reject. Metadata absence never excuses missing core/kernel exports or malformed bootstrap-used registry state.

## Exact source integration and API impact

RFC 5036 already provides `runtime-core/src/runtimeImage.ts`, `UserOptions.runtimeImage`, instance-image association, injector provider-info metadata, and the exported helper. The local bounded follow-up `13e83755eba6b461161cb47e747343bdb9a3894c` now validates shape/version before comparison/publication without changing v1 comparisons or undefined absence behavior. Final local #5107 `d3d52a0cc28e8a6fef0d6698f5876ac5804285b3` rejects actual compiled unsupported-version/null/wrong-shape cases, including first publication, and preserves provider/registry/share state. These corrected existing APIs are the reuse candidate.

RFC 5128 minor and major do not currently ship that API. Two review alternatives are honest:

1. Add the existing supported v1 descriptor/helper and association API locally to each alternative stack, before the Rspack metadata bootstrap integration; this is an additive public API and runtime-option/global-info shape change that needs its own changeset and packed declarations/export checks.
2. Make a reviewed dependency on the corresponding corrected RFC 5036 metadata link and resolve its kernel/composition differences explicitly. This changes stack ancestry and must remain an alternative-stack decision made by the parent.

The source touchpoints would be `runtime-core/src/runtimeImage.ts` (descriptor/parser/helper), `runtime-core/src/index.ts` and kernel exports where the helper is actually imported, `runtime-core/src/type/config.ts` (`runtimeImage` option), core/instance association and registration admission, `runtime-plugins/inject-external-runtime-core-plugin/src/index.ts` (validated publication into existing `_FEDERATION_RUNTIME_CORE_FROM.runtimeImage`), compiler-owned image generation, and `rspack/src/ExternalRuntimePlugin.ts` (pre-dereference bootstrap admission). The CJS kernel export maps to the root today; adding a helper to kernel import exports without adding it to root would leave require/import inconsistent, so both conditions must be validated against real packed artifacts.

The injector's `beforeInit` check remains useful for publication/reuse but cannot alone protect an external module's initial property access. The metadata guard is additional early bootstrap admission, not a no-op hook and not a fabricated replacement namespace. Compiler metadata must describe actual retained capabilities and target; a full fallback cannot claim a pruned image, and opaque loader identity must be an explicit compatibility guarantee, not a guess from plugin name or function text.

## Bootstrap-order implementation candidate

The current exact-kernel fix validates an imported raw root value before projecting kernel exports. Actual emitted missing-provider and bad-registry probes now reject before `runtime/src/instance.ts` reads `CurrentGlobal.__FEDERATION__.__INSTANCES__`. This covers the kernel startup boundary, independently of metadata.

A metadata guard also needs to cover the exact core-root external before any importing runtime module dereferences it. For the existing default/global external-provider path, a concrete candidate is an `ExternalsPlugin` variable expression that returns the existing global namespace only after a self-contained validation program. This preserves the actual namespace value; it does not map unsupported subpaths to it or introduce a registry. Conceptual emitted expression ordering is:

```js
(function () {
  var core = globalThis._FEDERATION_RUNTIME_CORE;
  // Validate namespace, bootstrap-used root/kernel exports and registry first.
  validateCoreMinimum(core);
  var from = globalThis._FEDERATION_RUNTIME_CORE_FROM;
  // Read only after validating an existing info payload as a record.
  var current = parseOptionalProviderImage(from);
  var next = parseRuntimeImage(compiledConsumerDescriptor);
  // Both parsing functions accept only undefined as absence.
  // Metadata supplied without the v1 comparison API is a named upgrade error.
  if (current !== undefined || next !== undefined) {
    if (typeof core.assertRuntimeImageCompatible !== 'function') {
      throw new Error('[RuntimeImageMinimumContract] Upgrade the external runtime core.');
    }
    core.assertRuntimeImageCompatible(current, next);
  }
  return core;
})();
```

The named functions here denote real parser/minimum-check source to be implemented and emitted before this expression; they are not implemented by this proposal. The expression is evaluated as the external module's value before an importing module can call/read `core.ModuleFederation`, `getGlobalFederationConstructor`, or registry state. The existing helper supplies the one-missing warning/allow behavior after parsing. With both absent, namespace/registry validation still runs. With malformed metadata, parsing rejects even if the counterpart is absent.

This candidate uses the existing provider's global value and is scoped to default/global externalization. Other configured `externalsType` values must preserve their actual transport and receive an equivalent early guard, or have an explicitly reviewed unsupported-mode diagnostic; they must not silently be reinterpreted as globals. The candidate has not been compiled or adopted, so neither browser startup ordering nor custom external types are claimed validated. Its implementation needs real emitted execution tests, not just helper tests or generated-source inspection.

Before publication, the injector must parse/copy its proposed descriptor and any existing descriptor, check minimum namespace/helper availability where metadata exists, and compare before assigning either existing global slot. Before reuse, all admission must finish before instance construction/registration or shared/remote state mutations. Rejection tests must snapshot the core value after any intentional bad-payload injection, `_FROM`, valid instance registry contents, and nested shared state; all must remain unchanged.

## Required proof before implementation is accepted

Actual compiled provider/consumer tests should retain compatible execution and separately assert named target, loader, ABI, missing-capability, unsupported-version, malformed-array/record, and missing-metadata-policy outcomes. Both first-publication and subsequent-reuse malformed/version rows are required. The one-undefined row must verify the existing warning and successful execution. Missing kernel/root exports reject independently in tagged and untagged cases. Packed declarations and require/import namespaces must expose only implemented APIs. Existing constructor, shared singleton, file remote, SDK data-URL remote, and zero-core external graph assertions must continue to pass on both final minor and major alternatives.
