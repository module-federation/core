/**
 * We extend `Date` during builds and revalidates to ensure that prerenders don't observe the clock as a source of IO
 * When dynamicIO is enabled. The current time is a form of IO even though it resolves synchronously. When dyanmicIO is
 * enabled we need to ensure that clock time is excluded from prerenders unless it is cached.
 *
 * There is tension here because time is used for both output and introspection. While arbitrary we intend to reserve
 * `Date` for output use cases and `performance` for introspection use cases. If you want to measure
 * how long something takes use `performance.timeOrigin` and `performance.now()` rather than `Date.now()` for instance.
 *
 * The extensions here never error nor alter the underlying Date objects, strings, and numbers created and thus should be transparent to callers.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _utils = require("./utils");
function createNow(originalNow) {
    return ({
        now: function now() {
            (0, _utils.io)('`Date.now()`', 'time');
            return originalNow();
        }
    })['now'.slice()].bind(null);
}
function createDate(originalConstructor) {
    const properties = Object.getOwnPropertyDescriptors(originalConstructor);
    properties.now.value = createNow(originalConstructor.now);
    const apply = Reflect.apply;
    const construct = Reflect.construct;
    const newConstructor = Object.defineProperties(// Ideally this should not minify the name.
    function Date1() {
        if (new.target === undefined) {
            (0, _utils.io)('`Date()`', 'time');
            return apply(originalConstructor, undefined, arguments);
        }
        if (arguments.length === 0) {
            (0, _utils.io)('`new Date()`', 'time');
        }
        return construct(originalConstructor, arguments, new.target);
    }, properties);
    Object.defineProperty(originalConstructor.prototype, 'constructor', {
        value: newConstructor
    });
    return newConstructor;
}
try {
    // eslint-disable-next-line no-native-reassign
    Date = createDate(Date);
} catch  {
    console.error('Failed to install `Date` class extension. When using `experimental.dynamicIO`, APIs that read the current time will not correctly trigger dynamic behavior.');
}

//# sourceMappingURL=date.js.map