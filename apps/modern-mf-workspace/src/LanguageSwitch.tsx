import React from 'react';
import { changeLocale, getLocale, t } from '../shared/i18n';
import type { Locale } from '../shared/i18n';

export function LanguageSwitch() {
  return (
    <select
      className="language-switch"
      aria-label={t('界面语言', 'Interface language')}
      title={t('切换语言会重新载入页面', 'Switching language reloads the page')}
      value={getLocale()}
      onChange={(event) => changeLocale(event.target.value as Locale)}
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}
