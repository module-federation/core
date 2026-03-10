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

  let bestMatch = null;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== '{' && char !== '[') {
      continue;
    }

    const toEndParse = tryParseJson(raw.slice(index));
    if (toEndParse.ok) {
      bestMatch = choosePreferredJsonMatch(
        bestMatch,
        buildJsonMatch(raw.slice(index), toEndParse.value),
      );
    }

    const balancedCandidate = extractBalancedJson(raw, index);
    if (!balancedCandidate) {
      continue;
    }

    const balancedParse = tryParseJson(balancedCandidate);
    if (balancedParse.ok) {
      bestMatch = choosePreferredJsonMatch(
        bestMatch,
        buildJsonMatch(balancedCandidate, balancedParse.value),
      );
    }
  }

  if (bestMatch) {
    return bestMatch.value;
  }

  throw new Error('Unable to locate JSON payload in Turbo output.');
}

export function listChangedFiles(root, baseRef, headRef, options = {}) {
  const diffFilter = options.diffFilter?.trim();
  const errorPrefix = options.errorPrefix ?? 'Failed to compute changed files';
  const args = ['diff', '--name-only'];

  if (diffFilter) {
    args.push(`--diff-filter=${diffFilter}`);
  }

  args.push(`${baseRef}...${headRef}`);

  const result = spawnSync('git', args, {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(
      `${errorPrefix} for ${baseRef}...${headRef}: ${result.stderr || result.stdout}`,
    );
  }

  return result.stdout
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
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

function buildJsonMatch(rawText, value) {
  return {
    rawText,
    value,
    score: scoreTurboJsonCandidate(value, rawText),
  };
}

function choosePreferredJsonMatch(current, candidate) {
  if (!current) {
    return candidate;
  }
  if (candidate.score !== current.score) {
    return candidate.score > current.score ? candidate : current;
  }
  if (candidate.rawText.length !== current.rawText.length) {
    return candidate.rawText.length > current.rawText.length
      ? candidate
      : current;
  }
  return candidate;
}

function scoreTurboJsonCandidate(value, rawText) {
  let score = 0;

  if (Array.isArray(value)) {
    score += 5;
    if (value.some((item) => item && typeof item === 'object')) {
      score += 10;
    }
  } else if (value && typeof value === 'object') {
    score += 10;
    if (value.turboVersion || value.packageManager) {
      score += 40;
    }
    if (value.packages) {
      score += 40;
    }
    if (Array.isArray(value.tasks)) {
      score += 40;
    }
    if (value.globalCacheInputs) {
      score += 20;
    }
  }

  if (typeof rawText === 'string') {
    score += Math.min(rawText.length, 100000) / 1000;
  }

  return score;
}
