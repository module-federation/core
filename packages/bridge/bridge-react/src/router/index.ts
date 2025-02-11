// Re-export from v5 for React Router v5 compatibility
export { BrowserRouter as BrowserRouterV5 } from './v5';

// Re-export from v6 for React Router v6
export {
  BrowserRouter as BrowserRouterV6,
  RouterProvider,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
} from './v6';

// Re-export base router components
export { BrowserRouter, RouterProvider as BaseRouterProvider } from './default';
