// Separate process: real HTTP traffic never contributes to the SSR host's heap.
const { url, mode, count, interval, version } = JSON.parse(process.argv[2]);
const emit = (data) => process.send?.(data);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function control(route) {
  const response = await fetch(url + '/__lab/' + route, {
    method: 'POST',
    signal: AbortSignal.timeout(25000),
  });
  const body = await response.json();
  if (!response.ok) throw Error(JSON.stringify(body));
  return body;
}
async function request(id, route = '/') {
  const sent = Date.now();
  emit({ type: 'request', id, sent, route, state: 'sent' });
  try {
    const response = await fetch(
      url + route + (route.includes('?') ? '&' : '?') + 'id=' + id,
      { signal: AbortSignal.timeout(25000) },
    );
    const html = await response.text();
    emit({
      type: 'request',
      id,
      sent,
      route,
      end: Date.now(),
      state: response.ok ? 'complete' : 'rejected',
      status: response.status,
      release: html.match(/data-release="(v[12])"/)?.[1],
      bytes: Buffer.byteLength(html),
    });
    return response.status;
  } catch (e) {
    emit({
      type: 'request',
      id,
      sent,
      route,
      end: Date.now(),
      state: 'error',
      error: String(e),
    });
    return 0;
  }
}
(async () => {
  if (mode === 'memory') {
    for (let i = 0; i < count; i++) {
      await control('update?v=' + (i % 2 ? 'v1' : 'v2'));
      await Promise.all(
        Array.from({ length: 8 }, (_, n) => request('cycle-' + i + '-' + n)),
      );
      if (i % 5 === 4 || i === count - 1)
        emit({
          type: 'sample',
          cycle: i + 1,
          sample: await control('sample?gc=1'),
        });
    }
  } else {
    await control('arm');
    const old = request('held', '/?hold=1');
    const deadline = Date.now() + 10000;
    while (!(await (await fetch(url + '/__lab/status')).json()).held) {
      if (Date.now() > deadline)
        throw Error('Held request did not enter loader');
      await sleep(20);
    }
    const update = control('update?v=' + version).then(
      (result) => emit({ type: 'update', result }),
      (e) => emit({ type: 'error', error: String(e) }),
    );
    while (
      (await (await fetch(url + '/__lab/status')).json()).status.phase !==
      'draining'
    ) {
      if (Date.now() > deadline) throw Error('Update did not start draining');
      await sleep(20);
    }
    emit({ type: 'draining', at: Date.now() });
    const jobs = [];
    for (let i = 0; i < count; i++) {
      jobs.push(request('request-' + i, i % 4 === 3 ? '/b' : '/'));
      if (interval) await sleep(interval);
    }
    await Promise.all(jobs);
    await old;
    await update;
  }
  emit({ type: 'done' });
})()
  .catch((e) => {
    emit({ type: 'error', error: String(e) });
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mode !== 'memory') await control('release').catch(() => {});
    process.disconnect?.();
  });
