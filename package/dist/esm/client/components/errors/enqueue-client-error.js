// Dedupe the two consecutive errors: If the previous one is same as current one, ignore the current one.
export function enqueueConsecutiveDedupedError(queue, error) {
    const previousError = queue[queue.length - 1];
    // Compare the error stack to dedupe the consecutive errors
    if (previousError && previousError.stack === error.stack) {
        return;
    }
    queue.push(error);
}

//# sourceMappingURL=enqueue-client-error.js.map