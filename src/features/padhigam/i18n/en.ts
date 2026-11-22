import type ta from './ta';

type Translation = typeof ta;

const en: Translation = {
  title: 'Tamil Vedhath Thirattu',
  subtitle: 'Thevaram, Thiruvasagam, Vinayagar, Murugan, Abirami Andhadhi & Perumal Hymns',
  todayBanner: {
    heading: 'Today’s Suggested Padhigam',
    readNow: 'Recite now ›',
    nallaNeramTitle: 'Today’s Padhigam',
  },
  search: {
    placeholder: 'Search relief, health, debt, Abirami, Murugan…',
    clear: 'Clear search',
  },
  filter: {
    all: 'All',
    favorites: 'Bookmarks',
    byRelief: 'By Relief / Blessing',
    byTradition: 'By Deity / Tradition',
    allTraditions: 'All Deities',
    bySaint: 'By Saint (Naalvar)',
    allSaints: 'All Saints',
  },
  list: {
    versesCount: '{{count}} verses',
    stanzasCount: '{{count}} sections',
    recitedToday: 'Recited today',
    empty: 'No Padhigams match your search or filter.',
    emptyFavorites: 'You haven’t bookmarked any Padhigams yet.',
    resetFilters: 'Reset filters',
    catalogueNote: 'Tamil Vedhath Thirattu — Thevaram, Thiruvasagam, Vinayagar, Murugan, Abirami Andhadhi & Divya Prabandham ({{count}} hymns).',
  },
  reader: {
    blessingHeading: 'Blessing & Relief',
    howToRecite: 'How to recite',
    shrineLabel: 'Shrine',
    verseLabel: 'Verse {{number}} / {{total}}',
    stanzaLabel: 'Section {{number}} / {{total}}',
    meaningToggle: 'Meaning',
    meaningHeading: 'Meaning',
    fontSmaller: 'Decrease text size',
    fontLarger: 'Increase text size',
    listenAll: 'Listen',
    stopListening: 'Stop',
    listenVerse: 'Listen to this verse',
    bookmarkAdd: 'Add bookmark',
    bookmarkRemove: 'Remove bookmark',
    markRecited: 'Mark today’s recitation complete',
    recitedDone: 'Recited today ✓',
    recitedHint: 'Tap again to undo',
    closingInvocation: 'Thiruchitrambalam',
    notFound: 'Padhigam not found.',
  },
};

export default en;
