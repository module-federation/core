import { Select } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_STORAGE_KEY, type SupportedLanguage } from '../i18n';

const { Option } = Select;

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

  const handleChange = (next: SupportedLanguage) => {
    void i18n.changeLanguage(next);
    persistLanguage(next);
  };

  return (
    <Select
      size="small"
      value={value}
      onChange={handleChange}
      style={{ width: 110 }}
      dropdownMenuStyle={{ minWidth: 110 }}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSwitch;
