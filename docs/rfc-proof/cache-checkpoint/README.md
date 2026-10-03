# Cache review checkpoint

These are historical owner reports and captured logs, published for independent review. Their statements that commits remain local refer to the moment those reports were written; the isolated proof branches are now published. Existing RFC PR branches have not been updated. No cache semantics endorsement or merge approval is claimed.

- RFC5036 cache patch: [0e515cf97](https://github.com/module-federation/core/commit/0e515cf97e1fcd66531db7e3e754a12bd13a2d49), based on unchanged #5107 plus its isolated slot correction. Full runtime suite: 161 pass.
- RFC5128 prerequisite cache patch: [10566aafc](https://github.com/module-federation/core/commit/10566aafc4cec87eabdd971c10bc51890410394f).
- RFC5128 concrete Node/browser platform followup: [1301cebe7](https://github.com/module-federation/core/commit/1301cebe747b749ed188b8705b5e7a7318e1a8a0). Review these two together. Full runtime suite: 176 pass; actual built Node/SDK proof: 12 pass; VM evaluator proof: 11 pass.

Runtime regression tests and JS fixtures are committed in the source patches. To rerun standalone scripts, copy them into a directory containing fresh, built checkouts named `rfc5036` and `rfc5128-cache` at their published proof branch heads. The VM script also accepts `RFC5128_CACHE_WORKTREE`. Baseline adapters temporarily replace ignored built artifacts and restore them in finally; use isolated checkouts. Reports contain exact build and test commands. Captured before/after logs are in `logs/`.

Limits: Node runtime fetch-hook forwarding remains an existing unsupported SDK gap. Distinct custom browser IIFE scopes sharing one physical global are explicitly refused, rather than isolated. Different equivalent callbacks are supported using separate evaluations. RFC5036 metadata-less legacy reuse retains its weaker preexisting guarantee. Final integration and exact-head CI remain pending.

Current propagation gates are tracked in [CURRENT_STATUS.md](CURRENT_STATUS.md). The earlier four fixture conflicts are resolved locally. Strict packed RFC5036 mixed `.mts` plus `.cts` checking fails four TS2403 global-declaration checks; original #5107 config replay produces the same four TS2403 plus its original TS2309. The focused CJS declaration correction removes TS2309 and leaves the preexisting TS2403 gate. Historical logs are preserved.

#5180: its validation work is complete; the draft PR remains open and unmerged at `dc61543814fd4a4706608e8b3d3fe34169f7532b`. Green CI does not close a PR. No PR state changes were requested or made.
