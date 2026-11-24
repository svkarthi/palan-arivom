import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Light selection tick for tabs, steppers, chips, and date cells. */
export function hapticTap(): void {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync().catch(() => {});
}

/** Medium tactile impact for compass lock and room placement. */
export function hapticImpact(): void {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Success notification pulse for saving profile, detecting city, or exporting PDF. */
export function hapticSuccess(): void {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
