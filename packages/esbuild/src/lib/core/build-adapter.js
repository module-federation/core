import { logger } from '../utils/logger';

let _buildAdapter = async () => {
  logger.error('Please set a BuildAdapter!');
  return [];
};

export function setBuildAdapter(buildAdapter) {
  _buildAdapter = buildAdapter;
}

export function getBuildAdapter() {
  return _buildAdapter;
}
