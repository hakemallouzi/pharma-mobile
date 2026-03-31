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
import { useCart } from '../context/CartContext';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

type Product = {
  category: string;
  title: string;
  sub: string;
  price: string;
  priceValue: number;
  badge?: string;
  tertiary?: boolean;
  image: string;
};

const PRODUCT_IMAGES = [imagesB2.product1, imagesB2.product2, imagesB2.product3, imagesB2.product4];

const CATEGORY_MOCK_TITLES = {
  Medicines: [
    'Rapid Relief Paracetamol',
    'Ibuprofen Plus',
    'Nighttime Cold Formula',
    'Sinus Comfort Tablets',
    'Cough Calm Syrup',
    'Allergy Shield Capsules',
    'Digestive Ease',
    'Heartburn Neutralizer',
    'Flu Defense Pack',
    'Antacid Quick Melt',
    'Pain Relief Gel Caps',
    'Sore Throat Lozenges',
    'Nasal Mist Relief',
    'Hydration Electro Mix',
    'Travel Sickness Tabs',
  ],
  Vitamins: [
    'Liposomal Vitamin D3',
    'Omega-3 Superior',
    'Methyl B-Complex',
    'Chelated Zinc',
    'Vitamin C 1000',
    'Magnesium Glycinate',
    'Iron Gentle Release',
    'Calcium + K2',
    'Biotin Boost',
    'Women Daily Multi',
    'Men Daily Multi',
    'Immune Support Blend',
    'CoQ10 Advanced',
    'Probiotic 20B',
    'Electrolyte Minerals',
  ],
  'Baby Care': [
    'Baby Vitamin Drops',
    'Infant Probiotic',
    'Gentle Rash Cream',
    'Soothing Teething Gel',
    'Baby Immune Syrup',
    'Sensitive Skin Wash',
    'Comfort Colic Drops',
    'Kids Chewable Multi',
    'Nasal Saline Mist',
    'Moisture Barrier Balm',
    'Baby Electrolyte Mix',
    'Calming Sleep Lotion',
    'Tender Diaper Cream',
    'Kids Omega Gummies',
    'Hydra Baby Lotion',
  ],
  Skincare: [
    'Hydra Repair Serum',
    'Daily SPF 50 Shield',
    'Niacinamide Booster',
    'Gentle Clean Foam',
    'Overnight Renewal Cream',
    'Vitamin C Bright Gel',
    'Hyaluronic Hydrator',
    'Barrier Restore Balm',
    'Clarifying Toner',
    'Aloe Recovery Mist',
    'Peptide Eye Cream',
    'Retinol Night Blend',
    'Spot Correct Gel',
    'Calm Skin Essence',
    'Ceramide Moisture Cream',
  ],
} as const;

const products: Product[] = (Object.entries(CATEGORY_MOCK_TITLES) as Array<[string, readonly string[]]>).flatMap(
  ([category, titles], categoryIndex) =>
    titles.map((title, itemIndex) => {
      const priceValue = 26 + ((itemIndex * 7 + categoryIndex * 5) % 55);
      const badge =
        itemIndex % 6 === 0 ? 'Pure Grade' : itemIndex % 5 === 0 ? 'Bestseller' : undefined;
      return {
        category,
        title,
        sub: `${category} support formula designed for reliable daily care and wellness.`,
        price: `$${priceValue.toFixed(2)}`,
        priceValue,
        badge,
        tertiary: badge === 'Bestseller',
        image: PRODUCT_IMAGES[itemIndex % PRODUCT_IMAGES.length],
      };
    })
);

const CATEGORY_OPTIONS = ['All', 'Medicines', 'Vitamins', 'Baby Care', 'Skincare'];

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
  const [selectedCategory, setSelectedCategory] = useState(cat);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(PRICE_SLIDER_MAX);
  const [fPure, setFPure] = useState(false);
  const [fBestseller, setFBestseller] = useState(false);
  const [draftMaxPrice, setDraftMaxPrice] = useState(PRICE_SLIDER_MAX);
  const [draftFPure, setDraftFPure] = useState(false);
  const [draftFBestseller, setDraftFBestseller] = useState(false);
  const { addItem, removeItem, cartCount, lines } = useCart();

  const filteredProducts = useMemo(() => {
    const tagOn = fPure || fBestseller;
    const capActive = maxPrice < PRICE_SLIDER_MAX;

    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (!matchesQuery(p, query)) return false;
      if (capActive && p.priceValue > maxPrice) return false;
      if (tagOn) {
        const okPure = fPure && p.badge === 'Pure Grade';
        const okBest = fBestseller && p.badge === 'Bestseller';
        if (!okPure && !okBest) return false;
      }
      return true;
    });
  }, [selectedCategory, query, maxPrice, fPure, fBestseller]);
  const progressPercent = products.length
    ? Math.max(0, Math.min(100, (filteredProducts.length / products.length) * 100))
    : 0;

  const activeFilterCount =
    (maxPrice < PRICE_SLIDER_MAX ? 1 : 0) + (fPure ? 1 : 0) + (fBestseller ? 1 : 0);

  const activeDraftFilterCount =
    (draftMaxPrice < PRICE_SLIDER_MAX ? 1 : 0) + (draftFPure ? 1 : 0) + (draftFBestseller ? 1 : 0);

  const openFilters = () => {
    setDraftMaxPrice(maxPrice);
    setDraftFPure(fPure);
    setDraftFBestseller(fBestseller);
    setFiltersOpen(true);
  };

  const clearDraftFilters = () => {
    setDraftMaxPrice(PRICE_SLIDER_MAX);
    setDraftFPure(false);
    setDraftFBestseller(false);
  };

  const applyFilters = () => {
    setMaxPrice(draftMaxPrice);
    setFPure(draftFPure);
    setFBestseller(draftFBestseller);
    setFiltersOpen(false);
  };

  const bumpPrice = (delta: number) => {
    setDraftMaxPrice((v) => {
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

  const isItemInCart = (p: Product) => lines.some((l) => l.id === `${p.category}-${p.title}`);

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
            <Pressable style={styles.cartIconWrap} hitSlop={8} onPress={() => navigation.navigate('Main', { screen: 'Cart' })}>
              <MaterialCommunityIcons name="cart-outline" size={22} color={colors.primary} />
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeTxt}>{cartCount > 99 ? '99+' : String(cartCount)}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 24 }}>
        <Text style={styles.kicker}>
          Premium Supplements · {selectedCategory}
          {query ? ` · “${query}”` : ''}
        </Text>
        <Text style={styles.heroTitle}>{selectedCategory === 'All' ? 'Catalog' : selectedCategory}</Text>
        <Text style={styles.heroSub}>
          {query
            ? `Results and picks aligned with “${query}”.`
            : 'Scientifically formulated micronutrients designed to bridge nutritional gaps and optimize your biological sanctuary.'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySlider}
        >
          {CATEGORY_OPTIONS.map((item) => {
            const active = item === selectedCategory;
            return (
              <Pressable
                key={item}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryChipTxt, active && styles.categoryChipTxtActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.tools}>
          <Pressable
            style={[styles.tool, styles.toolWide, filtersOpen && styles.toolActive]}
            onPress={() => (filtersOpen ? setFiltersOpen(false) : openFilters())}
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
              {activeDraftFilterCount > 0 ? (
                <Pressable onPress={clearDraftFilters} hitSlop={8}>
                  <Text style={styles.filterClear}>Clear all</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.filterGroupLabel}>price</Text>
            <View style={styles.priceCounter}>
              {/* <Pressable
                style={[styles.counterBtn, maxPrice <= PRICE_SLIDER_MIN && styles.counterBtnDisabled]}
                onPress={() => bumpPrice(-1)}
                disabled={maxPrice <= PRICE_SLIDER_MIN}
                accessibilityRole="button"
                accessibilityLabel="Decrease max price by one dollar"
              >
                <MaterialCommunityIcons name="minus" size={22} color={colors.onSurface} />
              </Pressable> */}
              <View style={styles.counterValue}>
                <Text style={styles.counterValueMain}>${Math.round(draftMaxPrice)}</Text>
                <Text style={styles.counterValueSub}>
                  {draftMaxPrice < PRICE_SLIDER_MAX ? 'ceiling' : 'no limit'}
                </Text>
              </View>
              {/* <Pressable
                style={[styles.counterBtn, maxPrice >= PRICE_SLIDER_MAX && styles.counterBtnDisabled]}
                onPress={() => bumpPrice(1)}
                disabled={maxPrice >= PRICE_SLIDER_MAX}
                accessibilityRole="button"
                accessibilityLabel="Increase max price by one dollar"
              >
                <MaterialCommunityIcons name="plus" size={22} color={colors.onSurface} />
              </Pressable> */}
            </View>
            <Slider
              style={styles.priceSlider}
              minimumValue={PRICE_SLIDER_MIN}
              maximumValue={PRICE_SLIDER_MAX}
              step={1}
              value={draftMaxPrice}
              onValueChange={setDraftMaxPrice}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.outlineVariant}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderEnds}>
              <Text style={styles.sliderEndTxt}>${PRICE_SLIDER_MIN}</Text>
              <Text style={styles.sliderEndTxt}>${PRICE_SLIDER_MAX}</Text>
            </View>
            <Text style={[styles.filterGroupLabel, styles.filterGroupLabelSpaced]}>Highlights</Text>
            <FilterCheck checked={draftFPure} onToggle={() => setDraftFPure((v) => !v)} label="Pure Grade" />
            <FilterCheck
              checked={draftFBestseller}
              onToggle={() => setDraftFBestseller((v) => !v)}
              label="Bestseller"
            />
            <Pressable style={styles.filterDoneBtn} onPress={applyFilters}>
              <Text style={styles.filterDoneTxt}>Done</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.grid}>
          {filteredProducts.map((p) => (
            <Pressable
              key={p.title}
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { item: p })}
            >
              <View style={styles.imgWrap}>
                <Image source={{ uri: p.image }} style={styles.pimg} contentFit="cover" />
                {p.badge ? (
                  <View style={[styles.badge, p.tertiary && styles.badgeTer]}>
                    <Text style={[styles.badgeTxt, p.tertiary && { color: colors.tertiary }]}>{p.badge}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.brand}>Vitalis Lab</Text>
                <Text style={styles.pname} numberOfLines={2}>
                  {p.title}
                </Text>
                <Text style={styles.psub} numberOfLines={2}>
                  {p.sub}
                </Text>
                <View style={styles.cardFoot}>
                  <Text style={styles.price}>{p.price}</Text>
                  {(() => {
                    const added = isItemInCart(p);
                    const itemId = `${p.category}-${p.title}`;
                    return (
                      <View style={styles.actionRow}>
                        {added ? (
                          <View style={styles.addedStack}>
                            <Pressable
                              style={styles.removeBtn}
                              onPress={(e) => {
                                e.stopPropagation();
                                removeItem(itemId);
                              }}
                            >
                              <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.onSurface} />
                            </Pressable>
                            <View style={styles.addedPill}>
                              <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.primary} />
                              <Text style={styles.addedPillTxt}>Added</Text>
                            </View>
                          </View>
                        ) : (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              addItem({
                                id: itemId,
                                title: p.title,
                                sub: p.sub,
                                price: p.priceValue.toFixed(2),
                                image: p.image,
                              });
                            }}
                          >
                            <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.add}>
                              <MaterialCommunityIcons name="cart-plus" size={18} color={colors.onPrimaryContainer} />
                              <Text style={styles.addTxt}>Add</Text>
                            </LinearGradient>
                          </Pressable>
                        )}
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.showing}>
          Showing {filteredProducts.length} of {products.length} products
        </Text>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </ScrollView>
    </View>
  );
}

function createProductListStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    headerRight: { flexDirection: 'row', gap: 12 },
    cartIconWrap: {
      position: 'relative',
    },
    cartBadge: {
      position: 'absolute',
      right: -8,
      top: -8,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      backgroundColor: c.primary,
      borderWidth: 1,
      borderColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadgeTxt: {
      fontSize: 9,
      fontWeight: '900',
      color: c.onPrimary,
      lineHeight: 11,
    },
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
    categorySlider: { paddingVertical: 16, gap: 10 },
    categoryChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    categoryChipActive: {
      backgroundColor: c.tabPillActive,
      borderColor: c.primary,
    },
    categoryChipTxt: { fontSize: 12, fontWeight: '700', color: c.onSurfaceVariant },
    categoryChipTxtActive: { color: c.primary },
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
    filterDoneBtn: {
      marginTop: 14,
      alignSelf: 'flex-end',
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    filterDoneTxt: { color: c.onPrimary, fontWeight: '800', fontSize: 13 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
    card: {
      width: '47%',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 8,
      minHeight: 320,
    },
    imgWrap: { aspectRatio: 4 / 5, backgroundColor: c.surfaceContainerHigh },
    pimg: { width: '100%', height: '100%' },
    cardBody: {
      flex: 1,
      paddingBottom: 14,
    },
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
    pname: { fontSize: 16, fontWeight: '900', color: c.onSurface, marginHorizontal: 14, marginTop: 4, minHeight: 40 },
    psub: { fontSize: 12, color: c.onSurfaceVariant, marginHorizontal: 14, marginTop: 6, minHeight: 36 },
    cardFoot: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: 14,
      marginTop: 'auto',
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
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
    addedStack: { alignItems: 'flex-end', gap: 4 },
    addedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: `${c.secondary}2B`,
      borderWidth: 1,
      borderColor: c.secondary,
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },
    addedPillTxt: { color: c.secondary, fontWeight: '800', fontSize: 10 },
    removeBtn: {
      width: 24,
      height: 24,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    showing: { textAlign: 'center', color: c.onSurfaceVariant, marginTop: 24 },
    progress: {
      height: 4,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 4,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: c.primary },
  });
}
