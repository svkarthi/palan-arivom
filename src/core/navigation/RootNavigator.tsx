import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

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
              >
                <Text style={{ fontSize: 22 }}>⚙️</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
        <Stack.Screen name="Vastu" component={VastuNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
