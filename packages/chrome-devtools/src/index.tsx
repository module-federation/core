import { createRoot } from 'react-dom/client';
import '@arco-design/web-react/es/_util/react-19-adapter';
import './index.css';
import App from './App';

(async () => {
  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error
    await import('../mock');
  }
  const container = document.getElementById('root') as HTMLElement;
  const root = createRoot(container);
  root.render(<App />);
})();
