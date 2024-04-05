import Theme from 'rspress/theme';
import { HomeLayout } from './pages';
import './index.css';

// eslint-disable-next-line import/export
export * from 'rspress/theme';

export default {
  ...Theme,
  HomeLayout,
};
