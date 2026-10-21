(async () => {
  const assert = (value, message) => {
    if (!value) throw new Error(message);
  };
  const tick = () => new Promise((resolve) => setTimeout(resolve, 100));
  const row = (n) => document.querySelector(`[data-case="${n}"]`);
  for (
    let i = 0;
    i < 100 && !row(8)?.innerText.includes('Fetched on provider');
    i++
  )
    await tick();
  assert(document.querySelectorAll('[data-case]').length === 9, 'Nine cases');
  assert(!document.querySelector('[role="alert"]'), 'No error fallbacks');
  assert(
    document.querySelectorAll('[data-testid="app"]').length === 2,
    'Both application entry forms',
  );
  assert(
    document.querySelectorAll('[data-testid="plain"]').length === 4,
    'Plain components plus loader precedence and noSSR',
  );
  assert(
    document.querySelectorAll('[data-testid="data-value"]').length === 3,
    'SSR and CSR DataLoaders',
  );
  for (const n of [1, 4, 8])
    assert(
      row(n).innerText.includes('Fetched on provider'),
      `Data ready in case ${n}`,
    );
  row(0).querySelector('button').click();
  row(1).querySelector('button').click();
  row(2).querySelector('button').click();
  row(2).querySelector('a[href="/detail"]').click();
  await tick();
  assert(
    row(0).innerText.includes('Plain clicks: 1'),
    'Plain hydration interaction',
  );
  assert(
    row(1).innerText.includes('Data clicks: 1'),
    'Data hydration interaction',
  );
  assert(row(2).innerText.includes('App clicks: 1'), 'Bridge root interaction');
  assert(
    row(2).innerText.includes('Application detail route'),
    'Bridge routing',
  );
  assert(
    row(5).innerText.includes('Application home route'),
    'Independent app instances',
  );
  document.querySelector('.controls button').click();
  await tick();
  assert(
    row(2).innerText.includes('App clicks: 1'),
    'Parent rerender preserves app state',
  );
  const sources = [
    ...new Set(
      [...document.querySelectorAll('[data-source]')].map(
        (e) => e.dataset.source,
      ),
    ),
  ];
  const manifestRequests = performance
    .getEntriesByType('resource')
    .filter((e) => e.name.includes('5103/mf-manifest.json'))
    .map((e) => e.name);
  const mode = document.body.innerText.includes('Mode: snapshot')
    ? 'snapshot'
    : 'manifest';
  assert(
    sources.length === 1 && sources[0] === mode,
    'Expected metadata source for every case',
  );
  if (mode === 'snapshot')
    assert(
      manifestRequests.length === 0,
      'Injected snapshot must avoid provider manifest requests',
    );
  return { passed: true, sources, manifestRequests };
})();
