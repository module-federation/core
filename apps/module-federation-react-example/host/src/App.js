import React from 'react';

const App = () => {
  const [RemoteButton, setRemoteButton] = React.useState(null);
  const [RemoteApp, setRemoteApp] = React.useState(null);

  React.useEffect(() => {
    // Dynamically load the remote components
    import('remote/Button')
      .then((module) => {
        setRemoteButton(() => module.default);
      })
      .catch((err) => console.error('Error loading remote button:', err));

    import('remote/App')
      .then((module) => {
        setRemoteApp(() => module.default);
      })
      .catch((err) => console.error('Error loading remote app:', err));
  }, []);

  return (
    <div>
      <h1>Host Application</h1>
      <p>This is the host application that consumes shared components.</p>

      {RemoteButton ? (
        <div>
          <h2>Remote Button Component:</h2>
          <RemoteButton />
        </div>
      ) : (
        <p>Loading remote button...</p>
      )}

      {RemoteApp ? (
        <div>
          <h2>Remote App Component:</h2>
          <RemoteApp />
        </div>
      ) : (
        <p>Loading remote app...</p>
      )}
    </div>
  );
};

export default App;
