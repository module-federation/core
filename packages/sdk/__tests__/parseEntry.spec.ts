import { parseEntry } from '../src';

describe('parseEntry', () => {
  it('get correct entryInfo by parsing normal entry', () => {
    const entry = '@byted/app1:1.2.0';

    const entryInfo = parseEntry(entry);

    expect(entryInfo).toMatchObject({
      version: '1.2.0',
      name: '@byted/app1',
    });
  });

  it('get correct entryInfo by parsing none version entry', () => {
    const entry = '@byted/app1';

    const entryInfo = parseEntry(entry);

    expect(entryInfo).toMatchObject({
      version: '*',
      name: '@byted/app1',
    });
  });

  it('get correct entryInfo by parsing local version entry', () => {
    const entry = '@byted/app1:http://localhost:8080/mf-manifest.json';

    const entryInfo = parseEntry(entry);

    expect(entryInfo).toMatchObject({
      name: '@byted/app1',
      entry: 'http://localhost:8080/mf-manifest.json',
    });
  });

  it('get correct entryInfo by parsing dts manifest entry', () => {
    const entry = '@scope/app1@http://domain/@version/mf-manifest.json';

    const entryInfo = parseEntry(entry, undefined, '@');

    expect(entryInfo).toMatchObject({
      name: '@scope/app1',
      entry: 'http://domain/@version/mf-manifest.json',
    });
  });
});
