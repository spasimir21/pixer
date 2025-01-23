import { Effect, Reactive, State } from '@lib/reactivity';

type FlatTranslations = Record<string, string>;

interface LocalizatorConfig<TLang extends string, T extends FlatTranslations> {
  defaultLanguage: NoInfer<TLang>;
  translations: Record<TLang, T | (() => Promise<T>)>;
}

@Reactive
class Localizator<TLang extends string = string, T extends FlatTranslations = FlatTranslations> {
  @State
  private readonly loadedTranslations: Record<string, T> = {};

  @State
  public language: TLang;

  constructor(public readonly config: LocalizatorConfig<TLang, T>) {
    this.language = config.defaultLanguage;
    this.loadLanguage();
  }

  @Effect<Localizator>({ track: l => l.language })
  private loadLanguage() {
    if (!(this.language in this.config.translations) || this.language in this.loadedTranslations) return;

    const translations = this.config.translations[this.language];

    if (typeof translations === 'function') {
      const language = this.language;
      translations().then(t => (this.loadedTranslations[language] = t));

      return;
    }

    this.loadedTranslations[this.language] = translations as any;
  }

  getTranslation(key: keyof T) {
    return (
      this.loadedTranslations[this.language]?.[key] ??
      this.loadedTranslations[this.config.defaultLanguage]?.[key] ??
      key
    );
  }
}

export { Localizator, LocalizatorConfig, FlatTranslations };
