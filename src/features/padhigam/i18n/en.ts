import type ta from './ta';

type Translation = typeof ta;

const en: Translation = {
  title: 'Tamil Vedhath Thirattu',
  subtitle: 'Thevaram & Thiruvasagam — Padhigams for Relief & Blessings',
  todayBanner: {
    heading: 'Today’s Suggested Padhigam',
    readNow: 'Recite now ›',
    nallaNeramTitle: 'Today’s Padhigam',
  },
  search: {
    placeholder: 'Search relief, health, fear, debt, hymn…',
    clear: 'Clear search',
  },
  filter: {
    all: 'All',
    favorites: 'Bookmarks',
    byRelief: 'By Relief / Blessing',
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
    phase2Note: 'Thevaram & Thiruvasagam Padhigams are included now. Murugan, Vinayagar, Amman, and Perumal hymns will be added next.',
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
