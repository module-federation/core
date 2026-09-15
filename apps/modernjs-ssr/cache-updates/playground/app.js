const $ = (id) => document.getElementById(id);
let selected = 'static',
  state,
  busy = false,
  initialized = false;
const isMemory = location.pathname === '/memory';
$('memory').hidden = !isMemory;
$('experience').hidden = isMemory;
document
  .querySelectorAll('.nav')
  .forEach((a) =>
    a.classList.toggle(
      'active',
      new URL(a.href).pathname === location.pathname,
    ),
  );
if (isMemory) {
  $('title').textContent = '留下的内存，看得见。';
  $('intro').textContent =
    '分别观察两个 SSR 进程。控制台和流量发生器不计入测量。';
}
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const mib = (n) => (n / 1024 / 1024).toFixed(2);
function error(e) {
  $('error').hidden = false;
  $('error').textContent = String(e);
}
async function action(name, params = {}) {
  const response = await fetch(
    '/api/' + name + '?' + new URLSearchParams({ host: selected, ...params }),
    { method: 'POST' },
  );
  const text = await response.text();
  if (!response.ok) throw Error(text);
  return JSON.parse(text);
}
async function perform(fn) {
  if (busy) return;
  busy = true;
  $('html').disabled = true;
  $('error').hidden = true;
  try {
    await fn();
  } catch (e) {
    error(e);
  } finally {
    busy = false;
    $('html').disabled = false;
    await refresh();
  }
}
function loadFrames() {
  const url = state.hosts[selected].url;
  $('old').src = url + '/';
  $('new').src = url + $('entry').value;
  $('standalone').href = url + '/';
}
function chart(id, values, key) {
  if (!values.length) {
    $(id).innerHTML =
      '<text x="20" y="95">还没有样本。点击采样或运行实验。</text>';
    return;
  }
  const nums = values.map((v) => v[key] / 1048576),
    low = Math.min(...nums),
    high = Math.max(...nums),
    range = Math.max(high - low, 1);
  const coords = nums.map((n, i) => [
    36 + (i * 530) / Math.max(1, nums.length - 1),
    145 - ((n - low) * 110) / range,
  ]);
  $(id).innerHTML =
    '<path d="M36 20V150H580" fill="none" stroke="#444656"/><polyline fill="none" stroke="' +
    (key === 'heapUsed' ? '#b5a0ff' : '#72dac8') +
    '" stroke-width="2" points="' +
    coords.map((p) => p.join(',')).join(' ') +
    '"/>' +
    coords
      .map(
        ([x, y], i) =>
          '<circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="3" fill="#b5a0ff"><title>' +
          escape(
            nums[i].toFixed(2) +
              ' MiB · ' +
              new Date(values[i].at).toLocaleTimeString(),
          ) +
          '</title></circle>',
      )
      .join('') +
    '<text x="40" y="175">' +
    low.toFixed(2) +
    '–' +
    high.toFixed(2) +
    ' MiB · ' +
    values.length +
    ' samples</text>';
}
function metrics(id, values) {
  $(id).innerHTML = values
    .map(
      ([label, value]) =>
        '<div class="metric"><strong>' +
        escape(value) +
        '</strong><span>' +
        escape(label) +
        '</span></div>',
    )
    .join('');
}
async function refresh() {
  try {
    const response = await fetch('/api/state');
    if (!response.ok) throw Error(await response.text());
    state = await response.json();
    const host = state.hosts[selected],
      status = host.status,
      exp = state.experiment;
    $('connection').textContent = status.phase;
    $('host-info').textContent =
      'PID ' + host.pid + ' · generation ' + status.generation;
    $('plan').textContent =
      host.plan.mode === 'entries'
        ? '局部更新 · ' + host.plan.entries.join(', ')
        : '整体应用重建';
    $('plan').title = JSON.stringify(host.plan);
    $('register').hidden = selected !== 'dynamic';
    if (!initialized) {
      initialized = true;
      if (!isMemory) loadFrames();
    }
    if (host.lastUpdate)
      $('update-result').textContent = JSON.stringify(host.lastUpdate, null, 2);
    const belongs = exp.kind === selected,
      requests = belongs ? exp.requests : [];
    metrics('counters', [
      ['实际在途', status.activeRequests],
      ['实际排队', status.pendingRequests],
      ['已完成', requests.filter((r) => r.state === 'complete').length],
      ['被拒绝', requests.filter((r) => r.state === 'rejected').length],
    ]);
    $('empty').hidden = requests.length > 0;
    const now = Date.now(),
      duration = Math.max(1, ...requests.map((r) => (r.end || now) - r.sent));
    $('requests').innerHTML = requests
      .map((r) => {
        const entered = host.records.find(
          (e) => e.id === r.id && e.event === 'loader-enter',
        );
        const label =
          r.state === 'sent'
            ? entered
              ? '已进入 loader'
              : '已发送 · 等待响应'
            : r.state;
        return (
          '<tr><td>' +
          escape(r.id) +
          '</td><td>' +
          escape(r.route) +
          '</td><td class="' +
          escape(r.state) +
          '">' +
          escape(label) +
          '</td><td><i class="timeline" style="width:' +
          Math.round((((r.end || now) - r.sent) / duration) * 150) +
          'px"></i>' +
          ((r.end || now) - r.sent) +
          ' ms</td><td>' +
          escape(r.status || '—') +
          ' / ' +
          escape(r.release || '—') +
          '</td></tr>'
        );
      })
      .join('');
    $('events').textContent = JSON.stringify(
      { host: host.records, experiment: belongs ? exp.events : [] },
      null,
      2,
    );
    for (const id of [
      'run',
      'soak',
      'v1',
      'v2',
      'register',
      'sample',
      'gc',
      'snapshot',
      'html',
    ])
      $(id).disabled = busy || exp.running;
    $('release').disabled = !host.held;
    const samples = state.samples[selected],
      gc = samples.filter((s) => s.gc),
      warm = gc.filter((s) => !s.cycle || s.cycle > 10);
    const latest = samples.at(-1),
      delta =
        warm.length > 1 ? mib(warm.at(-1).heapUsed - warm[0].heapUsed) : '—';
    metrics('memory-summary', [
      ['当前 PID', host.pid],
      ['样本数量', samples.length],
      ['末次 heap / MiB', latest ? mib(latest.heapUsed) : '—'],
      ['预热后 GC 堆变化 / MiB', delta],
    ]);
    chart('heap-chart', gc, 'heapUsed');
    chart('rss-chart', samples, 'rss');
    $('samples').innerHTML = samples
      .slice()
      .reverse()
      .map(
        (s) =>
          '<tr><td>' +
          new Date(s.at).toLocaleTimeString() +
          ' / ' +
          (s.cycle || '手动') +
          '</td><td>' +
          s.gc +
          '</td><td>' +
          mib(s.heapUsed) +
          '</td><td>' +
          mib(s.rss) +
          '</td><td>' +
          mib(s.external) +
          '</td><td>' +
          mib(s.arrayBuffers) +
          '</td><td>' +
          s.instances +
          '</td></tr>',
      )
      .join('');
  } catch (e) {
    $('connection').textContent = '连接中断';
    error(e);
  }
}
for (const kind of ['static', 'dynamic'])
  $(kind).onclick = () => {
    selected = kind;
    for (const k of ['static', 'dynamic'])
      $(k).classList.toggle('selected', k === kind);
    if (state && !isMemory) loadFrames();
    refresh();
  };
for (const v of ['v1', 'v2'])
  $(v).onclick = () =>
    perform(async () => {
      $('update-result').textContent = JSON.stringify(
        await action('update', { v }),
        null,
        2,
      );
    });
$('register').onclick = () =>
  perform(async () => {
    await action('update', { v: state.hosts[selected].version, dynamic: '1' });
    $('new').src = state.hosts[selected].url + '/?t=' + Date.now();
  });
$('reload').onclick = () => {
  $('new').src =
    state.hosts[selected].url + $('entry').value + '?t=' + Date.now();
};
$('entry').onchange = () => $('reload').click();
$('run').onclick = () =>
  perform(() =>
    action('experiment', {
      count: $('count').value,
      interval: $('interval').value,
      v: state.hosts[selected].version === 'v1' ? 'v2' : 'v1',
    }),
  );
$('release').onclick = () => perform(() => action('release'));
$('sample').onclick = () => perform(() => action('sample'));
$('gc').onclick = () => perform(() => action('sample', { gc: '1' }));
$('soak').onclick = () =>
  perform(() =>
    action('experiment', { mode: 'memory', count: $('cycles').value }),
  );
$('snapshot').onclick = () =>
  perform(async () => {
    $('snapshot-result').textContent = JSON.stringify(
      await action('snapshot'),
      null,
      2,
    );
  });
$('export').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          { host: state.hosts[selected], samples: state.samples[selected] },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    ),
  );
  a.download = 'ssr-memory-' + selected + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('html').onclick = () =>
  perform(async () => {
    const result = await action('html', { entry: $('entry').value });
    $('source-text').textContent = result.html;
    $('source').showModal();
  });
$('close-source').onclick = () => $('source').close();
(async function poll() {
  await refresh();
  setTimeout(poll, 500);
})();
