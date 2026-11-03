import { useLang } from '@rspress/core/runtime';
import React, { useMemo, useState } from 'react';
import { NoSSR } from '../NoSSR';
import type { ShareScopeAlignmentItem } from './computeInitContainerShareScopeAlignment';
import { computeInitContainerShareScopeAlignment } from './computeInitContainerShareScopeAlignment';

type InputKind = 'unset' | 'string' | 'array';

const GERMAN_MESSAGES: Record<string, string> = {
  'Host shareScope is an empty array.':
    'Der shareScope des Hosts ist ein leeres Array.',
  "Host shareScope is an array with a single item. Prefer a string (e.g. 'default') unless you intentionally need array semantics.":
    "Der shareScope des Hosts ist ein Array mit einem einzigen Eintrag. Verwende vorzugsweise einen String (z. B. 'default'), sofern du nicht ausdrücklich die Array-Semantik benötigst.",
  'Remote shareScope is an empty array.':
    'Der shareScope des Remotes ist ein leeres Array.',
  "Remote shareScope is an array with a single item. Prefer a string (e.g. 'default') unless you intentionally need array semantics.":
    "Der shareScope des Remotes ist ein Array mit einem einzigen Eintrag. Verwende vorzugsweise einen String (z. B. 'default'), sofern du nicht ausdrücklich die Array-Semantik benötigst.",
  'Aligned via the shareScope object passed to remoteEntry.init(...)':
    'Abgleich über das shareScope-Objekt, das an remoteEntry.init(...) übergeben wird',
};

function parseStringArray(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function toShareScopeKey(
  kind: InputKind,
  raw: string,
): string | string[] | undefined {
  if (kind === 'unset') return undefined;
  if (kind === 'string') {
    const v = raw.trim();
    return v ? v : undefined;
  }
  return parseStringArray(raw);
}

export default function ShareScopeAlignmentPlayground() {
  const isGerman = useLang() === 'de';
  const localize = (message: string) =>
    isGerman ? GERMAN_MESSAGES[message] || message : message;
  const [hostKind, setHostKind] = useState<InputKind>('array');
  const [hostRaw, setHostRaw] = useState('default,scope1');

  const [remoteKind, setRemoteKind] = useState<InputKind>('string');
  const [remoteRaw, setRemoteRaw] = useState('default');

  const hostShareScopeKeys = useMemo(
    () => toShareScopeKey(hostKind, hostRaw),
    [hostKind, hostRaw],
  );
  const remoteShareScopeKey = useMemo(
    () => toShareScopeKey(remoteKind, remoteRaw),
    [remoteKind, remoteRaw],
  );

  const result = useMemo(() => {
    return computeInitContainerShareScopeAlignment({
      hostShareScopeKeys,
      remoteShareScopeKey,
    });
  }, [hostShareScopeKeys, remoteShareScopeKey]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    padding: '8px 10px',
    border: '1px solid var(--rp-c-divider, #e5e7eb)',
    borderRadius: 8,
    background: 'var(--rp-c-bg, #fff)',
    color: 'var(--rp-c-text-1, #111827)',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    maxWidth: 200,
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--rp-c-divider, #e5e7eb)',
    borderRadius: 12,
    padding: 14,
    background: 'var(--rp-c-bg, #fff)',
    margin: '12px 0',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--rp-c-text-2, #374151)',
    marginBottom: 6,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const blockTitleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--rp-c-text-1, #111827)',
    margin: '14px 0 8px',
  };

  return (
    <NoSSR>
      <div style={cardStyle}>
        <div style={rowStyle}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={labelStyle}>
              {isGerman ? 'Share Scope des Hosts' : 'HostShareScope'}{' '}
              (remotes[remote].shareScope)
            </div>
            <div style={rowStyle}>
              <select
                aria-label={
                  isGerman
                    ? 'Typ des Host-Share-Scopes'
                    : 'Host share scope type'
                }
                value={hostKind}
                onChange={(e) => setHostKind(e.target.value as InputKind)}
                style={selectStyle}
              >
                <option value="unset">
                  {isGerman ? 'nicht gesetzt' : 'unset'}
                </option>
                <option value="string">string</option>
                <option value="array">array</option>
              </select>
              <input
                aria-label={
                  isGerman ? 'Host-Share-Scopes' : 'Host share scopes'
                }
                value={hostRaw}
                onChange={(e) => setHostRaw(e.target.value)}
                placeholder="default,scope1"
                style={inputStyle}
                disabled={hostKind === 'unset'}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <div style={labelStyle}>
              {isGerman ? 'Share Scope des Remotes' : 'RemoteShareScope'}{' '}
              (shareScope)
            </div>
            <div style={rowStyle}>
              <select
                aria-label={
                  isGerman
                    ? 'Typ des Remote-Share-Scopes'
                    : 'Remote share scope type'
                }
                value={remoteKind}
                onChange={(e) => setRemoteKind(e.target.value as InputKind)}
                style={selectStyle}
              >
                <option value="unset">
                  {isGerman ? 'nicht gesetzt' : 'unset'}
                </option>
                <option value="string">string</option>
                <option value="array">array</option>
              </select>
              <input
                aria-label={
                  isGerman ? 'Remote-Share-Scopes' : 'Remote share scopes'
                }
                value={remoteRaw}
                onChange={(e) => setRemoteRaw(e.target.value)}
                placeholder="default"
                style={inputStyle}
                disabled={remoteKind === 'unset'}
              />
            </div>
          </div>
        </div>

        {result.warnings.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <div style={blockTitleStyle}>
              {isGerman ? 'Warnungen' : 'Warnings'}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {result.warnings.map((w: string) => (
                <li key={w} style={{ color: 'var(--rp-c-text-2, #374151)' }}>
                  {localize(w)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div style={blockTitleStyle}>
          {isGerman ? 'Abgleich (Pseudocode)' : 'Alignment (pseudo code)'}
        </div>
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 10,
            border: '1px solid var(--rp-c-divider, #e5e7eb)',
            background: 'var(--rp-code-bg, rgba(0,0,0,0.03))',
            overflowX: 'auto',
          }}
        >
          {result.alignment.length > 0
            ? result.alignment
                .map((a: ShareScopeAlignmentItem) => {
                  if ('note' in a)
                    return `${a.expression}\n${localize(a.note)}`;
                  return a.expression;
                })
                .join('\n')
            : isGerman
              ? '(kein Abgleich)'
              : '(no alignment)'}
        </pre>

        <div style={blockTitleStyle}>
          {isGerman ? 'Initialisierte Scopes' : 'Initialized Scopes'}
        </div>
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 10,
            border: '1px solid var(--rp-c-divider, #e5e7eb)',
            background: 'var(--rp-code-bg, rgba(0,0,0,0.03))',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(result.initializedScopes, null, 2)}
        </pre>
      </div>
    </NoSSR>
  );
}
