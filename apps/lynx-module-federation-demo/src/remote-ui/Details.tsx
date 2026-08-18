import { increment, instanceId, snapshot, token } from 'orbit-shared-state';

import './Remote.css';

export function Details() {
  const sharedState = snapshot();

  return (
    <view className="RemotePanel" data-testid="remote-details">
      <view className="RemotePanelHeader">
        <text className="RemotePanelTitle">Realm status</text>
        <view className="RemoteStatus">
          <view className="RemoteStatusDot" />
          <text className="RemoteStatusText">REMOTE DETAILS</text>
        </view>
      </view>

      <view className="RealmGrid">
        <view className="RealmCell">
          <text className="RealmName">Background</text>
          <text className="RealmMeta" data-testid="shared-details-count">
            READY · COUNT {sharedState.count}
          </text>
        </view>
        <view className="RealmCell">
          <text className="RealmName">Main thread</text>
          <text className="RealmMeta">READY · ISOLATED</text>
        </view>
      </view>

      <text className="IdentityLine">
        Direct singleton read · {sharedState.instanceId} · revision{' '}
        {sharedState.revision}
      </text>
    </view>
  );
}

export const sharedInstance = () => instanceId;
export const sharedSnapshot = snapshot;
export const sharedToken = () => token;

export function touchSharedState() {
  increment('catalog/Details');
  return snapshot();
}

export default Details;
