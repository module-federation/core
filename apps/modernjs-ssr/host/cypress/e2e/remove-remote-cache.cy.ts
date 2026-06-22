describe('/remove-remote-cache', () => {
  it('reloads a same-name remote from a different URL after removeRemote', () => {
    cy.visit('/remove-remote-cache', {
      timeout: 120_000,
    });

    cy.get('#remove-remote-cache-result', { timeout: 60_000 })
      .invoke('text')
      .then((text) => {
        const result = JSON.parse(text);

        expect(result.initialRemoteEntry).to.contain(
          '127.0.0.1:3051/static/mf-manifest.json',
        );
        expect(result.reloadedRemoteEntry).to.contain(
          '127.0.0.1:3055/mf-manifest.json',
        );
        expect(result.gcAvailable).to.equal(true);
        expect(result.heavyStats.version).to.equal('v1');
        expect(result.reloadedHeavyStats.version).to.equal('v2');
        expect(result.heavyStats.items).to.equal(200000);
        expect(result.reloadedHeavyStats.items).to.equal(200000);
        expect(result.heavyStats.first).to.not.equal(
          result.reloadedHeavyStats.first,
        );
        expect(result.removeRemoteError).to.equal(undefined);
        expect(result.clearCacheCalls).to.have.length(1);
        expect(result.clearCacheCalls[0].result).to.equal('resolved');
        expect(result.snapshots.map((item) => item.label)).to.deep.equal([
          'before load',
          'after load',
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
