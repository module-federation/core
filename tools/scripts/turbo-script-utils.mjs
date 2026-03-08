import { spawnSync } from 'node:child_process';

export function hasGitRef(root, ref) {
  if (!ref || !ref.trim()) {
    return false;
  }

  const result = spawnSync(
    'git',
    ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`],
    {
      cwd: root,
      stdio: 'ignore',
    },
  );

  return result.status === 0;
}

export function resolveGitCommit(root, ref) {
  if (!ref || !ref.trim()) {
    return null;
  }

  const result = spawnSync(
    'git',
    ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`],
    {
      cwd: root,
      stdio: 'pipe',
      encoding: 'utf-8',
    },
  );

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim() || null;
}

export function parseJsonFromTurboOutput(outputText) {
  const raw = outputText?.trim();
  if (!raw) {
    throw new Error('Turbo output is empty.');
  }

  const directParse = tryParseJson(raw);
  if (directParse.ok) {
    return directParse.value;
  }

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== '{' && char !== '[') {
      continue;
    }

    const toEndParse = tryParseJson(raw.slice(index));
    if (toEndParse.ok) {
      return toEndParse.value;
    }

    const balancedCandidate = extractBalancedJson(raw, index);
    if (!balancedCandidate) {
      continue;
    }

    const balancedParse = tryParseJson(balancedCandidate);
    if (balancedParse.ok) {
      return balancedParse.value;
    }
  }

  throw new Error('Unable to locate JSON payload in Turbo output.');
}

function tryParseJson(value) {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false, value: null };
  }
}

function extractBalancedJson(text, startIndex) {
  const stack = [];
  let inString = false;
  let escaping = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === '\\') {
        escaping = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      stack.push('}');
      continue;
    }
    if (char === '[') {
      stack.push(']');
      continue;
    }
    if (char === '}' || char === ']') {
      const expected = stack.pop();
      if (expected !== char) {
        return null;
      }
      if (stack.length === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}
