export default function ProfileCard() {
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
