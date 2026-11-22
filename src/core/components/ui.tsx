import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, type ComponentProps, type ReactNode } from 'react';
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
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { colors, fonts, shadows, spacing } from '../theme';
import { hapticTap } from '../utils/haptics';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Safe bottom inset for ScrollViews and bottom sheets (safe outside SafeAreaProvider in tests). */
export function useBottomInset(extra = spacing.md): number {
  const insets = useContext(SafeAreaInsetsContext);
  return Math.max(insets?.bottom ?? 0, spacing.sm) + extra;
}

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

type IconBadgeProps = {
  icon: IconName;
  color?: string;
  bg?: string;
  size?: number;
  iconSize?: number;
};

/** Tinted circular/squircle vector icon container. */
export function IconBadge({
  icon,
  color = colors.primary,
  bg = colors.primaryBg,
  size = 44,
  iconSize = Math.round(size * 0.52),
}: IconBadgeProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.34),
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
    </View>
  );
}

type SectionHeaderProps = {
  icon?: IconName;
  iconNode?: ReactNode;
  title: string;
  color?: string;
  bg?: string;
  right?: ReactNode;
};

/** Crisp section heading with a tinted vector icon badge and optional right action. */
export function SectionHeader({
  icon,
  iconNode,
  title,
  color = colors.primaryDark,
  bg = colors.primaryBg,
  right,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: bg }]}>
        {iconNode ?? (icon ? <MaterialCommunityIcons name={icon} size={17} color={color} /> : null)}
      </View>
      <AppText bold size={16} color={colors.primaryDark} style={styles.flex}>
        {title}
      </AppText>
      {right}
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
  const filled = variant !== 'outline';
  const tint = variant === 'danger' ? colors.bad : colors.primary;
  const fg = filled ? '#fff' : tint;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled ? { backgroundColor: tint } : { borderColor: tint, borderWidth: 1.5, backgroundColor: colors.card },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.82 },
        pressed && !disabled && { transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      <View style={styles.buttonInner}>
        {icon ? <MaterialCommunityIcons name={icon} size={18} color={fg} /> : null}
        <AppText bold size={14} color={fg} center>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

type CardProps = {
  children: ReactNode;
  variant?: 'default' | 'hero' | 'tinted';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = 'default', style }: CardProps) {
  if (variant === 'hero') {
    return (
      <LinearGradient
        colors={['#982A1E', '#7A1F1F', '#551414']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.cardHero, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return (
    <View
      style={[
        styles.card,
        variant === 'tinted' && styles.cardTinted,
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ChipProps = { label: string; color: string; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> };

export function Chip({ label, color, style, textStyle }: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '1A', borderColor: color + '66' }, style]}>
      <AppText size={12} bold color={color} style={textStyle}>
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
            onPress={() => {
              if (!active) hapticTap();
              onChange(o.value);
            }}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && !active && { opacity: 0.7 },
            ]}
          >
            <AppText
              bold={active}
              size={13}
              color={active ? '#fff' : colors.primaryDark}
              center
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

type StepperProps = { label: string; onPrev: () => void; onNext: () => void; onReset?: () => void; resetLabel?: string };

/** ‹ label › control for stepping through days or months. */
export function Stepper({ label, onPrev, onNext, onReset, resetLabel }: StepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="previous"
        onPress={() => {
          hapticTap();
          onPrev();
        }}
        hitSlop={10}
        style={({ pressed }) => [styles.stepButton, pressed && { opacity: 0.6 }]}
      >
        <MaterialCommunityIcons name="chevron-left" size={26} color={colors.primary} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!onReset}
        onPress={() => {
          if (onReset) {
            hapticTap();
            onReset();
          }
        }}
        style={styles.stepLabel}
      >
        <AppText bold size={15} color={colors.primaryDark} center>
          {label}
        </AppText>
        {onReset && resetLabel ? (
          <AppText size={11} bold color={colors.primary} center>
            {resetLabel}
          </AppText>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="next"
        onPress={() => {
          hapticTap();
          onNext();
        }}
        hitSlop={10}
        style={({ pressed }) => [styles.stepButton, pressed && { opacity: 0.6 }]}
      >
        <MaterialCommunityIcons name="chevron-right" size={26} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  stepButton: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.sm },
  stepLabel: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  button: {
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHero: {
    backgroundColor: colors.heroBg,
    borderColor: 'rgba(245, 196, 105, 0.35)',
    ...shadows.hero,
  },
  cardTinted: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segment: { flex: 1, paddingVertical: 7, paddingHorizontal: 6, borderRadius: 9 },
  segmentActive: { backgroundColor: colors.primary },
});
