import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

type Product = {
  title: string;
  sub: string;
  price: string;
  priceValue: number;
  badge?: string;
  tertiary?: boolean;
  image: string;
};

const products: Product[] = [
  {
    title: 'Liposomal Vitamin D3',
    sub: 'High-absorption formula for immune support and bone density optimization.',
    price: '$42.00',
    priceValue: 42,
    badge: 'Pure Grade',
    image: imagesB2.product1,
  },
  {
    title: 'Omega-3 Superior',
    sub: 'Ultra-pure deep sea fish oil with high EPA/DHA concentration for cognitive health.',
    price: '$58.00',
    priceValue: 58,
    badge: 'Bestseller',
    tertiary: true,
    image: imagesB2.product2,
  },
  {
    title: 'Methyl B-Complex',
    sub: 'Bioactive B-vitamins for cellular energy production and metabolic balance.',
    price: '$35.00',
    priceValue: 35,
    image: imagesB2.product3,
  },
  {
    title: 'Chelated Zinc',
    sub: 'High-potency mineral support for immune defense and enzyme activation.',
    price: '$29.00',
    priceValue: 29,
    image: imagesB2.product4,
  },
];

/** Slider max = show all products up to this ceiling; at `PRICE_SLIDER_MAX` the price filter is off. */
const PRICE_SLIDER_MIN = 25;
const PRICE_SLIDER_MAX = 80;

function matchesQuery(p: Product, q: string | undefined) {
  if (!q?.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    p.title.toLowerCase().includes(s) ||
    p.sub.toLowerCase().includes(s) ||
    (p.badge?.toLowerCase().includes(s) ?? false)
  );
}

export function ProductListScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createProductListStyles(colors, isDark), [colors, isDark]);
  const cat = route.params?.category ?? 'Vitamins';
  const query = route.params?.query;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(PRICE_SLIDER_MAX);
  const [fPure, setFPure] = useState(false);
  const [fBestseller, setFBestseller] = useState(false);

  const filteredProducts = useMemo(() => {
    const tagOn = fPure || fBestseller;
    const capActive = maxPrice < PRICE_SLIDER_MAX;

    return products.filter((p) => {
      if (!matchesQuery(p, query)) return false;
      if (capActive && p.priceValue > maxPrice) return false;
      if (tagOn) {
        const okPure = fPure && p.badge === 'Pure Grade';
        const okBest = fBestseller && p.badge === 'Bestseller';
        if (!okPure && !okBest) return false;
      }
      return true;
    });
  }, [query, maxPrice, fPure, fBestseller]);

  const activeFilterCount =
    (maxPrice < PRICE_SLIDER_MAX ? 1 : 0) + (fPure ? 1 : 0) + (fBestseller ? 1 : 0);

  const clearFilters = () => {
    setMaxPrice(PRICE_SLIDER_MAX);
    setFPure(false);
    setFBestseller(false);
  };

  const bumpPrice = (delta: number) => {
    setMaxPrice((v) => {
      const n = Math.round(v + delta);
      return Math.min(PRICE_SLIDER_MAX, Math.max(PRICE_SLIDER_MIN, n));
    });
  };

  const FilterCheck = ({
    checked,
    onToggle,
    label,
  }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <Pressable
      onPress={onToggle}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={22}
        color={checked ? colors.primary : colors.outline}
      />
      <Text style={[styles.checkLabel, checked && styles.checkLabelOn]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title="The Clinical Atelier"
        onBack={() => navigation.goBack()}
        right={
          <View style={styles.headerRight}>
            <Pressable
              hitSlop={8}
              onPress={() => navigation.navigate('Main', { screen: 'Search' })}
            >
              <MaterialCommunityIcons name="magnify" size={22} color={colors.primary} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => navigation.navigate('Main', { screen: 'Cart' })}>
              <MaterialCommunityIcons name="cart-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 24 }}>
        <Text style={styles.kicker}>
          Premium Supplements · {cat}
          {query ? ` · “${query}”` : ''}
        </Text>
        <Text style={styles.heroTitle}>{cat === 'All' ? 'Catalog' : cat}</Text>
        <Text style={styles.heroSub}>
          {query
            ? `Results and picks aligned with “${query}”.`
            : 'Scientifically formulated micronutrients designed to bridge nutritional gaps and optimize your biological sanctuary.'}
        </Text>

        <View style={styles.tools}>
          <Pressable
            style={[styles.tool, styles.toolWide, filtersOpen && styles.toolActive]}
            onPress={() => setFiltersOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: filtersOpen }}
            accessibilityLabel={filtersOpen ? 'Hide filters' : 'Show filters'}
          >
            <MaterialCommunityIcons name="swap-vertical" size={18} color={colors.onSurface} />
            <Text style={styles.toolTxt}>Sort</Text>
            {activeFilterCount > 0 ? (
              <View style={styles.toolBadge}>
                <Text style={styles.toolBadgeTxt}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {filtersOpen ? (
          <View style={styles.filterPanel}>
            <View style={styles.filterPanelHead}>
              <Text style={styles.filterPanelTitle}>Filters</Text>
              {activeFilterCount > 0 ? (
                <Pressable onPress={clearFilters} hitSlop={8}>
                  <Text style={styles.filterClear}>Clear all</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.filterGroupLabel}>Max price</Text>
            <Text style={styles.priceHint}>Drag the slider or use − / + to set a ceiling; products at or below this price stay visible.</Text>
            <View style={styles.priceCounter}>
              <Pressable
                style={[styles.counterBtn, maxPrice <= PRICE_SLIDER_MIN && styles.counterBtnDisabled]}
                onPress={() => bumpPrice(-1)}
                disabled={maxPrice <= PRICE_SLIDER_MIN}
                accessibilityRole="button"
                accessibilityLabel="Decrease max price by one dollar"
              >
                <MaterialCommunityIcons name="minus" size={22} color={colors.onSurface} />
              </Pressable>
              <View style={styles.counterValue}>
                <Text style={styles.counterValueMain}>${Math.round(maxPrice)}</Text>
                <Text style={styles.counterValueSub}>
                  {maxPrice < PRICE_SLIDER_MAX ? 'ceiling' : 'no limit'}
                </Text>
              </View>
              <Pressable
                style={[styles.counterBtn, maxPrice >= PRICE_SLIDER_MAX && styles.counterBtnDisabled]}
                onPress={() => bumpPrice(1)}
                disabled={maxPrice >= PRICE_SLIDER_MAX}
                accessibilityRole="button"
                accessibilityLabel="Increase max price by one dollar"
              >
                <MaterialCommunityIcons name="plus" size={22} color={colors.onSurface} />
              </Pressable>
            </View>
            <Slider
              style={styles.priceSlider}
              minimumValue={PRICE_SLIDER_MIN}
              maximumValue={PRICE_SLIDER_MAX}
              step={1}
              value={maxPrice}
              onValueChange={setMaxPrice}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.outlineVariant}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderEnds}>
              <Text style={styles.sliderEndTxt}>${PRICE_SLIDER_MIN}</Text>
              <Text style={styles.sliderEndTxt}>${PRICE_SLIDER_MAX}</Text>
            </View>
            <Text style={[styles.filterGroupLabel, styles.filterGroupLabelSpaced]}>Highlights</Text>
            <FilterCheck checked={fPure} onToggle={() => setFPure((v) => !v)} label="Pure Grade" />
            <FilterCheck checked={fBestseller} onToggle={() => setFBestseller((v) => !v)} label="Bestseller" />
          </View>
        ) : null}

        <View style={styles.grid}>
          {filteredProducts.map((p) => (
            <View key={p.title} style={styles.card}>
              <View style={styles.imgWrap}>
                <Image source={{ uri: p.image }} style={styles.pimg} contentFit="cover" />
                {p.badge ? (
                  <View style={[styles.badge, p.tertiary && styles.badgeTer]}>
                    <Text style={[styles.badgeTxt, p.tertiary && { color: colors.tertiary }]}>{p.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.brand}>Vitalis Lab</Text>
              <Text style={styles.pname}>{p.title}</Text>
              <Text style={styles.psub} numberOfLines={2}>
                {p.sub}
              </Text>
              <View style={styles.cardFoot}>
                <Text style={styles.price}>{p.price}</Text>
                <Pressable
                  onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
                >
                  <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.add}>
                    <MaterialCommunityIcons name="cart-plus" size={18} color={colors.onPrimaryContainer} />
                    <Text style={styles.addTxt}>Add</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.showing}>
          Showing {filteredProducts.length} of {products.length} products
        </Text>
        <View style={styles.progress}>
          <View style={styles.progressFill} />
        </View>
        <Pressable style={styles.loadMore} onPress={() => navigation.navigate('Main', { screen: 'Search' })}>
          <Text style={styles.loadTxt}>Load More</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function createProductListStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    headerRight: { flexDirection: 'row', gap: 12 },
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      color: c.primary,
      marginTop: 8,
      textTransform: 'uppercase',
    },
    heroTitle: { fontSize: 40, fontWeight: '900', color: c.onSurface, marginTop: 6 },
    heroSub: { color: c.onSurfaceVariant, marginTop: 10, lineHeight: 22, maxWidth: 360 },
    tools: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 12 },
    tool: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.surfaceContainerHigh,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
    },
    toolWide: { flexGrow: 1 },
    toolActive: {
      borderWidth: 1,
      borderColor: c.primary,
      backgroundColor: c.tabPillActive,
    },
    toolTxt: { fontWeight: '700', color: c.onSurface, fontSize: 13 },
    toolBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    toolBadgeTxt: { color: c.onPrimary, fontSize: 10, fontWeight: '800' },
    filterPanel: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    filterPanelHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    filterPanelTitle: { fontSize: 16, fontWeight: '800', color: c.onSurface },
    filterClear: { fontSize: 13, fontWeight: '700', color: c.primary },
    filterGroupLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      color: c.primary,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    filterGroupLabelSpaced: { marginTop: 8 },
    priceHint: {
      fontSize: 12,
      color: c.onSurfaceVariant,
      lineHeight: 17,
      marginBottom: 12,
    },
    priceCounter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 8,
    },
    counterBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterBtnDisabled: { opacity: 0.35 },
    counterValue: { alignItems: 'center', minWidth: 100 },
    counterValueMain: { fontSize: 28, fontWeight: '900', color: c.onSurface },
    counterValueSub: { fontSize: 11, fontWeight: '600', color: c.onSurfaceVariant, marginTop: 2 },
    priceSlider: { width: '100%', height: 44, marginTop: 4 },
    sliderEnds: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 0,
      marginBottom: 4,
    },
    sliderEndTxt: { fontSize: 11, color: c.outline, fontWeight: '600' },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingRight: 8,
    },
    checkLabel: { fontSize: 15, color: c.onSurface },
    checkLabelOn: { fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
    card: {
      width: '47%',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 8,
    },
    imgWrap: { aspectRatio: 4 / 5, backgroundColor: c.surfaceContainerHigh },
    pimg: { width: '100%', height: '100%' },
    badge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeTer: { backgroundColor: `${c.tertiary}40` },
    badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    brand: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 2,
      color: c.primary,
      marginTop: 12,
      marginHorizontal: 14,
    },
    pname: { fontSize: 16, fontWeight: '900', color: c.onSurface, marginHorizontal: 14, marginTop: 4 },
    psub: { fontSize: 12, color: c.onSurfaceVariant, marginHorizontal: 14, marginTop: 6, minHeight: 32 },
    cardFoot: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    price: { fontSize: 17, fontWeight: '900', color: c.onSurface },
    add: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addTxt: { color: c.onPrimaryContainer, fontWeight: '900', fontSize: 12 },
    showing: { textAlign: 'center', color: c.onSurfaceVariant, marginTop: 24 },
    progress: {
      height: 4,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 4,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: { width: '16.6%', height: '100%', backgroundColor: c.primary },
    loadMore: {
      alignSelf: 'center',
      marginTop: 20,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    loadTxt: { fontWeight: '800', color: c.onSurface },
  });
}
