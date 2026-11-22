import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { GRID_9, ZONE_BY_ID, ZONES, type ZoneId } from '../data/zones';
import type { Lang } from '@core/i18n';
import type { PlanMode } from '../store/planSlice';
import { colors } from '@core/theme';
import { AppText } from '@core/components/ui';
import { hapticTap } from '@core/utils/haptics';

type Props = {
  size: number;
  mode: PlanMode;
  /** Clockwise degrees from the top of the map to north (16-zone mode only). */
  rotation?: number;
  lang: Lang;
  fills?: Partial<Record<ZoneId, string>>;
  /** Short text (usually room emoji) drawn inside a zone. */
  labels?: Partial<Record<ZoneId, string>>;
  imageUri?: string | null;
  onPressZone?: (zone: ZoneId) => void;
  /** Enable pinch-to-zoom, pan and two-finger rotate gestures (PlanScreen). */
  interactive?: boolean;
  /** Called when a two-finger rotation gesture finishes with the delta degrees. */
  onRotateBy?: (deltaDeg: number) => void;
};

const EMPTY_FILL = 'rgba(255,255,255,0.35)';
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Vastu overlay: a 16-zone wheel (plus centre) or a 3x3 grid, with optional pinch/pan/rotate gestures. */
export default function ZoneMap({
  size,
  mode,
  rotation = 0,
  lang,
  fills = {},
  labels = {},
  imageUri,
  onPressZone,
  interactive = false,
  onRotateBy,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 2;
  const inner = outer * 0.17;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const gestureRot = useSharedValue(0);
  const [zoomed, setZoomed] = useState(false);

  const commitRotation = (deg: number) => {
    if (onRotateBy && Math.abs(deg) >= 0.5) onRotateBy(deg);
  };

  const pinch = usePinchGesture({
    enabled: interactive,
    onUpdate: (e) => {
      'worklet';
      const next = Math.max(1, Math.min(3, savedScale.value * e.scale));
      scale.value = next;
    },
    onDeactivate: () => {
      'worklet';
      savedScale.value = scale.value;
      if (scale.value <= 1.02) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        savedTx.value = 0;
        savedTy.value = 0;
        runOnJS(setZoomed)(false);
      } else {
        runOnJS(setZoomed)(true);
      }
    },
  });

  const pan = usePanGesture({
    enabled: interactive,
    minPointers: 2,
    onUpdate: (e) => {
      'worklet';
      const limit = (size * (scale.value - 1)) / 2;
      tx.value = Math.max(-limit, Math.min(limit, savedTx.value + e.translationX));
      ty.value = Math.max(-limit, Math.min(limit, savedTy.value + e.translationY));
    },
    onDeactivate: () => {
      'worklet';
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    },
  });

  const rotate = useRotationGesture({
    enabled: interactive && mode === '16' && Boolean(onRotateBy),
    onUpdate: (e) => {
      'worklet';
      gestureRot.value = (e.rotation * 180) / Math.PI;
    },
    onDeactivate: () => {
      'worklet';
      const deg = gestureRot.value;
      gestureRot.value = 0;
      runOnJS(commitRotation)(deg);
    },
  });

  const composed = useSimultaneousGestures(pinch, pan, rotate);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const overlayRotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gestureRot.value}deg` }],
  }));

  const resetZoom = () => {
    hapticTap();
    scale.value = withSpring(1);
    savedScale.value = 1;
    tx.value = withSpring(0);
    ty.value = withSpring(0);
    savedTx.value = 0;
    savedTy.value = 0;
    setZoomed(false);
  };

  const point = (r: number, angle: number) => ({
    x: cx + r * Math.sin(rad(angle)),
    y: cy - r * Math.cos(rad(angle)),
  });

  const sector = (angle: number) => {
    const a0 = angle - 11.25 + rotation;
    const a1 = angle + 11.25 + rotation;
    const o0 = point(outer, a0);
    const o1 = point(outer, a1);
    const i1 = point(inner, a1);
    const i0 = point(inner, a0);
    return `M ${o0.x} ${o0.y} A ${outer} ${outer} 0 0 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${inner} ${inner} 0 0 0 ${i0.x} ${i0.y} Z`;
  };

  const overlay = (x: number, y: number, text: string, fontSize: number, key: string, bold = false) => (
    <View key={key} pointerEvents="none" style={[styles.label, { left: x - 22, top: y - fontSize }]}>
      <AppText size={fontSize} bold={bold} color={colors.primaryDark} center>
        {text}
      </AppText>
    </View>
  );

  const cell = size / 3;

  const content = (
    <View style={[styles.frame, { width: size, height: size }]}>
      <Animated.View style={[{ width: size, height: size }, canvasStyle]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} resizeMode="contain" style={[styles.image, { width: size, height: size }]} />
        ) : null}
        <Animated.View style={[{ width: size, height: size }, overlayRotStyle]}>
          <Svg width={size} height={size}>
            {mode === '16' ? (
              <>
                {ZONES.map((z) => (
                  <Path
                    key={z.id}
                    d={sector(z.angle as number)}
                    fill={fills[z.id] ?? EMPTY_FILL}
                    stroke={colors.primary}
                    strokeWidth={1}
                    onPress={onPressZone ? () => { hapticTap(); onPressZone(z.id); } : undefined}
                  />
                ))}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={inner}
                  fill={fills.C ?? EMPTY_FILL}
                  stroke={colors.primary}
                  strokeWidth={1}
                  onPress={onPressZone ? () => { hapticTap(); onPressZone('C'); } : undefined}
                />
              </>
            ) : (
              GRID_9.flatMap((row, r) =>
                row.map((id, c) => (
                  <Rect
                    key={id}
                    x={c * cell + 1}
                    y={r * cell + 1}
                    width={cell - 2}
                    height={cell - 2}
                    fill={fills[id] ?? EMPTY_FILL}
                    stroke={colors.primary}
                    strokeWidth={1}
                    onPress={onPressZone ? () => { hapticTap(); onPressZone(id); } : undefined}
                  />
                )),
              )
            )}
          </Svg>
          {mode === '16'
            ? [
                ...ZONES.map((z) => {
                  const a = (z.angle as number) + rotation;
                  const main = z.short.ta !== '';
                  const rim = point(outer * 0.9, a);
                  const mid = point(outer * 0.6, a);
                  return [
                    main ? overlay(rim.x, rim.y, z.short[lang], 11, `rim-${z.id}`, true) : null,
                    labels[z.id] ? overlay(mid.x, mid.y + 2, labels[z.id] as string, 18, `lab-${z.id}`) : null,
                  ];
                }),
                labels.C ? overlay(cx, cy + 2, labels.C, 14, 'lab-C') : null,
              ]
            : GRID_9.flatMap((row, r) =>
                row.map((id, c) => {
                  const x = c * cell + cell / 2;
                  const y = r * cell + cell / 2;
                  return [
                    overlay(c * cell + 26, r * cell + 14, ZONE_BY_ID[id].short[lang], 11, `rim-${id}`, true),
                    labels[id] ? overlay(x, y + 4, labels[id] as string, 22, `lab-${id}`) : null,
                  ];
                }),
              )}
        </Animated.View>
      </Animated.View>
      {interactive && zoomed ? (
        <Pressable accessibilityRole="button" onPress={resetZoom} style={styles.resetPill}>
          <AppText size={11} bold color="#fff">
            1×
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );

  return interactive ? <GestureDetector gesture={composed}>{content}</GestureDetector> : content;
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: 16 },
  image: { position: 'absolute', left: 0, top: 0, opacity: 0.65 },
  label: { position: 'absolute', width: 44, alignItems: 'center' },
  resetPill: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: colors.heroBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
