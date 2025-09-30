// Utility type. Prefix<[A, B, C, D]> matches [A], [A, B], [A, B, C] etc.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createTupleMap", {
    enumerable: true,
    get: function() {
        return createTupleMap;
    }
});
function createTupleMap() {
    let rootEntry = {
        parent: null,
        key: null,
        hasValue: false,
        value: null,
        map: null
    };
    // To optimize successive lookups, we cache the last accessed keypath.
    // Although it's not encoded in the type, these are both null or
    // both non-null. It uses object equality, so to take advantage of this
    // optimization, you must pass the same array instance to each successive
    // method call, and you must also not mutate the array between calls.
    let lastAccessedEntry = null;
    let lastAccessedKeys = null;
    function getOrCreateEntry(keys) {
        if (lastAccessedKeys === keys) {
            return lastAccessedEntry;
        }
        // Go through each level of keys until we find the entry that matches,
        // or create a new one if it doesn't already exist.
        let entry = rootEntry;
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            let map = entry.map;
            if (map !== null) {
                const existingEntry = map.get(key);
                if (existingEntry !== undefined) {
                    // Found a match. Keep going.
                    entry = existingEntry;
                    continue;
                }
            } else {
                map = new Map();
                entry.map = map;
            }
            // No entry exists yet at this level. Create a new one.
            const newEntry = {
                parent: entry,
                key,
                value: null,
                hasValue: false,
                map: null
            };
            map.set(key, newEntry);
            entry = newEntry;
        }
        lastAccessedKeys = keys;
        lastAccessedEntry = entry;
        return entry;
    }
    function getEntryIfExists(keys) {
        if (lastAccessedKeys === keys) {
            return lastAccessedEntry;
        }
        // Go through each level of keys until we find the entry that matches, or
        // return null if no match exists.
        let entry = rootEntry;
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            let map = entry.map;
            if (map !== null) {
                const existingEntry = map.get(key);
                if (existingEntry !== undefined) {
                    // Found a match. Keep going.
                    entry = existingEntry;
                    continue;
                }
            }
            // No entry exists at this level.
            return null;
        }
        lastAccessedKeys = keys;
        lastAccessedEntry = entry;
        return entry;
    }
    function set(keys, value) {
        const entry = getOrCreateEntry(keys);
        entry.hasValue = true;
        entry.value = value;
    }
    function get(keys) {
        const entry = getEntryIfExists(keys);
        if (entry === null || !entry.hasValue) {
            return null;
        }
        return entry.value;
    }
    function deleteEntry(keys) {
        const entry = getEntryIfExists(keys);
        if (entry === null || !entry.hasValue) {
            return;
        }
        // Found a match. Delete it from the cache.
        const deletedEntry = entry;
        deletedEntry.hasValue = false;
        deletedEntry.value = null;
        // Check if we can garbage collect the entry.
        if (deletedEntry.map === null) {
            // Since this entry has no value, and also no child entries, we can
            // garbage collect it. Remove it from its parent, and keep garbage
            // collecting the parents until we reach a non-empty entry.
            // Unlike a `set` operation, these are no longer valid because the entry
            // itself is being modified, not just the value it contains.
            lastAccessedEntry = null;
            lastAccessedKeys = null;
            let parent = deletedEntry.parent;
            let key = deletedEntry.key;
            while(parent !== null){
                const parentMap = parent.map;
                if (parentMap !== null) {
                    parentMap.delete(key);
                    if (parentMap.size === 0) {
                        // We just removed the last entry in the parent map.
                        parent.map = null;
                        if (parent.value === null) {
                            // The parent node has no child entries, nor does it have a value
                            // on itself. It can be garbage collected. Keep going.
                            key = parent.key;
                            parent = parent.parent;
                            continue;
                        }
                    }
                }
                break;
            }
        }
    }
    return {
        set,
        get,
        delete: deleteEntry
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=tuple-map.js.map