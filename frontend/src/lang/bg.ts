import { flattenTranslations } from '@lib/localization';
import { Translations } from './en';

const BG: Translations = {
  pixer: {
    title: 'ПиКсер',
    tagline: 'Споделени, енкриптирани албуми'
  },
  loading: 'Зарежда се...',
  login: {
    title: 'Логин',
    description: 'Влезни в профила си',
    username: 'Потребителско име',
    logIn: 'Влезни',
    createAccountText: 'Или създай нов профил',
    error: 'Този потребител не съществува!'
  },
  register: {
    title: 'Регистрация',
    description: 'Създай своя нов профил',
    username: 'Потребителско име',
    password: 'Парола',
    register: 'Създай',
    logInText: 'Или влезни в твоя профил',
    error: 'Този потребител вече съществува!'
  },
  password: {
    title: 'Парола',
    description: 'Въведи своята парола',
    loggedInAs: 'Логнат като',
    password: 'Парола',
    enter: 'Влезни',
    tryADifferentAccountText: 'Или пробвай с друг профил',
    error: 'Грешна парола!'
  },
  user: {
    profile: {
      title: 'Профил',
      headerTitle: 'Профил',
      friends: 'Приятеля',
      requests: 'Покани',
      joinedOn: 'Създаден на',
      uploadedImages: 'Качени Снимки',
      createdAlbums: 'Създадени Албума'
    }
  }
};

export default flattenTranslations(BG);
