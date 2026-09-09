describe('/remove-remote-cache', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (error) => {
      if (error.message.includes('rspackHotUpdatehost')) {
        return false;
      }
      return undefined;
    });
  });

  it('replaces a loaded remote on a later SSR request', () => {
    cy.visit('/remove-remote-cache', {
      timeout: 120_000,
    });

    cy.get('#remove-remote-cache-result', { timeout: 60_000 })
      .invoke('text')
      .then((text) => JSON.parse(text))
      .then((initialResult) => {
        expect(initialResult.action).to.equal('load remote v1');
        expect(initialResult.heavyStats.version).to.equal('v1');
        expect(initialResult.heavyStats.items).to.equal(200000);
        expect(initialResult.v1Runtime.captured).to.equal(true);
        expect(initialResult.v1Runtime.hostModuleCacheHasRemote).to.equal(true);
        expect(initialResult.snapshots.map((item) => item.label)).to.deep.equal(
          ['before load', 'after load'],
        );
      });

    cy.visit('/remove-remote-cache?update=1', {
      timeout: 120_000,
    });

    cy.get('#remove-remote-cache-result', { timeout: 60_000 })
      .invoke('text')
      .then((text) => {
        const result = JSON.parse(text);

        expect(result.initialRemoteEntry).to.contain(
          '127.0.0.1:3051/static/mf-manifest.json',
        );
        expect(result.initialRemoteName).to.equal('remote');
        expect(result.reloadedRemoteEntry).to.contain(
          '127.0.0.1:3055/mf-manifest.json',
        );
        expect(result.reloadedRemoteName).to.equal('replacement_remote');
        expect(result.gcAvailable).to.equal(true);
        expect(result.reloadedHeavyStats.version).to.equal('v2');
        expect(result.reloadedHeavyStats.items).to.equal(200000);
        expect(result.removeRemoteError).to.equal(undefined);
        expect(result.v1Runtime.captured).to.equal(true);
        expect(result.v1RuntimeAfterRemove.hostModuleCacheHasRemote).to.equal(
          false,
        );
        expect(
          result.v1RuntimeAfterRemove.federationInstancesWithRemote,
        ).to.equal(0);
        expect(
          result.v1RuntimeAfterRemove.globalEntryKeysPresent,
        ).to.deep.equal([]);
        expect(result.snapshots.map((item) => item.label)).to.deep.equal([
          'before load',
          'after load',
          'before removeRemote',
          'after removeRemote',
          'after gc',
          'after delayed gc 10s',
          'after delayed gc 20s',
          'after delayed gc 30s',
          'after reload',
        ]);

        const snapshotsByLabel = Object.fromEntries(
          result.snapshots.map((item) => [item.label, item]),
        );
        const afterRemoveHeap =
          snapshotsByLabel['after removeRemote'].heapUsedMb;
        const delayedGcSnapshots = [
          snapshotsByLabel['after delayed gc 10s'],
          snapshotsByLabel['after delayed gc 20s'],
          snapshotsByLabel['after delayed gc 30s'],
        ];

        expect(
          delayedGcSnapshots.some(
            (snapshot) => snapshot.heapUsedMb < afterRemoveHeap,
          ),
          `heap should decrease after removeRemote within 30s, afterRemove=${afterRemoveHeap}, delayed=${delayedGcSnapshots
            .map((snapshot) => snapshot.heapUsedMb)
            .join(',')}`,
        ).to.equal(true);
      });
  });
});
