# Utility App (பயன்பாட்டு கருவிகள்)

One Expo / React Native app (SDK 58, TypeScript, Redux Toolkit) that hosts several Tamil, tradition-based tools as feature modules. Tamil is the default language, English is available.

| Feature | Status |
|---|---|
| Vastu – compass, room guide, floor-plan overlay, score, PDF report | ready |
| Nalla Neram (நல்ல நேரம்) | planned – tile shown as "coming soon" |
| Nalla Naal (நல்ல நாள்) | planned – tile shown as "coming soon" |

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
src/features
  registry.ts            tiles shown on the home screen
  vastu/                 data, i18n (namespace "vastu"), navigation, screens, store, utils
```
Shared code is imported with the `@core/*` alias; code inside a feature uses relative imports.

## Adding a feature (e.g. Nalla Neram)
1. Create `src/features/nalla-neram/` with `data/`, `i18n/{ta,en}.ts`, `screens/`, `store/` (if it needs state) and a `navigation/NallaNeramNavigator.tsx`.
2. Register its strings as a new namespace in `src/core/i18n/index.ts` and use `useTranslation('nalla-neram')` in its screens.
3. Add its reducers to `src/core/store/index.ts` (and handle `resetAll` in each slice so "Erase all data" covers it).
4. Add a route to `RootStackParamList` and a `Stack.Screen` in `src/core/navigation/RootNavigator.tsx`.
5. Set `route` on its entry in `src/features/registry.ts`.

## Notes
- Vastu rules differ between schools. Have a practitioner review `src/features/vastu/data/rooms.ts` and the Tamil text before release.
- The compass needs the phone held flat; the heading is not tilt-compensated.
- App name and bundle identifiers (`com.example.utilityapp`) in `app.json` are placeholders.
