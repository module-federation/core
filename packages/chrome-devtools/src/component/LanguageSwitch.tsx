import { Button, Dropdown, Menu } from '@arco-design/web-react';
import { IconLanguage } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_STORAGE_KEY, type SupportedLanguage } from '../i18n';
import styles from './ThemeToggle.module.scss';

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en', label: 'English' },
];

const persistLanguage = (lang: SupportedLanguage) => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }

    const { chrome } = window as any;
    const storage = chrome?.storage?.local;
    if (storage && typeof storage.set === 'function') {
      try {
        storage.set({ [LANGUAGE_STORAGE_KEY]: lang });
      } catch {
        // ignore
      }
    }
  }
};

const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const current = i18n.language?.toLowerCase() || 'zh-cn';
  const value: SupportedLanguage = current.startsWith('en') ? 'en' : 'zh-CN';

  const handleChange = (next: string) => {
    i18n.changeLanguage(next);
    persistLanguage(next as SupportedLanguage);
  };

  const droplist = (
    <Menu onClickMenuItem={handleChange} selectedKeys={[value]}>
      {LANGUAGE_OPTIONS.map((option) => (
        <Menu.Item key={option.value}>{option.label}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown droplist={droplist} trigger="click" position="br">
      <Button
        icon={<IconLanguage />}
        size="default"
        className={styles.themeToggle}
      />
    </Dropdown>
  );
};

export default LanguageSwitch;
