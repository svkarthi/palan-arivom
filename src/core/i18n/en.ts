import type ta from './ta';

type Translation = typeof ta;

const en: Translation = {
  appName: 'Utility App',
  common: {
    cancel: 'Cancel',
    ok: 'OK',
    delete: 'Delete',
    degrees: '{{value}}°',
  },
  home: {
    title: 'Utility App',
    subtitle: 'Everyday Tamil tools in one place',
    comingSoon: 'Coming soon',
    openSettings: 'Settings',
    back: 'Home',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    tamil: 'தமிழ்',
    english: 'English',
    voice: 'Voice guidance',
    voiceHint: 'Speaks guidance aloud in Tamil (if the device supports it).',
    resetData: 'Erase all data',
    resetConfirm: 'All your data and settings will be erased. Continue?',
    about: 'About',
    aboutText: 'A collection of everyday tools rooted in Tamil tradition. Information is guidance only; regions and practitioners differ.',
    version: 'Version {{value}}',
  },
};

export default en;
