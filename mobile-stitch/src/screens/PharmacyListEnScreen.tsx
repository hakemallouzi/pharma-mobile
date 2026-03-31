import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useAppNavigation } from '../navigation/useAppNavigation';
import { SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import { images } from '../assets/images';
import { useLocale } from '../context/LocaleContext';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

const chips = ['nearest', 'topRated', 'openNow', 'filter'] as const;
type PharmacySpot = {
  name: string;
  info: string;
  latitude: number;
  longitude: number;
  rating: string;
  reviews: string;
  distance: string;
  delivery?: string;
  opensAt?: string;
  image: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  open: boolean;
  primaryButton: boolean;
  address: string;
  hours: string;
  services: string;
  contact: string;
  distanceMiles: number;
  ratingValue: number;
  reviewsCount: number;
};

const PHARMACIES: PharmacySpot[] = [
  {
    name: 'The Green Atelier',
    info: 'Open now · 4.9 rating · 15-20 mins delivery',
    latitude: 24.7136,
    longitude: 46.6753,
    rating: '4.9',
    reviews: '1.2k',
    distance: '0.8 miles',
    delivery: '15-20 mins',
    image: images.card1,
    icon: 'medical-bag',
    open: true,
    primaryButton: true,
    address: 'Olaya District, Riyadh',
    hours: 'Open daily · 8:00 AM - 1:00 AM',
    services: 'Prescription refill · Consultations',
    contact: '+966 11 000 0001',
    distanceMiles: 0.8,
    ratingValue: 4.9,
    reviewsCount: 1200,
  },
  {
    name: 'Curated Care Ph.',
    info: 'Open now · 4.7 rating · 25-35 mins delivery',
    latitude: 24.7308,
    longitude: 46.6505,
    rating: '4.7',
    reviews: '850',
    distance: '1.4 miles',
    delivery: '25-35 mins',
    image: images.card2,
    icon: 'shield-check',
    open: true,
    primaryButton: false,
    address: 'King Fahd Rd, Riyadh',
    hours: 'Open daily · 9:00 AM - 12:00 AM',
    services: 'Vaccination · Consultation room',
    contact: '+966 11 000 0002',
    distanceMiles: 1.4,
    ratingValue: 4.7,
    reviewsCount: 850,
  },
  {
    name: 'Midnight Apothecary',
    info: 'Closed now · Opens at 9:00 PM',
    latitude: 24.7415,
    longitude: 46.7042,
    rating: '4.5',
    reviews: '420',
    distance: '2.1 miles',
    opensAt: '9:00 PM',
    image: images.card3,
    icon: 'weather-night',
    open: false,
    primaryButton: false,
    address: 'Prince Turki Rd, Riyadh',
    hours: 'Open daily · 10:00 AM - 1:00 AM',
    services: 'Night care · Urgent refill',
    contact: '+966 11 000 0003',
    distanceMiles: 2.1,
    ratingValue: 4.5,
    reviewsCount: 420,
  },
  {
    name: 'Wellness Point Rx',
    info: 'Open now · 4.8 rating · 18-25 mins delivery',
    latitude: 24.702,
    longitude: 46.692,
    rating: '4.8',
    reviews: '970',
    distance: '1.1 miles',
    delivery: '18-25 mins',
    image: images.card1,
    icon: 'pill',
    open: true,
    primaryButton: false,
    address: 'Tahlia St, Riyadh',
    hours: 'Open daily · 8:00 AM - 12:00 AM',
    services: 'OTC care · Blood pressure check',
    contact: '+966 11 000 0004',
    distanceMiles: 1.1,
    ratingValue: 4.8,
    reviewsCount: 970,
  },
  {
    name: 'Family Health Drugstore',
    info: 'Open now · 4.6 rating · 20-30 mins delivery',
    latitude: 24.688,
    longitude: 46.667,
    rating: '4.6',
    reviews: '640',
    distance: '1.8 miles',
    delivery: '20-30 mins',
    image: images.card2,
    icon: 'account-group',
    open: true,
    primaryButton: false,
    address: 'Al Malaz, Riyadh',
    hours: 'Open daily · 9:00 AM - 11:30 PM',
    services: 'Family meds · Child prescriptions',
    contact: '+966 11 000 0005',
    distanceMiles: 1.8,
    ratingValue: 4.6,
    reviewsCount: 640,
  },
  {
    name: 'Prime Care 24/7',
    info: 'Open now · 4.7 rating · 12-20 mins delivery',
    latitude: 24.724,
    longitude: 46.718,
    rating: '4.7',
    reviews: '1.6k',
    distance: '2.6 miles',
    delivery: '12-20 mins',
    image: images.card3,
    icon: 'clock-check-outline',
    open: true,
    primaryButton: false,
    address: 'Al Nakheel, Riyadh',
    hours: 'Open 24 hours',
    services: 'Urgent refill · 24/7 support',
    contact: '+966 11 000 0006',
    distanceMiles: 2.6,
    ratingValue: 4.7,
    reviewsCount: 1600,
  },
  {
    name: 'Sunrise Clinical Pharmacy',
    info: 'Closed now · Opens at 8:30 AM',
    latitude: 24.671,
    longitude: 46.642,
    rating: '4.4',
    reviews: '310',
    distance: '3.2 miles',
    opensAt: '8:30 AM',
    image: images.card1,
    icon: 'white-balance-sunny',
    open: false,
    primaryButton: false,
    address: 'As Sulimaniyah, Riyadh',
    hours: 'Open daily · 8:30 AM - 11:00 PM',
    services: 'Compounding · Insurance claims',
    contact: '+966 11 000 0007',
    distanceMiles: 3.2,
    ratingValue: 4.4,
    reviewsCount: 310,
  },
  {
    name: 'City MedExpress',
    info: 'Open now · 4.5 rating · 10-18 mins delivery',
    latitude: 24.736,
    longitude: 46.678,
    rating: '4.5',
    reviews: '740',
    distance: '0.9 miles',
    delivery: '10-18 mins',
    image: images.card2,
    icon: 'truck-fast-outline',
    open: true,
    primaryButton: false,
    address: 'Al Murabba, Riyadh',
    hours: 'Open daily · 8:00 AM - 12:30 AM',
    services: 'Fast delivery · Chronic care packs',
    contact: '+966 11 000 0008',
    distanceMiles: 0.9,
    ratingValue: 4.5,
    reviewsCount: 740,
  },
];
const MAP_STYLE_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#101412' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b7c5b5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#101412' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1b221f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b3430' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2723' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#112329' }] },
];

const MAP_STYLE_LIGHT = [
  { elementType: 'geometry', stylers: [{ color: '#eef3ee' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3b4a43' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#d7e0d8' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#c6d3c8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e0e9e1' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cde2e4' }] },
];

export function PharmacyListEnScreen({
  mapParams,
}: {
  mapParams?: RootStackParamList['PharmacyList'];
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const rootNav = useAppNavigation();
  const { t, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const styles = useMemo(() => createPharmacyListEnStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);
  const [activeChip, setActiveChip] = useState<(typeof chips)[number]>('nearest');
  const heroHeight = Math.round(winH * 0.62);
  const heroZoom = useRef(new Animated.Value(1)).current;
  const showMapHero =
    !!mapParams?.focusMap &&
    typeof mapParams?.latitude === 'number' &&
    typeof mapParams?.longitude === 'number';
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacySpot | null>(
    showMapHero
      ? {
          name: mapParams?.pharmacyName ?? 'Nearby Pharmacy',
          info: mapParams?.pharmacyInfo ?? 'Tap to open pharmacy details',
          latitude: mapParams?.latitude as number,
          longitude: mapParams?.longitude as number,
          rating: '4.8',
          reviews: '1.0k',
          distance: '1.0 miles',
          delivery: '15-30 mins',
          image: images.card1,
          icon: 'medical-bag',
          open: true,
          primaryButton: true,
          address: 'Olaya District, Riyadh',
          hours: 'Open daily · 8:00 AM - 1:00 AM',
          services: 'Prescription refill · Consultations',
          contact: '+966 11 000 0000',
          distanceMiles: 1.0,
          ratingValue: 4.8,
          reviewsCount: 1000,
        }
      : null
  );
  const currentPharmacy = selectedPharmacy;
  const mapRegion = currentPharmacy
    ? {
        latitude: currentPharmacy.latitude,
        longitude: currentPharmacy.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : undefined;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroZoom, { toValue: 1.07, duration: 14000, useNativeDriver: true }),
        Animated.timing(heroZoom, { toValue: 1, duration: 14000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [heroZoom]);

  const chipLabel = (k: (typeof chips)[number]) => {
    switch (k) {
      case 'nearest':
        return t.nearest;
      case 'topRated':
        return t.topRated;
      case 'openNow':
        return t.openNow;
      case 'filter':
        return t.filter;
    }
  };

  const chipIcon = (k: (typeof chips)[number]) => {
    switch (k) {
      case 'nearest':
        return 'crosshairs-gps';
      case 'topRated':
        return 'star';
      case 'openNow':
        return 'clock-outline';
      case 'filter':
        return 'tune-variant';
    }
  };

  const filteredPharmacies = useMemo(() => {
    if (activeChip === 'openNow') {
      return PHARMACIES.filter((p) => p.open).sort((a, b) => a.distanceMiles - b.distanceMiles);
    }
    if (activeChip === 'topRated') {
      return [...PHARMACIES].sort((a, b) => {
        if (b.ratingValue !== a.ratingValue) return b.ratingValue - a.ratingValue;
        return b.reviewsCount - a.reviewsCount;
      });
    }
    // nearest and filter -> sort by nearest distance
    return [...PHARMACIES].sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [activeChip]);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={[styles.mainScroll, { direction: isRTL ? 'rtl' : 'ltr' }]}
        contentContainerStyle={[
          styles.mainScrollContent,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
      >
        <View style={[styles.hero, { width: winW, height: heroHeight }]}>
          {currentPharmacy ? (
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={mapRegion}
              customMapStyle={isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT}
              scrollEnabled
              zoomEnabled
              pitchEnabled
              rotateEnabled
            >
              <Marker
                coordinate={{
                  latitude: currentPharmacy.latitude,
                  longitude: currentPharmacy.longitude,
                }}
                title={currentPharmacy.name}
              />
            </MapView>
          ) : (
            <Animated.View style={[styles.heroImageZoom, { transform: [{ scale: heroZoom }] }]}>
              <Image
                source={{ uri: images.heroPharmacyEn }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
            </Animated.View>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.82)']}
            locations={[0.25, 1]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.heroTextOverlay} pointerEvents={currentPharmacy ? 'none' : 'box-none'}>
            <Text style={styles.heroLine1}>
              {t.expertCare}
              {'\n'}
              <Text style={styles.heroAccent}>{t.deliveredToYou}</Text>
            </Text>
            <Text style={styles.heroSub}>{t.heroSub}</Text>
            {currentPharmacy ? (
              <Text style={styles.heroMapHint}>{currentPharmacy.name}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.bodySection}>
          {currentPharmacy ? (
            <Pressable
              style={styles.mapInfoCard}
              onPress={() =>
                rootNav.navigate('PharmacyDetail', {
                  pharmacyName: currentPharmacy.name,
                  pharmacyInfo: currentPharmacy.info,
                  pharmacyImage: currentPharmacy.image,
                  address: currentPharmacy.address,
                  hours: currentPharmacy.hours,
                  delivery: currentPharmacy.delivery,
                  services: currentPharmacy.services,
                  contact: currentPharmacy.contact,
                  latitude: currentPharmacy.latitude,
                  longitude: currentPharmacy.longitude,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.mapInfoName}>{currentPharmacy.name}</Text>
                <Text style={styles.mapInfoSub}>{currentPharmacy.info}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
            </Pressable>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {chips.map((chipKey) => {
              const active = activeChip === chipKey;
              return (
                <Pressable
                  key={chipKey}
                  onPress={() => setActiveChip(chipKey)}
                  style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
                >
                  <MaterialCommunityIcons
                    name={chipIcon(chipKey) as 'star'}
                    size={18}
                    color={active ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{chipLabel(chipKey)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredPharmacies.map((p) => (
            <PharmacyCard
              key={p.name}
              styles={styles}
              colors={colors}
              name={p.name}
              rating={p.rating}
              reviews={p.reviews}
              distance={p.distance}
              delivery={p.delivery}
              opensAt={p.opensAt}
              image={p.image}
              icon={p.icon}
              open={p.open}
              primaryButton={p.primaryButton}
              onPress={() => {
                setSelectedPharmacy(p);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
              onViewDetails={() =>
                rootNav.navigate('PharmacyDetail', {
                  pharmacyName: p.name,
                  pharmacyInfo: p.info,
                  pharmacyImage: p.image,
                  address: p.address,
                  hours: p.hours,
                  delivery: p.delivery,
                  services: p.services,
                  contact: p.contact,
                  latitude: p.latitude,
                  longitude: p.longitude,
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.08)', 'transparent']}
        locations={[0, 0.55, 1]}
        pointerEvents="none"
        style={[styles.headerScrim, { height: insets.top + 64 }]}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.headerLeft}>
          <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.title}>{t.pharmaciesTitle}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable hitSlop={8} onPress={() => rootNav.navigate('Main', { screen: 'Search' })}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.primary} />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => rootNav.navigate('Main', { screen: 'Profile' })}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

    </View>
  );
}

function PharmacyCard({
  styles,
  colors,
  name,
  rating,
  reviews,
  distance,
  delivery,
  opensAt,
  image,
  icon,
  open,
  primaryButton,
  onPress,
  onViewDetails,
}: {
  styles: ReturnType<typeof createPharmacyListEnStyles>;
  colors: ThemeColors;
  name: string;
  rating: string;
  reviews: string;
  distance: string;
  delivery?: string;
  opensAt?: string;
  image: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  open: boolean;
  primaryButton: boolean;
  onPress?: () => void;
  onViewDetails?: () => void;
}) {
  const { t } = useLocale();
  return (
    <Pressable style={[styles.card, !open && styles.cardMuted]} onPress={onPress}>
      <View style={styles.badgeWrap}>
        <View style={[styles.statusBadge, open ? styles.badgeOpen : styles.badgeClosed]}>
          <Text style={[styles.badgeText, !open && styles.badgeTextClosed]}>
            {open ? t.openNow : 'Closed'}
          </Text>
        </View>
      </View>
      <View style={[styles.cardImgWrap, !open && styles.cardImgMuted]}>
        <Image source={{ uri: image }} style={styles.cardImg} contentFit="cover" />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardName}>{name}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={open ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={[styles.ratingVal, !open && { color: colors.onSurfaceVariant }]}>
                {rating}
              </Text>
              <Text style={styles.reviews}>
                ({reviews} {t.reviews})
              </Text>
            </View>
          </View>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name={icon} size={28} color={open ? colors.primary : colors.onSurfaceVariant} />
          </View>
        </View>
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>{t.distance}</Text>
            <Text style={styles.metaVal}>{distance}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>{open ? t.delivery : t.opensAt}</Text>
            <Text style={[styles.metaVal, open && { color: colors.primary }, !open && { color: colors.error }]}>
              {open ? delivery : opensAt}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          style={[
            styles.cta,
            primaryButton && styles.ctaPrimary,
            !primaryButton && open && styles.ctaOutline,
            !open && styles.ctaDisabled,
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              primaryButton && styles.ctaTextPrimary,
              !open && styles.ctaTextDisabled,
            ]}
          >
            {t.viewDetails}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={
              primaryButton
                ? colors.onPrimaryContainer
                : open
                  ? colors.primary
                  : colors.onSurfaceVariant
            }
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

function createPharmacyListEnStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },
    mainScroll: { flex: 1, backgroundColor: 'transparent' },
    mainScrollContent: {
      flexGrow: 1,
      paddingTop: 0,
      paddingHorizontal: 0,
    },
    bodySection: {
      paddingHorizontal: SCREEN_CONTENT_GUTTER,
      paddingTop: 20,
    },
    headerScrim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 8,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingBottom: 12,
      backgroundColor: 'transparent',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.primary,
      letterSpacing: -0.5,
      textShadowColor: 'rgba(0,0,0,0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    hero: {
      alignSelf: 'center',
      marginBottom: 24,
      overflow: 'hidden',
      backgroundColor: c.surfaceContainerLowest,
    },
    heroImageZoom: {
      ...StyleSheet.absoluteFillObject,
    },
    heroTextOverlay: {
      position: 'absolute',
      left: 24,
      right: 24,
      bottom: 28,
      gap: 12,
      maxWidth: 360,
    },
    heroLine1: {
      fontSize: 32,
      fontWeight: '800',
      color: '#f8faf8',
      lineHeight: 38,
      letterSpacing: -1,
      textShadowColor: 'rgba(0,0,0,0.45)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 12,
    },
    heroAccent: { color: c.primary },
    heroSub: {
      fontSize: 14,
      color: 'rgba(248,250,248,0.92)',
      maxWidth: 320,
      lineHeight: 20,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    heroMapHint: {
      alignSelf: 'flex-start',
      fontSize: 12,
      fontWeight: '700',
      color: c.onPrimaryContainer,
      backgroundColor: 'rgba(0,0,0,0.35)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    mapInfoCard: {
      marginBottom: 14,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    mapInfoName: { fontSize: 15, fontWeight: '800', color: c.onSurface },
    mapInfoSub: { marginTop: 4, fontSize: 12, color: c.onSurfaceVariant },
    chipsScroll: { marginBottom: 20, marginHorizontal: -SCREEN_CONTENT_GUTTER },
    chipsContent: { gap: 12, paddingBottom: 4, paddingHorizontal: SCREEN_CONTENT_GUTTER },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    chipOn: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
    },
    chipOff: {
      backgroundColor: c.surfaceContainerHigh,
      borderColor: c.outlineVariant,
    },
    chipText: { fontSize: 13, fontWeight: '600', color: c.onSurfaceVariant },
    chipTextOn: { color: c.onPrimaryContainer },
    card: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 32,
      marginBottom: 20,
      overflow: 'hidden',
    },
    cardMuted: { opacity: 0.85 },
    badgeWrap: { position: 'absolute', top: 16, left: 16, zIndex: 2 },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeOpen: { backgroundColor: c.primary },
    badgeClosed: { backgroundColor: c.surfaceContainerHighest },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: c.onPrimary,
    },
    badgeTextClosed: { color: c.onSurfaceVariant },
    cardImgWrap: { height: 192, overflow: 'hidden' },
    cardImgMuted: { opacity: 0.85 },
    cardImg: { width: '100%', height: '100%' },
    cardBody: { padding: 24, gap: 16 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitleBlock: { flex: 1 },
    cardName: { fontSize: 20, fontWeight: '800', color: c.onSurface },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    ratingVal: { fontSize: 13, fontWeight: '800', color: c.primary },
    reviews: { fontSize: 11, color: c.onSurfaceVariant, marginLeft: 4 },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 8,
    },
    metaLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: c.onSurfaceVariant,
    },
    metaVal: { fontSize: 13, fontWeight: '600', color: c.onSurface, marginTop: 2 },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
    },
    ctaPrimary: {
      backgroundColor: c.primaryContainer,
    },
    ctaOutline: {
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    ctaDisabled: {
      backgroundColor: c.surfaceContainerHigh,
    },
    ctaText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: c.primary },
    ctaTextPrimary: { color: c.onPrimaryContainer },
    ctaTextDisabled: { color: c.onSurfaceVariant },
  });
}
