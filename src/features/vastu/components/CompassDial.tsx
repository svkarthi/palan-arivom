import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { ZONES } from '../data/zones';
import type { Lang } from '@core/i18n';
import { colors, fonts } from '@core/theme';

type Props = { size: number; heading: number; lang: Lang };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Compass card that turns opposite to the heading so north stays true. */
export default function CompassDial({ size, heading, lang }: Props) {
  const c = size / 2;
  const r = c - 6;
  const at = (radius: number, angle: number) => ({
    x: c + radius * Math.sin(rad(angle)),
    y: c - radius * Math.cos(rad(angle)),
  });

  return (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, transform: [{ rotate: `${-heading}deg` }] }}>
        <Svg width={size} height={size}>
          <Circle cx={c} cy={c} r={r} fill={colors.card} stroke={colors.primary} strokeWidth={3} />
          <Circle cx={c} cy={c} r={r * 0.62} fill="none" stroke={colors.border} strokeWidth={1} />
          {ZONES.map((z) => {
            const a = z.angle as number;
            const main = z.short.ta !== '';
            const p1 = at(r, a);
            const p2 = at(r - (main ? 16 : 9), a);
            return (
              <Line
                key={z.id}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={z.id === 'N' ? colors.bad : colors.primary}
                strokeWidth={main ? 2.5 : 1.2}
              />
            );
          })}
          {ZONES.filter((z) => z.short.ta !== '').map((z) => {
            const a = z.angle as number;
            const p = at(r - 34, a);
            const isCardinal = a % 90 === 0;
            return (
              <SvgText
                key={z.id}
                x={p.x}
                y={p.y + 5}
                fontSize={isCardinal ? 20 : 13}
                fontFamily={fonts.bold}
                fill={z.id === 'N' ? colors.bad : colors.primaryDark}
                textAnchor="middle"
                rotation={a}
                origin={`${p.x}, ${p.y}`}
              >
                {z.short[lang]}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      <Svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
        <Polygon points={`${c},${6} ${c - 9},${28} ${c + 9},${28}`} fill={colors.primaryDark} />
        <Circle cx={c} cy={c} r={4} fill={colors.primaryDark} />
      </Svg>
    </View>
  );
}
