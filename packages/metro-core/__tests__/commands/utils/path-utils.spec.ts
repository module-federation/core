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
    expect(toFileSourceUrl('exposed\\info.bundle')).toBe(
      'file:///exposed/info.bundle',
    );
  });

  it('encodes reserved characters as pathname segments', () => {
    expect(toFileSourceUrl('shared/#hash.bundle')).toBe(
      'file:///shared/%23hash.bundle',
    );
    expect(toFileSourceUrl('shared/?query.bundle')).toBe(
      'file:///shared/%3Fquery.bundle',
    );
    expect(toFileSourceUrl('shared/%25literal.bundle')).toBe(
      'file:///shared/%2525literal.bundle',
    );
  });
});
