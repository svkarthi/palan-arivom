import { Ionicons } from '@expo/vector-icons';
import { headerStyle } from '@core/navigation/headerStyle';
import type { RootStackParamList } from '@core/navigation/types';
import { colors } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import PadhigamLibraryScreen from '../screens/PadhigamLibraryScreen';
import PadhigamReaderScreen from '../screens/PadhigamReaderScreen';
import type { PadhigamStackParamList } from './types';

const Stack = createNativeStackNavigator<PadhigamStackParamList>();

/** Entry point of the Padhigam feature; supports opening Library or jumping straight to Reader. */
export default function PadhigamNavigator() {
  const { t } = useTranslation('padhigam');
  const root = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Stack.Navigator screenOptions={headerStyle} initialRouteName="PadhigamLibrary">
      <Stack.Screen
        name="PadhigamLibrary"
        component={PadhigamLibraryScreen}
        options={{
          title: t('title'),
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.back', { ns: 'translation' })}
              onPress={() => root.navigate('Home')}
              hitSlop={12}
              style={({ pressed }) => ({ paddingRight: 12, opacity: pressed ? 0.65 : 1 })}
            >
              <Ionicons name="chevron-back" size={26} color={colors.heroText} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="PadhigamReader"
        component={PadhigamReaderScreen}
        options={{ title: t('title') }}
      />
    </Stack.Navigator>
  );
}
