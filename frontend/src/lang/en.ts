import { FlattenTranslations, flattenTranslations, GetTranslationsType } from '@lib/localization';

const EN = {
  pixer: {
    title: 'PiXer',
    tagline: 'Shared, encrypted albums for all'
  },
  loading: 'Loading...',
  home: {
    noAlbums: 'You currently have no albums'
  },
  login: {
    title: 'Login',
    description: 'Log into your account',
    username: 'Username',
    logIn: 'Log in',
    createAccountText: 'Or create an account',
    error: 'No such user exists!'
  },
  register: {
    title: 'Register',
    description: 'Create your new account',
    username: 'Username',
    password: 'Password',
    register: 'Register',
    logInText: 'Or log into your account',
    error: 'This user already exists!'
  },
  password: {
    title: 'Password',
    description: 'Enter your password',
    loggedInAs: 'Logged in as',
    password: 'Password',
    enter: 'Enter',
    tryADifferentAccountText: 'Or try a different account',
    error: 'Incorrect password!'
  },
  me: {
    profile: {
      title: 'My Profile',
      friends: 'Friends',
      requests: 'Requests',
      joinedOn: 'Joined on',
      uploadedImages: 'Uploaded Images',
      createdAlbums: 'Created Albums'
    },
    friends: {
      title: 'Friends',
      noFriends: 'You currently have no friends',
      remove: 'Remove'
    },
    requests: {
      title: 'Requests',
      noRequests: 'You currently have no requests'
    }
  },
  user: {
    profile: {
      title: 'User Profile',
      friendStatus: {
        friends: 'Friends',
        sendRequest: 'Send Request',
        cancelRequest: 'Cancel Request',
        acceptRequest: 'Accept Request'
      }
    }
  },
  album: {
    create: {
      title: 'Create an Album'
    }
  }
} as const;

type Translations = GetTranslationsType<typeof EN>;

type TranslationKey = keyof FlattenTranslations<Translations>;

export default flattenTranslations(EN);
export { Translations, TranslationKey };
