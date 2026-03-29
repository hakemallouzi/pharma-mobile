import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
    { icon: 'pill' as const, label: 'Medicines', color: colors.primary },
    { icon: 'pill' as const, label: 'Vitamins', color: colors.tertiary },
    { icon: 'baby-face-outline' as const, label: 'Baby Care', color: colors.secondary },
    { icon: 'spa' as const, label: 'Skincare', color: colors.primary },
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
              onPress={() => navigation.navigate('ProductList', { category: item.label })}
            >
              <View style={[styles.catIcon, { backgroundColor: `${item.color}22` }]}>
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
            <View style={styles.recentHead}>
              <Text style={styles.smallTitle}>Recent</Text>
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
          </View>
        </View>

        <LinearGradient
          colors={[colors.surfaceContainerLow, colors.surfaceContainer]}
          style={styles.promo}
        >
          <Image source={{ uri: imagesB2.searchBanner }} style={styles.promoImg} contentFit="cover" />
          <View style={styles.promoInner}>
            <Text style={styles.promoBadge}>Health Essentials</Text>
            <Text style={styles.promoTitle}>Refill your regular prescriptions effortlessly</Text>
            <Pressable style={styles.promoBtn} onPress={() => navigation.navigate('BarcodeScan')}>
              <Text style={styles.promoBtnText}>Scan Prescription</Text>
            </Pressable>
          </View>
        </LinearGradient>
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
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    link: { color: c.primary, fontWeight: '700', fontSize: 14 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    catCard: {
      width: '47%',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 18,
      padding: 18,
      marginBottom: 4,
    },
    catIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    catLabel: { fontWeight: '700', color: c.onSurface },
    twoCol: { marginTop: 28, gap: 24 },
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
    promo: {
      marginTop: 32,
      borderRadius: 28,
      overflow: 'hidden',
      minHeight: 180,
    },
    promoImg: { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
    promoInner: { padding: 24, maxWidth: '70%' },
    promoBadge: {
      alignSelf: 'flex-start',
      backgroundColor: c.tabPillActive,
      color: c.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 8,
      overflow: 'hidden',
    },
    promoTitle: { fontSize: 22, fontWeight: '800', color: c.onSurface, lineHeight: 28, marginBottom: 12 },
    promoBtn: {
      alignSelf: 'flex-start',
      backgroundColor: c.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 999,
    },
    promoBtnText: { color: c.onPrimary, fontWeight: '800', fontSize: 13 },
  });
}
