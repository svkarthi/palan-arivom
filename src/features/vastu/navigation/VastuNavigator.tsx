import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { IconName } from '@core/components/ui';
import { headerStyle } from '@core/navigation/headerStyle';
import type { RootStackParamList } from '@core/navigation/types';
import { colors, fonts } from '@core/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import CompassScreen from '../screens/CompassScreen';
import GuideScreen from '../screens/GuideScreen';
import PlanScreen from '../screens/PlanScreen';
import ReportScreen from '../screens/ReportScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import type { VastuStackParamList, VastuTabParamList } from './types';

const Stack = createNativeStackNavigator<VastuStackParamList>();
const Tab = createBottomTabNavigator<VastuTabParamList>();

const TAB_ICONS: Record<keyof VastuTabParamList, { active: IconName; inactive: IconName }> = {
  Compass: { active: 'compass', inactive: 'compass-outline' },
  Guide: { active: 'book-open-variant', inactive: 'book-open-outline' },
  Plan: { active: 'floor-plan', inactive: 'floor-plan' },
  Report: { active: 'chart-donut', inactive: 'chart-donut' },
};

function Tabs() {
  const { t } = useTranslation('vastu');
  const root = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const titles: Record<keyof VastuTabParamList, string> = {
    Compass: t('tabs.compass'),
    Guide: t('tabs.guide'),
    Plan: t('tabs.plan'),
    Report: t('tabs.report'),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        title: titles[route.name],
        headerLeft: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.back')}
            onPress={() => root.navigate('Home')}
            hitSlop={12}
            style={({ pressed }) => ({ paddingHorizontal: 12, opacity: pressed ? 0.65 : 1 })}
          >
            <Ionicons name="chevron-back" size={26} color={colors.heroText} />
          </Pressable>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color }) => (
          <MaterialCommunityIcons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={23}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Compass" component={CompassScreen} />
      <Tab.Screen name="Guide" component={GuideScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
    </Tab.Navigator>
  );
}

/** Entry point of the Vastu feature; registered once in the root navigator. */
export default function VastuNavigator() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="VastuTabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    </Stack.Navigator>
  );
}
