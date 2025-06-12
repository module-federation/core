import lodash from 'lodash';

export default function ComponentB() {
  const lodashVersion = lodash.VERSION || 'unknown';
  const layerInfo = lodash.LAYER_INFO || 'unlayered';
  return `ComponentB (layer2) with lodash ${lodashVersion} (${layerInfo})`;
}
