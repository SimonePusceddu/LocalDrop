import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SharedFile } from '../types';
import { FileTypeIcon } from './FileTypeIcon';
import { colors, spacing } from '../constants/theme';

interface Props {
  file: SharedFile;
  onRemove?: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function TransferRow({ file, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <FileTypeIcon mimeType={file.mimeType} uri={file.uri} size={44} />

      <View style={styles.info}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
      </View>

      {onRemove && (
        <TouchableOpacity
          onPress={() => onRemove(file.id)}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeText}>{'\u2715'}</Text>
        </TouchableOpacity>
      )}
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
});
