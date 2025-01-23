import { FlattenTranslations, flattenTranslations, GetTranslationsType } from '@lib/localization';

const EN = {
  pixer: 'PiXer',
  login: {
    description: 'Log into your account',
    username: 'Username',
    logIn: 'Log in',
    createAccountText: 'Or create an account',
    error: 'No such user exists!'
  }
} as const;

type Translations = GetTranslationsType<typeof EN>;

type TranslationKey = keyof FlattenTranslations<Translations>;

export default flattenTranslations(EN);
export { Translations, TranslationKey };
