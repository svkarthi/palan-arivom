import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import BirthStarScreen from '../../features/birth-star/screens/BirthStarScreen';
import NallaNaalScreen from '../../features/nalla-naal/screens/NallaNaalScreen';
import NallaNeramScreen from '../../features/nalla-neram/screens/NallaNeramScreen';
import PadhigamNavigator from '../../features/padhigam/navigation/PadhigamNavigator';
import PoruthamScreen from '../../features/porutham/screens/PoruthamScreen';
import VastuNavigator from '../../features/vastu/navigation/VastuNavigator';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';
import { headerStyle } from './headerStyle';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    primary: colors.primary,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};

/** Add a new feature by registering its navigator here and in `features/registry.ts`. */
export default function RootNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={headerStyle}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: t('home.title'),
            headerRight: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('home.openSettings')}
                onPress={() => navigation.navigate('Settings')}
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1, paddingHorizontal: 4 })}
              >
                <Ionicons name="settings-outline" size={23} color={colors.heroText} />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
        <Stack.Screen name="Vastu" component={VastuNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="NallaNeram" component={NallaNeramScreen} options={{ title: t('title', { ns: 'nallaNeram' }) }} />
        <Stack.Screen name="NallaNaal" component={NallaNaalScreen} options={{ title: t('title', { ns: 'nallaNaal' }) }} />
        <Stack.Screen name="Porutham" component={PoruthamScreen} options={{ title: t('title', { ns: 'porutham' }) }} />
        <Stack.Screen name="BirthStar" component={BirthStarScreen} options={{ title: t('title', { ns: 'birthStar' }) }} />
        <Stack.Screen name="Padhigam" component={PadhigamNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
