import { FlatTranslations, Localizator, LocalizatorConfig } from '@lib/localization';
import { createSingletonManager, Service, useService } from '@lib/service';
import { addDependency } from '@lib/reactivity';
import en from '../lang/en';

const LANG_LOCAL_STORAGE_KEY = '$$pixer_lang';

class LocalizationService<TLang extends string, T extends FlatTranslations> extends Service {
  public readonly localizator: Localizator<TLang, T>;

  get language() {
    return this.localizator.language;
  }

  set language(language: TLang) {
    this.localizator.language = language;
    localStorage.setItem(LANG_LOCAL_STORAGE_KEY, language);
  }

  constructor(config: LocalizatorConfig<TLang, T>) {
    super();

    this.getTranslation = this.getTranslation.bind(this);

    this.localizator = addDependency(this, new Localizator(config));

    this.localizator.language =
      (localStorage.getItem(LANG_LOCAL_STORAGE_KEY) as TLang | null) ?? config.defaultLanguage;
  }

  getTranslation(key: keyof T) {
    return this.localizator.getTranslation(key);
  }
}

const LocalizationServiceManager = createSingletonManager(
  () =>
    new LocalizationService({
      defaultLanguage: 'en',
      translations: {
        en,
        bg: async () => (await import('../lang/bg')).default
      }
    }),
  false
);

const useLocalization = () => useService(LocalizationServiceManager).getTranslation;

function useLanguage() {
  const locService = useService(LocalizationServiceManager);

  return {
    get value() {
      return locService.language;
    },
    set value(lang: (typeof locService)['language']) {
      locService.language = lang;
    }
  };
}

export { LocalizationService, LocalizationServiceManager, useLocalization, useLanguage };
