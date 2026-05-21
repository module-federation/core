import { useEffect } from 'react';

type OnMFRemoteLoaded = (options?: {
  metadata?: Record<string, unknown>;
}) => void;

export default function ProfileCard({
  onMFRemoteLoaded,
}: {
  onMFRemoteLoaded?: OnMFRemoteLoaded;
}) {
  useEffect(() => {
    onMFRemoteLoaded?.({
      metadata: {
        producer: 'runtime_remote2',
        expose: './ProfileCard',
      },
    });
  }, [onMFRemoteLoaded]);

  return (
    <section
      className="customer-portal__remote-widget"
      data-testid="remote2-profile-card"
    >
      <h3>Jordan Lee</h3>
      <p>
        Account owner profile loaded from runtime_remote2/ProfileCard when the
        page opened.
      </p>
      <div className="customer-portal__remote-meta">
        <span>producer: runtime_remote2</span>
        <span>expose: ProfileCard</span>
      </div>
    </section>
  );
}
