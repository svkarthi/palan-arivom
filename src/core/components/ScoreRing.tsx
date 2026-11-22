import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';
import { AppText } from './ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  score: number;
  /** Maximum value for the ring (default 100; pass 10 for 10 Porutham). */
  max?: number;
  size?: number;
  /** Optional stroke & text color override; defaults to `scoreColor` based on percentage. */
  color?: string;
  /** Optional center label override (e.g. `"8/10"`). Defaults to `String(score)`. */
  label?: string;
};

export function scoreColor(percent: number): string {
  if (percent >= 65) return colors.good;
  if (percent >= 40) return colors.ok;
  return colors.bad;
}

/** Animated circular score ring shared by Vastu Report and 10 Porutham. */
export default function ScoreRing({ score, max = 100, size = 140, color, label }: Props) {
  const stroke = Math.max(9, Math.round(size * 0.085));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.max(0, Math.min(1, max > 0 ? score / max : 0));
  const tint = color ?? scoreColor(ratio * 100);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const text = label ?? String(score);
  const textSize = text.length > 3 ? Math.round(size * 0.21) : Math.round(size * 0.26);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tint}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText bold size={textSize} color={tint}>
        {text}
      </AppText>
    </View>
  );
}
