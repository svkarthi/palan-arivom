# பலன் அறிவோம் (Palan Arivom)

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

## Validation against a printed calendar
`__tests__/validation.test.ts` compares the app with the 2026 lists on tamildailycalendar.com (read on 23 Oct 2026): Amavasai 12/12, Pournami 12/13, Pradosham 24/25 (one day shifted each), Karinal 33/34, and 49 of 55 listed wedding dates rated "fair or better" while only 110 of 365 days are. Differences are mostly Vakya vs Thirukanitha: on 23 Oct 2026 that calendar ends Dwadashi at 12:40 PM and Pooratathi at 8:08 PM, this app at 2:36 PM and 9:02 PM (it matched published new/full moon times to the minute). Tamil month starts also differ by a day in some months.
Rules changed because of that data: Pournami is judged in the afternoon like Amavasai, Shashti is waxing only, Pradosham picks one day when two overlap, Chaturthi/Chaturdashi are a caution (not an avoid), judging uses the morning panchangam, and marriage avoids Aadi, Purattasi and Margazhi and accepts more nakshatras. The Karinaal table (`src/core/astro/karinaal.ts`) comes from that site's 2024-2026 lists.

## Checked against an independent Swiss Ephemeris implementation
[tamil-panchang-api](https://github.com/karthiknitt/tamil-panchang-api) (MIT, © 2024 Karthikeyan N) computes the same Drik panchangam with the Swiss Ephemeris. Run locally over 117 city-dates in 2026 (Chennai, Madurai, Singapore) it agrees with this app's engine on every thithi, nakshatra and yoga at sunrise, with sunrise and sunset within 15 s, Rahu / Yama / Gulikai within 0.2 min, and end times within about 3 min (apart from the API clipping an end time at the next sunrise). A 25-day sample of its values is kept in `__tests__/fixtures/swisseph-chennai-2026.json` as a regression test (`__tests__/swisseph.test.ts`). No code from that project is used in the app.

Findings from reading its rules, which differ from this app on purpose: its Chandrashtamam adds 7 to the Moon's rashi instead of 5 (on 23 Oct 2026 it gives Kanya / Mrigasiridam where the printed calendar has Magam, Pooram, which matches this app); its Amrita / Siddha / Marana table gives Marana for Thursday + Poosam and Wednesday + Anusham, which the classical Amrita Siddhi list contradicts; and its muhurta rules pass only 22 of the 55 wedding dates on the printed calendar and 20 days in all of 2026 for house-warming, so they are much stricter than printed practice.

## Adding a feature
1. Create `src/features/<name>/` with `i18n/{ta,en}.ts`, `screens/`, and `store/` if it needs state. A single-screen feature needs no navigator of its own.
2. Register its strings as a new namespace in `src/core/i18n/index.ts` and use `useTranslation('<namespace>')` in its screens.
3. Add its reducers to `src/core/store/index.ts` (and handle `resetAll` in each slice so "Erase all data" covers it).
4. Add a route to `RootStackParamList` and a `Stack.Screen` in `src/core/navigation/RootNavigator.tsx` (a multi-screen feature exports its own navigator, as Vastu does).
5. Set `route` on its entry in `src/features/registry.ts`.

## Notes
- Observance days (Pournami, Amavasai, Pradosham, Sankashta / Vinayaka Chaturthi, Shashti, Karthigai and Karthigai Deepam) are in `src/core/astro/specialDays.ts`, each reckoned by the tithi or nakshatra at the time of day it is traditionally judged by. Checked against 2025 dates (for example Pradosham on 4 and 18 Oct, Pournami on 6 Oct, Karthigai Deepam on 3 Dec); moonrise is approximated, and some almanacs differ by a day. They do not affect Nalla Naal scores.
- Nalla Naal's rules (good tithis and nakshatras per purpose, months to avoid, weekday preferences) are common textbook rules that I wrote down; they must be reviewed by an astrologer before release. They live in `src/features/nalla-naal/data/purposes.ts` and `logic.ts`.
- Nalla Neram's "good times" are the benefic horas (Jupiter, Venus, Mercury, Moon) minus Rahu Kalam, Yamagandam and Kuligai. It does not use Gowri panchangam.
- Results use the Thirukanitha (Drik) method; traditional Vakya panchangams can differ by minutes, and occasionally by a tithi or nakshatra boundary.
- Vastu rules differ between schools. Have a practitioner review `src/features/vastu/data/rooms.ts` and the Tamil text before release.
- The compass prefers the OS-fused tilt-compensated heading (true north via `expo-location`) and falls back to the raw magnetometer (which needs the phone held flat) if location permission is unavailable.
- App name and bundle identifiers (`com.utilityapp`) in `app.json` are placeholders.
