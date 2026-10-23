import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@core/theme';
import { AppText } from '@core/components/ui';

type Props = { score: number; size?: number };

export function scoreColor(score: number): string {
  if (score >= 65) return colors.good;
  if (score >= 40) return colors.ok;
  return colors.bad;
}

export default function ScoreRing({ score, size = 140 }: Props) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const color = scoreColor(score);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * score) / 100} ${circumference}`}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText bold size={36} color={color}>
        {score}
      </AppText>
    </View>
  );
}
