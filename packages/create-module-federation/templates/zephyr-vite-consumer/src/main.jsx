import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

// Import remote component
const RemoteFooter = lazy(() => import('provider/Footer'));

const App = () => (
  <div
    style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem',
      maxWidth: '900px',
      margin: '0 auto',
    }}
  >
    <h1>Zephyr Vite Consumer - {{ mfName }}</h1>
    <p>
      This application consumes a federated Footer component from the provider
      application.
    </p>

    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '20px',
      }}
    >
      <h2>Main Content</h2>
      <p>
        This is the main content of the consumer application. The footer below
        is imported from the provider application via Module Federation with
        Zephyr.
      </p>
    </div>

    <Suspense fallback={<div>Loading Footer from Provider...</div>}>
      <RemoteFooter />
    </Suspense>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
