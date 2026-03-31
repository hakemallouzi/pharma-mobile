import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import { useAppNavigation } from '../navigation/useAppNavigation';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

const popular = [
  'Vitamin C 1000mg',
  'Pain Relief',
  'Melatonin Gummies',
  'Digital Thermometer',
  'Face Masks',
  'Omega 3',
];

const initialRecent = ['Paracetamol 500mg', 'Antiseptic Cream', 'Kids Multivitamin'];

function categoryChips(colors: ThemeColors) {
  return [
    { icon: 'view-grid-plus-outline' as const, label: 'All Categories', category: 'All', color: colors.secondary },
    { icon: 'pill' as const, label: 'Medicines', color: colors.primary },
    { icon: 'pill-multiple' as const, label: 'Vitamins', color: colors.tertiary },
    { icon: 'baby-bottle-outline' as const, label: 'Baby Care', color: colors.secondary },
    { icon: 'face-woman-outline' as const, label: 'Skincare', color: colors.primary },
    { icon: 'cup-water' as const, label: 'Hydration', color: colors.primary },
    { icon: 'stethoscope' as const, label: 'Medical Devices', color: colors.primary },
    { icon: 'heart-pulse' as const, label: 'Heart Health', color: colors.primary },
    { icon: 'brain' as const, label: 'Mental Wellness', color: colors.primary },
    { icon: 'bone' as const, label: 'Bones & Joints', color: colors.primary },
    { icon: 'bandage' as const, label: 'First Aid', color: colors.primary },
    { icon: 'spray-bottle' as const, label: 'Personal Care', color: colors.primary },
  ];
}

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createSearchStyles(colors, isDark), [colors, isDark]);
  const cats = useMemo(() => categoryChips(colors), [colors]);
  const [q, setQ] = useState('');
  const [recentItems, setRecentItems] = useState(initialRecent);
  const [prescriptionImageUri, setPrescriptionImageUri] = useState<string | null>(null);
  const [medicineImageUri, setMedicineImageUri] = useState<string | null>(null);

  const savePickedImage = (kind: 'prescription' | 'medicine', uri: string) => {
    if (kind === 'prescription') setPrescriptionImageUri(uri);
    else setMedicineImageUri(uri);
  };

  const pickFromLibrary = async (kind: 'prescription' | 'medicine') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled || !result.assets.length) return;
    savePickedImage(kind, result.assets[0].uri);
  };

  const pickFromCamera = async (kind: 'prescription' | 'medicine') => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled || !result.assets.length) return;
    savePickedImage(kind, result.assets[0].uri);
  };

  const pickImage = (kind: 'prescription' | 'medicine') => {
    Alert.alert('Select image source', 'Choose how you want to upload.', [
      { text: 'Take Photo', onPress: () => pickFromCamera(kind) },
      { text: 'Choose from Gallery', onPress: () => pickFromLibrary(kind) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const contactSpecialistPharmacist = () => {
    navigation.navigate('SpecialistChat', { topic: 'prescription' });
  };

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title="Search"
        right={
          <Pressable hitSlop={8}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, vitamins, wellness..."
            placeholderTextColor={colors.outline}
            value={q}
            onChangeText={setQ}
          />
          <Pressable
            onPress={() => navigation.navigate('BarcodeScan')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Scan prescription barcode"
          >
            <MaterialCommunityIcons name="barcode-scan" size={24} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.uploadRow}>
          <Pressable style={styles.uploadBtn} onPress={contactSpecialistPharmacist}>
            <MaterialCommunityIcons name="face-agent" size={18} color={colors.primary} />
            <Text style={styles.uploadBtnTxt}>Prescription via specialist</Text>
          </Pressable>
          <Pressable style={styles.uploadBtn} onPress={() => pickImage('medicine')}>
            <MaterialCommunityIcons name="pill" size={18} color={colors.primary} />
            <Text style={styles.uploadBtnTxt}>Upload medicine image</Text>
          </Pressable>
        </View>
        <Text style={styles.uploadHint}>For prescriptions, contact our specialist pharmacist for guidance.</Text>
        {prescriptionImageUri || medicineImageUri ? (
          <View style={styles.uploadPreviewRow}>
            {prescriptionImageUri ? (
              <View style={styles.uploadPreviewItem}>
                <Image source={{ uri: prescriptionImageUri }} style={styles.uploadPreviewImg} contentFit="cover" />
                <Text style={styles.uploadPreviewTxt}>Prescription ready</Text>
              </View>
            ) : null}
            {medicineImageUri ? (
              <View style={styles.uploadPreviewItem}>
                <Image source={{ uri: medicineImageUri }} style={styles.uploadPreviewImg} contentFit="cover" />
                <Text style={styles.uploadPreviewTxt}>Medicine image ready</Text>
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={styles.orderAgainHead}>
          <Text style={styles.smallTitle}>Order Again</Text>
          <Pressable onPress={() => setRecentItems([])}>
            <Text style={styles.clear}>Clear All</Text>
          </Pressable>
        </View>
        {recentItems.map((r) => (
          <Pressable
            key={r}
            style={styles.recentRow}
            onPress={() => navigation.navigate('ProductList', { category: 'All', query: r })}
          >
            <MaterialCommunityIcons name="history" size={18} color={colors.outline} />
            <Text style={styles.recentTxt}>{r}</Text>
          </Pressable>
        ))}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Pressable onPress={() => navigation.navigate('ProductList', { category: 'All' })}>
            <Text style={styles.link}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.catGrid}>
          {cats.map((item) => (
            <Pressable
              key={item.label}
              style={styles.catCard}
              onPress={() => navigation.navigate('ProductList', { category: item.category ?? item.label })}
            >
              <View
                style={[
                  styles.catIcon,
                  { backgroundColor: item.category === 'All' ? `${colors.secondary}30` : `${item.color}22` },
                ]}
              >
                <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.catLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.smallTitle}>Popular Now</Text>
            <View style={styles.chips}>
              {popular.map((p) => (
                <Pressable
                  key={p}
                  style={styles.chip}
                  onPress={() => navigation.navigate('ProductList', { category: 'All', query: p })}
                >
                  <Text style={styles.chipText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ flex: 1 }}>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

function createSearchStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.surface) },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      paddingHorizontal: 16,
      height: 56,
      marginTop: 8,
      gap: 10,
    },
    searchIcon: { marginLeft: 4 },
    searchInput: { flex: 1, color: c.onSurface, fontSize: 16 },
    uploadRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    uploadBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    uploadBtnTxt: { fontSize: 12, fontWeight: '700', color: c.onSurface },
    uploadHint: { marginTop: 8, fontSize: 11, color: c.onSurfaceVariant },
    uploadPreviewRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    uploadPreviewItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 12,
      padding: 8,
    },
    uploadPreviewImg: { width: 28, height: 28, borderRadius: 6, backgroundColor: c.surfaceContainerHigh },
    uploadPreviewTxt: { fontSize: 11, fontWeight: '700', color: c.onSurfaceVariant },
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    link: { color: c.primary, fontWeight: '700', fontSize: 14 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
    catCard: {
      width: '22%',
      alignItems: 'center',
    },
    catIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    catLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c.onSurfaceVariant,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    twoCol: { marginTop: 28, gap: 24 },
    orderAgainHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
    },
    smallTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 2,
      color: c.outline,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    chipText: { fontSize: 12, fontWeight: '600', color: c.onSurface },
    recentHead: { flexDirection: 'row', justifyContent: 'space-between' },
    clear: { fontSize: 11, color: c.error, fontWeight: '700' },
    recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    recentTxt: { flex: 1, color: c.onSurface },
  });
}
