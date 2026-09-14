import { version as antdVersion } from 'antd';

const nonSharedPayload = Array.from(
  { length: 100_000 },
  (_, index) =>
    `another-remote-non-shared-${index.toString().padStart(6, '0')}`,
);

export const getConsumerMarker = () => 'another_remote';

export const getProvidedAntdVersion = () => antdVersion;

export const getNonSharedPayloadItems = () => nonSharedPayload.length;

export const getNonSharedPayload = () => nonSharedPayload;
