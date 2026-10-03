# Local fixes under independent review

This is an immediate review snapshot, published at the parent's request while unaffected verification continues. Production source remains local and PR pushes remain held.

- [RFC5128 metadata source/API proposal](rfc5128-metadata-integration-proposal.md): existing v1 descriptor/comparisons, explicit legacy policy, existing globals, and a pre-dereference bootstrap guard. No metadata implementation is included.
- [Exact RFC5128 externalization production diff](rfc5128-externalization-production.patch): replaces the root-only external hook with an exact kernel adapter; validates actual provider exports and registry, projects five implemented kernel exports, and rejects unsupported subpaths. Two production files only.
- [Base and source hashes](review-snapshot.json): snapshot identity pending the focused local commit.

The production patch has zero context to preserve a clean diff artifact; use `git apply --unidiff-zero` if applying it. Package changeset and regression coverage will be recorded with the final local commit and its checks. Overall metadata conformance remains open; this snapshot is not an implementation or approval.
