import { Module as RemoteModule } from '../../module';
import { UnavailableRemoteModule } from '../../remote/disabled';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;

export const Module =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
  FEDERATION_OPTIMIZE_NO_REMOTE
    ? UnavailableRemoteModule
    : RemoteModule;
