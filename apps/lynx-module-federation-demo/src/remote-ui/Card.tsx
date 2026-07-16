import { useCallback } from '@lynx-js/react';
import { increment, instanceId, snapshot, token } from 'orbit-shared-state';

import type { RemoteCardProps } from './contracts';
import './Remote.css';

export function Card({ loadPath, onStateChange }: RemoteCardProps) {
  const sharedState = snapshot();
  const incrementFromRemote = useCallback(() => {
    'background-only';
    increment('catalog/Card');
    onStateChange(snapshot());
  }, [onStateChange]);

  return (
    <view className="RemotePanel RemotePanelAccent" data-testid="remote-card">
      <view className="RemotePanelHeader">
        <text className="RemotePanelTitle RemotePanelTitleDark">
          Shared state
        </text>
        <view className="RemoteStatus">
          <view className="RemoteStatusDot" />
          <text className="RemoteStatusText RemoteStatusTextDark">
            REMOTE CARD
          </text>
        </view>
      </view>

      <view className="CountHero">
        <text className="CountValue" data-testid="shared-card-count">
          {sharedState.count}
        </text>
        <text className="CountLabel">read by catalog/Card</text>
      </view>

      <view className="CountGrid">
        <view className="CountCell">
          <text className="CountCellLabel">Last writer</text>
          <text className="CountCellValue" data-testid="shared-last-source">
            {sharedState.lastSource}
          </text>
        </view>
        <view className="CountCell">
          <text className="CountCellLabel">Revision</text>
          <text className="CountCellValue">{sharedState.revision}</text>
        </view>
      </view>

      <text className="IdentityLine">
        Direct singleton read · {sharedState.instanceId} · {loadPath}
      </text>

      <view
        className="RemoteAction"
        bindtap={incrementFromRemote}
        data-testid="increment-shared"
      >
        <text className="RemoteActionText">Increment from remote</text>
      </view>
    </view>
  );
}

export function touchSharedState() {
  increment('catalog/Card');
  return snapshot();
}

export const sharedInstance = () => instanceId;
export const sharedSnapshot = snapshot;
export const sharedToken = () => token;

export default Card;
