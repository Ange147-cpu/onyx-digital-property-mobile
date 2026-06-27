import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FontSizes, Radii } from '@/constants/theme';
import { PAYMENT_STATUS_CONFIG } from '@/utils/format';

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = '#fff', bg = 'rgba(255,255,255,0.1)', style, size = 'sm' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'md' && styles.md, style]}>
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, style, size = 'sm' }: StatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) {
    return <Badge label={status} style={style} size={size} />;
  }
  return <Badge label={config.label} color={config.color} bg={config.bg} style={style} size={size} />;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  textMd: {
    fontSize: FontSizes.sm,
  },
});
