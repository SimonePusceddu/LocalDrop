import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Share,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as Network from 'expo-network';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Zeroconf from 'react-native-zeroconf';
import { startServer, stopServer, PORT } from './src/server';
import { SharedFile, ServerStatus } from './src/types';

const zeroconf = new Zeroconf();

export default function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    running: false,
    port: PORT,
    ip: null,
    mdnsAdvertised: false,
  });
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const serverStartedRef = useRef(false);

  const getIp = useCallback(() => serverStatus.ip, [serverStatus.ip]);

  const addFile = useCallback((file: SharedFile) => {
    setSharedFiles((prev) => [...prev, file]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setSharedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const getFiles = useCallback(() => sharedFiles, [sharedFiles]);

  // Get device IP address
  const fetchIpAddress = useCallback(async () => {
    try {
      const ipAddress = await Network.getIpAddressAsync();
      setServerStatus((prev) => ({ ...prev, ip: ipAddress }));
      return ipAddress;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return null;
    }
  }, []);

  // Initialize server
  useEffect(() => {
    if (serverStartedRef.current) return;
    serverStartedRef.current = true;

    const initServer = async () => {
      await fetchIpAddress();

      try {
        startServer({
          getFiles: () => sharedFiles,
          addFile,
          removeFile,
          getIp,
        });
        setServerStatus((prev) => ({ ...prev, running: true }));
        console.log(`Server started on port ${PORT}`);
      } catch (error) {
        console.error('Failed to start server:', error);
        Alert.alert('Error', 'Failed to start the server');
      }
    };

    initServer();

    return () => {
      stopServer();
      setServerStatus((prev) => ({ ...prev, running: false }));
    };
  }, []);

  // Update server callbacks when files change
  useEffect(() => {
    if (!serverStatus.running) return;

    // Restart server with updated callbacks
    stopServer();
    startServer({
      getFiles,
      addFile,
      removeFile,
      getIp,
    });
  }, [sharedFiles, getFiles, addFile, removeFile, getIp, serverStatus.running]);

  // Initialize mDNS advertisement
  useEffect(() => {
    const advertiseMdns = async () => {
      try {
        // Register the service
        zeroconf.publishService('http', 'tcp', 'local.', 'LocalDrop', PORT, {
          path: '/',
        });
        setServerStatus((prev) => ({ ...prev, mdnsAdvertised: true }));
        console.log('mDNS service advertised');
      } catch (error) {
        console.error('Failed to advertise mDNS:', error);
      }
    };

    if (serverStatus.running && serverStatus.ip) {
      advertiseMdns();
    }

    return () => {
      try {
        zeroconf.unpublishService('LocalDrop');
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [serverStatus.running, serverStatus.ip]);

  // Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const newFile: SharedFile = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: asset.name,
            uri: asset.uri,
            size: asset.size || 0,
            mimeType: asset.mimeType || 'application/octet-stream',
            addedAt: Date.now(),
          };
          addFile(newFile);
        }
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // Pick image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const fileName = asset.fileName || `image_${Date.now()}.jpg`;
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          const fileSize = fileInfo.exists ? (fileInfo as { size: number }).size : 0;

          const newFile: SharedFile = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            uri: asset.uri,
            size: fileSize,
            mimeType: asset.mimeType || 'image/jpeg',
            addedAt: Date.now(),
          };
          addFile(newFile);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Share URL
  const shareUrl = async () => {
    const url = serverStatus.ip
      ? `http://${serverStatus.ip}:${PORT}`
      : `http://localdrop.local:${PORT}`;

    try {
      await Share.share({
        message: `Access LocalDrop at: ${url}`,
        url: url,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Render file item
  const renderFileItem = ({ item }: { item: SharedFile }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.fileSize}>{formatSize(item.size)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFile(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const friendlyUrl = `http://localdrop.local:${PORT}`;
  const ipUrl = serverStatus.ip ? `http://${serverStatus.ip}:${PORT}` : 'Getting IP...';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LocalDrop</Text>
        <Text style={styles.subtitle}>Share files with your PC</Text>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: serverStatus.running ? '#4ade80' : '#ef4444' },
            ]}
          />
          <Text style={styles.statusText}>
            Server {serverStatus.running ? 'Running' : 'Stopped'}
          </Text>
        </View>

        <View style={styles.urlSection}>
          <Text style={styles.urlLabel}>Friendly URL (mDNS):</Text>
          <Text style={styles.urlText}>{friendlyUrl}</Text>
        </View>

        <View style={styles.urlSection}>
          <Text style={styles.urlLabel}>Fallback IP Address:</Text>
          <Text style={styles.urlText}>{ipUrl}</Text>
        </View>

        {serverStatus.mdnsAdvertised && (
          <View style={styles.mdnsBadge}>
            <Text style={styles.mdnsBadgeText}>mDNS Active</Text>
          </View>
        )}
      </View>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={shareUrl}>
        <Text style={styles.shareButtonText}>Send Link to PC</Text>
      </TouchableOpacity>

      {/* Add Files Section */}
      <View style={styles.addFilesRow}>
        <TouchableOpacity style={styles.addButton} onPress={pickDocument}>
          <Text style={styles.addButtonText}>+ Document</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Text style={styles.addButtonText}>+ Image</Text>
        </TouchableOpacity>
      </View>

      {/* Files List */}
      <View style={styles.filesCard}>
        <Text style={styles.filesTitle}>
          Shared Files ({sharedFiles.length})
        </Text>

        {sharedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No files shared yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add files to share them with your PC
            </Text>
          </View>
        ) : (
          <FlatList
            data={sharedFiles}
            keyExtractor={(item) => item.id}
            renderItem={renderFileItem}
            style={styles.fileList}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  urlSection: {
    marginBottom: 12,
  },
  urlLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urlText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  mdnsBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  mdnsBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  addFilesRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filesCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  filesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 5,
    textAlign: 'center',
  },
});
