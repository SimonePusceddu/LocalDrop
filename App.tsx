import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Share,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Zeroconf from 'react-native-zeroconf';

import { ConnectionStatusCard } from './src/components/ConnectionStatusCard';
import { ActionButtons } from './src/components/ActionButtons';
import { RecentTransfers } from './src/components/RecentTransfers';
import { FilePickerModal } from './src/components/FilePickerModal';
import { startServer, stopServer, PORT } from './src/server';
import { SharedFile, ServerStatus } from './src/types';
import { colors } from './src/constants/theme';

SplashScreen.preventAutoHideAsync();

const zeroconf = new Zeroconf();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    running: false,
    port: PORT,
    ip: null,
    mdnsAdvertised: false,
  });
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [filePickerVisible, setFilePickerVisible] = useState(false);
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
            direction: 'sent',
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
            direction: 'sent',
          };
          addFile(newFile);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Handle Send to PC - show file picker modal
  const handleSendToPC = () => {
    setFilePickerVisible(true);
  };

  // Share URL for receiving files
  const handleReceiveFiles = async () => {
    const url = serverStatus.ip
      ? `http://${serverStatus.ip}:${PORT}`
      : `http://localdrop.local:${PORT}`;

    try {
      await Share.share({
        message: `Open this URL on your PC to send files to your phone:\n${url}`,
        url: url,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Handle font loading
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />

      {/* Dark connection status header */}
      <ConnectionStatusCard
        isConnected={serverStatus.running}
        ipAddress={serverStatus.ip}
        port={PORT}
      />

      {/* Light content area */}
      <View style={styles.contentArea}>
        {/* Action buttons */}
        <ActionButtons
          onSendToPC={handleSendToPC}
          onReceiveFiles={handleReceiveFiles}
        />

        {/* Recent transfers list */}
        <RecentTransfers
          files={sharedFiles}
          onRemoveFile={removeFile}
        />
      </View>

      {/* File picker modal */}
      <FilePickerModal
        visible={filePickerVisible}
        onClose={() => setFilePickerVisible(false)}
        onSelectDocument={pickDocument}
        onSelectImage={pickImage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  contentArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
});
