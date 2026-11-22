import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { colors, spacing } from '../theme';
import { hapticTap } from '../utils/haptics';
import { AppText, useBottomInset } from './ui';

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  maxHeight?: `${number}%`;
  children: ReactNode;
};

/**
 * Animated bottom sheet with swipe-down gesture dismissal on the handle/header
 * and automatic bottom safe-area padding.
 */
export default function BottomSheet({ visible, title, onClose, maxHeight = '75%', children }: Props) {
  const bottomInset = useBottomInset(spacing.sm);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) translateY.value = 0;
  }, [visible, translateY]);

  const dismiss = () => {
    hapticTap();
    onClose();
  };

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      translateY.value = Math.max(0, e.translationY);
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY > 90 || e.velocityY > 650) {
        translateY.value = withTiming(400, { duration: 180 }, (finished) => {
          if (finished) runOnJS(dismiss)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 260 });
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { maxHeight, paddingBottom: bottomInset }, sheetStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.dragArea}>
              <View style={styles.handle} />
              {title ? (
                <AppText bold size={17} color={colors.primaryDark}>
                  {title}
                </AppText>
              ) : null}
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(20,10,5,0.45)' },
  sheet: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dragArea: { paddingTop: 4, paddingBottom: 4, gap: spacing.sm },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
});
