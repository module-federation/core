import { describe, expect, it } from 'vitest';
import {
  normalizeOutputRelativePath,
  toFileSourceUrl,
} from '../../../src/commands/utils/path-utils';

describe('commands path utils', () => {
  it('normalizes relative output paths to posix separators', () => {
    expect(normalizeOutputRelativePath('shared\\lodash.bundle')).toBe(
      'shared/lodash.bundle',
    );
  });

  it('builds file urls from normalized relative paths', () => {
    const parsed = new URL(toFileSourceUrl('exposed\\info.bundle'));
    expect(parsed.protocol).toBe('file:');
    expect(parsed.search).toBe('');
    expect(parsed.hash).toBe('');
    expect(parsed.pathname.endsWith('/exposed/info.bundle')).toBe(true);
  });

  it('encodes reserved characters as pathname segments', () => {
    const hashParsed = new URL(toFileSourceUrl('shared/#hash.bundle'));
    expect(hashParsed.hash).toBe('');
    expect(hashParsed.pathname.endsWith('/shared/%23hash.bundle')).toBe(true);

    const queryParsed = new URL(toFileSourceUrl('shared/?query.bundle'));
    expect(queryParsed.search).toBe('');
    expect(queryParsed.pathname.endsWith('/shared/%3Fquery.bundle')).toBe(true);

    const percentParsed = new URL(toFileSourceUrl('shared/%25literal.bundle'));
    expect(percentParsed.pathname.endsWith('/shared/%2525literal.bundle')).toBe(
      true,
    );
  });
});
