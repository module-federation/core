import { expect, it, rs } from '@rstest/core';
import { consumeTypesAPI } from './ConsumeTypesPlugin';

const { consumeTypes } = rs.hoisted(() => ({ consumeTypes: rs.fn() }));
rs.mock('../core/index', () => ({ consumeTypes, validateOptions: rs.fn() }));

it('consumeTypesAPI resolves only after remote types are consumed', async () => {
  consumeTypes.mockImplementationOnce(
    () => new Promise((resolve) => setTimeout(resolve, 10)),
  );
  const callback = rs.fn();

  await consumeTypesAPI({ host: { moduleFederationConfig: {} } }, callback);

  expect(callback).toHaveBeenCalledTimes(1);
});
