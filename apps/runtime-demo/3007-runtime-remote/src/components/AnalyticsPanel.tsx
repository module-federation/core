import { useEffect } from 'react';

type OnMFRemoteLoaded = (options?: {
  metadata?: Record<string, unknown>;
}) => void;

export default function AnalyticsPanel({
  onMFRemoteLoaded,
}: {
  onMFRemoteLoaded?: OnMFRemoteLoaded;
}) {
  useEffect(() => {
    onMFRemoteLoaded?.({
      metadata: {
        producer: 'runtime_remote2',
        expose: './AnalyticsPanel',
        readySource: 'producer',
      },
    });
  }, [onMFRemoteLoaded]);

  return (
    <section
      className="customer-portal__remote-widget"
      data-testid="remote2-analytics-panel"
    >
      <h3>Expansion analytics</h3>
      <p>
        Analytics panel loaded from runtime_remote2/AnalyticsPanel after route
        navigation.
      </p>
      <div className="customer-portal__remote-meta">
        <span>producer: runtime_remote2</span>
        <span>expose: AnalyticsPanel</span>
        <span>shared: react</span>
        <span>shared: observability-customer-sdk</span>
      </div>
    </section>
  );
}
