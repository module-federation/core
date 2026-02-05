import { Button } from '@arco-design/web-react';
import { IconMoon, IconSun } from '@arco-design/web-react/icon';
import type { FC } from 'react';

import type { DevtoolsTheme } from '../hooks/useDevtoolsTheme';
import styles from './ThemeToggle.module.scss';

interface ThemeToggleProps {
  theme: DevtoolsTheme;
  onToggle: () => void;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <Button
      className={styles.themeToggle}
      size="default"
      onClick={onToggle}
      icon={theme === 'dark' ? <IconSun /> : <IconMoon />}
    />
  );
};

export default ThemeToggle;
