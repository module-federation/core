import lodash from 'lodash';

export default function ComponentA() {
  const lodashVersion = lodash.VERSION || 'unknown';
  const layerInfo = lodash.LAYER_INFO || 'unlayered';
  return `ComponentA (layer1) with lodash ${lodashVersion} (${layerInfo})`;
}
