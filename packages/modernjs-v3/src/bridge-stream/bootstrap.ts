import type { BridgeStreamBrowserRuntime, BridgeStreamFrame } from './protocol';

export interface BridgeBootstrapOptions {
  instanceIds?: string[];
  timeoutMs?: number;
  nonce?: string;
  maxQueuedBytes?: number;
}

/** Serialized into the head: keep every runtime dependency inside this function. */
export function bridgeStreamBootstrap(
  options: BridgeBootstrapOptions = {},
): void {
  const global = window as unknown as {
    __MF_BRIDGE_SSR__?: BridgeStreamBrowserRuntime;
  };
  if (global.__MF_BRIDGE_SSR__) {
    (options.instanceIds || []).forEach((id) =>
      global.__MF_BRIDGE_SSR__!.expect(id),
    );
    return;
  }
  const entries: Record<string, any> = Object.create(null);
  const stylesheets = new Map<
    string,
    {
      link: HTMLLinkElement;
      ready: Promise<void>;
      users: number;
      settled: boolean;
      owned: boolean;
      detach(): void;
    }
  >();
  const releaseStyles = (state: any) => {
    (state.releaseStyles || []).forEach((release: () => void) => release());
    state.releaseStyles = [];
  };
  const acquireStylesheet = (href: string) => {
    const url = new URL(href, document.baseURI).href;
    let resource = stylesheets.get(url);
    if (!resource) {
      const existing = Array.prototype.find.call(
        document.querySelectorAll('link[href]'),
        (link: HTMLLinkElement) => {
          const rel = link.rel.toLowerCase().split(/\s+/);
          const media = link.media.trim().toLowerCase();
          const type = link.type.trim().toLowerCase().split(';', 1)[0].trim();
          return (
            rel.indexOf('stylesheet') !== -1 &&
            rel.indexOf('alternate') === -1 &&
            !link.disabled &&
            !link.hasAttribute('disabled') &&
            (!media || media === 'all') &&
            (!type || type === 'text/css') &&
            link.href === url
          );
        },
      ) as HTMLLinkElement | undefined;
      const link = existing || document.createElement('link');
      let resolve!: () => void;
      let reject!: (reason: unknown) => void;
      const ready = new Promise<void>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      // A metadata validation failure can release a partly acquired resource set.
      void ready.catch(() => {});
      const value = {
        link,
        ready,
        users: 0,
        settled: false,
        owned: !existing,
        detach() {
          link.removeEventListener('load', loaded);
          link.removeEventListener('error', failed);
        },
      };
      const loaded = () => {
        if (value.settled) return;
        value.settled = true;
        value.detach();
        resolve();
      };
      const failed = () => {
        if (value.settled) return;
        value.settled = true;
        value.detach();
        reject(Error(`Bridge stylesheet failed to load: ${url}`));
      };
      resource = value;
      stylesheets.set(url, value);
      link.addEventListener('load', loaded);
      link.addEventListener('error', failed);
      if (!existing) {
        link.rel = 'stylesheet';
        link.href = url;
        if (options.nonce) link.nonce = options.nonce;
        document.head.appendChild(link);
      }
      // Existing links may have finished loading before bootstrap was installed.
      // Reading sheet is cross-origin safe; inspecting cssRules would not be.
      if (link.sheet) loaded();
    }
    const value = resource;
    value.users++;
    let released = false;
    return {
      ready: value.ready,
      release() {
        if (released) return;
        released = true;
        value.users--;
        if (!value.users && !value.settled) {
          value.detach();
          stylesheets.delete(url);
          // Existing page styles belong to the document, not to this instance.
          if (value.owned) value.link.remove();
        }
      },
    };
  };
  const timeout = options.timeoutMs || 30000;
  const limit = options.maxQueuedBytes || 8 * 1024 * 1024;
  let redirecting = false;
  let leaving = false;
  const showError = () => {
    if (document.getElementById('mf-bridge-fatal-error')) return;
    const element = document.createElement('div');
    element.id = 'mf-bridge-fatal-error';
    element.setAttribute('role', 'alert');
    element.textContent =
      'The application could not be loaded. Please try again.';
    (document.body || document.documentElement).appendChild(element);
  };
  const fallback = (_error?: unknown) => {
    if (leaving || redirecting) return;
    const url = new URL(window.location.href);
    let csr = '';
    url.searchParams.forEach((value, name) => {
      if (name === 'csr') csr = value;
    });
    if (csr) {
      showError();
      return;
    }
    redirecting = true;
    url.searchParams.set('csr', '1');
    window.location.replace(url.toString());
  };
  const fail = (state: any, error: unknown) => {
    if (state.cancelled || state.complete) return;
    state.complete = true;
    state.pending = [];
    state.queuedBytes = 0;
    clearTimeout(state.timer);
    releaseStyles(state);
    state.reject(error);
    fallback(error);
  };
  const expect = (id: string) => {
    if (entries[id]) return;
    let resolve: (value: any) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const done = new Promise<any>((yes, no) => {
      resolve = yes;
      reject = no;
    });
    done.catch(() => {});
    const state: any = {
      done,
      resolve,
      reject,
      pending: [],
      queuedBytes: 0,
      complete: false,
      cancelled: false,
      hasHTML: false,
      hasData: false,
      stylesReady: true,
    };
    entries[id] = state;
    state.timer = setTimeout(
      () => fail(state, Error('Bridge stream timed out')),
      timeout,
    );
  };
  const insert = (container: HTMLElement, html: string, state: any) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    // appendChild moves the fragment's children. Capture references before it is emptied.
    const scripts = Array.prototype.slice.call(
      template.content.querySelectorAll('script'),
    ) as HTMLScriptElement[];
    scripts.forEach((script) => {
      if (script.src || script.type === 'module') {
        throw Error('Bridge SSR supports inline React completion scripts only');
      }
    });
    if (!state.hasHTML) {
      container.replaceChildren();
      state.hasHTML = true;
    }
    container.appendChild(template.content);
    scripts.forEach((old) => {
      const type = old.getAttribute('type');
      if (
        type &&
        type !== 'text/javascript' &&
        type !== 'application/javascript'
      )
        return;
      const script = document.createElement('script');
      Array.prototype.forEach.call(old.attributes, (attribute: Attr) => {
        script.setAttribute(attribute.name, attribute.value);
      });
      // Nonces can be hidden by getAttribute/attribute enumeration after DOM insertion.
      if (options.nonce || old.nonce) script.nonce = options.nonce || old.nonce;
      script.textContent = old.textContent;
      let executionError: unknown;
      const onError = (event: ErrorEvent) => {
        executionError = event.error || Error(event.message);
      };
      window.addEventListener('error', onError);
      try {
        old.replaceWith(script);
      } finally {
        window.removeEventListener('error', onError);
        script.remove();
      }
      if (executionError) throw executionError;
    });
  };
  const finish = (id: string, state: any) => {
    if (
      !state.streamDone ||
      !state.stylesReady ||
      state.complete ||
      state.cancelled
    )
      return;
    const container = document.getElementById(id);
    if (!container) return;
    // React 19 may schedule its boundary insertion after the last script returns.
    // Wait for the DOM state, keeping the watchdog active until it really completes.
    const comments = document.createTreeWalker(container, 128);
    let pending = false;
    let comment: Node | null;
    while ((comment = comments.nextNode())) {
      if (comment.nodeValue === '$!') {
        fail(state, Error('Bridge boundary requires client rendering'));
        return;
      }
      if (comment.nodeValue === '$?' || comment.nodeValue === '$~')
        pending = true;
    }
    if (pending) return;
    if (!state.hasHTML) container.replaceChildren();
    state.complete = true;
    clearTimeout(state.timer);
    releaseStyles(state);
    state.resolve({
      snapshot: state.snapshot,
      identifierPrefix: state.identifierPrefix,
    });
  };
  const drain = (id: string) => {
    const state = entries[id];
    if (!state || state.cancelled || state.complete) return;
    while (state.pending.length) {
      const next = state.pending[0];
      const frame = next.frame as BridgeStreamFrame;
      const container = document.getElementById(id);
      if (
        (frame.type === 'html' || frame.type === 'done') &&
        (!container || !state.stylesReady)
      )
        return;
      state.pending.shift();
      state.queuedBytes -= next.bytes;
      try {
        if (state.streamDone) throw Error('Bridge frame after completion');
        if (frame.type === 'error') throw Error(frame.message);
        if (frame.type === 'meta') {
          if (
            state.meta ||
            frame.protocol !== 'mf-bridge/1' ||
            !frame.identifierPrefix
          ) {
            throw Error('Invalid Bridge stream metadata');
          }
          state.meta = true;
          state.identifierPrefix = frame.identifierPrefix;
          if (
            frame.stylesheets !== undefined &&
            (!Array.isArray(frame.stylesheets) ||
              frame.stylesheets.some(
                (href) => typeof href !== 'string' || !href.trim(),
              ))
          )
            throw Error('Invalid Bridge stylesheet metadata');
          if (frame.stylesheets?.length) {
            state.stylesReady = false;
            const resources = Array.from(new Set(frame.stylesheets)).map(
              (href) => {
                const resource = acquireStylesheet(href);
                (state.releaseStyles ||= []).push(resource.release);
                return resource.ready;
              },
            );
            Promise.all(resources).then(
              () => {
                if (state.cancelled || state.complete || leaving) return;
                state.stylesReady = true;
                drain(id);
              },
              (error) => fail(state, error),
            );
          }
        } else if (!state.meta) throw Error('Missing Bridge stream metadata');
        else if (frame.type === 'html') {
          if (state.hasData || typeof frame.html !== 'string')
            throw Error('Invalid Bridge HTML frame');
          insert(container!, frame.html, state);
        } else if (frame.type === 'data') {
          if (state.hasData) throw Error('Duplicate Bridge snapshot');
          state.snapshot = frame.snapshot;
          state.hasData = true;
        } else if (frame.type === 'done') {
          if (!state.hasData) throw Error('Missing Bridge snapshot');
          state.streamDone = true;
          finish(id, state);
        } else throw Error('Unknown Bridge stream frame');
      } catch (error) {
        fail(state, error);
        return;
      }
    }
  };
  const runtime: BridgeStreamBrowserRuntime = {
    expect,
    get(id) {
      return entries[id];
    },
    claim(id, container) {
      const state = entries[id];
      if (!state || state.cancelled) return undefined;
      if (state.container && state.container !== container) {
        fail(state, Error('Bridge instance claimed by multiple containers'));
        return undefined;
      }
      state.container = container;
      drain(id);
      return state;
    },
    release(id, container) {
      const state = entries[id];
      if (!state || (state.container && state.container !== container)) return;
      state.cancelled = true;
      state.pending = [];
      state.queuedBytes = 0;
      clearTimeout(state.timer);
      releaseStyles(state);
      if (!state.complete) state.reject(Error('Bridge instance unmounted'));
    },
    accept(id, frame) {
      expect(id);
      const state = entries[id];
      if (state.cancelled) return;
      if (state.complete) {
        fallback(Error('Bridge frame after completion'));
        return;
      }
      try {
        // A server failure must not wait behind HTML held for pending CSS.
        if (frame.type === 'error') {
          fail(state, Error(frame.message));
          return;
        }
        const bytes = new TextEncoder().encode(
          JSON.stringify(frame),
        ).byteLength;
        if (state.queuedBytes + bytes > limit)
          throw Error('Bridge pending frames exceed limit');
        state.pending.push({ frame, bytes });
        state.queuedBytes += bytes;
        drain(id);
      } catch (error) {
        fail(state, error);
      }
    },
    fallback,
  };
  global.__MF_BRIDGE_SSR__ = runtime;
  (options.instanceIds || []).forEach(expect);
  const observer = new MutationObserver(() => {
    Object.keys(entries).forEach((id) => {
      if (entries[id].pending.length) drain(id);
      finish(id, entries[id]);
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  window.addEventListener(
    'pagehide',
    () => {
      leaving = true;
      observer.disconnect();
      Object.keys(entries).forEach((id) => {
        const state = entries[id];
        state.cancelled = true;
        clearTimeout(state.timer);
        releaseStyles(state);
      });
    },
    { once: true },
  );
}
