/**
 * We extend Web Crypto APIs during builds and revalidates to ensure that prerenders don't observe random bytes
 * When dynamicIO is enabled. Random bytes are a form of IO even if they resolve synchronously. When dyanmicIO is
 * enabled we need to ensure that random bytes are excluded from prerenders unless they are cached.
 *
 *
 * The extensions here never error nor alter the underlying return values and thus should be transparent to callers.
 */
export {};
