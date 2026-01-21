import { Button } from '@arco-design/web-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { DevtoolsTheme } from '../hooks/useDevtoolsTheme';

interface ThemeToggleProps {
  theme: DevtoolsTheme;
  onToggle: () => void;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const { t } = useTranslation();

  const labelKey =
    theme === 'dark' ? 'app.header.theme.dark' : 'app.header.theme.light';

  return (
    <Button size="mini" type="outline" onClick={onToggle}>
      {t(labelKey)}
    </Button>
  );
};

export default ThemeToggle;
