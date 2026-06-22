import React from 'react';

import type { ProbeResult } from './probe';

export const ProbeView = ({ result }: { result: ProbeResult }) => (
  <div>
    <h1>removeRemote cache probe</h1>
    <p id="probe-action">action: {result.action || 'full flow'}</p>
    <p id="gc-available">gc available: {String(result.gcAvailable)}</p>
    <p id="initial-remote-entry">initial remote: {result.initialRemoteEntry}</p>
    <p id="reloaded-remote-entry">
      reloaded remote: {result.reloadedRemoteEntry}
    </p>
    <p id="heavy-version">heavy version: {result.heavyStats?.version || '-'}</p>
    <p id="reloaded-heavy-version">
      reloaded heavy version: {result.reloadedHeavyStats?.version || '-'}
    </p>
    <p id="heavy-items">heavy items: {result.heavyStats?.items || 0}</p>
    <p id="heavy-created-at">
      heavy created at: {result.heavyStats?.createdAt || 0}
    </p>
    <p id="reloaded-heavy-created-at">
      reloaded heavy created at: {result.reloadedHeavyStats?.createdAt || 0}
    </p>
    <p id="heavy-load-count">
      heavy load count: {result.heavyStats?.loadCount || 0}
    </p>
    <p id="reloaded-heavy-load-count">
      reloaded heavy load count: {result.reloadedHeavyStats?.loadCount || 0}
    </p>
    <table border={1} cellPadding={5}>
      <thead>
        <tr>
          <td>step</td>
          <td>rss MB</td>
          <td>heap MB</td>
          <td>external MB</td>
          <td>require cache</td>
          <td>remote require cache</td>
          <td>webpack module cache</td>
          <td>webpack module factories</td>
          <td>bundler clearCache</td>
          <td>bundler chunk remote keys</td>
          <td>bundler module remote keys</td>
          <td>bundler mapped remote names</td>
          <td>heavy module cache</td>
          <td>federation instances</td>
          <td>module cache keys</td>
          <td>heap snapshot</td>
        </tr>
      </thead>
      <tbody>
        {result.snapshots.map((item) => (
          <tr key={item.label}>
            <td>{item.label}</td>
            <td>{item.rssMb}</td>
            <td>{item.heapUsedMb}</td>
            <td>{item.externalMb}</td>
            <td>{item.requireCacheEntries}</td>
            <td>{item.remoteRequireCacheEntries}</td>
            <td>{item.webpackModuleCacheEntries}</td>
            <td>{item.webpackModuleFactoryEntries}</td>
            <td>{String(item.bundlerClearCacheInstalled)}</td>
            <td>{item.bundlerChunkRemoteKeys.join(', ') || '-'}</td>
            <td>{item.bundlerModuleRemoteKeys.join(', ') || '-'}</td>
            <td>{item.bundlerMappedRemoteNames.join(', ') || '-'}</td>
            <td>
              {item.heavyModuleCacheEntries
                .map((entry) => `${entry.id}:${entry.payloadItems}`)
                .join(', ') || '-'}
            </td>
            <td>{item.federationInstances}</td>
            <td>{item.moduleCacheKeys.join(', ') || '-'}</td>
            <td>{item.heapSnapshotFile || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <pre id="remove-remote-cache-result">{JSON.stringify(result, null, 2)}</pre>
  </div>
);
