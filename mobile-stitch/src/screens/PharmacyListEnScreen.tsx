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
import { useAppNavigation } from '../navigation/useAppNavigation';
import { SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import { images } from '../assets/images';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

const chips = ['nearest', 'topRated', 'openNow', 'filter'] as const;

export function PharmacyListEnScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const rootNav = useAppNavigation();
  const { t, isRTL } = useLocale();
  const { colors } = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const styles = useMemo(() => createPharmacyListEnStyles(colors), [colors]);
  const [activeChip, setActiveChip] = useState<(typeof chips)[number]>('nearest');
  const heroHeight = Math.round(winH * 0.62);
  const heroZoom = useRef(new Animated.Value(1)).current;

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

  return (
    <View style={styles.root}>
      <ScrollView
        style={[styles.mainScroll, { direction: isRTL ? 'rtl' : 'ltr' }]}
        contentContainerStyle={[
          styles.mainScrollContent,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
      >
        <View style={[styles.hero, { width: winW, height: heroHeight }]}>
          <Animated.View style={[styles.heroImageZoom, { transform: [{ scale: heroZoom }] }]}>
            <Image
              source={{ uri: images.heroPharmacyEn }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          </Animated.View>
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.82)']}
            locations={[0.25, 1]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={styles.heroTextOverlay} pointerEvents="box-none">
            <Text style={styles.heroLine1}>
              {t.expertCare}
              {'\n'}
              <Text style={styles.heroAccent}>{t.deliveredToYou}</Text>
            </Text>
            <Text style={styles.heroSub}>{t.heroSub}</Text>
          </View>
        </View>

        <View style={styles.bodySection}>
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

          <PharmacyCard
          styles={styles}
          colors={colors}
          name="The Green Atelier"
          rating="4.9"
          reviews="1.2k"
          distance="0.8 miles"
          delivery="15-20 mins"
          image={images.card1}
          icon="medical-bag"
          open
          primaryButton
        />
        <PharmacyCard
          styles={styles}
          colors={colors}
          name="Curated Care Ph."
          rating="4.7"
          reviews="850"
          distance="1.4 miles"
          delivery="25-35 mins"
          image={images.card2}
          icon="shield-check"
          open
          primaryButton={false}
        />
        <PharmacyCard
          styles={styles}
          colors={colors}
          name="Midnight Apothecary"
          rating="4.5"
          reviews="420"
          distance="2.1 miles"
          opensAt="9:00 PM"
          image={images.card3}
          icon="weather-night"
          open={false}
          primaryButton={false}
        />
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
}) {
  const { t } = useLocale();
  return (
    <View style={[styles.card, !open && styles.cardMuted]}>
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
    </View>
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
