import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import { SharedFile } from '../types';
import { TransferRow } from './TransferRow';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface Props {
  files: SharedFile[];
  onRemoveFile: (id: string) => void;
}

export function RecentTransfers({ files, onRemoveFile }: Props) {
  const sentFiles = files.filter((f) => f.direction === 'sent');
  const receivedFiles = files.filter((f) => f.direction === 'received');

  const isEmpty = files.length === 0;

  const handleSave = async (file: SharedFile) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const handleOpenFile = async (file: SharedFile) => {
    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(file.uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: file.mimeType,
        });
      } else {
        // iOS fallback - use sharing
        await Sharing.shareAsync(file.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open file');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transfers</Text>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>{'\u{1F4C2}'}</Text>
          </View>
          <Text style={styles.emptyText}>No recent transfers</Text>
          <Text style={styles.emptySubtext}>
            Files you send or receive will appear here
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Sent Files Section */}
          {sentFiles.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, styles.sentIcon]}>
                  <Text style={styles.sectionArrow}>{'\u2191'}</Text>
                </View>
                <Text style={styles.sectionTitle} numberOfLines={1}>Sent to PC</Text>
                <Text style={styles.sectionCount}>{sentFiles.length}</Text>
              </View>
              {sentFiles.map((file) => (
                <TransferRow
                  key={file.id}
                  file={file}
                  onRemove={onRemoveFile}
                  onPress={handleOpenFile}
                />
              ))}
            </View>
          )}

          {/* Received Files Section */}
          {receivedFiles.length > 0 && (
            <View style={[styles.section, sentFiles.length > 0 && styles.sectionSpacing]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, styles.receivedIcon]}>
                  <Text style={styles.sectionArrow}>{'\u2193'}</Text>
                </View>
                <Text style={styles.sectionTitle} numberOfLines={1}>Received from PC</Text>
                <Text style={styles.sectionCount}>{receivedFiles.length}</Text>
              </View>
              {receivedFiles.map((file) => (
                <TransferRow
                  key={file.id}
                  file={file}
                  onSave={handleSave}
                  onPress={handleOpenFile}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    ...shadows.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    // Section container
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    marginBottom: spacing.xs,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentIcon: {
    backgroundColor: colors.accent.greenLight,
  },
  receivedIcon: {
    backgroundColor: colors.accent.blueLight,
  },
  sectionArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textTertiary,
    backgroundColor: colors.light.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyIconText: {
    fontSize: 22,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
