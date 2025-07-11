import { flattenTranslations } from '@lib/localization';
import { Translations } from './en';

const BG: Translations = {
  pixer: {
    title: 'ПиКсер',
    tagline: 'Споделени, енкриптирани албуми'
  },
  loading: 'Зарежда се...',
  date: {
    month: {
      jan: 'Януари',
      feb: 'Февруари',
      mar: 'Март',
      apr: 'Април',
      may: 'Май',
      jun: 'Юни',
      jul: 'Юли',
      aug: 'Август',
      sep: 'Септември',
      oct: 'Октомври',
      nov: 'Ноември',
      dec: 'Декември'
    },
    from: 'От',
    upTo: 'До'
  },
  home: {
    noAlbums: 'Нямате албуми',
    yourAlbums: 'Твоите Албуми',
    sharedAlbums: 'Споделени Албуми',
    pinnedAlbums: 'Запазени Албуми'
  },
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
  me: {
    profile: {
      title: 'Моят Профил',
      friends: 'Приятели',
      requests: 'Покани',
      joinedOn: 'Създаден на',
      uploadedImages: 'Качени Снимки',
      createdAlbums: 'Създадени Албуми'
    },
    friends: {
      title: 'Приятели',
      noFriends: 'Нямате добавени приятели',
      remove: 'Премахни',
      cancel: 'Затвори'
    },
    requests: {
      title: 'Покани',
      noRequests: 'Нямате покани'
    }
  },
  user: {
    profile: {
      title: 'Профил',
      friendStatus: {
        friends: 'Приятел',
        sendRequest: 'Прати Покана',
        cancelRequest: 'Спри Поканата',
        acceptRequest: 'Приеми Покана'
      },
      publicImages: 'Публични Снимки',
      publicAlbums: 'Публични Албуми'
    },
    select: {
      search: 'Потърси Потребител',
      noUsers: 'Няма намерени потребители'
    }
  },
  album: {
    create: {
      title: 'Създай Албум',
      public: 'Публичен',
      private: 'Частен',
      albumName: 'Име на Албума',
      users: 'Потребители',
      allowSubmissions: 'Предложения',
      create: 'Създай'
    },
    view: {
      images: {
        select: {
          title: 'Избери Снимки',
          select: 'Избери'
        },
        upload: {
          title: 'Качване на Снимките',
          uploading: 'Качване на'
        },
        noImages: 'Няма снимки',
        delete: {
          title: 'Изтрий Снимката?'
        }
      },
      info: {
        allowsSubmissions: 'Предложения',
        share: 'Сподели'
      },
      edit: {
        save: 'Запази',
        delete: {
          delete: 'Изтрий',
          cancel: 'Затвори'
        }
      },
      submissions: {
        upload: {
          title: 'Качване на Предложенията',
          uploading: 'Качване на'
        },
        noSubmissions: 'Няма предложения'
      }
    }
  }
};

export default flattenTranslations(BG);
