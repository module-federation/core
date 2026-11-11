import { getServiceUrl } from '../src/getServiceUrl';

describe('Service deployment URLs', () => {
  it.each([
    'https://service.example.test/weather',
    'https://service.example.test/weather/',
  ])('preserves the selected deployment base %s', (base) => {
    expect(getServiceUrl(base, '__mf/service/route%2FApp')).toBe(
      'https://service.example.test/weather/__mf/service/route%2FApp',
    );
  });

  it.each([
    undefined,
    '',
    '/weather/',
    'file:///weather/',
    'https://user:secret@example.test/',
    'https://example.test/?key=value',
    'https://example.test/#fragment',
  ])('rejects an incomplete or unsafe service base %s', (base) => {
    expect(() => getServiceUrl(base, 'render/App')).toThrow(/serviceBaseUrl/);
  });

  it.each([
    undefined,
    null,
    '',
    ' ',
    '/render/App',
    '//other.example.test/render',
    'https://other.example.test/render',
    '../render',
    'render/../../App',
    'render/%2e%2E/App',
    'render/.%2e/App',
    'render\\App',
    'render?target=App',
    'render#App',
    ' render/App',
    'render/\nApp',
  ])(
    'does not treat an invalid service path as ordinary loading: %s',
    (path) => {
      expect(() =>
        getServiceUrl('https://service.example.test/base/', path as string),
      ).toThrow(/servicePath/);
    },
  );
});
