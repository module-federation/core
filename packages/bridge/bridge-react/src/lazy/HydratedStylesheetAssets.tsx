import React, { useEffect, useRef, useState } from 'react';

type StylesheetSubscriber = (hrefs: ReadonlySet<string>) => void;

type HeadStylesheetStore = {
  document: Document;
  head: HTMLHeadElement | null;
  hrefs: ReadonlySet<string>;
  observer: MutationObserver;
  subscribers: Set<StylesheetSubscriber>;
};

const EMPTY_HREFS = new Set<string>();
const stylesheetStores = new WeakMap<Document, HeadStylesheetStore>();

function isActiveStylesheet(link: HTMLLinkElement) {
  const rel = link.rel.toLowerCase().split(/\s+/u);
  const media = link.media.trim().toLowerCase();
  const type = link.type.trim().toLowerCase().split(';', 1)[0].trim();

  return (
    rel.includes('stylesheet') &&
    !rel.includes('alternate') &&
    !link.disabled &&
    !link.hasAttribute('disabled') &&
    (!media || media === 'all') &&
    (!type || type === 'text/css')
  );
}

function collectHeadStylesheetHrefs(document: Document) {
  const hrefs = new Set<string>();
  document.head
    ?.querySelectorAll<HTMLLinkElement>('link[href]')
    .forEach((link) => {
      if (isActiveStylesheet(link)) {
        hrefs.add(link.href);
      }
    });
  return hrefs;
}

function haveSameHrefs(
  current: ReadonlySet<string>,
  next: ReadonlySet<string>,
) {
  if (current.size !== next.size) {
    return false;
  }
  for (const href of current) {
    if (!next.has(href)) {
      return false;
    }
  }
  return true;
}

function observeHead(store: HeadStylesheetStore) {
  store.observer.disconnect();
  const { document, head, observer } = store;

  if (head) {
    observer.observe(head, {
      attributes: true,
      attributeFilter: ['disabled', 'href', 'media', 'rel', 'type'],
      childList: true,
      subtree: true,
    });
  }

  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true });
  }
}

function refreshHeadStylesheets(store: HeadStylesheetStore) {
  if (!store.subscribers.size) {
    return;
  }

  const head = store.document.head;
  if (head !== store.head) {
    store.head = head;
    observeHead(store);
  }

  const hrefs = collectHeadStylesheetHrefs(store.document);
  if (haveSameHrefs(store.hrefs, hrefs)) {
    return;
  }

  store.hrefs = hrefs;
  store.subscribers.forEach((subscriber) => subscriber(hrefs));
}

function getStylesheetStore(document: Document) {
  const current = stylesheetStores.get(document);
  if (current) {
    return current;
  }

  const MutationObserver =
    document.defaultView?.MutationObserver ?? globalThis.MutationObserver;
  let store: HeadStylesheetStore;
  const observer = new MutationObserver(() => refreshHeadStylesheets(store));
  store = {
    document,
    head: document.head,
    hrefs: collectHeadStylesheetHrefs(document),
    observer,
    subscribers: new Set(),
  };
  observeHead(store);
  stylesheetStores.set(document, store);
  return store;
}

function subscribeToHeadStylesheets(
  document: Document,
  subscriber: StylesheetSubscriber,
) {
  const store = getStylesheetStore(document);
  let subscribed = true;
  store.subscribers.add(subscriber);
  subscriber(store.hrefs);

  return () => {
    if (!subscribed) {
      return;
    }
    subscribed = false;
    store.subscribers.delete(subscriber);
    if (!store.subscribers.size) {
      store.observer.disconnect();
      if (stylesheetStores.get(document) === store) {
        stylesheetStores.delete(document);
      }
    }
  };
}

function resolveHref(href: string, document: Document) {
  try {
    return new URL(href, document.baseURI).href;
  } catch {
    return href;
  }
}

export function HydratedStylesheetAssets({ hrefs }: { hrefs: string[] }) {
  const firstLinkRef = useRef<HTMLLinkElement | null>(null);
  const ownerDocumentRef = useRef<Document | null>(null);
  const [headHrefs, setHeadHrefs] = useState<ReadonlySet<string>>(EMPTY_HREFS);

  useEffect(() => {
    const link = firstLinkRef.current;
    if (!link) {
      return;
    }

    const ownerDocument = link.ownerDocument;
    ownerDocumentRef.current = ownerDocument;
    if (
      link.getRootNode() !== ownerDocument ||
      ownerDocument.head?.contains(link)
    ) {
      return;
    }

    return subscribeToHeadStylesheets(ownerDocument, setHeadHrefs);
  }, []);

  return (
    <>
      {hrefs.map((href, index) =>
        ownerDocumentRef.current &&
        headHrefs.has(resolveHref(href, ownerDocumentRef.current)) ? null : (
          <link
            key={href}
            ref={index === 0 ? firstLinkRef : undefined}
            href={href}
            rel="stylesheet"
            type="text/css"
          />
        ),
      )}
    </>
  );
}
