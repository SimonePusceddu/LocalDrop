import React from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { usePulseAnimation } from '../hooks/usePulseAnimation';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  isConnected: boolean;
  ipAddress: string | null;
  port: number;
}

export function ConnectionStatusCard({ isConnected, ipAddress, port }: Props) {
  const pulseAnim = usePulseAnimation(isConnected);

  const url = ipAddress ? `http://${ipAddress}:${port}` : null;

  return (
    <View style={styles.container}>
      <View style={styles.deviceRow}>
        {/* PC Icon */}
        <View style={styles.deviceIcon}>
          <Text style={styles.deviceEmoji}>{'\u{1F4BB}'}</Text>
          <Text style={styles.deviceLabel}>PC</Text>
        </View>

        {/* Secure Link Line */}
        <View style={styles.linkContainer}>
          <Animated.View
            style={[
              styles.linkLine,
              isConnected && { opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.linkDot,
              styles.linkDotLeft,
              isConnected && {
                opacity: pulseAnim,
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0.6, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.linkDot,
              styles.linkDotRight,
              isConnected && {
                opacity: pulseAnim.interpolate({
                  inputRange: [0.6, 1],
                  outputRange: [1, 0.6],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0.6, 1],
                      outputRange: [1, 0.8],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Phone Icon */}
        <Animated.View
          style={[
            styles.deviceIcon,
            isConnected && {
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0.6, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.deviceEmoji}>{'\u{1F4F1}'}</Text>
          <Text style={styles.deviceLabel}>Phone</Text>
        </Animated.View>
      </View>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? colors.dark.connected : colors.dark.disconnected },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: isConnected ? colors.dark.connected : colors.dark.disconnected },
          ]}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {/* URL Section */}
      {url && (
        <View style={styles.urlContainer}>
          <Text style={styles.urlLabel}>Open on your PC</Text>
          <Text style={styles.urlText}>{url}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.background,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  deviceIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceEmoji: {
    fontSize: 28,
  },
  deviceLabel: {
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkContainer: {
    width: 80,
    height: 4,
    marginHorizontal: spacing.md,
    justifyContent: 'center',
  },
  linkLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: colors.dark.linkLine,
    borderRadius: 2,
  },
  linkDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.dark.linkLine,
  },
  linkDotLeft: {
    left: 0,
  },
  linkDotRight: {
    right: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  urlContainer: {
    backgroundColor: colors.dark.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  urlLabel: {
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  urlText: {
    color: colors.dark.text,
    fontSize: 15,
    fontWeight: '500',
  },
});
