import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Radii, FontSizes, FontWeights, Spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        isDisabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'secondary' ? Colors.gold : Colors.goldForeground}
        />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },

  // Sizes
  size_sm: { paddingHorizontal: Spacing.md, paddingVertical: 8, minHeight: 36 },
  size_md: { paddingHorizontal: Spacing.lg, paddingVertical: 12, minHeight: 44 },
  size_lg: { paddingHorizontal: Spacing.xl, paddingVertical: 16, minHeight: 52 },

  // Variants
  variant_primary: {
    backgroundColor: Colors.foreground,
  },
  variant_gold: {
    backgroundColor: Colors.gold,
  },
  variant_secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: Colors.error,
  },

  // Text colors
  text: {
    fontWeight: FontWeights.semibold,
  },
  text_primary: {
    color: Colors.background,
  },
  text_gold: {
    color: Colors.goldForeground,
  },
  text_secondary: {
    color: Colors.foreground,
  },
  text_ghost: {
    color: Colors.gold,
  },
  text_danger: {
    color: Colors.error,
  },

  // Text sizes
  textSize_sm: { fontSize: FontSizes.sm },
  textSize_md: { fontSize: FontSizes.base },
  textSize_lg: { fontSize: FontSizes.md },

  // Disabled
  disabled: { opacity: 0.45 },
});
