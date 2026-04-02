import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { ClinicalHeader } from '../components/ClinicalHeader';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

type Product = {
  category: string;
  title: string;
  titleAr: string;
  sub: string;
  subAr: string;
  price: string;
  priceValue: number;
  /** Optional dose/pack variants (e.g. 200gm, 500gm). */
  doses?: Array<{
    label: string;
    price?: string;
    priceValue?: number;
  }>;
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

const CATEGORY_MOCK_TITLES_AR = {
  Medicines: [
    'باراسيتامول راحة سريعة',
    'إيبوبروفين بلس',
    'تركيبة البرد الليلية',
    'أقراص راحة الجيوب',
    'شراب تهدئة السعال',
    'كبسولات حماية الحساسية',
    'راحة الهضم',
    'مضاد الحموضة الفوري',
    'باقة الدفاع ضد الإنفلونزا',
    'مضاد حموضة سريع الذوبان',
    'كبسولات جل لتسكين الألم',
    'مستحلبات التهاب الحلق',
    'رذاذ الأنف المريح',
    'مزيج ترطيب الأملاح',
    'أقراص دوار السفر',
  ],
  Vitamins: [
    'فيتامين د3 ليبوسومال',
    'أوميغا 3 سوبر',
    'مركب فيتامين ب ميثيل',
    'زنك مخلبي',
    'فيتامين سي 1000',
    'مغنيسيوم جلايسينات',
    'حديد لطيف الإطلاق',
    'كالسيوم + ك2',
    'بيوتين بوست',
    'ملتي فيتامين يومي للنساء',
    'ملتي فيتامين يومي للرجال',
    'خليط دعم المناعة',
    'كوإنزيم كيو10 المتقدم',
    'بروبيوتك 20 مليار',
    'معادن إلكتروليت',
  ],
  'Baby Care': [
    'قطرات فيتامين للرضع',
    'بروبيوتك للرضع',
    'كريم طفح لطيف',
    'جل تهدئة التسنين',
    'شراب مناعة للأطفال',
    'غسول للبشرة الحساسة',
    'قطرات مغص مهدئة',
    'ملتي فيتامين قابل للمضغ',
    'رذاذ ملحي للأنف',
    'مرهم حاجز مرطب',
    'مزيج إلكتروليت للأطفال',
    'لوشن نوم مهدئ',
    'كريم حفاضات لطيف',
    'حلوى أوميغا للأطفال',
    'لوشن ترطيب الطفل',
  ],
  Skincare: [
    'سيروم إصلاح الترطيب',
    'حماية يومية SPF 50',
    'معزز نياسيناميد',
    'رغوة تنظيف لطيفة',
    'كريم تجديد ليلي',
    'جل تفتيح فيتامين سي',
    'مرطب هيالورونيك',
    'بلسم إصلاح الحاجز',
    'تونر منقي',
    'رذاذ تعافي الألوفيرا',
    'كريم عين بالببتيد',
    'مزيج ريتينول ليلي',
    'جل تصحيح البقع',
    'إيسنس تهدئة البشرة',
    'كريم ترطيب بالسيراميد',
  ],
} as const;

const products: Product[] = (Object.entries(CATEGORY_MOCK_TITLES) as Array<[string, readonly string[]]>).flatMap(
  ([category, titles], categoryIndex) =>
    titles.map((title, itemIndex) => {
      const titleAr = CATEGORY_MOCK_TITLES_AR[category as keyof typeof CATEGORY_MOCK_TITLES_AR][itemIndex] ?? title;
      const priceValue = 26 + ((itemIndex * 7 + categoryIndex * 5) % 55);
      const dose200PriceValue = priceValue;
      const dose500PriceValue = Math.round(dose200PriceValue * 1.8 * 100) / 100;
      const badge =
        itemIndex % 6 === 0 ? 'Pure Grade' : itemIndex % 5 === 0 ? 'Bestseller' : undefined;
      const categoryAr =
        category === 'Medicines'
          ? 'الأدوية'
          : category === 'Vitamins'
            ? 'الفيتامينات'
            : category === 'Baby Care'
              ? 'العناية بالطفل'
              : category === 'Skincare'
                ? 'العناية بالبشرة'
                : category;
      return {
        category,
        title,
        titleAr,
        sub: `${category} support formula designed for reliable daily care and wellness.`,
        subAr: `تركيبة داعمة من ${categoryAr} مصممة للعناية اليومية الموثوقة وتعزيز الصحة.`,
        // For now, all medicines have dose/pack options.
        // We treat `price` as the default dose (200gm).
        price: `$${dose200PriceValue.toFixed(2)}`,
        priceValue: dose200PriceValue,
        doses:
          category === 'Medicines'
            ? [
                { label: '200gm', price: `$${dose200PriceValue.toFixed(2)}`, priceValue: dose200PriceValue },
                { label: '500gm', price: `$${dose500PriceValue.toFixed(2)}`, priceValue: dose500PriceValue },
              ]
            : undefined,
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
  const { locale, isRTL } = useLocale();
  const isArabic = locale === 'ar';
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createProductListStyles(colors, isDark), [colors, isDark]);
  const cat = route.params?.category ?? 'Vitamins';
  const query = route.params?.query;
  const [searchText, setSearchText] = useState(query ?? '');
  const [selectedCategory, setSelectedCategory] = useState(cat);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(PRICE_SLIDER_MAX);
  const [fPure, setFPure] = useState(false);
  const [fBestseller, setFBestseller] = useState(false);
  const [draftMaxPrice, setDraftMaxPrice] = useState(PRICE_SLIDER_MAX);
  const [draftFPure, setDraftFPure] = useState(false);
  const [draftFBestseller, setDraftFBestseller] = useState(false);
  const { addItem, removeItem, lines } = useCart();
  const categoryLabel = (value: string) => {
    if (!isArabic) return value;
    if (value === 'All') return 'الكل';
    if (value === 'Medicines') return 'الأدوية';
    if (value === 'Vitamins') return 'الفيتامينات';
    if (value === 'Baby Care') return 'العناية بالطفل';
    if (value === 'Skincare') return 'العناية بالبشرة';
    return value;
  };
  const badgeLabel = (value?: string) => {
    if (!value || !isArabic) return value;
    if (value === 'Pure Grade') return 'درجة نقاء';
    if (value === 'Bestseller') return 'الأكثر مبيعا';
    return value;
  };

  const filteredProducts = useMemo(() => {
    const tagOn = fPure || fBestseller;
    const capActive = maxPrice < PRICE_SLIDER_MAX;

    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (!matchesQuery(p, searchText)) return false;
      if (capActive && p.priceValue > maxPrice) return false;
      if (tagOn) {
        const okPure = fPure && p.badge === 'Pure Grade';
        const okBest = fBestseller && p.badge === 'Bestseller';
        if (!okPure && !okBest) return false;
      }
      return true;
    });
  }, [selectedCategory, searchText, maxPrice, fPure, fBestseller]);
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
      style={[styles.checkRow, isRTL && styles.rowReverse]}
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

  const getCartIdsForProduct = (p: Product) => {
    const baseId = `${p.category}-${p.title}`;
    if (p.doses?.length) return p.doses.map((d) => `${baseId}-${d.label}`);
    return [baseId];
  };

  const isItemInCart = (p: Product) => {
    const cartIds = getCartIdsForProduct(p);
    return lines.some((l) => cartIds.includes(l.id));
  };

  return (
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <ClinicalHeader
        title={locale === 'ar' ? 'المنتجات' : 'Products'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 24 }}>
        <Text style={[styles.kicker, isRTL && styles.textRight]}>
          {isArabic ? 'مكملات مميزة' : 'Premium Supplements'} · {categoryLabel(selectedCategory)}
          {searchText ? ` · “${searchText}”` : ''}
        </Text>
        <Text style={[styles.heroTitle, isRTL && styles.textRight]}>
          {selectedCategory === 'All' ? (isArabic ? 'الكتالوج' : 'Catalog') : categoryLabel(selectedCategory)}
        </Text>
        <Text style={[styles.heroSub, isRTL && styles.textRight]}>
          {searchText
            ? isArabic
              ? `نتائج واقتراحات مطابقة لـ “${searchText}”.`
              : `Results and picks aligned with “${searchText}”.`
            : isArabic
              ? 'تركيبات مدروسة علميا لدعم الاحتياجات الغذائية اليومية.'
              : 'Scientifically formulated micronutrients designed to bridge nutritional gaps and optimize your biological sanctuary.'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categorySliderBleed}
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
                <Text style={[styles.categoryChipTxt, active && styles.categoryChipTxtActive]}>{categoryLabel(item)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={[styles.searchBar, isRTL && styles.rowReverse]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.outline} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.textRight]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={isArabic ? 'ابحث عن منتج' : 'Search products'}
            placeholderTextColor={colors.outline}
          />
          <Pressable
            style={[styles.searchSortBtn, filtersOpen && styles.toolActive]}
            onPress={() => (filtersOpen ? setFiltersOpen(false) : openFilters())}
            accessibilityRole="button"
            accessibilityState={{ expanded: filtersOpen }}
            accessibilityLabel={filtersOpen ? (isArabic ? 'إخفاء الفلاتر' : 'Hide filters') : isArabic ? 'إظهار الفلاتر' : 'Show filters'}
          >
            <MaterialCommunityIcons name="swap-vertical" size={16} color={colors.onSurface} />
            <Text style={styles.toolTxt}>{isArabic ? 'فرز' : 'Sort'}</Text>
            {activeFilterCount > 0 ? (
              <View style={styles.toolBadge}>
                <Text style={styles.toolBadgeTxt}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {filtersOpen ? (
          <View style={styles.filterPanel}>
            <View style={[styles.filterPanelHead, isRTL && styles.rowReverse]}>
              <Text style={styles.filterPanelTitle}>{isArabic ? 'الفلاتر' : 'Filters'}</Text>
              {activeDraftFilterCount > 0 ? (
                <Pressable onPress={clearDraftFilters} hitSlop={8}>
                  <Text style={styles.filterClear}>{isArabic ? 'مسح الكل' : 'Clear all'}</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.filterGroupLabel}>{isArabic ? 'السعر' : 'price'}</Text>
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
                  {draftMaxPrice < PRICE_SLIDER_MAX
                    ? isArabic
                      ? 'حد أقصى'
                      : 'ceiling'
                    : isArabic
                      ? 'بدون حد'
                      : 'no limit'}
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
            <View style={[styles.sliderEnds, isRTL && styles.rowReverse]}>
              <Text style={styles.sliderEndTxt}>${PRICE_SLIDER_MIN}</Text>
              <Text style={styles.sliderEndTxt}>${PRICE_SLIDER_MAX}</Text>
            </View>
            <Text style={[styles.filterGroupLabel, styles.filterGroupLabelSpaced]}>{isArabic ? 'خيارات إضافية' : 'Highlights'}</Text>
            <FilterCheck checked={draftFPure} onToggle={() => setDraftFPure((v) => !v)} label={isArabic ? 'درجة نقاء' : 'Pure Grade'} />
            <FilterCheck
              checked={draftFBestseller}
              onToggle={() => setDraftFBestseller((v) => !v)}
              label={isArabic ? 'الأكثر مبيعا' : 'Bestseller'}
            />
            <Pressable style={styles.filterDoneBtn} onPress={applyFilters}>
              <Text style={styles.filterDoneTxt}>{isArabic ? 'تم' : 'Done'}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.grid}>
          {filteredProducts.map((p) => {
            const itemTitle = isArabic ? p.titleAr : p.title;
            const shareMessage =
              locale === 'ar'
                ? `مرحبًا، لدي سؤال عن "${itemTitle}" ؟`
                : `Hi, I have a question about "${itemTitle}" ?`;

            return (
            <Pressable
              key={p.title}
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { item: p })}
            >
              <View style={styles.imgWrap}>
                <Image source={{ uri: p.image }} style={styles.pimg} contentFit="cover" />
                <Pressable
                  hitSlop={8}
                  style={styles.cardShareBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('SpecialistChat', {
                      topic: 'general',
                      initialMessage: shareMessage,
                      initialImageUri: p.image,
                    });
                  }}
                >
                  <MaterialCommunityIcons name="share-variant" size={18} color={colors.primary} />
                </Pressable>
                {p.badge ? (
                  <View style={[styles.badge, isRTL && styles.badgeRtl, p.tertiary && styles.badgeTer]}>
                    <Text style={[styles.badgeTxt, p.tertiary && { color: colors.tertiary }]}>{badgeLabel(p.badge)}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.brand, isRTL && styles.textRight]}>{isArabic ? 'مختبر فيتاليس' : 'Vitalis Lab'}</Text>
                <Text style={[styles.pname, isRTL && styles.textRight]} numberOfLines={2}>
                  {isArabic ? p.titleAr : p.title}
                </Text>
                <Text style={[styles.psub, isRTL && styles.textRight]} numberOfLines={2}>
                  {isArabic ? p.subAr : p.sub}
                </Text>
                <View style={[styles.cardFoot, isRTL && styles.rowReverse]}>
                  <Text style={[styles.price, isRTL && styles.textRight]}>{p.price}</Text>
                  {(() => {
                    const added = isItemInCart(p);
                    const baseId = `${p.category}-${p.title}`;
                    const hasMultipleDoses = (p.doses?.length ?? 0) > 1;
                    const cartIds = getCartIdsForProduct(p);
                    const defaultDose = p.doses?.[0];
                    const defaultCartId = defaultDose ? `${baseId}-${defaultDose.label}` : baseId;
                    return (
                      <View style={[styles.actionRow, isRTL && styles.rowReverse]}>
                        {added ? (
                          <View style={[styles.addedStack, isRTL && styles.alignStart]}>
                            <Pressable
                              style={styles.removeBtn}
                              onPress={(e) => {
                                e.stopPropagation();
                                // If multiple doses exist, remove all variants of this product.
                                cartIds.forEach((id) => removeItem(id));
                              }}
                            >
                              <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.onSurface} />
                            </Pressable>
                            <View style={styles.addedPill}>
                              <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.primary} />
                              <Text style={styles.addedPillTxt}>{isArabic ? 'تمت إضافته' : 'Added'}</Text>
                            </View>
                          </View>
                        ) : (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              // For multi-dose items, force the user to pick the dose inside item details.
                              if (hasMultipleDoses) {
                                navigation.navigate('ProductDetail', { item: p });
                                return;
                              }
                              addItem({
                                id: defaultCartId,
                                title: defaultDose
                                  ? `${isArabic ? p.titleAr : p.title} ${defaultDose.label}`
                                  : isArabic
                                    ? p.titleAr
                                    : p.title,
                                sub: isArabic ? p.subAr : p.sub,
                                price: (defaultDose?.priceValue ?? p.priceValue).toFixed(2),
                                image: p.image,
                              });
                            }}
                          >
                            <LinearGradient
                              colors={[colors.primary, colors.primaryContainer]}
                              style={[styles.add, isRTL && styles.rowReverse]}
                            >
                              <MaterialCommunityIcons name="cart-plus" size={18} color={colors.onPrimaryContainer} />
                              <Text style={styles.addTxt}>{isArabic ? 'إضافة' : 'Add'}</Text>
                            </LinearGradient>
                          </Pressable>
                        )}
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Pressable>
            );
          })}
        </View>

        <Text style={styles.showing}>
          {isArabic
            ? `عرض ${filteredProducts.length} من أصل ${products.length} منتج`
            : `Showing ${filteredProducts.length} of ${products.length} products`}
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
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
    alignStart: { alignItems: 'flex-start' },
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
    categorySliderBleed: { marginHorizontal: -24 },
    categorySlider: { paddingVertical: 16, gap: 10, paddingHorizontal: 24 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 2,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      color: c.onSurface,
      fontSize: 14,
      fontWeight: '600',
      paddingVertical: 0,
    },
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
    searchSortBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.surfaceContainerHigh,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 10,
      flexShrink: 0,
    },
    toolActive: {
      borderWidth: 1,
      borderColor: c.primary,
      backgroundColor: c.tabPillActive,
    },
    toolTxt: { fontWeight: '700', color: c.onSurface, fontSize: 12 },
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
    imgWrap: { aspectRatio: 4 / 5, backgroundColor: c.surfaceContainerHigh, position: 'relative' },
    pimg: { width: '100%', height: '100%' },
    cardBody: {
      flex: 1,
      paddingBottom: 14,
    },
    badge: {
      position: 'absolute',
      top: 10,
      left: 44,
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeRtl: {
      left: undefined,
      right: 10,
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
    cardShareBtn: {
      position: 'absolute',
      top: 10,
      left: 10,
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      zIndex: 2,
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
