import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';

interface ToastProps {
  text1?: string;
  text2?: string;
}

function ToastSuccess({ text1, text2 }: ToastProps) {
  return (
    <View style={[styles.container, { borderLeftColor: Colors.success }]}>
      <View style={styles.texts}>
        {text1 && <Text style={[styles.title, { color: Colors.success }]}>{text1}</Text>}
        {text2 && <Text style={styles.body}>{text2}</Text>}
      </View>
    </View>
  );
}

function ToastError({ text1, text2 }: ToastProps) {
  return (
    <View style={[styles.container, { borderLeftColor: Colors.error }]}>
      <View style={styles.texts}>
        {text1 && <Text style={[styles.title, { color: Colors.error }]}>{text1}</Text>}
        {text2 && <Text style={styles.body}>{text2}</Text>}
      </View>
    </View>
  );
}

function ToastInfo({ text1, text2 }: ToastProps) {
  return (
    <View style={[styles.container, { borderLeftColor: Colors.info }]}>
      <View style={styles.texts}>
        {text1 && <Text style={[styles.title, { color: Colors.info }]}>{text1}</Text>}
        {text2 && <Text style={styles.body}>{text2}</Text>}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (props: ToastProps) => <ToastSuccess {...props} />,
  error: (props: ToastProps) => <ToastError {...props} />,
  info: (props: ToastProps) => <ToastInfo {...props} />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderLeftWidth: 4,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  texts: { flex: 1 },
  title: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  body: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
});
