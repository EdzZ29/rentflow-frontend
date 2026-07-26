// Languages offered by the global switcher in the header. `code` is a BCP 47
// tag so it can be dropped straight into <html lang> and Intl APIs.
export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fil', label: 'Filipino', short: 'FIL' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'zh', label: '中文', short: 'ZH' },
  { code: 'ko', label: '한국어', short: 'KO' },
];

export const DEFAULT_LANGUAGE = 'en';

export const STORAGE_KEY = 'rentivo.language';

export function findLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
