import validateContainer from '../../../src/schemas/container/ContainerPlugin.check';
import validateFederation from '../../../src/schemas/container/ModuleFederationPlugin.check';

it.each([validateContainer, validateFederation])(
  'accepts named or omitted expose layers and rejects empty layers',
  (validate) => {
    for (const layer of [undefined, 'server']) {
      expect(
        validate({
          name: 'host',
          exposes: { './module': { import: './module', layer } },
        }),
      ).toBe(true);
    }
    expect(
      validate({
        name: 'host',
        exposes: { './module': { import: './module', layer: '' } },
      }),
    ).toBe(false);
  },
);
