import { CameraView, useCameraPermissions, type BarcodeType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BarcodeScan'>;

const BARCODE_TYPES: BarcodeType[] = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'codabar',
  'itf14',
  'qr',
  'pdf417',
  'datamatrix',
  'aztec',
];

export function BarcodeScanScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);
  const [torch, setTorch] = useState(false);

  const onScanned = useCallback(
    ({ data }: { data: string }) => {
      if (handled.current || !data?.trim()) return;
      handled.current = true;
      const q = data.trim();
      navigation.replace('ProductList', { category: 'All', query: q });
    },
    [navigation]
  );

  const onClose = useCallback(() => navigation.goBack(), [navigation]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.unsupported}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Pressable onPress={onClose} style={[styles.topBtn, { top: insets.top + 8 }]}>
          <MaterialCommunityIcons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <MaterialCommunityIcons name="barcode-off" size={56} color={colors.outline} />
        <Text style={styles.unsupportedTitle}>Camera scanning</Text>
        <Text style={styles.unsupportedSub}>Use the iOS or Android app to scan prescription barcodes.</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <StatusBar style="light" />
        <Text style={styles.permissionTitle}>Camera access</Text>
        <Text style={styles.permissionSub}>
          Allow camera access to scan barcodes on your prescription or medicine packaging.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={() => requestPermission()}>
          <Text style={styles.primaryBtnText}>Continue</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.textBtn}>
          <Text style={styles.textBtnLabel}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} style={styles.iconCircle} accessibilityRole="button" accessibilityLabel="Close scanner">
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.hint}>Align barcode in frame</Text>
          <Pressable
            onPress={() => setTorch((t) => !t)}
            style={styles.iconCircle}
            accessibilityRole="button"
            accessibilityLabel={torch ? 'Turn flash off' : 'Turn flash on'}
          >
            <MaterialCommunityIcons name={torch ? 'flashlight' : 'flashlight-off'} size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.frame} />
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    centered: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: {
      flex: 1,
      textAlign: 'center',
      color: 'rgba(255,255,255,0.95)',
      fontSize: 15,
      fontWeight: '600',
      paddingHorizontal: 8,
    },
    frame: {
      alignSelf: 'center',
      width: '86%',
      maxWidth: 340,
      aspectRatio: 1.6,
      marginBottom: 120,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.45)',
      backgroundColor: 'transparent',
    },
    permission: {
      flex: 1,
      backgroundColor: screenRootBg(isDark, colors.background),
      paddingHorizontal: 28,
      paddingTop: 120,
      gap: 16,
    },
    permissionTitle: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
    permissionSub: { fontSize: 15, lineHeight: 22, color: colors.onSurfaceVariant },
    primaryBtn: {
      marginTop: 12,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    primaryBtnText: { color: colors.onPrimary, fontWeight: '800', fontSize: 16 },
    textBtn: { alignItems: 'center', paddingVertical: 12 },
    textBtnLabel: { color: colors.primary, fontWeight: '700', fontSize: 16 },
    unsupported: {
      flex: 1,
      backgroundColor: screenRootBg(isDark, colors.background),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    topBtn: { position: 'absolute', left: 16, zIndex: 2, padding: 8 },
    unsupportedTitle: { fontSize: 20, fontWeight: '800', color: colors.onSurface },
    unsupportedSub: { textAlign: 'center', fontSize: 15, color: colors.onSurfaceVariant, lineHeight: 22 },
  });
}
