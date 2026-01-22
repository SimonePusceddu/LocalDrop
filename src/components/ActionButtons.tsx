import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface Props {
  onSendToPC: () => void;
  onReceiveFiles: () => void;
}

export function ActionButtons({ onSendToPC, onReceiveFiles }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.sendButton]}
        onPress={onSendToPC}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, styles.sendIcon]}>
          <Text style={styles.sendArrow}>{'\u2191'}</Text>
        </View>
        <Text style={styles.buttonTitle} numberOfLines={1}>Send to PC</Text>
        <Text style={styles.buttonSubtitle} numberOfLines={1}>Share files from phone</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.receiveButton]}
        onPress={onReceiveFiles}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, styles.receiveIcon]}>
          <Text style={styles.receiveArrow}>{'\u2193'}</Text>
        </View>
        <Text style={styles.buttonTitle} numberOfLines={1}>Receive Files</Text>
        <Text style={styles.buttonSubtitle} numberOfLines={1}>Get files from PC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  sendButton: {
    borderTopColor: colors.accent.green,
    borderTopWidth: 4,
  },
  receiveButton: {
    borderTopColor: colors.accent.blue,
    borderTopWidth: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  sendIcon: {
    backgroundColor: colors.accent.greenLight,
  },
  receiveIcon: {
    backgroundColor: colors.accent.blueLight,
  },
  sendArrow: {
    fontSize: 22,
    color: colors.accent.green,
    fontWeight: '700',
  },
  receiveArrow: {
    fontSize: 22,
    color: colors.accent.blue,
    fontWeight: '700',
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginTop: spacing.xs,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
});
