# Utility App (பயன்பாட்டு கருவிகள்)

One Expo / React Native app (SDK 58, TypeScript, Redux Toolkit) that hosts several Tamil, tradition-based tools as feature modules. Tamil is the default language, English is available.

| Feature | Status |
|---|---|
| Vastu – compass, room guide, floor-plan overlay, score, PDF report | ready |
| Nalla Neram (நல்ல நேரம்) – good times, Rahu Kalam, Yamagandam, Kuligai, Abhijit, hora table, panchangam, Tamil date | ready |
| Nalla Naal (நல்ல நாள்) – month view of auspicious days for 7 purposes, optional Tarabalam / Chandrabalam | ready |

## Run
```bash
npm install
npx expo start        # press i / a, or scan with Expo Go
npm test
npm run typecheck
```

## Structure
```
src/core                 shared by every feature
  components/ui.tsx      AppText, Button, Card, Chip, Segmented
  i18n/                  i18next setup; core strings (ta.ts is the source of truth)
  navigation/            root stack (Home, Settings, one route per feature)
  screens/               HomeScreen, SettingsScreen
  store/                 store + redux-persist, settings slice, resetAll action
  theme.ts, hooks/, utils/
  astro/                 offline panchangam engine (see below), places, Tamil/English names
src/features
  registry.ts            tiles shown on the home screen
  vastu/                 data, i18n (namespace "vastu"), navigation, screens, store, utils
  nalla-neram/           daily times screen + logic (namespace "nallaNeram")
  nalla-naal/            auspicious-day finder: purposes, scoring, screen (namespace "nallaNaal")
```
Shared code is imported with the `@core/*` alias; code inside a feature uses relative imports.

## Panchangam engine (`src/core/astro`)
Everything is computed on the device, with no network or API key.
- Sun and Moon longitudes from Meeus' *Astronomical Algorithms* (ch. 25 and 47), Lahiri ayanamsa, a fixed ΔT of 69 s.
- Sunrise and sunset by the NOAA method for the chosen city; times are formatted with the city's fixed UTC offset, not the device time zone.
- Tithi, nakshatra, yoga and karana end times are found by bisection on the Sun/Moon angles.
- Tamil date: the month starts on the civil day on which the Sun enters the next rashi before sunset (otherwise the next day).
- Rahu Kalam, Yamagandam and Kuligai use the standard eighths of daylight per weekday; horas run from the weekday lord.
- Tests check the engine against the Meeus worked examples, the 21 Oct 2025 new moon (12:25 UTC), the 7 Oct 2025 full moon (03:47 UTC) and the Pongal / Tamil New Year dates.

## Adding a feature
1. Create `src/features/<name>/` with `i18n/{ta,en}.ts`, `screens/`, and `store/` if it needs state. A single-screen feature needs no navigator of its own.
2. Register its strings as a new namespace in `src/core/i18n/index.ts` and use `useTranslation('<namespace>')` in its screens.
3. Add its reducers to `src/core/store/index.ts` (and handle `resetAll` in each slice so "Erase all data" covers it).
4. Add a route to `RootStackParamList` and a `Stack.Screen` in `src/core/navigation/RootNavigator.tsx` (a multi-screen feature exports its own navigator, as Vastu does).
5. Set `route` on its entry in `src/features/registry.ts`.

## Notes
- Nalla Naal's rules (good tithis and nakshatras per purpose, months to avoid, weekday preferences) are common textbook rules that I wrote down; they must be reviewed by an astrologer before release. They live in `src/features/nalla-naal/data/purposes.ts` and `logic.ts`.
- Nalla Neram's "good times" are the benefic horas (Jupiter, Venus, Mercury, Moon) minus Rahu Kalam, Yamagandam and Kuligai. It does not use Gowri panchangam.
- Results use the Thirukanitha (Drik) method; traditional Vakya panchangams can differ by minutes, and occasionally by a tithi or nakshatra boundary.
- Vastu rules differ between schools. Have a practitioner review `src/features/vastu/data/rooms.ts` and the Tamil text before release.
- The compass needs the phone held flat; the heading is not tilt-compensated.
- App name and bundle identifiers (`com.utilityapp`) in `app.json` are placeholders.
