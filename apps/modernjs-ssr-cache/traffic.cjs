// Separate process: real HTTP traffic never contributes to the SSR host's heap.
const { url, mode, count, interval, version, preset, visual, experimentId } =
  JSON.parse(process.argv[2]);
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
      reason: response.ok ? undefined : html.slice(0, 500),
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
function waitForPage(cycle) {
  return new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (
        message.type !== 'page-ready' ||
        message.cycle !== cycle ||
        message.experimentId !== experimentId
      )
        return;
      cleanup();
      resolve();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(
        Error(
          '第 ' +
            cycle +
            ' 轮页面未在 15 秒内确认加载，请保持内存页面打开后重试',
        ),
      );
    }, 15000);
    function cleanup() {
      clearTimeout(timer);
      process.off('message', onMessage);
    }
    process.on('message', onMessage);
  });
}
(async () => {
  if (mode === 'memory') {
    for (let i = 0; i < count; i++) {
      const release = i % 2 ? 'v1' : 'v2';
      await control('update?v=' + release);
      const statuses = await Promise.all(
        Array.from({ length: 8 }, (_, n) => request('cycle-' + i + '-' + n)),
      );
      if (statuses.some((status) => status !== 200))
        throw Error('Memory cycle SSR request failed');
      // Install the listener before advertising the cycle to avoid losing a fast ACK.
      const page = visual ? waitForPage(i + 1) : undefined;
      emit({
        type: 'memory-cycle',
        cycle: i + 1,
        release,
        at: Date.now(),
        experimentId,
      });
      if (page) {
        await page;
        emit({ type: 'memory-page', cycle: i + 1, at: Date.now() });
        // Keep the real returned page visible before navigating to the next version.
        await sleep(800);
      }
      if (i % 5 === 4 || i === count - 1)
        emit({
          type: 'sample',
          cycle: i + 1,
          sample: await control('sample?gc=1'),
        });
      emit({ type: 'memory-complete', cycle: i + 1, release, at: Date.now() });
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
    emit({ type: 'held', at: Date.now() });
    let updateError;
    const update = control('update?v=' + version).then(
      (result) => emit({ type: 'update', at: Date.now(), result }),
      (e) => {
        updateError = e;
        emit({ type: 'error', error: String(e) });
      },
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
    // Read the real coordinator while requests are held; retain evidence after release.
    const releaseAt = Date.now() + (preset === 'timeout' ? 3500 : 1400);
    let peak = 0;
    while (true) {
      const current = await (await fetch(url + '/__lab/status')).json();
      if (current.status.pendingRequests > peak) {
        peak = current.status.pendingRequests;
        emit({ type: 'queue', at: Date.now(), peak });
      }
      if (!current.held) break;
      if (preset !== 'manual' && Date.now() >= releaseAt) {
        await control('release');
        break;
      }
      if (Date.now() > deadline + 10000)
        throw Error('Manual release deadline exceeded');
      await sleep(50);
    }
    emit({ type: 'released', at: Date.now() });
    await Promise.all(jobs);
    await old;
    await update;
    if (updateError) throw updateError;
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
