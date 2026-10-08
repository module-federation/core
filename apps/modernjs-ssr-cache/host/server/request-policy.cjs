// Loaded once by weather.config.cjs. Invoked only when SSR admission is blocked,
// or a queued request reaches a terminal condition. No remote/SSR imports here.
module.exports = ({ request, update }) => {
  const url = new URL(request.url);
  // Demo-only override for inspecting HTML fallback with curl or a browser.
  // A real service can classify request headers/URLs using its own policy.
  if (url.searchParams.get('updatePolicy') === 'csr') return 'csr';
  if (url.searchParams.get('updatePolicy') === 'reject') return 'reject';
  if (update.reason !== 'updating') return 'reject';
  return 'wait';
};
