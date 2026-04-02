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
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

const filterKeys = ['all', 'near', 'open', 'rated', '24h'] as const;

export function PharmacyListArScreen({
  mapParams: _mapParams,
}: {
  mapParams?: RootStackParamList['PharmacyList'];
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const rootNav = useAppNavigation();
  const { isRTL } = useLocale();
  const { colors } = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const styles = useMemo(() => createPharmacyListArStyles(colors), [colors]);
  const [active, setActive] = useState<(typeof filterKeys)[number]>('all');
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

  const label = (k: (typeof filterKeys)[number]) => {
    switch (k) {
      case 'all':
        return 'الكل';
      case 'near':
        return 'قريب مني';
      case 'open':
        return 'مفتوح الآن';
      case 'rated':
        return 'الأكثر تقييماً';
      case '24h':
        return 'خدمة 24 ساعة';
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={[styles.mainScroll, { direction: isRTL ? 'rtl' : 'ltr' }]}
        contentContainerStyle={[styles.mainScrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { width: winW, height: heroHeight }]}>
          <Animated.View style={[styles.heroImageZoom, { transform: [{ scale: heroZoom }] }]}>
            <Image
              source={{ uri: images.pharmacyArHero }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          </Animated.View>
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.88)']}
            locations={[0.2, 1]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={styles.heroTextOverlay} pointerEvents="box-none">
            <Text style={styles.heroBadge}>مميز</Text>
            <Text style={styles.heroTitle}>العناية المتكاملة بالأدوية</Text>
            <Text style={styles.heroSub}>
              احصل على استشارة صيدلانية فورية وتوصيل سريع في أقل من 30 دقيقة.
            </Text>
            <View style={styles.heroBottomRow}>
              <Pressable style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>اكتشف المزيد</Text>
                <MaterialCommunityIcons name="auto-fix" size={20} color={colors.onPrimaryContainer} />
              </Pressable>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>98%</Text>
                <Text style={styles.statLabel}>نسبة الرضا</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bodySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {filterKeys.map((k) => {
              const on = active === k;
              return (
                <Pressable key={k} onPress={() => setActive(k)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{label(k)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.largeCard}>
          <View style={styles.largeImgWrap}>
            <Image source={{ uri: images.pharmacyArLarge }} style={styles.largeImg} contentFit="cover" />
            <View style={styles.starBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#eab308" />
              <Text style={styles.starText}>4.9</Text>
            </View>
          </View>
          <View style={styles.largeBody}>
            <View style={styles.largeText}>
              <Text style={styles.largeTitle}>صيدلية الحكمة المركزية</Text>
              <View style={styles.largeMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                  <Text style={styles.metaTxt}>حي الروضة، الرياض · 1.2 كم</Text>
                </View>
              </View>
            </View>
            <View style={styles.largeIcon}>
              <MaterialCommunityIcons name="pill" size={28} color={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.smallCard}>
            <View style={styles.smallIcon}>
              <MaterialCommunityIcons name="check-decagram" size={28} color={colors.primary} />
            </View>
            <Text style={styles.smallTitle}>صيدلية الشفاء</Text>
            <Text style={styles.smallSub}>
              متخصصون في الأدوية النادرة والتركيبات الطبية الخاصة.
            </Text>
            <View style={styles.smallFooter}>
              <Text style={styles.smallOpen}>مفتوح 24 ساعة</Text>
              <MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} />
            </View>
          </View>
        </View>

        <View style={styles.pharmaCard}>
          <Image source={{ uri: images.pharmacyArPharmacist }} style={styles.pharmaImg} contentFit="cover" />
          <Text style={styles.pharmaTitle}>صيدلية الوفاء</Text>
          <Text style={styles.pharmaSub}>استشارة مجانية متوفرة الآن</Text>
          <Pressable style={styles.pharmaBtn}>
            <Text style={styles.pharmaBtnText}>تحدث مع الصيدلي</Text>
          </Pressable>
        </View>

        <View style={styles.wideCard}>
          <Image source={{ uri: images.pharmacyArLab }} style={styles.wideImg} contentFit="cover" />
          <View style={styles.wideBody}>
            <View style={styles.wideTop}>
              <Text style={styles.wideTitle}>مركز الدواء الحديث</Text>
              <Text style={styles.busy}>مزدحم قليلاً</Text>
            </View>
            <Text style={styles.wideSub}>
              نوفر جميع أنواع اللقاحات والمكملات الغذائية الرياضية المعتمدة عالمياً.
            </Text>
            <View style={styles.wideMeta}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                <Text style={styles.metaSmall}>15 دقيقة</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={16} color={colors.primary} />
                <Text style={styles.metaSmall}>توصيل مجاني</Text>
              </View>
            </View>
          </View>
        </View>
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
            <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.title}>الصيدليات</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable hitSlop={8} onPress={() => rootNav.navigate('Main', { screen: 'Search' })}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <Pressable style={[styles.fab, { bottom: insets.bottom + 100 }]}>
        <MaterialCommunityIcons name="face-agent" size={28} color={colors.onPrimaryContainer} />
      </Pressable>
    </View>
  );
}

function createPharmacyListArStyles(c: ThemeColors) {
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
    headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    headerAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.primary,
      textShadowColor: 'rgba(0,0,0,0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    hero: {
      alignSelf: 'center',
      marginBottom: 20,
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
      bottom: 24,
      gap: 10,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(0,0,0,0.35)',
      color: c.primary,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: '800',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(136,217,130,0.35)',
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: '#f8faf8',
      lineHeight: 34,
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 10,
    },
    heroSub: {
      fontSize: 16,
      color: 'rgba(248,250,248,0.92)',
      lineHeight: 24,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    heroBottomRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 8,
    },
    heroBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.primaryContainer,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    heroBtnText: { color: c.onPrimaryContainer, fontWeight: '800', fontSize: 15 },
    statCard: {
      backgroundColor: 'rgba(0,0,0,0.45)',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      minWidth: 88,
      alignItems: 'center',
    },
    statNum: { fontSize: 24, fontWeight: '900', color: c.primary },
    statLabel: { fontSize: 10, color: 'rgba(248,250,248,0.85)', letterSpacing: 1 },
    chipsScroll: { marginBottom: 20, marginHorizontal: -SCREEN_CONTENT_GUTTER },
    chipsContent: { gap: 10, paddingBottom: 4, paddingHorizontal: SCREEN_CONTENT_GUTTER },
    chip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    chipOn: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
    },
    chipText: { fontSize: 13, fontWeight: '600', color: c.onSurfaceVariant },
    chipTextOn: { color: c.onPrimaryContainer, fontWeight: '800' },
    largeCard: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 16,
    },
    largeImgWrap: { height: 220, position: 'relative' },
    largeImg: { width: '100%', height: '100%' },
    starBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.surfaceContainerHighest,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      opacity: 0.95,
    },
    starText: { fontSize: 12, fontWeight: '800', color: c.onSurface },
    largeBody: {
      flexDirection: 'row',
      padding: 20,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    largeText: { flex: 1, gap: 8 },
    largeTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    largeMeta: { gap: 8, marginTop: 4 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaTxt: { fontSize: 13, color: c.onSurfaceVariant },
    largeIcon: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: c.tabPillActive,
    },
    row2: { marginBottom: 16 },
    smallCard: {
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 24,
      padding: 22,
      borderRightWidth: 4,
      borderRightColor: c.primary,
    },
    smallIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: c.tabPillActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallTitle: { fontSize: 17, fontWeight: '800', marginTop: 12, color: c.onSurface },
    smallSub: { fontSize: 13, color: c.onSurfaceVariant, marginTop: 8, lineHeight: 20 },
    smallFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.outlineVariant,
    },
    smallOpen: { fontSize: 11, fontWeight: '800', color: c.primary },
    pharmaCard: {
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 24,
      padding: 24,
      marginBottom: 16,
    },
    pharmaImg: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: c.primary,
    },
    pharmaTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, color: c.onSurface },
    pharmaSub: { fontSize: 11, color: c.onSurfaceVariant, marginTop: 4 },
    pharmaBtn: {
      marginTop: 16,
      width: '100%',
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: c.surfaceVariant,
      alignItems: 'center',
    },
    pharmaBtnText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.onSurfaceVariant },
    wideCard: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 24,
    },
    wideImg: { width: '100%', height: 160 },
    wideBody: { padding: 20, gap: 10 },
    wideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    wideTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface, flex: 1 },
    busy: {
      fontSize: 10,
      fontWeight: '800',
      color: c.error,
      backgroundColor: c.errorContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    wideSub: { fontSize: 13, color: c.onSurfaceVariant, lineHeight: 20 },
    wideMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
    metaSmall: { fontSize: 12, color: c.onSurfaceVariant },
    fab: {
      position: 'absolute',
      left: 24,
      zIndex: 12,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
  });
}
