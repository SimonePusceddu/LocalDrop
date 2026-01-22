import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../constants/theme';

interface Props {
  mimeType: string;
  uri?: string;
  size?: number;
}

function getIconConfig(mimeType: string): { label: string; bgColor: string; textColor: string } {
  if (mimeType.startsWith('video/')) {
    return { label: 'VID', bgColor: '#fce7f3', textColor: '#db2777' };
  }
  if (mimeType.startsWith('audio/')) {
    return { label: 'AUD', bgColor: '#e0e7ff', textColor: '#4f46e5' };
  }
  if (mimeType === 'application/pdf') {
    return { label: 'PDF', bgColor: '#fee2e2', textColor: '#dc2626' };
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return { label: 'XLS', bgColor: '#dcfce7', textColor: '#16a34a' };
  }
  if (mimeType.includes('document') || mimeType.includes('word')) {
    return { label: 'DOC', bgColor: '#dbeafe', textColor: '#2563eb' };
  }
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) {
    return { label: 'ZIP', bgColor: '#f3e8ff', textColor: '#9333ea' };
  }
  if (mimeType.includes('text/')) {
    return { label: 'TXT', bgColor: '#f1f5f9', textColor: '#475569' };
  }
  return { label: 'FILE', bgColor: '#f1f5f9', textColor: '#64748b' };
}

export function FileTypeIcon({ mimeType, uri, size = 44 }: Props) {
  const isImage = mimeType.startsWith('image/');

  // Show actual image preview for images
  if (isImage && uri) {
    return (
      <View style={[styles.imageContainer, { width: size, height: size }]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Show icon for other file types
  const { label, bgColor, textColor } = getIconConfig(mimeType);

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor, fontSize: size * 0.25 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
  imageContainer: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.light.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
