import { isXVersion, parseRegex } from './utils';
import {
  caret,
  caretTrim,
  comparatorTrim,
  gte0,
  hyphenRange,
  star,
  tilde,
  tildeTrim,
  xRange,
} from './constants';

function replaceRange(
  range: string,
  regex: RegExp,
  replaceCallback: (
    match: string,
    from: string,
    fromMajor: string,
    fromMinor: string,
    fromPatch: string,
    fromPreRelease: string,
    fromBuild: string,
    to: string,
    toMajor: string,
    toMinor: string,
    toPatch: string,
    toPreRelease: string,
  ) => string,
): string {
  return range.replace(regex, replaceCallback);
}

function formatRange(
  fromMajor: string,
  fromMinor: string,
  fromPatch: string,
  fromVersion: string,
  toMajor: string,
  toMinor: string,
  toPatch: string,
  toVersion: string,
  toPreRelease: string,
): string {
  let fromVersionRes = fromVersion;
  if (isXVersion(fromMajor)) {
    fromVersionRes = '';
  } else if (isXVersion(fromMinor)) {
    fromVersionRes = `>=${fromMajor}.0.0`;
  } else if (isXVersion(fromPatch)) {
    fromVersionRes = `>=${fromMajor}.${fromMinor}.0`;
  } else {
    fromVersionRes = `>=${fromVersionRes}`;
  }

  let toVersionRes = toVersion;
  if (isXVersion(toMajor)) {
    toVersionRes = '';
  } else if (isXVersion(toMinor)) {
    toVersionRes = `<${Number(toMajor) + 1}.0.0-0`;
  } else if (isXVersion(toPatch)) {
    toVersionRes = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
  } else if (toPreRelease) {
    toVersionRes = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
  } else {
    toVersionRes = `<=${toVersionRes}`;
  }

  return `${fromVersionRes} ${toVersionRes}`.trim();
}

export function parseHyphen(range: string): string {
  return replaceRange(
    range,
    parseRegex(hyphenRange),
    (
      match,
      from,
      fromMajor,
      fromMinor,
      fromPatch,
      fromPreRelease,
      fromBuild,
      to,
      toMajor,
      toMinor,
      toPatch,
      toPreRelease,
    ) =>
      formatRange(
        fromMajor,
        fromMinor,
        fromPatch,
        from,
        toMajor,
        toMinor,
        toPatch,
        to,
        toPreRelease,
      ),
  );
}

export function parseComparatorTrim(range: string): string {
  return range.replace(parseRegex(comparatorTrim), '$1$2$3');
}

export function parseTildeTrim(range: string): string {
  return range.replace(parseRegex(tildeTrim), '$1~');
}

export function parseCaretTrim(range: string): string {
  return range.replace(parseRegex(caretTrim), '$1^');
}

function parseRange(
  range: string,
  regex: RegExp,
  replaceCallback: (
    match: string,
    major: string,
    minor: string,
    patch: string,
    preRelease: string,
  ) => string,
): string {
  return range
    .trim()
    .split(/\s+/)
    .map((rangeVersion) => rangeVersion.replace(regex, replaceCallback))
    .join(' ');
}

export function parseCarets(range: string): string {
  return parseRange(
    range,
    parseRegex(caret),
    (match, major, minor, patch, preRelease) => {
      if (isXVersion(major)) {
        return '';
      } else if (isXVersion(minor)) {
        return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
      } else if (isXVersion(patch)) {
        if (major === '0') {
          return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
        } else {
          return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
        }
      } else if (preRelease) {
        if (major === '0') {
          if (minor === '0') {
            return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${
              Number(patch) + 1
            }-0`;
          } else {
            return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${
              Number(minor) + 1
            }.0-0`;
          }
        } else {
          return `>=${major}.${minor}.${patch}-${preRelease} <${
            Number(major) + 1
          }.0.0-0`;
        }
      } else {
        if (major === '0') {
          if (minor === '0') {
            return `>=${major}.${minor}.${patch} <${major}.${minor}.${
              Number(patch) + 1
            }-0`;
          } else {
            return `>=${major}.${minor}.${patch} <${major}.${
              Number(minor) + 1
            }.0-0`;
          }
        }
        return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
      }
    },
  );
}

export function parseTildes(range: string): string {
  return parseRange(
    range,
    parseRegex(tilde),
    (match, major, minor, patch, preRelease) => {
      if (isXVersion(major)) {
        return '';
      } else if (isXVersion(minor)) {
        return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
      } else if (isXVersion(patch)) {
        return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
      } else if (preRelease) {
        return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${
          Number(minor) + 1
        }.0-0`;
      }
      return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
    },
  );
}

export function parseXRanges(range: string): string {
  return parseRange(
    range,
    parseRegex(xRange),
    (match, operator, major, minor, patch, preRelease) => {
      const isXMajor = isXVersion(major);
      const isXMinor = isXMajor || isXVersion(minor);
      const isXPatch = isXMinor || isXVersion(patch);

      if (operator === '=' && isXPatch) {
        operator = '';
      }

      preRelease = '';

      if (isXMajor) {
        if (operator === '>' || operator === '<') {
          return '<0.0.0-0';
        } else {
          return '*';
        }
      } else if (operator && isXPatch) {
        if (isXMinor) {
          minor = '0';
        }
        patch = '0';

        if (operator === '>') {
          operator = '>=';
          if (isXMinor) {
            major = (Number(major) + 1).toString();
            minor = '0';
            patch = '0';
          } else {
            minor = (Number(minor) + 1).toString();
            patch = '0';
          }
        } else if (operator === '<=') {
          operator = '<';
          if (isXMinor) {
            major = (Number(major) + 1).toString();
          } else {
            minor = (Number(minor) + 1).toString();
          }
        }

        if (operator === '<') {
          preRelease = '-0';
        }

        return `${operator + major}.${minor}.${patch}${preRelease}`;
      } else if (isXMinor) {
        return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
      } else if (isXPatch) {
        return `>=${major}.${minor}.0${preRelease} <${major}.${
          Number(minor) + 1
        }.0-0`;
      }

      return match;
    },
  );
}

export function parseStar(range: string): string {
  return range.trim().replace(parseRegex(star), '');
}

export function parseGTE0(comparatorString: string): string {
  return comparatorString.trim().replace(parseRegex(gte0), '');
}
