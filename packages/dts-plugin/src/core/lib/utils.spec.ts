import { it, describe, expect, vi } from 'vitest';
import { nativeFetch, cloneDeepOptions } from './utils';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

it('nativeFetch should merge MF_ENV_HEADERS into request headers', async () => {
  const prevEnv = process.env['MF_ENV_HEADERS'];
  process.env['MF_ENV_HEADERS'] = JSON.stringify({ 'x-test': '1' });

  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'text/plain' }),
    text: vi.fn().mockResolvedValue('ok'),
  });
  vi.stubGlobal('fetch', fetchMock);

  const res = await nativeFetch('http://localhost');

  expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost',
    expect.objectContaining({
      headers: expect.objectContaining({ 'x-test': '1' }),
    }),
  );
  expect(res.data).toBe('ok');

  vi.unstubAllGlobals();
  process.env['MF_ENV_HEADERS'] = prevEnv;
});

it('nativeFetch should return arraybuffer when responseType is arraybuffer', async () => {
  const buf = Buffer.from('hello');
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/zip' }),
    arrayBuffer: vi.fn().mockResolvedValue(ab),
  });
  vi.stubGlobal('fetch', fetchMock);

  const res = await nativeFetch('http://localhost/file.zip', {
    responseType: 'arraybuffer',
  });

  expect(res.data).toBeInstanceOf(ArrayBuffer);

  vi.unstubAllGlobals();
});

describe('cloneDeepOptions', () => {
  it('deep clones plain values', () => {
    const options: DTSManagerOptions = {
      remote: {
        moduleFederationConfig: {
          name: 'app',
          filename: 'mf.js',
          exposes: {},
          remotes: {},
        },
      },
    };

    const result = cloneDeepOptions(options);

    expect(result).toEqual(options);
    expect(result).not.toBe(options);
    expect(result.remote).not.toBe(options.remote);
  });

  it('replaces "manifest" key with false at any nesting level', () => {
    const options: DTSManagerOptions = {
      remote: {
        moduleFederationConfig: {
          name: 'app',
          filename: 'mf.js',
          exposes: {},
          remotes: {},
          manifest: true,
        },
      },
    };
    const result = cloneDeepOptions(options);

    expect(result.remote?.moduleFederationConfig.manifest).toBe(false);
  });

  it('replaces "async" key with false', () => {
    const options: DTSManagerOptions = {
      remote: {
        moduleFederationConfig: {
          name: 'app',
          filename: 'mf.js',
          exposes: {},
          remotes: {},
          async: true,
        },
      },
    };
    const result = cloneDeepOptions(options);

    expect(result.remote?.moduleFederationConfig.async).toBe(false);
  });

  it('replaces function values with false', () => {
    const fn = () => 'hello';
    const options: DTSManagerOptions = { extraOptions: { compute: fn } };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['compute']).toBe(false);
  });

  it('converts extractThirdParty array items to strings', () => {
    const regex = /^react$/;
    const options: DTSManagerOptions = {
      extraOptions: { extractThirdParty: [regex, 'lodash'] },
    };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['extractThirdParty']).toEqual([
      regex.toString(),
      'lodash',
    ]);
  });

  it('does not share object references with the original', () => {
    const nested = { value: 42 };
    const options: DTSManagerOptions = { extraOptions: { nested } };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['nested']).toEqual(nested);
    expect(result.extraOptions?.['nested']).not.toBe(nested);
  });

  it('does not throw on a self-referencing object', () => {
    const circular: { [key: string]: unknown } = { value: 1 };
    circular['self'] = circular;
    const options: DTSManagerOptions = { extraOptions: circular };

    expect(() => cloneDeepOptions(options)).not.toThrow();
  });

  it('preserves the cycle in the cloned result', () => {
    const circular: { [key: string]: unknown } = { value: 1 };
    circular['self'] = circular;
    const options: DTSManagerOptions = { extraOptions: circular };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['value']).toBe(1);
    expect(result.extraOptions?.['self']).toBe(result.extraOptions);
  });

  it('does not throw on a circular array', () => {
    const arr: unknown[] = [1, 2];
    arr.push(arr);
    const options: DTSManagerOptions = { extraOptions: { arr } };

    expect(() => cloneDeepOptions(options)).not.toThrow();
  });
});
