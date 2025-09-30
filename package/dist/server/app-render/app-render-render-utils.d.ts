/**
 * This is a utility function to make scheduling sequential tasks that run back to back easier.
 * We schedule on the same queue (setImmediate) at the same time to ensure no other events can sneak in between.
 */
export declare function scheduleInSequentialTasks<R>(render: () => R | Promise<R>, followup: () => void): Promise<R>;
