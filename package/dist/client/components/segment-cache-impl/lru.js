"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createLRU", {
    enumerable: true,
    get: function() {
        return createLRU;
    }
});
function createLRU(// From the LRU's perspective, the size unit is arbitrary, but for our
// purposes this is the byte size.
maxLruSize, onEviction) {
    let head = null;
    let didScheduleCleanup = false;
    let lruSize = 0;
    function put(node) {
        if (head === node) {
            // Already at the head
            return;
        }
        const prev = node.prev;
        const next = node.next;
        if (next === null || prev === null) {
            // This is an insertion
            lruSize += node.size;
            // Whenever we add an entry, we need to check if we've exceeded the
            // max size. We don't evict entries immediately; they're evicted later in
            // an asynchronous task.
            ensureCleanupIsScheduled();
        } else {
            // This is a move. Remove from its current position.
            prev.next = next;
            next.prev = prev;
        }
        // Move to the front of the list
        if (head === null) {
            // This is the first entry
            node.prev = node;
            node.next = node;
        } else {
            // Add to the front of the list
            const tail = head.prev;
            node.prev = tail;
            tail.next = node;
            node.next = head;
            head.prev = node;
        }
        head = node;
    }
    function updateSize(node, newNodeSize) {
        // This is a separate function from `put` so that we can resize the entry
        // regardless of whether it's currently being tracked by the LRU.
        const prevNodeSize = node.size;
        node.size = newNodeSize;
        if (node.next === null) {
            // This entry is not currently being tracked by the LRU.
            return;
        }
        // Update the total LRU size
        lruSize = lruSize - prevNodeSize + newNodeSize;
        ensureCleanupIsScheduled();
    }
    function deleteNode(deleted) {
        const next = deleted.next;
        const prev = deleted.prev;
        if (next !== null && prev !== null) {
            lruSize -= deleted.size;
            deleted.next = null;
            deleted.prev = null;
            // Remove from the list
            if (head === deleted) {
                // Update the head
                if (next === head) {
                    // This was the last entry
                    head = null;
                } else {
                    head = next;
                }
            } else {
                prev.next = next;
                next.prev = prev;
            }
        } else {
        // Already deleted
        }
    }
    function ensureCleanupIsScheduled() {
        if (didScheduleCleanup || lruSize <= maxLruSize) {
            return;
        }
        didScheduleCleanup = true;
        requestCleanupCallback(cleanup);
    }
    function cleanup() {
        didScheduleCleanup = false;
        // Evict entries until we're at 90% capacity. We can assume this won't
        // infinite loop because even if `maxLruSize` were 0, eventually
        // `deleteNode` sets `head` to `null` when we run out entries.
        const ninetyPercentMax = maxLruSize * 0.9;
        while(lruSize > ninetyPercentMax && head !== null){
            const tail = head.prev;
            deleteNode(tail);
            onEviction(tail);
        }
    }
    return {
        put,
        delete: deleteNode,
        updateSize
    };
}
const requestCleanupCallback = typeof requestIdleCallback === 'function' ? requestIdleCallback : (cb)=>setTimeout(cb, 0);

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=lru.js.map