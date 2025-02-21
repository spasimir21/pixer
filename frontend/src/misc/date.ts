import { TranslationKey } from '../lang/en';

const formatNumber = (n: number) => (n < 10 ? '0' : '') + n.toString();

const formatDate = (date: Date) =>
  `${formatNumber(date.getDate())}/${formatNumber(date.getMonth() + 1)}/${date.getFullYear()}`;

const MonthTranslationKeys: TranslationKey[] = [
  'date.month.jan',
  'date.month.feb',
  'date.month.mar',
  'date.month.apr',
  'date.month.may',
  'date.month.jun',
  'date.month.jul',
  'date.month.aug',
  'date.month.sep',
  'date.month.oct',
  'date.month.nov',
  'date.month.dec'
];

const formatDateAlt = (date: Date, l: (key: TranslationKey) => string) =>
  `${date.getDate()} ${l(MonthTranslationKeys[date.getMonth()])} ${date.getFullYear()}`;

const formatTime = (date: Date) => `${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`;

export { formatDate, formatDateAlt, formatTime, MonthTranslationKeys };
