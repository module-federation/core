import { logger } from '../utils/logger';

type BuildAdapter = () => Promise<any[]>;

let _buildAdapter: BuildAdapter = async () => {
  logger.error('Please set a BuildAdapter!');
  return [];
};

export function setBuildAdapter(buildAdapter: BuildAdapter): void {
  _buildAdapter = buildAdapter;
}

export function getBuildAdapter(): BuildAdapter {
  return _buildAdapter;
}
