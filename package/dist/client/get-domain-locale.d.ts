import type { DomainLocale } from '../server/config';
export declare function getDomainLocale(path: string, locale?: string | false, locales?: readonly string[], domainLocales?: readonly DomainLocale[]): string | false;
