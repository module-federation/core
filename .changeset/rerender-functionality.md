---
"@module-federation/bridge-react": patch
---

feat(bridge-react): add rerender option to createBridgeComponent

- Add rerender option to ProviderFnParams interface for custom rerender handling
- Update bridge-base implementation to support custom rerender logic with proper shouldRecreate functionality
- Add component state tracking to detect rerenders vs initial renders
- Properly unmount and recreate roots when shouldRecreate is true
- Preserve component state when shouldRecreate is false
- Maintain backward compatibility for existing code
- Add comprehensive test suite for rerender functionality

This addresses issue #4171 where remote apps were being recreated on every host rerender, causing loss of internal state.