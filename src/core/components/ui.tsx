import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, spacing } from '../theme';

type AppTextProps = TextProps & {
  bold?: boolean;
  size?: number;
  color?: string;
  center?: boolean;
};

/** Text with the Tamil-capable font and a line height that avoids clipping. */
export function AppText({ bold, size = 16, color = colors.text, center, style, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: bold ? fonts.bold : fonts.regular,
          fontSize: size,
          lineHeight: Math.round(size * 1.55),
          color,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
    />
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const filled = variant !== 'outline';
  const tint = variant === 'danger' ? colors.bad : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled ? { backgroundColor: tint } : { borderColor: tint, borderWidth: 1.5 },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.8 },
        style,
      ]}
    >
      <AppText bold size={15} color={filled ? '#fff' : tint} center>
        {title}
      </AppText>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ChipProps = { label: string; color: string; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> };

export function Chip({ label, color, style, textStyle }: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color }, style]}>
      <AppText size={12} color={color} style={textStyle}>
        {label}
      </AppText>
    </View>
  );
}

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: colors.primary }]}
          >
            <AppText bold={active} size={14} color={active ? '#fff' : colors.primary} center>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  segment: { flex: 1, paddingVertical: 8, paddingHorizontal: 6 },
});
