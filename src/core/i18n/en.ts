import type ta from './ta';

type Translation = typeof ta;

const en: Translation = {
  appName: 'Palan Arivom',
  common: {
    cancel: 'Cancel',
    ok: 'OK',
    delete: 'Delete',
    share: 'Share',
    degrees: '{{value}}°',
  },
  home: {
    title: 'Palan Arivom',
    subtitle: 'Everyday Tamil tools in one place',
    comingSoon: 'Coming soon',
    openSettings: 'Settings',
    back: 'Home',
    viewDay: 'View full day ›',
  },
  place: {
    choose: 'Choose a city',
    detect: 'Detect nearest city',
    detecting: 'Detecting…',
    detectFailed: 'Could not detect location.',
  },
  datetime: {
    nextDay: 'next day',
    today: 'Today',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    tamil: 'தமிழ்',
    english: 'English',
    voice: 'Voice guidance',
    voiceHint: 'Speaks guidance aloud in Tamil (if the device supports it).',
    reminders: 'Viratham & Chandrashtamam reminders',
    remindersHint: 'Offline morning alerts for Pradosham, Ekadashi, Amavasai, Pournami and your Chandrashtamam days (next 30 days).',
    remindersDenied: 'Notification permission is required for reminders.',
    resetData: 'Erase all data',
    resetConfirm: 'All your data and settings will be erased. Continue?',
    about: 'About',
    aboutText: 'A collection of everyday tools rooted in Tamil tradition. Information is guidance only; regions and practitioners differ.',
    version: 'Version {{value}}',
  },
};

export default en;
