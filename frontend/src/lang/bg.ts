import { flattenTranslations } from '@lib/localization';
import { Translations } from './en';

const BG: Translations = {
  pixer: 'ПиКсер',
  login: {
    description: 'Влезни в акаунта си',
    username: 'Потребителско име',
    logIn: 'Влезни',
    createAccountText: 'Или създай нов акаунт',
    error: 'Този потребител не съществува!'
  }
};

export default flattenTranslations(BG);
