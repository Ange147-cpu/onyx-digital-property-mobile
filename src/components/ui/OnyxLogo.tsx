import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, FontSizes } from '@/constants/theme';

interface OnyxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function OnyxLogo({ size = 'md', showText = true }: OnyxLogoProps) {
  const gemSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontSize = size === 'sm' ? FontSizes.sm : size === 'lg' ? FontSizes.xl : FontSizes.md;

  return (
    <View style={styles.row}>
      <View style={[styles.gem, { width: gemSize, height: gemSize, borderRadius: gemSize * 0.22 }]}>
        {/* Gem icon using simple text symbol */}
        <Text style={[styles.gemText, { fontSize: gemSize * 0.5 }]}>◆</Text>
      </View>
      {showText && (
        <View style={styles.textWrap}>
          <Text style={[styles.title, { fontSize }]}>Onyx Digital</Text>
          <Text style={styles.sub}>Property Platform</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gem: {
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemText: {
    color: Colors.goldForeground,
    fontWeight: '700',
  },
  textWrap: {
    gap: 1,
  },
  title: {
    color: Colors.foreground,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
