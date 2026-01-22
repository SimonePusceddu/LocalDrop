import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SharedFile } from '../types';
import { FileTypeIcon } from './FileTypeIcon';
import { colors, spacing } from '../constants/theme';

interface Props {
  file: SharedFile;
  onRemove?: (id: string) => void;
  onSave?: (file: SharedFile) => void;
  onPress?: (file: SharedFile) => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function TransferRow({ file, onRemove, onSave, onPress }: Props) {
  const isReceived = file.direction === 'received';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainContent}
        onPress={() => onPress?.(file)}
        activeOpacity={0.7}
      >
        <FileTypeIcon mimeType={file.mimeType} uri={file.uri} size={44} />

        <View style={styles.info}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
        </View>
      </TouchableOpacity>

      {isReceived && onSave ? (
        <TouchableOpacity
          onPress={() => onSave(file)}
          style={styles.saveButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.saveText}>{'\u2193'}</Text>
        </TouchableOpacity>
      ) : onRemove ? (
        <TouchableOpacity
          onPress={() => onRemove(file.id)}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeText}>{'\u2715'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.sm + 4,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.light.text,
  },
  fileSize: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: colors.accent.blue,
    fontSize: 16,
    fontWeight: '700',
  },
});
