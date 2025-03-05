import React from 'react';
import ReactDOM from 'react-dom/client';
import Footer from './Footer';

const App = () => (
  <div
    style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem',
      maxWidth: '900px',
      margin: '0 auto',
    }}
  >
    <h1>Zephyr Vite Example</h1>
    <p>
      This application demonstrates a federated Footer component using Module
      Federation with Zephyr and Vite
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
        This is the main content of the application. The footer below is a
        federated component that could be shared across multiple applications.
      </p>
    </div>

    <Footer />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
