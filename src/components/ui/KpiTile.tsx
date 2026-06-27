import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from './Card';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface KpiTileProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  accent?: boolean; // gold accent variant
  trend?: { value: number; label?: string }; // positive = green, negative = red
}

export function KpiTile({ label, value, sub, icon, loading = false, accent = false, trend }: KpiTileProps) {
  const trendColor = trend
    ? trend.value >= 0
      ? Colors.success
      : Colors.error
    : undefined;

  return (
    <Card style={[styles.tile, accent && styles.accentTile]}>
      {icon && (
        <View style={[styles.iconWrap, accent && styles.accentIconWrap]}>
          {icon}
        </View>
      )}
      {loading ? (
        <ActivityIndicator size="small" color={Colors.gold} style={{ marginVertical: 8 }} />
      ) : (
        <Text style={[styles.value, accent && styles.accentValue]}>{value}</Text>
      )}
      <Text style={styles.label}>{label}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
      {trend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </Text>
          {trend.label && <Text style={styles.trendLabel}> {trend.label}</Text>}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 140,
    padding: Spacing.md,
    gap: 4,
  },
  accentTile: {
    borderColor: `${Colors.gold}40`,
    backgroundColor: `${Colors.gold}08`,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  accentIconWrap: {
    backgroundColor: `${Colors.gold}20`,
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.foreground,
  },
  accentValue: {
    color: Colors.gold,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    fontWeight: FontWeights.medium,
  },
  sub: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  trendLabel: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
});
