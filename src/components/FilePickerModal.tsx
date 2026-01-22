import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDocument: () => void;
  onSelectImage: () => void;
}

export function FilePickerModal({
  visible,
  onClose,
  onSelectDocument,
  onSelectImage,
}: Props) {
  const handleSelectDocument = () => {
    onClose();
    onSelectDocument();
  };

  const handleSelectImage = () => {
    onClose();
    onSelectImage();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              <Text style={styles.title}>Select file type</Text>
              <Text style={styles.subtitle}>Choose what you want to share</Text>

              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={handleSelectDocument}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, styles.documentIcon]}>
                    <Text style={styles.emoji}>{'\u{1F4C4}'}</Text>
                  </View>
                  <Text style={styles.optionTitle}>Document</Text>
                  <Text style={styles.optionSubtitle}>PDF, Word, Excel, etc.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={handleSelectImage}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, styles.imageIcon]}>
                    <Text style={styles.emoji}>{'\u{1F5BC}'}</Text>
                  </View>
                  <Text style={styles.optionTitle}>Image</Text>
                  <Text style={styles.optionSubtitle}>Photos from gallery</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  documentIcon: {
    backgroundColor: '#dbeafe',
  },
  imageIcon: {
    backgroundColor: '#fef3c7',
  },
  emoji: {
    fontSize: 28,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  optionSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
});
