describe('bridge-react default entry', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('does not require router packages during module initialization', () => {
    jest.isolateModules(() => {
      jest.doMock(
        '@module-federation/bridge-shared',
        () => ({
          dispatchPopstateEnv: jest.fn(),
        }),
        { virtual: true },
      );
      jest.doMock('react-router-dom', () => {
        throw new Error('react-router-dom should not be required');
      });
      jest.doMock('react-router', () => {
        throw new Error('react-router should not be required');
      });

      expect(() => require('../src')).not.toThrow();
    });
  });
});
