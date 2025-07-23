---
"@module-federation/runtime-core": patch
---

fix: prevent duplicate error prefix in Module Federation Runtime errors

This change fixes an issue where the `[ Federation Runtime ]` prefix was being added multiple times to error messages when errors were re-thrown or already contained the prefix. The fix includes:

- Check if error message already starts with the log category prefix before adding it
- Properly handle Error objects to avoid mutating original errors in warn function
- Add comprehensive tests to ensure prefix duplication is prevented