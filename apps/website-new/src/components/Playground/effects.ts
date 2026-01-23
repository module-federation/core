import { useMemo } from 'react';
import type { PlaygroundState } from './state';
import {
  generateConsumerConfigSnippet,
  generateManifestSnippet,
  generatePluginConsumerUsageSnippet,
  generateProducerComponentSnippet,
  generateProducerConfigSnippet,
  generateRuntimeUsageSnippet,
} from './utils';

export interface PlaygroundGeneratedCode {
  producerConfig: string;
  consumerConfig: string;
  manifest: string;
  runtimeUsage: string;
  pluginUsage: string;
  producerComponent: string;
}

export function usePlaygroundGeneratedCode(
  state: PlaygroundState,
): PlaygroundGeneratedCode {
  return useMemo(
    () => ({
      producerConfig: generateProducerConfigSnippet(state.producer),
      consumerConfig: generateConsumerConfigSnippet(state),
      manifest: generateManifestSnippet(state),
      runtimeUsage: generateRuntimeUsageSnippet(state),
      pluginUsage: generatePluginConsumerUsageSnippet(state),
      producerComponent: generateProducerComponentSnippet(state.producer),
    }),
    [state],
  );
}
