import type { SnapshotHandlerContract } from '../../type';
import { PluginSystem } from '../../utils/hooks';

export class DisabledSnapshotHandler implements SnapshotHandlerContract {
  hooks: SnapshotHandlerContract['hooks'] = new PluginSystem(
    {} as SnapshotHandlerContract['hooks']['lifecycle'],
  );
}
