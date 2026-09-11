const visitAndRead = (path) => {
  cy.visit(path, { timeout: 120_000 });
  return cy
    .get('#remove-remote-shared-cache-result', { timeout: 60_000 })
    .invoke('text')
    .then((text) => JSON.parse(text));
};

describe('/remove-remote-shared-cache', () => {
  it('provides antd before the host consumes it, then removes another_remote', () => {
    visitAndRead('/remove-remote-shared-cache').then((result) => {
      expect(result.consumerMarker).to.equal('another_remote');
      expect(result.providedAntdVersion).to.equal('4.24.15');
      expect(result.nonSharedPayloadItems).to.equal(100_000);
      expect(result.runtime.anotherRemoteInstances).to.equal(1);
      expect(result.runtime.hostModuleCacheHasAnotherRemote).to.equal(true);
      expect(
        result.runtime.antdShares.some(
          (shared) =>
            shared.from === 'another_remote' && shared.loaded === true,
        ),
      ).to.equal(true);
    });

    visitAndRead('/remove-remote-shared-cache?load=1').then((result) => {
      expect(result.antdVersion).to.equal('4.24.15');
      expect(
        result.runtime.antdShares.some(
          (shared) =>
            shared.from === 'another_remote' && shared.loaded === true,
        ),
      ).to.equal(true);
    });

    visitAndRead('/remove-remote-shared-cache?remove=another_remote').then(
      (result) => {
        expect(result.runtime.anotherRemoteInstances).to.equal(0);
        expect(result.runtime.hostModuleCacheHasAnotherRemote).to.equal(false);
        expect(result.antdVersionAfterRemove).to.equal('4.24.15');
        expect(result.nonSharedPayloadCollected).to.equal(true);
        expect(
          result.runtime.antdShares.some(
            (shared) =>
              shared.from === 'another_remote' && shared.loaded === true,
          ),
        ).to.equal(true);
        expect(
          result.snapshots.map((snapshot) => snapshot.label),
        ).to.deep.equal(['after-load', 'after-remove', 'after-gc']);
        expect(result.snapshots[1].file).to.match(
          /after-remove.*heapsnapshot$/,
        );
        expect(result.snapshots[2].file).to.match(/after-gc.*heapsnapshot$/);
      },
    );
  });
});
