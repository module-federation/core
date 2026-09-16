import { act, render, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { HydratedStylesheetAssets } from '../src/lazy/HydratedStylesheetAssets';

const href = 'https://cdn.example.com/remote.css';

describe('HydratedStylesheetAssets', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('hydrates the server link without a warning before suppressing a head duplicate', async () => {
    document.head.innerHTML = `<link rel="stylesheet" href="${href}">`;
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <HydratedStylesheetAssets hrefs={[href]} />,
    );
    document.body.append(container);
    expect(container.querySelector('link')?.href).toBe(href);

    const onRecoverableError = jest.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(
        container,
        <HydratedStylesheetAssets hrefs={[href]} />,
        { onRecoverableError },
      );
    });

    await waitFor(() => expect(container.querySelector('link')).toBeNull());
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(async () => root!.unmount());
  });

  it('keeps a matching stylesheet inside a shadow root', async () => {
    document.head.innerHTML = `<link rel="stylesheet" href="${href}">`;
    const shadowRoot = document.body
      .appendChild(document.createElement('div'))
      .attachShadow({ mode: 'open' });
    const container = shadowRoot.appendChild(document.createElement('div'));

    render(<HydratedStylesheetAssets hrefs={[href]} />, { container });

    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(href),
    );
  });

  it('uses the owner document base URI and ignores the parent document head', async () => {
    document.head.innerHTML = '<link rel="stylesheet" href="./remote.css">';
    const childDocument = document.implementation.createHTMLDocument('child');
    const base = childDocument.createElement('base');
    base.href = 'https://child.example.com/assets/';
    childDocument.head.append(base);
    const container = childDocument.body.appendChild(
      childDocument.createElement('div'),
    );

    render(<HydratedStylesheetAssets hrefs={['./remote.css']} />, {
      container,
      baseElement: childDocument.body,
    });

    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(
        'https://child.example.com/assets/remote.css',
      ),
    );

    const childOwner = childDocument.createElement('link');
    childOwner.rel = 'stylesheet';
    childOwner.href = './remote.css';
    childDocument.head.append(childOwner);
    await waitFor(() => expect(container.querySelector('link')).toBeNull());
  });

  it('suppresses a late head owner and restores the link when it is removed', async () => {
    const { container, rerender } = render(
      <HydratedStylesheetAssets hrefs={[href]} />,
    );
    expect(container.querySelector('link')?.href).toBe(href);

    const owner = document.createElement('link');
    owner.rel = 'stylesheet';
    owner.href = href;
    document.head.append(owner);
    await waitFor(() => expect(container.querySelector('link')).toBeNull());

    rerender(<HydratedStylesheetAssets hrefs={[href]} />);
    owner.remove();
    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(href),
    );
  });

  it('keeps observing while another stylesheet group remains mounted', async () => {
    const first = render(<HydratedStylesheetAssets hrefs={[href]} />);
    const second = render(<HydratedStylesheetAssets hrefs={[href]} />);
    const owner = document.createElement('link');
    owner.rel = 'stylesheet';
    owner.href = href;
    document.head.append(owner);

    await waitFor(() => {
      expect(first.container.querySelector('link')).toBeNull();
      expect(second.container.querySelector('link')).toBeNull();
    });

    first.unmount();
    owner.remove();
    await waitFor(() =>
      expect(second.container.querySelector('link')?.href).toBe(href),
    );
  });

  it('disconnects the document observer after the last group unmounts', async () => {
    const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    try {
      const rendered = render(<HydratedStylesheetAssets hrefs={[href]} />);
      await waitFor(() =>
        expect(rendered.container.querySelector('link')?.href).toBe(href),
      );
      const callsBeforeUnmount = disconnect.mock.calls.length;

      rendered.unmount();

      expect(disconnect.mock.calls.length).toBeGreaterThan(callsBeforeUnmount);
    } finally {
      disconnect.mockRestore();
    }
  });

  it('tracks changes that make a head owner active or inactive', async () => {
    const owner = document.createElement('link');
    owner.rel = 'stylesheet';
    owner.href = href;
    document.head.append(owner);
    const { container } = render(<HydratedStylesheetAssets hrefs={[href]} />);
    await waitFor(() => expect(container.querySelector('link')).toBeNull());

    owner.setAttribute('disabled', '');
    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(href),
    );

    owner.removeAttribute('disabled');
    await waitFor(() => expect(container.querySelector('link')).toBeNull());

    owner.type = 'text/plain';
    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(href),
    );

    owner.type = 'text/css; charset=utf-8';
    await waitFor(() => expect(container.querySelector('link')).toBeNull());

    owner.href = 'https://cdn.example.com/other.css';
    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(href),
    );
  });

  it.each<[string, (link: HTMLLinkElement) => void]>([
    ['unsupported type', (link) => (link.type = 'text/plain')],
    ['non-screen media', (link) => (link.media = 'print')],
    ['alternate relation', (link) => (link.rel = 'alternate stylesheet')],
    ['disabled state', (link) => link.setAttribute('disabled', '')],
  ])('keeps the link for an inactive head stylesheet: %s', async (_, setup) => {
    const inactive = document.createElement('link');
    inactive.rel = 'stylesheet';
    inactive.href = href;
    setup(inactive);
    document.head.append(inactive);

    const { container } = render(<HydratedStylesheetAssets hrefs={[href]} />);

    await waitFor(() =>
      expect(container.querySelector('link')?.href).toBe(href),
    );
  });

  it('keeps React-owned stylesheets rendered in the document head', async () => {
    render(<HydratedStylesheetAssets hrefs={[href]} />, {
      container: document.head,
    });

    await waitFor(() =>
      expect(
        document.head.querySelectorAll(`link[href="${href}"]`),
      ).toHaveLength(1),
    );
  });
});
