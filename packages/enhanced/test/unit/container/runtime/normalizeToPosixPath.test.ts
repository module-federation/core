import { describe, expect, it } from '@rstest/core';
import { normalizeToPosixPath } from '../../../../src/lib/container/runtime/normalizeToPosixPath';

describe('normalizeToPosixPath', () => {
  it.each([
    ['', '.'],
    ['a\\b', 'a/b'],
    ['.\\a\\b', './a/b'],
    ['C:\\foo\\..\\bar', 'C:/bar'],
    ['\\\\server\\share\\a\\..\\b', '//server/share/b'],
    ['a//b///c', 'a/b/c'],
    ['../a/./b', '../a/b'],
    ['/a/b/../', '/a/'],
    ['C:/foo//bar/', 'C:/foo/bar/'],
    ['\\\\.\\pipe\\name', '//./pipe/name'],
    ['\\\\?\\C:\\foo\\..\\bar', '//?/C:/bar'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeToPosixPath(input)).toBe(expected);
  });
});
