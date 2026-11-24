import { NotoSansTamil_400Regular } from '@expo-google-fonts/noto-sans-tamil/400Regular';
import { NotoSansTamil_700Bold } from '@expo-google-fonts/noto-sans-tamil/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import i18n from './src/core/i18n/index';
import RootNavigator from './src/core/navigation/RootNavigator';
import { persistor, store } from './src/core/store/index';
import { useAppSelector } from './src/core/store/hooks';
import { colors } from './src/core/theme';

/** Keeps i18next in step with the persisted language setting. */
function LanguageSync() {
  const language = useAppSelector((s) => s.settings.language);
  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);
  return null;
}

const Loading = (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
    <ActivityIndicator color={colors.primary} size="large" />
  </View>
);

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ NotoSansTamil_400Regular, NotoSansTamil_700Bold });

  if (!fontsLoaded && !fontError) return Loading;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={Platform.OS === 'web' ? styles.webShell : styles.fill}>
        <Provider store={store}>
          <PersistGate loading={Loading} persistor={persistor}>
            <SafeAreaProvider>
              <LanguageSync />
              <RootNavigator />
              <StatusBar style="light" />
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EFE7D8' : colors.bg,
  },
  fill: { flex: 1 },
  webShell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    boxShadow: '0 0 32px rgba(45, 22, 16, 0.14)',
  },
});
