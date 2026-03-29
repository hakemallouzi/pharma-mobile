import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../assets/images';
import { useLocale } from '../context/LocaleContext';
import { ScreenScroll, SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

const categories = [
  { icon: 'pill' as const, label: 'Medicines' },
  { icon: 'pill-multiple' as const, label: 'Vitamins' },
  { icon: 'baby-bottle-outline' as const, label: 'Baby Care' },
  { icon: 'cup-water' as const, label: 'Personal' },
  { icon: 'stethoscope' as const, label: 'Medical' },
];

/** Gap between trending product cards + target peek of the third card (scroll affordance). */
const TREND_GAP = 16;
const TREND_PEEK = 52;

export function HomeEnScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const { t } = useLocale();
  const nav = useAppNavigation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createHomeEnStyles(colors, isDark), [colors, isDark]);

  const trendingCardW = Math.max(
    132,
    Math.floor((winW - SCREEN_CONTENT_GUTTER - TREND_PEEK - TREND_GAP * 2) / 2)
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.deliverLabel}>{t.deliverTo}</Text>
          <Pressable style={styles.deliverRow} onPress={() => nav.navigate('Addresses')}>
            <Text style={styles.deliverValue}>Home</Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconCircle} onPress={() => Alert.alert('Notifications', 'No new alerts.')}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurface} />
          </Pressable>
          <Pressable style={styles.iconCirclePrimary} onPress={() => nav.navigate('Main', { screen: 'Profile' })}>
            <MaterialCommunityIcons name="account" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScreenScroll bottomInset={88}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t.categories}</Text>
          <Pressable onPress={() => nav.navigate('ProductList', { category: 'All' })}>
            <Text style={styles.link}>{t.seeAll}</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.hScroll, styles.hScrollBleed]}
          contentContainerStyle={styles.hScrollBleedContent}
        >
          {categories.map((item) => (
            <Pressable
              key={item.label}
              style={styles.catItem}
              onPress={() => nav.navigate('ProductList', { category: item.label })}
            >
              <View style={styles.catIcon}>
                <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.catLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <LinearGradient
          colors={[colors.primaryContainer, colors.surfaceContainerLow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promo}
        >
          <View style={styles.promoText}>
            <Text style={styles.promoBadge}>{t.promotion}</Text>
            <Text style={styles.promoTitle}>Full Body Health Checkup</Text>
            <Text style={styles.promoSub}>Professional diagnostic tests at home with 20% discount.</Text>
            <Pressable style={styles.promoBtn} onPress={() => nav.navigate('Main', { screen: 'Cart' })}>
              <Text style={styles.promoBtnText}>{t.bookNow}</Text>
            </Pressable>
          </View>
          <Image source={{ uri: images.homeEnBanner }} style={styles.promoImg} contentFit="cover" />
        </LinearGradient>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t.nearbyPharmacies}</Text>
          <Pressable onPress={() => nav.navigate('PharmacyList')} hitSlop={8}>
            <MaterialCommunityIcons name="map-outline" size={22} color={colors.outline} />
          </Pressable>
        </View>
        <NearbyCard
          styles={styles}
          colors={colors}
          title="The Health Atelier"
          rating="4.8"
          dist="1.2 km"
          image={images.nearby1}
          onPress={() => nav.navigate('PharmacyList')}
        />
        <NearbyCard
          styles={styles}
          colors={colors}
          title="Evergreen Care"
          rating="4.6"
          dist="2.5 km"
          image={images.nearby2}
          onPress={() => nav.navigate('PharmacyList')}
        />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t.trendingHealth}</Text>
          <Pressable onPress={() => nav.navigate('ProductList', { category: 'All' })}>
            <Text style={styles.link}>{t.viewAll}</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingHScroll}
          contentContainerStyle={styles.trendingHScrollContent}
        >
          <ProductCard
            styles={styles}
            colors={colors}
            cardWidth={trendingCardW}
            title="Vitamin C 1000mg"
            category="Vitamins"
            price="$24.00"
            image={images.product1}
            onPress={() => nav.navigate('ProductList', { category: 'Vitamins' })}
            onAddToCart={() => nav.navigate('Main', { screen: 'Cart' })}
          />
          <ProductCard
            styles={styles}
            colors={colors}
            cardWidth={trendingCardW}
            title="Hyaluronic Gel"
            category="Skin Care"
            price="$32.50"
            image={images.product2}
            onPress={() => nav.navigate('ProductList', { category: 'Skincare' })}
            onAddToCart={() => nav.navigate('Main', { screen: 'Cart' })}
          />
          <ProductCard
            styles={styles}
            colors={colors}
            cardWidth={trendingCardW}
            title="KN95 Protective"
            category="Protection"
            price="$15.99"
            image={images.product3}
            onPress={() => nav.navigate('ProductList', { category: 'Medicines' })}
            onAddToCart={() => nav.navigate('Main', { screen: 'Cart' })}
          />
        </ScrollView>
      </ScreenScroll>
    </View>
  );
}

function NearbyCard({
  styles,
  colors,
  title,
  rating,
  dist,
  image,
  onPress,
}: {
  styles: ReturnType<typeof createHomeEnStyles>;
  colors: ThemeColors;
  title: string;
  rating: string;
  dist: string;
  image: string;
  onPress?: () => void;
}) {
  const { t } = useLocale();
  return (
    <Pressable style={styles.nearby} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.nearbyImg} contentFit="cover" />
      <View style={styles.nearbyBody}>
        <View style={styles.nearbyTop}>
          <Text style={styles.nearbyTitle}>{title}</Text>
          <Text style={styles.openBadge}>{t.open}</Text>
        </View>
        <View style={styles.nearbyMeta}>
          <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
          <Text style={styles.metaText}>{rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{dist}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ProductCard({
  styles,
  colors,
  cardWidth,
  title,
  category,
  price,
  image,
  onPress,
  onAddToCart,
}: {
  styles: ReturnType<typeof createHomeEnStyles>;
  colors: ThemeColors;
  cardWidth?: number;
  title: string;
  category: string;
  price: string;
  image: string;
  onPress?: () => void;
  onAddToCart?: () => void;
}) {
  return (
    <Pressable style={[styles.product, cardWidth != null && { width: cardWidth }]} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.productImg} contentFit="cover" />
      <Text style={styles.productTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.productCat}>{category}</Text>
      <View style={styles.productRow}>
        <Text style={styles.price}>{price}</Text>
        <Pressable style={styles.addBtn} onPress={() => onAddToCart?.()}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function createHomeEnStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingBottom: 12,
      backgroundColor: c.headerBar,
    },
    deliverLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2,
      color: c.primary,
      opacity: 0.7,
      textTransform: 'uppercase',
    },
    deliverRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deliverValue: { fontSize: 18, fontWeight: '700', color: c.onSurface },
    headerActions: { flexDirection: 'row', gap: 12 },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCirclePrimary: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.tabPillActive,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: c.onSurface },
    link: { fontSize: 14, fontWeight: '600', color: c.primary },
    hScroll: { marginBottom: 24 },
    hScrollBleed: { marginHorizontal: -SCREEN_CONTENT_GUTTER },
    hScrollBleedContent: {
      paddingLeft: SCREEN_CONTENT_GUTTER,
      paddingRight: SCREEN_CONTENT_GUTTER,
    },
    trendingHScroll: { marginBottom: 24, marginHorizontal: -SCREEN_CONTENT_GUTTER },
    trendingHScrollContent: {
      paddingLeft: SCREEN_CONTENT_GUTTER,
      paddingRight: SCREEN_CONTENT_GUTTER,
    },
    catItem: { alignItems: 'center', marginRight: 16, width: 72 },
    catIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catLabel: {
      marginTop: 8,
      fontSize: 11,
      fontWeight: '600',
      color: c.onSurfaceVariant,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    promo: {
      borderRadius: 24,
      padding: 24,
      minHeight: 200,
      marginBottom: 28,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
    },
    promoText: { flex: 1, zIndex: 2, maxWidth: '68%' },
    promoBadge: {
      alignSelf: 'flex-start',
      backgroundColor: c.onPrimaryContainer,
      color: c.primaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      overflow: 'hidden',
    },
    promoTitle: {
      marginTop: 8,
      fontSize: 22,
      fontWeight: '700',
      color: c.onPrimaryContainer,
      lineHeight: 28,
    },
    promoSub: {
      marginTop: 6,
      fontSize: 13,
      color: c.onPrimaryContainer,
      opacity: 0.85,
    },
    promoBtn: {
      marginTop: 12,
      alignSelf: 'flex-start',
      backgroundColor: c.primary,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 999,
    },
    promoBtnText: { color: c.onPrimary, fontWeight: '700', fontSize: 14 },
    promoImg: {
      position: 'absolute',
      right: -16,
      bottom: -16,
      width: 140,
      height: 140,
      borderRadius: 70,
      opacity: 0.9,
    },
    nearby: {
      flexDirection: 'row',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 24,
      padding: 16,
      gap: 16,
      marginBottom: 12,
    },
    nearbyImg: { width: 80, height: 80, borderRadius: 16 },
    nearbyBody: { flex: 1, justifyContent: 'center' },
    nearbyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    nearbyTitle: { fontSize: 16, fontWeight: '700', color: c.onSurface, flex: 1 },
    openBadge: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: c.primary,
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    nearbyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    metaText: { fontSize: 12, color: c.onSurfaceVariant },
    dot: { color: c.outline, fontSize: 12 },
    product: {
      width: 176,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 32,
      padding: 16,
      marginRight: 16,
    },
    productImg: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 16,
      marginBottom: 12,
      backgroundColor: c.surfaceContainerHigh,
    },
    productTitle: { fontSize: 14, fontWeight: '700', color: c.onSurface },
    productCat: {
      fontSize: 10,
      fontWeight: '700',
      color: c.outline,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 4,
      marginBottom: 12,
    },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 16, fontWeight: '700', color: c.primary },
    addBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
