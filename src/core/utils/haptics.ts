import * as Haptics from 'expo-haptics';

/** Light selection tick for tabs, steppers, chips, and date cells. */
export function hapticTap(): void {
  void Haptics.selectionAsync().catch(() => {});
}

/** Medium tactile impact for compass lock and room placement. */
export function hapticImpact(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Success notification pulse for saving profile, detecting city, or exporting PDF. */
export function hapticSuccess(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
