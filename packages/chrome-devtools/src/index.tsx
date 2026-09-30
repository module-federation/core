import { createRoot } from 'react-dom/client';
import App from './App';

if (new URLSearchParams(window.location.search).get('view') === 'popup') {
  document.documentElement.dataset.devtoolsView = 'popup';
  document.documentElement.style.width = '800px';
  document.documentElement.style.height = '600px';
}

(async () => {
  if (process.env.NODE_ENV === 'development') {
    await import('../mock');
  }
  const container = document.getElementById('root') as HTMLElement;
  const root = createRoot(container);
  root.render(<App />);
})();
