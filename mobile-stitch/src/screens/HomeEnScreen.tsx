import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../assets/images';
import { imagesB2 } from '../assets/imagesBatch2';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { ScreenScroll, SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const APP_LOGO = require('../assets/logo.png');

const categories = [
  { icon: 'view-grid-plus-outline' as const, label: 'All Categories', category: 'All', greenBg: true },
  { icon: 'pill' as const, label: 'Medicines' },
  { icon: 'pill-multiple' as const, label: 'Vitamins' },
  { icon: 'baby-bottle-outline' as const, label: 'Baby Care' },
  { icon: 'face-woman-outline' as const, label: 'Skincare' },
  { icon: 'cup-water' as const, label: 'Hydration' },
  { icon: 'stethoscope' as const, label: 'Medical Devices' },
  { icon: 'heart-pulse' as const, label: 'Heart Health' },
  { icon: 'brain' as const, label: 'Mental Wellness' },
  { icon: 'bone' as const, label: 'Bones & Joints' },
  { icon: 'bandage' as const, label: 'First Aid' },
  { icon: 'spray-bottle' as const, label: 'Personal Care' },
];

const PROMOTIONS = [
  {
    title: 'Full Body Health Checkup',
    sub: 'Professional diagnostic tests at home with 20% discount.',
    button: 'Book Now',
    image: images.homeEnBanner,
  },
  {
    title: 'Vitamin Essentials Bundle',
    sub: 'Daily core vitamins with free same-day delivery for limited time.',
    button: 'Shop Bundle',
    image: images.product1,
  },
  {
    title: 'Skin & Wellness Care Week',
    sub: 'Top skincare and wellness picks with exclusive member pricing.',
    button: 'Explore Deals',
    image: images.product2,
  },
];

const ORDER_ROUTE = [
  { latitude: 44.0542, longitude: -123.035 },
  { latitude: 44.051, longitude: -123.029 },
  { latitude: 44.048, longitude: -123.025 },
  { latitude: 44.0462, longitude: -123.022 },
] as const;

type OrderStatus = 'Placed' | 'Preparing' | 'On the Way' | 'Delivered';

export function HomeEnScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const { t, locale, setLocale } = useLocale();
  const nav = useAppNavigation();
  const { profileImageUri } = useAuth();
  const { colors, isDark, toggleScheme } = useTheme();
  const styles = useMemo(() => createHomeEnStyles(colors, isDark), [colors, isDark]);
  // Demo: show order tracking map when an outstanding order exists.
  const hasOutstandingOrder = true;
  const [activeOrderStatus] = useState<OrderStatus>('Preparing');
  const [showAllCategories, setShowAllCategories] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const promoRef = useRef<ScrollView>(null);
  const [promoViewportWidth, setPromoViewportWidth] = useState(0);
  const promoCardWidth = promoViewportWidth || Math.max(280, winW - SCREEN_CONTENT_GUTTER);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (hasOutstandingOrder) return;
    const id = setInterval(() => {
      setPromoIndex((prev) => {
        const next = (prev + 1) % PROMOTIONS.length;
        if (promoCardWidth > 0) {
          promoRef.current?.scrollTo({ x: next * promoCardWidth, animated: true });
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [promoCardWidth, hasOutstandingOrder]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLead}>
          <Pressable onPress={() => nav.navigate('Main', { screen: 'Home' })} hitSlop={8} style={styles.logoBtn}>
            <Image source={APP_LOGO} style={[styles.logo, locale === 'en' ? styles.logoEn : styles.logoAr]} contentFit="contain" />
          </Pressable>
          <Pressable onPress={() => nav.navigate('Main', { screen: 'Profile' })} hitSlop={8}>
            <Image source={{ uri: profileImageUri ?? images.homeEnAvatar }} style={styles.avatar} contentFit="cover" />
          </Pressable>
          <View>
            <Text style={styles.deliverLabel}>{t.deliverTo}</Text>
            <Pressable style={styles.deliverRow} onPress={() => nav.navigate('Addresses')}>
              <Text style={styles.deliverValue}>Home</Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
            </Pressable>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconCircle}
            onPress={() =>
              Alert.alert(
                t.profileNotifications,
                locale === 'ar' ? 'لا توجد إشعارات جديدة.' : 'No new alerts.'
              )
            }
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurface} />
          </Pressable>
          <Pressable onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')} style={styles.langSwitch} hitSlop={8}>
            <Text style={styles.langTxt}>{locale === 'en' ? 'AR' : 'EN'}</Text>
          </Pressable>
          <Pressable onPress={toggleScheme} style={styles.themeBtn} hitSlop={8}>
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={18}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>

      <ScreenScroll bottomInset={88}>
        {hasOutstandingOrder ? (
          <OrderTrackerOnHome
            styles={styles}
            colors={colors}
            locale={locale}
            status={activeOrderStatus}
            onOpen={() => nav.navigate('OrderDetail', { orderId: 'VT-88291' })}
          />
        ) : (
          <View
            style={styles.promoCarousel}
            onLayout={(e) => setPromoViewportWidth(Math.round(e.nativeEvent.layout.width))}
          >
            <ScrollView
              ref={promoRef}
              style={styles.promoPager}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                if (promoCardWidth <= 0) return;
                const next = Math.round(e.nativeEvent.contentOffset.x / promoCardWidth);
                setPromoIndex(Math.max(0, Math.min(PROMOTIONS.length - 1, next)));
              }}
            >
              {PROMOTIONS.map((p) => (
                <LinearGradient
                  key={p.title}
                  colors={[colors.primaryContainer, colors.surfaceContainerLow]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.promo, { width: promoCardWidth }]}
                >
                  <View style={styles.promoText}>
                    <Text style={styles.promoBadge}>{t.promotion}</Text>
                    <Text style={styles.promoTitle}>{p.title}</Text>
                    <Text style={styles.promoSub}>{p.sub}</Text>
                    <Pressable style={styles.promoBtn} onPress={() => nav.navigate('Main', { screen: 'Cart' })}>
                      <Text style={styles.promoBtnText}>{p.button}</Text>
                    </Pressable>
                  </View>
                  <Image source={{ uri: p.image }} style={styles.promoImg} contentFit="cover" />
                </LinearGradient>
              ))}
            </ScrollView>
            <View style={styles.promoDots}>
              {PROMOTIONS.map((_, i) => (
                <View key={i} style={[styles.promoDot, i === promoIndex && styles.promoDotActive]} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t.categories}</Text>
          <Pressable onPress={() => setShowAllCategories((v) => !v)}>
            <View style={styles.linkRow}>
              <Text style={styles.link}>{showAllCategories ? 'Show Less' : t.seeAll}</Text>
              <MaterialCommunityIcons
                name={showAllCategories ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </View>
        {showAllCategories ? (
          <View style={styles.catGrid}>
            {categories.map((item) => (
              <Pressable
                key={item.label}
                style={styles.catGridItem}
                onPress={() => nav.navigate('ProductList', { category: item.category ?? item.label })}
              >
                <View style={[styles.catIcon, item.greenBg && { backgroundColor: `${colors.secondary}30` }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
                </View>
                <Text style={styles.catLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
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
                onPress={() => nav.navigate('ProductList', { category: item.category ?? item.label })}
              >
                <View style={[styles.catIcon, item.greenBg && { backgroundColor: `${colors.secondary}30` }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
                </View>
                <Text style={styles.catLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

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
          onPress={() =>
            nav.navigate('PharmacyList', {
              focusMap: true,
              pharmacyName: 'The Health Atelier',
              pharmacyInfo: 'Open now · 4.8 rating · 15-20 mins delivery',
              latitude: 24.7136,
              longitude: 46.6753,
            })
          }
        />
        <NearbyCard
          styles={styles}
          colors={colors}
          title="Evergreen Care"
          rating="4.6"
          dist="2.5 km"
          image={images.nearby2}
          onPress={() =>
            nav.navigate('PharmacyList', {
              focusMap: true,
              pharmacyName: 'Evergreen Care',
              pharmacyInfo: 'Open now · 4.6 rating · 25-35 mins delivery',
              latitude: 24.7308,
              longitude: 46.6505,
            })
          }
        />

      </ScreenScroll>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.drawerBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={[styles.drawerSheet, { paddingTop: insets.top + 10 }]}>
          <View style={styles.drawerHead}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <Pressable hitSlop={8} onPress={() => setMenuOpen(false)}>
              <MaterialCommunityIcons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContent}>
            <Text style={styles.drawerSection}>{t.profileSectionClinical}</Text>
            <MenuItem label={t.profilePrescriptions} onPress={() => { setMenuOpen(false); nav.navigate('ProductList', { category: 'Medicines' }); }} />
            <MenuItem label={t.profileLabResults} onPress={() => { setMenuOpen(false); nav.navigate('OrderDetail', { orderId: 'LAB-RESULTS' }); }} />
            <MenuItem label={t.profileCareReminders} onPress={() => { setMenuOpen(false); nav.navigate('Main', { screen: 'Home' }); }} />

            <Text style={styles.drawerSection}>{t.profileSectionOrders}</Text>
            <MenuItem label={t.profileOrders} onPress={() => { setMenuOpen(false); nav.navigate('OrdersHistory'); }} />
            <MenuItem label={t.profileCart} onPress={() => { setMenuOpen(false); nav.navigate('Main', { screen: 'Cart' }); }} />
            <MenuItem label={t.profileAddresses} onPress={() => { setMenuOpen(false); nav.navigate('Addresses'); }} />
            <MenuItem
              label={t.profileUpdatePaymentMethod}
              onPress={() => { setMenuOpen(false); nav.navigate('Checkout', { openVisaModal: true, visaModalStep: 'form' }); }}
            />
            <MenuItem label={t.profilePharmacies} onPress={() => { setMenuOpen(false); nav.navigate('PharmacyList'); }} />

            <Text style={styles.drawerSection}>{t.profileSectionSupport}</Text>
            <MenuItem label={t.profileNotifications} onPress={() => { setMenuOpen(false); Alert.alert(t.profileNotifications, 'Notification preferences would be managed here.'); }} />
            <MenuItem
              label={t.profileHelp}
              onPress={() => {
                setMenuOpen(false);
                const SUPPORT_PHONE_TEL = 'tel:+18005550199';
                const SUPPORT_EMAIL_MAILTO = 'mailto:support@vitalis.health';
                Alert.alert(
                  t.profileHelp,
                  'Choose a contact method',
                  [
                    { text: 'Call support', onPress: () => Linking.openURL(SUPPORT_PHONE_TEL).catch(() => {}) },
                    { text: 'Email support', onPress: () => Linking.openURL(SUPPORT_EMAIL_MAILTO).catch(() => {}) },
                    { text: 'Cancel', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }}
            />
            <MenuItem label={t.profilePrivacy} onPress={() => { setMenuOpen(false); Linking.openURL('https://vitalis.health/privacy').catch(() => {}); }} />
            <MenuItem label={t.profileTerms} onPress={() => { setMenuOpen(false); Linking.openURL('https://vitalis.health/terms').catch(() => {}); }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[stylesMenu.row, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]} onPress={onPress}>
      <Text style={[stylesMenu.txt, { color: colors.onSurface }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.chevronMuted} />
    </Pressable>
  );
}

const stylesMenu = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  txt: { fontSize: 15, fontWeight: '600' },
});

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

function OrderTrackerOnHome({
  styles,
  colors,
  locale,
  status,
  onOpen,
}: {
  styles: ReturnType<typeof createHomeEnStyles>;
  colors: ThemeColors;
  locale: string;
  status: OrderStatus;
  onOpen: () => void;
}) {
  const useGoogleMaps =
    Platform.OS === 'android' || (Platform.OS === 'ios' && Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY));
  const mapProvider = useGoogleMaps ? PROVIDER_GOOGLE : undefined;
  const useNativeMap = Platform.OS !== 'web';

  const statusTxt =
    locale === 'ar'
      ? status === 'Placed'
        ? 'تم الاستلام'
        : status === 'Preparing'
          ? 'قيد التحضير'
          : status === 'On the Way'
            ? 'في الطريق'
            : 'تم التسليم'
      : status;

  const start = ORDER_ROUTE[0];
  const end = ORDER_ROUTE[ORDER_ROUTE.length - 1];
  const mid = {
    latitude: (start.latitude + end.latitude) / 2,
    longitude: (start.longitude + end.longitude) / 2,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <Pressable style={styles.orderTrackerWrap} onPress={onOpen} accessibilityRole="button">
      {useNativeMap ? (
        <MapView
          style={styles.orderMap}
          initialRegion={mid}
          provider={mapProvider}
          scrollEnabled
          zoomEnabled
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
          showsUserLocation={false}
          showsCompass={false}
        >
          <Polyline coordinates={[...ORDER_ROUTE]} strokeColor={colors.primary} strokeWidth={4} />
          <Marker coordinate={end} title="Delivery" tracksViewChanges={false}>
            <View style={[styles.orderMarker, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.primary }]}>
              <MaterialCommunityIcons name="home-map-marker" size={18} color={colors.primary} />
            </View>
          </Marker>
        </MapView>
      ) : (
        <Image source={{ uri: imagesB2.orderMap }} style={styles.orderMap} contentFit="cover" />
      )}

      <Text style={styles.orderTrackingLabel}>{locale === 'ar' ? 'يتم تتبع الطلب' : 'Tracking order'}</Text>
      <View style={styles.orderStatusRow}>
        <View style={styles.orderStatusPill}>
          <Text style={styles.orderStatusTxt}>{statusTxt}</Text>
        </View>
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
    headerLead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    logo: { width: 64, height: 100 },
    logoAr: { transform: [{ rotate: '-15deg' }] },
    logoEn: { transform: [{ scaleX: -1 }, { rotate: '-15deg' }] },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant,
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
    langSwitch: {
      minWidth: 44,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      padding: 2,
    },
    langTxt: { fontSize: 11, fontWeight: '800', color: c.primary, letterSpacing: 0.4 },
    themeBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.34)' },
    drawerSheet: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: '84%',
      maxWidth: 360,
      backgroundColor: c.surface,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: c.outlineVariant,
      paddingHorizontal: 16,
    },
    drawerHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outlineVariant,
    },
    drawerTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    drawerContent: { paddingVertical: 10, gap: 6, paddingBottom: 42 },
    drawerSection: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.3,
      color: c.mutedIcon,
      textTransform: 'uppercase',
    },
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: c.onSurface },
    link: { fontSize: 14, fontWeight: '600', color: c.primary },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    hScroll: { marginBottom: 24 },
    hScrollBleed: { marginHorizontal: -SCREEN_CONTENT_GUTTER },
    hScrollBleedContent: {
      paddingLeft: SCREEN_CONTENT_GUTTER,
      paddingRight: SCREEN_CONTENT_GUTTER,
    },
    catItem: { alignItems: 'center', marginRight: 16, width: 72 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    catGridItem: { alignItems: 'center', width: '22%' },
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
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
    },
    promoCarousel: { marginBottom: 28, overflow: 'hidden' },
    promoPager: { width: '100%' },
    promoDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
    promoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.outlineVariant,
    },
    promoDotActive: {
      width: 16,
      backgroundColor: c.primary,
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
    orderTrackerWrap: {
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: 'transparent',
      marginBottom: 28,
      borderWidth: 1,
      borderColor: c.primary,
      position: 'relative',
    },
    orderMap: { width: '100%', height: 200 },
    orderMarker: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orderStatusRow: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 14,
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    },
    orderStatusPill: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(0,0,0,0.28)',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.primary,
    },
    orderTrackingLabel: {
      position: 'absolute',
      top: 14,
      left: 16,
      backgroundColor: 'rgba(0,0,0,0.28)',
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'left',
    },
    orderStatusTxt: { fontSize: 12, fontWeight: '900', color: '#fff' },
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
  });
}
